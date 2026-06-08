import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CustomButton } from "../components/CustomButton";
import { CustomTextInput } from "../components/CustomTextInput";
import {
  KycApplication,
  getFieldErrorMap,
  validateStep,
} from "../utils/validation";

const DOCUMENT_OPTIONS: Array<NonNullable<KycApplication["document"]>["type"]> = [
  "passport",
  "national_id",
  "drivers_license",
];

type Props = {
  application: KycApplication;
  busy?: boolean;
  onSave: (data: NonNullable<KycApplication["document"]>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function DocumentInfo({
  application,
  busy,
  onSave,
  onNext,
  onBack,
}: Props) {
  const [documentType, setDocumentType] = useState<
    NonNullable<KycApplication["document"]>["type"]
  >(application.document?.type ?? "passport");
  const [documentNumber, setDocumentNumber] = useState(
    application.document?.documentNumber ?? "",
  );
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDocumentType(application.document?.type ?? "passport");
    setDocumentNumber(application.document?.documentNumber ?? "");
  }, [application.document]);

  const errors = useMemo(
    () => ({
      ...getFieldErrorMap(application.requiredFields),
      ...localErrors,
    }),
    [application.requiredFields, localErrors],
  );

  const handleNext = () => {
    const fields = validateStep("document", {
      document: { type: documentType, documentNumber },
    });
    if (fields.length > 0) {
      setLocalErrors(getFieldErrorMap(fields));
      return;
    }

    setLocalErrors({});
    onSave({ type: documentType, documentNumber });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Identity document</Text>
      <View style={styles.options}>
        {DOCUMENT_OPTIONS.map((option) => {
          const selected = option === documentType;
          return (
            <Pressable
              key={option}
              style={[styles.option, selected && styles.selectedOption]}
              onPress={() => setDocumentType(option)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selected && styles.selectedOptionLabel,
                ]}
              >
                {option.replaceAll("_", " ")}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {errors["document.type"] ? (
        <Text style={styles.error}>{errors["document.type"]}</Text>
      ) : null}
      <CustomTextInput
        label="Document number"
        value={documentNumber}
        autoCapitalize="characters"
        placeholder="APP-123456"
        error={errors["document.documentNumber"]}
        onChangeText={setDocumentNumber}
      />
      <Text style={styles.help}>
        Use `APP-`, `REJ-`, `MORE-`, `FAIL-SUBMIT-`, or `FAIL-POLL-` prefixes
        for fake service outcomes.
      </Text>
      <View style={styles.footer}>
        <CustomButton
          label="Back"
          variant="secondary"
          disabled={busy}
          onPress={onBack}
        />
        <CustomButton label="Review" disabled={busy} onPress={handleNext} />
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
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  selectedOption: {
    borderColor: "#184E77",
    backgroundColor: "#D6EAF8",
  },
  optionLabel: {
    color: "#334155",
    textTransform: "capitalize",
  },
  selectedOptionLabel: {
    color: "#184E77",
    fontWeight: "700",
  },
  help: {
    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: "#B42318",
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
});
