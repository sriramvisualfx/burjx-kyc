import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CustomButton } from "../components/CustomButton";
import { CustomTextInput } from "../components/CustomTextInput";
import {
  KycApplication,
  getFieldErrorMap,
  validateStep,
} from "../utils/validation";

type Props = {
  application: KycApplication;
  busy?: boolean;
  onSave: (data: NonNullable<KycApplication["personalInfo"]>) => void;
  onNext: () => void;
};

export function PersonalInfo({ application, busy, onSave, onNext }: Props) {
  const [legalName, setLegalName] = useState(
    application.personalInfo?.legalName ?? "",
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    application.personalInfo?.dateOfBirth ?? "",
  );
  const [nationality, setNationality] = useState(
    application.personalInfo?.nationality ?? "",
  );
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLegalName(application.personalInfo?.legalName ?? "");
    setDateOfBirth(application.personalInfo?.dateOfBirth ?? "");
    setNationality(application.personalInfo?.nationality ?? "");
  }, [application.personalInfo]);

  const errors = useMemo(
    () => ({
      ...getFieldErrorMap(application.requiredFields),
      ...localErrors,
    }),
    [application.requiredFields, localErrors],
  );

  const handleNext = () => {
    const fields = validateStep("personal_info", {
      personalInfo: { legalName, dateOfBirth, nationality },
    });
    if (fields.length > 0) {
      setLocalErrors(getFieldErrorMap(fields));
      return;
    }

    setLocalErrors({});
    onSave({ legalName, dateOfBirth, nationality });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Personal details</Text>
      <CustomTextInput
        label="Legal name"
        value={legalName}
        placeholder="Jane Doe"
        autoCapitalize="words"
        error={errors["personalInfo.legalName"]}
        onChangeText={setLegalName}
      />
      <CustomTextInput
        label="Date of birth"
        value={dateOfBirth}
        placeholder="1990-01-31"
        autoCapitalize="none"
        error={errors["personalInfo.dateOfBirth"]}
        onChangeText={setDateOfBirth}
      />
      <CustomTextInput
        label="Nationality"
        value={nationality}
        placeholder="United Arab Emirates"
        autoCapitalize="words"
        error={errors["personalInfo.nationality"]}
        onChangeText={setNationality}
      />
      <View style={styles.footer}>
        <CustomButton label="Next" disabled={busy} onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  footer: {
    flexDirection: "row",
    marginTop: 8,
  },
});
