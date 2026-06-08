export type KycStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "requires_more_info"
  | "approved"
  | "rejected";

export type KycStep =
  | "personal_info"
  | "address"
  | "document"
  | "review"
  | "status";

export type EditableKycStep = Exclude<KycStep, "review" | "status">;

export type KycRequiredField =
  | "personalInfo.legalName"
  | "personalInfo.dateOfBirth"
  | "personalInfo.nationality"
  | "address.country"
  | "address.city"
  | "address.line1"
  | "document.type"
  | "document.documentNumber";

export interface KycApplication {
  id: string;
  status: KycStatus;
  currentStep: KycStep;
  personalInfo?: {
    legalName: string;
    dateOfBirth: string;
    nationality: string;
  };
  address?: {
    country: string;
    city: string;
    line1: string;
  };
  document?: {
    type: "passport" | "national_id" | "drivers_license";
    documentNumber: string;
  };
  requiredFields?: KycRequiredField[];
  rejectionReason?: string;
  updatedAt: string;
}

export const EDITABLE_STEPS: EditableKycStep[] = [
  "personal_info",
  "address",
  "document",
];

export const STEP_ORDER: KycStep[] = [
  "personal_info",
  "address",
  "document",
  "review",
  "status",
];

export const STEP_TITLES: Record<KycStep, string> = {
  personal_info: "Personal info",
  address: "Address",
  document: "Document",
  review: "Review",
  status: "Status",
};

export function validateStep(
  step: EditableKycStep,
  application: Partial<KycApplication>,
): KycRequiredField[] {
  const missingFields: KycRequiredField[] = [];

  if (step === "personal_info") {
    if (!application.personalInfo?.legalName?.trim()) {
      missingFields.push("personalInfo.legalName");
    }
    if (!application.personalInfo?.dateOfBirth?.trim()) {
      missingFields.push("personalInfo.dateOfBirth");
    }
    if (!application.personalInfo?.nationality?.trim()) {
      missingFields.push("personalInfo.nationality");
    }
  }

  if (step === "address") {
    if (!application.address?.country?.trim()) {
      missingFields.push("address.country");
    }
    if (!application.address?.city?.trim()) {
      missingFields.push("address.city");
    }
    if (!application.address?.line1?.trim()) {
      missingFields.push("address.line1");
    }
  }

  if (step === "document") {
    if (!application.document?.type?.trim()) {
      missingFields.push("document.type");
    }
    if (!application.document?.documentNumber?.trim()) {
      missingFields.push("document.documentNumber");
    }
  }

  return missingFields;
}

export function getFirstInvalidStep(
  application: Partial<KycApplication>,
): { step: EditableKycStep; fields: KycRequiredField[] } | null {
  for (const step of EDITABLE_STEPS) {
    const fields = validateStep(step, application);
    if (fields.length > 0) {
      return { step, fields };
    }
  }

  return null;
}

export function getStepForField(field: KycRequiredField): EditableKycStep {
  if (field.startsWith("personalInfo")) {
    return "personal_info";
  }
  if (field.startsWith("address")) {
    return "address";
  }
  return "document";
}

export function getStepForRequiredFields(
  fields: KycRequiredField[] | undefined,
): EditableKycStep {
  if (!fields?.length) {
    return "personal_info";
  }
  return getStepForField(fields[0]);
}

export function getNextStep(step: KycStep): KycStep {
  const index = STEP_ORDER.indexOf(step);
  return STEP_ORDER[Math.min(index + 1, STEP_ORDER.length - 1)];
}

export function getPreviousStep(step: KycStep): KycStep {
  const index = STEP_ORDER.indexOf(step);
  return STEP_ORDER[Math.max(index - 1, 0)];
}

export function getFieldErrorMap(
  fields: KycRequiredField[] | undefined,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields ?? []) {
    errors[field] = "Required";
  }
  return errors;
}
