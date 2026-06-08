import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { CustomButton } from "../components/CustomButton";
import { CustomTextInput } from "../components/CustomTextInput";
import { KycApplication, validateSteps } from "../utils/validation";

type Props = {
  onNext: () => void;
  onSave: (data: {
    legalName: string;
    dateOfBirth: string;
    nationality: string;
  }) => void;
  onBack: () => void;
  application: KycApplication | null;
};

export const AddressInfo = ({ onNext, onBack, onSave, application }: Props) => {
  const [country, setCountry] = useState(application?.address?.country || "");
  const [city, setCity] = useState(application?.address?.city || "");
  const [addressLine1, setAddressLine1] = useState(
    application?.address?.line1 || "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    setCountry(application?.address?.country || "");
    setCity(application?.address?.city || "");
    setAddressLine1(application?.address?.line1 || "");
  }, [application?.address]);

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
      country,
      city,
      line1: addressLine1,
    };
    const validationErrors = validateSteps("address", {
      address: formData,
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
        label="Country"
        value={country}
        placeholder="Enter your country"
        onChangeText={() => {}}
      />
      <CustomTextInput
        label="City"
        value={city}
        placeholder="Enter your city"
        onChangeText={() => {}}
      />
      <CustomTextInput
        label="Address Line 1"
        value={addressLine1}
        placeholder="Enter your address line 1"
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
    justifyContent: "space-between",
  },
});
