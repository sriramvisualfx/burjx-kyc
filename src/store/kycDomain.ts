import {
  KycApplication,
  KycRequiredField,
  KycStep,
  KycStatus,
  validateSteps,
  getStepsForField,
} from "../utils/validation";

export interface KycSyncState {
  lastSyncedAt: string | null;
  lastRemoteStatus: KycStatus | null;
}

export interface KycConflict {
  conflictType: "local_draft" | "remote_draft | requires_more_info";
  message: string;
  localChanges: boolean;
}

export interface KycStateResult {
  application: KycApplication;
  currentStep: KycStep;
  conflict: KycConflict | null;
  syncDraft: boolean;
  localDraft: KycApplication | null;
}

const EDITABLE_STATUSES: KycStatus[] = [
  "draft",
  "not_started",
  "requires_more_info",
];
const SUBMITTED_STATUSES: KycStatus[] = ["approved", "rejected"];

function getTimeStamp(value: string): number {
  if (!value) return 0;
  return new Date(value).getTime();
}

// Merge Field Values
function mergeValues(
  localDraft?: KycApplication | null,
  remoteDraft?: KycApplication | null,
): Pick<KycApplication, "personalInfo" | "address" | "document"> {
  return {
    personalInfo:
      localDraft?.personalInfo || remoteDraft?.personalInfo
        ? ({
            ...remoteDraft?.personalInfo,
            ...localDraft?.personalInfo,
          } as NonNullable<KycApplication["personalInfo"]>)
        : undefined,
    address:
      localDraft?.address || remoteDraft?.address
        ? ({
            ...remoteDraft?.address,
            ...localDraft?.address,
          } as NonNullable<KycApplication["address"]>)
        : undefined,
    document:
      localDraft?.document || remoteDraft?.document
        ? ({
            ...remoteDraft?.document,
            ...localDraft?.document,
          } as NonNullable<KycApplication["document"]>)
        : undefined,
  };
}

export function getCurrentStepForApplication(
  application: KycApplication,
): KycStep {
  if(application.status === "submitted" ||isSubmittedRemote(application.status)) {
    return "status";
  }

  if (application.status === "requires_more_info") {
    const first = application?.requiredFields?.[0];
    return first ? getStepsForField(first)[0] : "personal_info";
  }

  return application?.currentStep;
}

export function isEditableRemote(status: KycStatus): boolean {
  return EDITABLE_STATUSES.includes(status);
}

export function isSubmittedRemote(status: KycStatus): boolean {
  return SUBMITTED_STATUSES.includes(status);
}

export function isAllowedStatus(from: KycStatus, to: KycStatus): boolean {
  const allowedStatuses: Record<KycStatus, KycStatus[]> = {
    not_started: ["draft"],
    draft: ["draft", "submitted"],
    submitted: ["submitted", "approved", "rejected", "requires_more_info"],
    requires_more_info: ["requires_more_info", "submitted", "draft"],
    approved: ["approved"],
    rejected: ["rejected"],
  };
  return allowedStatuses[from].includes(to);
}
