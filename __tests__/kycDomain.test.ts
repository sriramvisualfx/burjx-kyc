import {
  createEmptyApplication,
  isAllowedStatusTransition,
  resolveKycView,
} from "../src/store/kycDomain";
import { KycRequiredField } from "../src/utils/validation";

describe("kyc domain", () => {
  it("enforces allowed state transitions", () => {
    expect(isAllowedStatusTransition("draft", "submitted")).toBe(true);
    expect(isAllowedStatusTransition("submitted", "approved")).toBe(true);
    expect(isAllowedStatusTransition("submitted", "draft")).toBe(false);
  });

  it("prefers the newer local draft when remote is still editable", () => {
    const remote = {
      ...createEmptyApplication(),
      status: "draft" as const,
      currentStep: "address" as const,
      updatedAt: "2026-06-08T10:00:00.000Z",
    };
    const local = {
      ...remote,
      currentStep: "document" as const,
      updatedAt: "2026-06-08T11:00:00.000Z",
    };

    const resolved = resolveKycView(local, remote);

    expect(resolved.currentStep).toBe("document");
    expect(resolved.conflict?.kind).toBe("local_newer_remote_draft");
  });

  it("keeps locked remote states authoritative while preserving local changes", () => {
    const remote = {
      ...createEmptyApplication(),
      status: "approved" as const,
      currentStep: "status" as const,
      updatedAt: "2026-06-08T10:00:00.000Z",
    };
    const local = {
      ...remote,
      status: "draft" as const,
      currentStep: "review" as const,
      updatedAt: "2026-06-08T11:00:00.000Z",
    };

    const resolved = resolveKycView(local, remote);

    expect(resolved.currentStep).toBe("status");
    expect(resolved.activeApplication.status).toBe("approved");
    expect(resolved.conflict?.kind).toBe("remote_locked_local_preserved");
  });

  it("routes requires_more_info back to the relevant step", () => {
    const remote = {
      ...createEmptyApplication(),
      status: "requires_more_info" as const,
      currentStep: "status" as const,
      requiredFields: ["document.documentNumber"] as KycRequiredField[],
    };

    const resolved = resolveKycView(null, remote);

    expect(resolved.currentStep).toBe("document");
    expect(resolved.activeApplication.status).toBe("requires_more_info");
  });

  it("lets a newer local step win after the initial more-info route", () => {
    const remote = {
      ...createEmptyApplication(),
      status: "requires_more_info" as const,
      currentStep: "status" as const,
      requiredFields: ["document.documentNumber"] as KycRequiredField[],
      updatedAt: "2026-06-08T10:00:00.000Z",
    };
    const local = {
      ...remote,
      currentStep: "review" as const,
      updatedAt: "2026-06-08T11:00:00.000Z",
    };

    const resolved = resolveKycView(local, remote);

    expect(resolved.currentStep).toBe("review");
    expect(resolved.activeApplication.status).toBe("requires_more_info");
  });
});
