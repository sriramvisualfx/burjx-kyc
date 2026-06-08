import {
  advanceFakeServiceRecord,
  getScenarioForApplication,
} from "../src/services/fakeKycService";
import { createEmptyApplication } from "../src/store/kycDomain";

function buildApplication(documentNumber: string) {
  return {
    ...createEmptyApplication(),
    status: "draft" as const,
    personalInfo: {
      legalName: "Jane Doe",
      dateOfBirth: "1990-01-01",
      nationality: "UAE",
    },
    address: {
      country: "UAE",
      city: "Dubai",
      line1: "Marina",
    },
    document: {
      type: "passport" as const,
      documentNumber,
    },
  };
}

describe("fake KYC service", () => {
  it("supports deterministic scenario selection", () => {
    expect(getScenarioForApplication(buildApplication("APP-123"))).toBe("approve");
    expect(getScenarioForApplication(buildApplication("REJ-123"))).toBe("reject");
    expect(getScenarioForApplication(buildApplication("MORE-123"))).toBe(
      "requires_more_info",
    );
    expect(getScenarioForApplication(buildApplication("FAIL-SUBMIT-123"))).toBe(
      "submit_failure",
    );
    expect(getScenarioForApplication(buildApplication("FAIL-POLL-123"))).toBe(
      "poll_failure_once",
    );
  });

  it("produces approved and rejected outcomes deterministically", () => {
    const approvedRecord = {
      application: {
        ...buildApplication("APP-123"),
        status: "submitted" as const,
        currentStep: "status" as const,
      },
      scenario: "approve" as const,
      pollCount: 1,
      pollFailureDelivered: false,
    };

    expect(advanceFakeServiceRecord(approvedRecord).application.status).toBe(
      "approved",
    );

    const rejectedRecord = {
      ...approvedRecord,
      scenario: "reject" as const,
    };
    expect(advanceFakeServiceRecord(rejectedRecord).application.status).toBe(
      "rejected",
    );
  });

  it("returns requires_more_info with the expected route target", () => {
    const record = {
      application: {
        ...buildApplication("MORE-123"),
        status: "submitted" as const,
        currentStep: "status" as const,
      },
      scenario: "requires_more_info" as const,
      pollCount: 0,
      pollFailureDelivered: false,
    };

    const nextRecord = advanceFakeServiceRecord(record);

    expect(nextRecord.application.status).toBe("requires_more_info");
    expect(nextRecord.application.requiredFields).toEqual([
      "document.documentNumber",
    ]);
  });
});
