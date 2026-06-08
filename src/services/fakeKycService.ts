import { saveRemoteRecord, loadRemoteRecord } from "../storage/kycStorage";
import { isAllowedStatusTransition } from "../store/kycDomain";
import { KycApplication, KycRequiredField } from "../utils/validation";

export type FakeServiceScenario =
  | "approve"
  | "reject"
  | "requires_more_info"
  | "submit_failure"
  | "poll_failure_once";

export interface FakeServiceRecord {
  application: KycApplication;
  scenario: FakeServiceScenario;
  pollCount: number;
  pollFailureDelivered: boolean;
}

const FINAL_POLL_COUNT = 2;

export function getScenarioForApplication(
  application: KycApplication,
): FakeServiceScenario {
  const documentNumber = application.document?.documentNumber.trim().toUpperCase() ?? "";

  if (documentNumber.startsWith("FAIL-SUBMIT")) {
    return "submit_failure";
  }
  if (documentNumber.startsWith("FAIL-POLL")) {
    return "poll_failure_once";
  }
  if (documentNumber.startsWith("MORE-")) {
    return "requires_more_info";
  }
  if (documentNumber.startsWith("REJ-")) {
    return "reject";
  }

  return "approve";
}

function buildSubmittedApplication(application: KycApplication): KycApplication {
  if (!isAllowedStatusTransition(application.status, "submitted")) {
    throw new Error(`Invalid transition from ${application.status} to submitted`);
  }

  return {
    ...application,
    status: "submitted",
    currentStep: "status",
    requiredFields: undefined,
    rejectionReason: undefined,
    updatedAt: new Date().toISOString(),
  };
}

function buildRequiresMoreInfoApplication(
  application: KycApplication,
  requiredFields: KycRequiredField[],
): KycApplication {
  if (!isAllowedStatusTransition(application.status, "requires_more_info")) {
    throw new Error(
      `Invalid transition from ${application.status} to requires_more_info`,
    );
  }

  return {
    ...application,
    status: "requires_more_info",
    currentStep: "document",
    requiredFields,
    updatedAt: new Date().toISOString(),
  };
}

function buildApprovedApplication(application: KycApplication): KycApplication {
  if (!isAllowedStatusTransition(application.status, "approved")) {
    throw new Error(`Invalid transition from ${application.status} to approved`);
  }

  return {
    ...application,
    status: "approved",
    currentStep: "status",
    requiredFields: undefined,
    updatedAt: new Date().toISOString(),
  };
}

function buildRejectedApplication(application: KycApplication): KycApplication {
  if (!isAllowedStatusTransition(application.status, "rejected")) {
    throw new Error(`Invalid transition from ${application.status} to rejected`);
  }

  return {
    ...application,
    status: "rejected",
    currentStep: "status",
    requiredFields: undefined,
    rejectionReason: "The fake review service rejected this application.",
    updatedAt: new Date().toISOString(),
  };
}

export function advanceFakeServiceRecord(
  record: FakeServiceRecord,
): FakeServiceRecord {
  const pollCount = record.pollCount + 1;

  if (record.scenario === "requires_more_info") {
    return {
      ...record,
      pollCount,
      application: buildRequiresMoreInfoApplication(record.application, [
        "document.documentNumber",
      ]),
    };
  }

  if (pollCount < FINAL_POLL_COUNT) {
    return {
      ...record,
      pollCount,
      application: {
        ...record.application,
        status: "submitted",
        currentStep: "status",
        updatedAt: new Date().toISOString(),
      },
    };
  }

  if (record.scenario === "reject") {
    return {
      ...record,
      pollCount,
      application: buildRejectedApplication(record.application),
    };
  }

  return {
    ...record,
    pollCount,
    application: buildApprovedApplication(record.application),
  };
}

export async function submitFakeKycApplication(
  application: KycApplication,
): Promise<KycApplication> {
  const scenario = getScenarioForApplication(application);
  if (scenario === "submit_failure") {
    return Promise.reject(
      new Error("The fake KYC service failed before accepting the submission."),
    );
  }

  const record: FakeServiceRecord = {
    application: buildSubmittedApplication(application),
    scenario,
    pollCount: 0,
    pollFailureDelivered: false,
  };

  await saveRemoteRecord(record);
  return record.application;
}

export async function pollFakeKycApplication(
  applicationId: string,
): Promise<KycApplication> {
  const record = await loadRemoteRecord();
  if (!record || record.application.id !== applicationId) {
    return Promise.reject(new Error("No fake KYC submission was found."));
  }

  if (record.scenario === "poll_failure_once" && !record.pollFailureDelivered) {
    const failedRecord: FakeServiceRecord = {
      ...record,
      pollFailureDelivered: true,
    };
    await saveRemoteRecord(failedRecord);
    return Promise.reject(
      new Error("The fake KYC service status check failed. Retry to continue."),
    );
  }

  const nextRecord = advanceFakeServiceRecord(record);
  await saveRemoteRecord(nextRecord);
  return nextRecord.application;
}
