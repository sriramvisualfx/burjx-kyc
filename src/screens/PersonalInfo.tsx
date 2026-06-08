import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { CustomButton } from "../components/CustomButton";
import { CustomTextInput } from "../components/CustomTextInput";
import { validateSteps, KycApplication } from "../utils/validation";

type Props = {
  onNext: () => void;
  onSave: (data: {
    legalName: string;
    dateOfBirth: string;
    nationality: string;
  }) => void;
  application: KycApplication | null;
};

export const PersonalInfo = ({ onNext, onSave, application }: Props) => {
  const [legalName, setLegalName] = useState(
    application?.personalInfo?.legalName || "",
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    application?.personalInfo?.dateOfBirth || "",
  );
  const [nationality, setNationality] = useState(
    application?.personalInfo?.nationality || "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLegalName(application?.personalInfo?.legalName || "");
    setDateOfBirth(application?.personalInfo?.dateOfBirth || "");
    setNationality(application?.personalInfo?.nationality || "");
  }, [application?.personalInfo]);

  useEffect(() => {
    if (application?.requiredFields) {
      const newError: Record<string, string> = {};
      application?.requiredFields.forEach((field) => {
        const fieldName = field.split(".")[1];
        newError[fieldName] = "This is a required field";
      });
      setErrors(newError);
    } else {
      setErrors({});
    }
  }, [application?.requiredFields]);

  const handleNext = () => {
    const formData = {
      legalName,
      dateOfBirth,
      nationality,
    };
    const validationErrors = validateSteps("personal_info", {
      personalInfo: formData,
    });
    if (validationErrors.length > 0) {
      const newError: Record<string, string> = {};
      validationErrors.forEach((field) => {
        const fieldName = field.split(".")[1];
        newError[fieldName] = "This is a required field";
      });
      setErrors(newError);
      return;
    }
    setErrors({});
    onSave(formData);
    onNext();
  };

  const handleChange = (field: string, value: string) => {
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };
  return (
    <View style={styles.container}>
      <CustomTextInput
        label="Legal Name"
        value={legalName}
        placeholder="Enter your name"
        onChangeText={(e) => {
          setLegalName(e);
          handleChange("legalName", e);
        }}
        error={errors.legalName}
      />
      <CustomTextInput
        label="Date of Birth"
        value={dateOfBirth}
        placeholder="DOB (YYYY-MM-DD)"
        onChangeText={(e) => {
          setDateOfBirth(e);
          handleChange("dateOfBirth", e);
        }}
        error={errors.dateOfBirth}
      />
      <CustomTextInput
        label="Nationality"
        value={nationality}
        placeholder="Nationality"
        onChangeText={(e) => {
          setNationality(e);
          handleChange("nationality", e);
        }}
        error={errors.nationality}
      />
      <View style={styles.buttonRow}>
        <CustomButton label="Next" onPress={handleNext} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    gap: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "space-between",
  },
});
