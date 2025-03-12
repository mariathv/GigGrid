"use client"

import {
    View,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native"
import { useState } from "react"
import { Stack, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"

export default function UserTypeScreen() {
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const router = useRouter()

    const handleContinue = () => {
        if (selectedType) {
            router.push({
                pathname: "/register",
                params: { userType: selectedType }
            })
        } else {
            alert("Please select a user type to continue")
        }
    }

    return (
        <ThemedView style={styles.container}>
            <StatusBar style="light" />
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "",
                    headerStyle: { backgroundColor: "#151619" },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.headerContainer}>
                        <ThemedText style={styles.title}>Boost your freelance earning here</ThemedText>
                        <ThemedText style={styles.subtitle}>what will you choose</ThemedText>
                    </View>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                selectedType === "freelancer" && styles.selectedOption
                            ]}
                            onPress={() => setSelectedType("Freelancer")}
                        >
                            <Ionicons name="person" size={24} color="#fff" style={styles.optionIcon} />
                            <ThemedText style={styles.optionText}>I'm a Freelancer</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                selectedType === "client" && styles.selectedOption
                            ]}
                            onPress={() => setSelectedType("Client")}
                        >
                            <Ionicons name="people" size={24} color="#fff" style={styles.optionIcon} />
                            <ThemedText style={styles.optionText}>I'm looking for freelancer</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.continueButton, !selectedType && styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={!selectedType}
                    >
                        <ThemedText style={styles.buttonText}>Continue</ThemedText>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    headerContainer: {
        marginTop: 20,
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: "#999",
    },
    optionsContainer: {
        width: "100%",
        marginBottom: 40,
        gap: 16,
    },
    optionButton: {
        backgroundColor: "#111",
        borderRadius: 8,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
    },
    selectedOption: {
        backgroundColor: "#1E1E1E",
        borderColor: "#4B7172",
    },
    optionIcon: {
        marginRight: 12,
    },
    optionText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    continueButton: {
        backgroundColor: "#4B7172",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        marginTop: "auto",
        marginBottom: 24,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
})
