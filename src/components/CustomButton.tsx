import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CustomButtonProps {
    label: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ label, ...rest }) => {
    return (
        <Pressable style={styles.container} {...rest}>
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E6F4FE",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
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