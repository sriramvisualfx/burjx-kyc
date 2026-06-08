import {
  KycApplication,
  KycRequiredField,
  KycStatus,
  KycStep,
  getStepForRequiredFields,
} from "../utils/validation";

export interface KycConflict {
  kind:
    | "local_newer_remote_draft"
    | "remote_locked_local_preserved"
    | "requires_more_info";
  message: string;
}

export interface DerivedKycView {
  activeApplication: KycApplication;
  currentStep: KycStep;
  conflict: KycConflict | null;
}

export const LOCKED_REMOTE_STATUSES: KycStatus[] = [
  "submitted",
  "approved",
  "rejected",
];

const editableStatuses: KycStatus[] = [
  "not_started",
  "draft",
  "requires_more_info",
];

const transitions: Record<KycStatus, KycStatus[]> = {
  not_started: ["draft"],
  draft: ["draft", "submitted"],
  submitted: ["submitted", "requires_more_info", "approved", "rejected"],
  requires_more_info: ["requires_more_info", "draft", "submitted"],
  approved: ["approved"],
  rejected: ["rejected"],
};

export function createKycId(): string {
  return `kyc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyApplication(): KycApplication {
  return {
    id: createKycId(),
    status: "not_started",
    currentStep: "personal_info",
    updatedAt: new Date().toISOString(),
  };
}

export function isEditableStatus(status: KycStatus): boolean {
  return editableStatuses.includes(status);
}

export function isLockedRemoteStatus(status: KycStatus): boolean {
  return LOCKED_REMOTE_STATUSES.includes(status);
}

export function isAllowedStatusTransition(
  from: KycStatus,
  to: KycStatus,
): boolean {
  return transitions[from].includes(to);
}

export function getTimestamp(value: string | undefined | null): number {
  if (!value) {
    return 0;
  }
  return new Date(value).getTime();
}

function mergeSection<T extends object>(
  remoteSection: T | undefined,
  localSection: T | undefined,
): T | undefined {
  if (!remoteSection && !localSection) {
    return undefined;
  }

  return {
    ...(remoteSection ?? {}),
    ...(localSection ?? {}),
  } as T;
}

export function mergeEditableApplication(
  remoteApplication: KycApplication,
  localDraft: KycApplication | null,
): KycApplication {
  return {
    ...remoteApplication,
    personalInfo: mergeSection(
      remoteApplication.personalInfo,
      localDraft?.personalInfo,
    ),
    address: mergeSection(remoteApplication.address, localDraft?.address),
    document: mergeSection(remoteApplication.document, localDraft?.document),
    updatedAt:
      getTimestamp(localDraft?.updatedAt) > getTimestamp(remoteApplication.updatedAt)
        ? (localDraft?.updatedAt ?? remoteApplication.updatedAt)
        : remoteApplication.updatedAt,
  };
}

export function applyStepFields(
  application: KycApplication,
  step: "personal_info" | "address" | "document",
  value:
    | NonNullable<KycApplication["personalInfo"]>
    | NonNullable<KycApplication["address"]>
    | NonNullable<KycApplication["document"]>,
  requiredFields?: KycRequiredField[],
): KycApplication {
  const status = application.status === "not_started" ? "draft" : application.status;
  const shared = {
    ...application,
    status,
    currentStep: step,
    requiredFields,
    updatedAt: new Date().toISOString(),
  };

  if (step === "personal_info") {
    return {
      ...shared,
      personalInfo: value as NonNullable<KycApplication["personalInfo"]>,
    };
  }

  if (step === "address") {
    return {
      ...shared,
      address: value as NonNullable<KycApplication["address"]>,
    };
  }

  return {
    ...shared,
    document: value as NonNullable<KycApplication["document"]>,
  };
}

export function resolveKycView(
  localDraft: KycApplication | null,
  remoteApplication: KycApplication | null,
): DerivedKycView {
  if (!remoteApplication) {
    const activeApplication = localDraft ?? createEmptyApplication();
    return {
      activeApplication,
      currentStep: activeApplication.currentStep,
      conflict: null,
    };
  }

  if (remoteApplication.status === "requires_more_info") {
    const activeApplication = mergeEditableApplication(
      remoteApplication,
      localDraft,
    );
    const requiredStep = getStepForRequiredFields(remoteApplication.requiredFields);
    const prefersLocalStep =
      !!localDraft &&
      localDraft.currentStep !== "status" &&
      getTimestamp(localDraft.updatedAt) > getTimestamp(remoteApplication.updatedAt);
    const currentStep = prefersLocalStep
      ? localDraft.currentStep
      : requiredStep;

    return {
      activeApplication: {
        ...activeApplication,
        status: "requires_more_info",
        currentStep,
      },
      currentStep,
      conflict: {
        kind: "requires_more_info",
        message:
          "The fake review requested more information. We routed you to the first required field and preserved any local edits.",
      },
    };
  }

  if (isLockedRemoteStatus(remoteApplication.status)) {
    return {
      activeApplication: {
        ...remoteApplication,
        currentStep: "status",
      },
      currentStep: "status",
      conflict:
        localDraft &&
        getTimestamp(localDraft.updatedAt) > getTimestamp(remoteApplication.updatedAt)
          ? {
              kind: "remote_locked_local_preserved",
              message:
                "A newer local draft was preserved, but it cannot overwrite the submitted or terminal fake service state.",
            }
          : null,
    };
  }

  if (!localDraft) {
    return {
      activeApplication: remoteApplication,
      currentStep: remoteApplication.currentStep,
      conflict: null,
    };
  }

  const prefersLocal =
    getTimestamp(localDraft.updatedAt) >= getTimestamp(remoteApplication.updatedAt);

  return {
    activeApplication: {
      ...mergeEditableApplication(remoteApplication, localDraft),
      currentStep: prefersLocal ? localDraft.currentStep : remoteApplication.currentStep,
    },
    currentStep: prefersLocal ? localDraft.currentStep : remoteApplication.currentStep,
    conflict: prefersLocal
      ? {
          kind: "local_newer_remote_draft",
          message:
            "A newer local draft was restored and kept ahead of the fake service draft.",
        }
      : null,
  };
}
