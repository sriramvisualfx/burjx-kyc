import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { PersonalInfo } from "./src/screens/PersonalInfo";
import { AddressInfo } from "./src/screens/AddressInfo";
import { DocumentInfo } from "./src/screens/DocumentInfo";
import { initialState, kycReducer } from "./src/store/kycReducer";
import { useCallback, useReducer } from "react";
import { KycAction } from "./src/store/kycAction";
import { KycApplication } from "./src/utils/validation";

export default function App() {
  const [state, dispatch] = useReducer(kycReducer, initialState);

  const handleSavePersonalInfo = useCallback(
    (data: NonNullable<KycApplication["personalInfo"]>) => {
      dispatch({ type: KycAction.SAVE_PERSONAL_INFO, data });
    },
    [],
  );
  const handleSaveAddressInfo = useCallback(
    (data: NonNullable<KycApplication["address"]>) => {
      dispatch({ type: KycAction.SAVE_ADDRESS_INFO, data });
    },
    [],
  );
  const handleSaveDocumentInfo = useCallback(
    (data: NonNullable<KycApplication["document"]>) => {
      dispatch({ type: KycAction.SAVE_DOCUMENT_INFO, data });
    },
    [],
  )
  const handleNext = useCallback(() => {
    if(state.currentStep === "review") {
      void handleSubmit();
      return;
    } 
    dispatch({ type: KycAction.NEXT_STEP });
  }, [handleSubmit, state.currentStep]);

  function handleSubmit = useCallback(async () => {
    if(!state.application) return;

    const firstInvalid = getFirstInvalidStep(state.application);
    if (firstInvalid) {
      dispatch({ type: KycAction.SET_REQUIRED_FIELDS, data: firstInvalid.fields });
      dispatch({ type: KycAction.SET_STATE, data: firstInvalid.step });
      return;
    }
    
  })
  const renderScreen = () => {
    const app = state.application;

    if (state.isLoading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
          <Text>Loading BurjX KYC...</Text>
        </View>
      );
    }

    if (!app) {
      return null;
    }

    switch (state.currentStep) {
      case "personal_info":
        return (
          <PersonalInfo
            onNext={handleNext}
            onSave={handleSavePersonalInfo}
            application={state.application}
          />
        );
      case "address_info":
        return (
          <AddressInfo
            onNext={() => dispatch({ type: KycAction.NEXT_STEP })}
            onBack={() => dispatch({ type: KycAction.PREV_STEP })}
            onSave={handleSaveAddressInfo}
            application={state.application}
          />
        );
      case "document_info":
        return <DocumentInfo />;
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 25,
    gap: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "space-between",
  },
});
