jest.mock("../src/storage/kycStorage", () => {
  let record: unknown = null;

  return {
    loadRemoteRecord: jest.fn(async () => record),
    saveRemoteRecord: jest.fn(async (nextRecord: unknown) => {
      record = nextRecord;
    }),
  };
});

import {
  pollFakeKycApplication,
  submitFakeKycApplication,
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

describe("fake KYC service async behavior", () => {
  it("rejects the submit failure scenario", async () => {
    await expect(
      submitFakeKycApplication(buildApplication("FAIL-SUBMIT-123")),
    ).rejects.toThrow("failed before accepting");
  });

  it("supports a poll failure followed by retry", async () => {
    const submitted = await submitFakeKycApplication(
      buildApplication("FAIL-POLL-123"),
    );

    await expect(pollFakeKycApplication(submitted.id)).rejects.toThrow(
      "status check failed",
    );

    await expect(pollFakeKycApplication(submitted.id)).resolves.toMatchObject({
      status: "submitted",
    });
  });
});
