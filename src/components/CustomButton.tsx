import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface CustomButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export function CustomButton({
  label,
  onPress,
  disabled,
  variant = "primary",
}: CustomButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.container,
        variant === "secondary" && styles.secondaryContainer,
        variant === "danger" && styles.dangerContainer,
        disabled && styles.disabledContainer,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "secondary" && styles.secondaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#184E77",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  secondaryContainer: {
    backgroundColor: "#E2E8F0",
  },
  dangerContainer: {
    backgroundColor: "#B42318",
  },
  disabledContainer: {
    opacity: 0.55,
  },
  label: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryLabel: {
    color: "#184E77",
  },
});
