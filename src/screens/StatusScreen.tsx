import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { CustomButton } from "../components/CustomButton";
import { KycApplication } from "../utils/validation";

type Props = {
  application: KycApplication;
  isPolling: boolean;
  error: string | null;
  pollAttempts: number;
  maxPollAttempts: number;
  onRetry: () => void;
  onResumeRequiredInfo: () => void;
  onRestart: () => void;
};

export function StatusScreen({
  application,
  isPolling,
  error,
  pollAttempts,
  maxPollAttempts,
  onRetry,
  onResumeRequiredInfo,
  onRestart,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Application status</Text>

      {application.status === "submitted" ? (
        <View style={styles.card}>
          <ActivityIndicator color="#184E77" />
          <Text style={styles.statusTitle}>Submitted for review</Text>
          <Text style={styles.body}>
            The fake service accepted the application. Polling is bounded to{" "}
            {maxPollAttempts} attempts.
          </Text>
          <Text style={styles.body}>
            Poll attempts used: {pollAttempts} / {maxPollAttempts}
          </Text>
        </View>
      ) : null}

      {application.status === "requires_more_info" ? (
        <View style={styles.card}>
          <Text style={styles.statusTitle}>More information required</Text>
          <Text style={styles.body}>
            The fake service requested updates before continuing review.
          </Text>
          <Text style={styles.body}>
            Required fields: {(application.requiredFields ?? []).join(", ")}
          </Text>
        </View>
      ) : null}

      {application.status === "approved" ? (
        <View style={styles.card}>
          <Text style={styles.statusTitle}>Approved</Text>
          <Text style={styles.body}>
            The fake review completed successfully.
          </Text>
        </View>
      ) : null}

      {application.status === "rejected" ? (
        <View style={styles.card}>
          <Text style={styles.statusTitle}>Rejected</Text>
          <Text style={styles.body}>
            {application.rejectionReason ??
              "The fake review service rejected this application."}
          </Text>
        </View>
      ) : null}

      {error ? (
        <View style={[styles.card, styles.errorCard]}>
          <Text style={styles.errorTitle}>Retry needed</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        {application.status === "requires_more_info" ? (
          <CustomButton label="Fix required fields" onPress={onResumeRequiredInfo} />
        ) : null}
        {error && (application.status === "submitted" || isPolling) ? (
          <CustomButton label="Retry status check" onPress={onRetry} />
        ) : null}
        {(application.status === "approved" ||
          application.status === "rejected") &&
        !isPolling ? (
          <CustomButton
            label="Start new application"
            variant="secondary"
            onPress={onRestart}
          />
        ) : null}
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
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    gap: 10,
  },
  errorCard: {
    backgroundColor: "#FEF3F2",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  body: {
    color: "#475569",
    lineHeight: 20,
  },
  errorTitle: {
    color: "#B42318",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#912018",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
});
