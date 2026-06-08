import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CustomButton } from "../components/CustomButton";
import { KycApplication } from "../utils/validation";

type Props = {
  application: KycApplication;
  busy?: boolean;
  error?: string | null;
  onBack: () => void;
  onSubmit: () => void;
};

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || "Not provided"}</Text>
    </View>
  );
}

export function ReviewScreen({
  application,
  busy,
  error,
  onBack,
  onSubmit,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Review before submit</Text>
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Submission failed</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <ReviewRow label="Legal name" value={application.personalInfo?.legalName} />
      <ReviewRow
        label="Date of birth"
        value={application.personalInfo?.dateOfBirth}
      />
      <ReviewRow
        label="Nationality"
        value={application.personalInfo?.nationality}
      />
      <ReviewRow label="Country" value={application.address?.country} />
      <ReviewRow label="City" value={application.address?.city} />
      <ReviewRow label="Address line 1" value={application.address?.line1} />
      <ReviewRow label="Document type" value={application.document?.type} />
      <ReviewRow
        label="Document number"
        value={application.document?.documentNumber}
      />
      <View style={styles.footer}>
        <CustomButton
          label="Back"
          variant="secondary"
          disabled={busy}
          onPress={onBack}
        />
        <CustomButton
          label={busy ? "Submitting..." : "Submit"}
          disabled={busy}
          onPress={onSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  errorCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FEF3F2",
    gap: 6,
  },
  errorTitle: {
    color: "#B42318",
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    color: "#912018",
    lineHeight: 20,
  },
  reviewRow: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    gap: 4,
  },
  reviewLabel: {
    color: "#64748B",
    fontSize: 12,
    textTransform: "uppercase",
  },
  reviewValue: {
    color: "#0F172A",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
});
