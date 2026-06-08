import React from "react";
import { TextInput, StyleSheet, Text, View } from "react-native";

interface CustomTextInputProps {
    label: string;
    value: string;
    placeholder?: string;
    onChangeText: (text: string) => void;
    error?: string;
}

export const CustomTextInput = ({ label, value, placeholder, onChangeText, error }: CustomTextInputProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontWeight: "bold",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 8,
    },
    error: {
        color: "red",
        marginTop: 8,
    },
})