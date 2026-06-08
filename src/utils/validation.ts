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
  rejectionReason?: string;
  requiredFields?: KycRequiredField[];
  updatedAt: string;
}
export function validateSteps(step: KycStep, application: Partial<KycApplication>): KycRequiredField[] {
  const missingFields: KycRequiredField[] = [];
  if (step === "personal_info") {
    const pInfo = application.personalInfo;
    if (!pInfo?.legalName || pInfo?.legalName.trim() === "") {
      missingFields.push("personalInfo.legalName");
    }
    if (!pInfo?.dateOfBirth || pInfo?.dateOfBirth.trim() === "") {
      missingFields.push("personalInfo.dateOfBirth");
    }
    if (!pInfo?.nationality || pInfo?.nationality.trim() === "") {
      missingFields.push("personalInfo.nationality");
    }
  }
  if (step === "address") {
    const addr = application.address;
    if (!addr?.country || addr?.country.trim() === "") {
      missingFields.push("address.country");
    }
    if (!addr?.city || addr?.city.trim() === "") {
      missingFields.push("address.city");
    }
    if (!addr?.line1 || addr?.line1.trim() === "") {
      missingFields.push("address.line1");
    }
  }
  if (step === "document") {
    const doc = application.document;
    if (!doc?.type || doc?.type.trim() === "") {
      missingFields.push("document.type");
    }
    if (!doc?.documentNumber || doc?.documentNumber.trim() === "") {
      missingFields.push("document.documentNumber");
    }
  }
  return missingFields;
}

export function getStepsForField(field: KycRequiredField): KycStep[] {
  const steps: KycStep[] = [];
  if (field.startsWith("personalInfo")) {
    steps.push("personal_info");
  }
  if (field.startsWith("address")) {
    steps.push("address");
  }
  if (field.startsWith("document")) {
    steps.push("document");
  }
  return steps;
}