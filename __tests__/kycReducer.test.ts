import { KycAction } from "../src/store/kycAction";
import { createEmptyApplication } from "../src/store/kycDomain";
import { initialState, kycReducer } from "../src/store/kycReducer";

describe("kyc reducer", () => {
  it("resumes from a local draft", () => {
    const localDraft = {
      ...createEmptyApplication(),
      status: "draft" as const,
      currentStep: "document" as const,
    };

    const state = kycReducer(initialState, {
      type: KycAction.HYDRATE_SUCCESS,
      data: {
        localDraft,
        remoteApplication: null,
      },
    });

    expect(state.currentStep).toBe("document");
    expect(state.activeApplication.currentStep).toBe("document");
  });

  it("captures fake service vs local draft conflicts", () => {
    const remoteApplication = {
      ...createEmptyApplication(),
      status: "approved" as const,
      currentStep: "status" as const,
      updatedAt: "2026-06-08T10:00:00.000Z",
    };
    const localDraft = {
      ...remoteApplication,
      status: "draft" as const,
      currentStep: "review" as const,
      updatedAt: "2026-06-08T11:00:00.000Z",
    };

    const state = kycReducer(initialState, {
      type: KycAction.HYDRATE_SUCCESS,
      data: {
        localDraft,
        remoteApplication,
      },
    });

    expect(state.conflict?.kind).toBe("remote_locked_local_preserved");
  });

  it("exposes retry state when polling fails", () => {
    const remoteApplication = {
      ...createEmptyApplication(),
      status: "submitted" as const,
      currentStep: "status" as const,
    };
    const hydrated = kycReducer(initialState, {
      type: KycAction.HYDRATE_SUCCESS,
      data: {
        localDraft: remoteApplication,
        remoteApplication,
      },
    });

    const failed = kycReducer(hydrated, {
      type: KycAction.POLL_FAILURE,
      data: "Status polling timed out",
    });

    expect(failed.isPolling).toBe(false);
    expect(failed.error).toBe("Status polling timed out");
  });
});
