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
  onSave: (data: NonNullable<KycApplication["address"]>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function AddressInfo({
  application,
  busy,
  onSave,
  onNext,
  onBack,
}: Props) {
  const [country, setCountry] = useState(application.address?.country ?? "");
  const [city, setCity] = useState(application.address?.city ?? "");
  const [line1, setLine1] = useState(application.address?.line1 ?? "");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCountry(application.address?.country ?? "");
    setCity(application.address?.city ?? "");
    setLine1(application.address?.line1 ?? "");
  }, [application.address]);

  const errors = useMemo(
    () => ({
      ...getFieldErrorMap(application.requiredFields),
      ...localErrors,
    }),
    [application.requiredFields, localErrors],
  );

  const handleNext = () => {
    const fields = validateStep("address", {
      address: { country, city, line1 },
    });
    if (fields.length > 0) {
      setLocalErrors(getFieldErrorMap(fields));
      return;
    }

    setLocalErrors({});
    onSave({ country, city, line1 });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Residential address</Text>
      <CustomTextInput
        label="Country"
        value={country}
        placeholder="United Arab Emirates"
        autoCapitalize="words"
        error={errors["address.country"]}
        onChangeText={setCountry}
      />
      <CustomTextInput
        label="City"
        value={city}
        placeholder="Dubai"
        autoCapitalize="words"
        error={errors["address.city"]}
        onChangeText={setCity}
      />
      <CustomTextInput
        label="Address line 1"
        value={line1}
        placeholder="Flat 1201, Marina Promenade"
        error={errors["address.line1"]}
        onChangeText={setLine1}
      />
      <View style={styles.footer}>
        <CustomButton
          label="Back"
          variant="secondary"
          disabled={busy}
          onPress={onBack}
        />
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
    gap: 12,
    marginTop: 8,
  },
});
