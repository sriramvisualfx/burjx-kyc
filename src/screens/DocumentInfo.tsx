import React from "react";
import { View, StyleSheet } from "react-native";
import { CustomButton } from "../components/CustomButton";
import { CustomTextInput } from "../components/CustomTextInput";

export const DocumentInfo = () => {
  return (
    <View style={styles.container}>
      <CustomTextInput
        label="Document Type"
        value=""
        placeholder="Enter your document type (Passport, National ID, Driving License)"
        onChangeText={() => {}}
      />
      <CustomTextInput
        label="ID Number"
        value=""
        placeholder="Enter your ID number"
        onChangeText={() => {}}
      />
      <View style={styles.buttonRow}>
        <CustomButton label="Back" />
        <CustomButton label="Next" />
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
    justifyContent: "space-between" 
  },
})