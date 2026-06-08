import {
  getFirstInvalidStep,
  getStepForRequiredFields,
  validateStep,
} from "../src/utils/validation";

describe("validation", () => {
  it("validates required fields per step", () => {
    expect(validateStep("personal_info", {})).toEqual([
      "personalInfo.legalName",
      "personalInfo.dateOfBirth",
      "personalInfo.nationality",
    ]);
    expect(validateStep("address", {})).toEqual([
      "address.country",
      "address.city",
      "address.line1",
    ]);
    expect(validateStep("document", {})).toEqual([
      "document.type",
      "document.documentNumber",
    ]);
  });

  it("finds the first invalid step", () => {
    expect(
      getFirstInvalidStep({
        personalInfo: {
          legalName: "Jane Doe",
          dateOfBirth: "1990-01-01",
          nationality: "UAE",
        },
      }),
    ).toEqual({
      step: "address",
      fields: ["address.country", "address.city", "address.line1"],
    });
  });

  it("routes requires_more_info to the first required step", () => {
    expect(
      getStepForRequiredFields(["document.documentNumber", "address.line1"]),
    ).toBe("document");
  });
});
