import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useKycController } from "./src/hooks/useKycController";
import { AddressInfo } from "./src/screens/AddressInfo";
import { DocumentInfo } from "./src/screens/DocumentInfo";
import { PersonalInfo } from "./src/screens/PersonalInfo";
import { ReviewScreen } from "./src/screens/ReviewScreen";
import { StatusScreen } from "./src/screens/StatusScreen";
import {
  STEP_ORDER,
  STEP_TITLES,
  getStepForRequiredFields,
} from "./src/utils/validation";

function StepIndicator({ currentStep }: { currentStep: keyof typeof STEP_TITLES }) {
  return (
    <View style={styles.stepRail}>
      {STEP_ORDER.map((step) => {
        const active = step === currentStep;
        return (
          <View key={step} style={[styles.stepPill, active && styles.activeStepPill]}>
            <Text style={[styles.stepLabel, active && styles.activeStepLabel]}>
              {STEP_TITLES[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function App() {
  const { state, actions, maxPollAttempts } = useKycController();
  const busy = state.isSubmitting || state.isPolling;

  const renderScreen = () => {
    switch (state.currentStep) {
      case "personal_info":
        return (
          <PersonalInfo
            application={state.activeApplication}
            busy={busy}
            onSave={(data) => actions.saveStep("personal_info", data)}
            onNext={actions.goNext}
          />
        );
      case "address":
        return (
          <AddressInfo
            application={state.activeApplication}
            busy={busy}
            onSave={(data) => actions.saveStep("address", data)}
            onBack={actions.goBack}
            onNext={actions.goNext}
          />
        );
      case "document":
        return (
          <DocumentInfo
            application={state.activeApplication}
            busy={busy}
            onSave={(data) => actions.saveStep("document", data)}
            onBack={actions.goBack}
            onNext={actions.goNext}
          />
        );
      case "review":
        return (
          <ReviewScreen
            application={state.activeApplication}
            busy={state.isSubmitting}
            error={state.error}
            onBack={actions.goBack}
            onSubmit={() => void actions.submit()}
          />
        );
      case "status":
        return (
          <StatusScreen
            application={state.activeApplication}
            isPolling={state.isPolling}
            error={state.error}
            pollAttempts={state.pollAttempts}
            maxPollAttempts={maxPollAttempts}
            onRetry={() => void actions.retryStatusCheck()}
            onResumeRequiredInfo={() =>
              actions.goToStep(
                getStepForRequiredFields(state.activeApplication.requiredFields),
              )
            }
            onRestart={() => void actions.restart()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>KYC onboarding</Text>
        <Text style={styles.title}>Multi-step verification wizard</Text>

        <StepIndicator currentStep={state.currentStep} />

        {state.conflict ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{state.conflict.message}</Text>
          </View>
        ) : null}

        {state.isHydrating ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#184E77" />
            <Text style={styles.loadingText}>Restoring your saved KYC state...</Text>
          </View>
        ) : (
          renderScreen()
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  eyebrow: {
    color: "#184E77",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    color: "#475569",
    lineHeight: 22,
  },
  stepRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stepPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#E2E8F0",
  },
  activeStepPill: {
    backgroundColor: "#184E77",
  },
  stepLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  activeStepLabel: {
    color: "#FFFFFF",
  },
  banner: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFF7ED",
    gap: 6,
  },
  bannerTitle: {
    color: "#9A3412",
    fontWeight: "700",
  },
  bannerText: {
    color: "#9A3412",
    lineHeight: 20,
  },
  loadingCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#475569",
  },
  securityNote: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    gap: 8,
  },
  securityTitle: {
    color: "#0C4A6E",
    fontWeight: "700",
  },
  securityText: {
    color: "#0C4A6E",
    lineHeight: 20,
  },
});
