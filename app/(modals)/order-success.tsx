"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import "@/global.css"

export default function OrderSuccessScreen() {
    const router = useRouter()
    const params = useLocalSearchParams()
    const scaleAnim = useRef(new Animated.Value(0)).current
    const opacityAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        // Animation sequence
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start()

        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start()
    }, [])

    const handleViewOrder = () => {
        router.push({
            pathname: "/orders",
            params: { highlight: params.orderId },
        })
    }

    const handleContinueBrowsing = () => {
        router.push("/browse")
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Success Animation */}
                <View style={styles.successIconContainer}>
                    <Animated.View
                        style={[
                            styles.checkCircle,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    >
                        <Ionicons name="checkmark" size={60} color="#fff" />
                    </Animated.View>
                </View>

                {/* Success Message */}
                <Animated.View style={{ opacity: opacityAnim }}>
                    <ThemedText style={styles.successTitle}>Order Placed Successfully!</ThemedText>
                    <ThemedText style={styles.successMessage}>
                        Your order has been placed and the freelancer has been notified.
                    </ThemedText>
                    <ThemedText style={styles.orderId}>Order ID: {params.orderId}</ThemedText>
                </Animated.View>

                {/* Order Details */}
                <View style={styles.card}>
                    <ThemedText style={styles.cardTitle}>Order Details</ThemedText>
                    <View style={styles.orderItem}>
                        <ThemedText style={styles.orderItemLabel}>Package</ThemedText>
                        <ThemedText style={styles.orderItemValue}>
                            {params.packageType === "basic" ? "Basic" : params.packageType === "standard" ? "Standard" : "Premium"}{" "}
                            Package
                        </ThemedText>
                    </View>
                    <View style={styles.orderItem}>
                        <ThemedText style={styles.orderItemLabel}>Freelancer</ThemedText>
                        <ThemedText style={styles.orderItemValue}>{params.freelancerName || "Freelancer"}</ThemedText>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.orderItem}>
                        <ThemedText style={styles.totalLabel}>Total</ThemedText>
                        <ThemedText style={styles.totalValue}>${(Number(params.price) + 5).toFixed(2)}</ThemedText>
                    </View>
                </View>

                {/* Next Steps */}
                <View style={styles.card}>
                    <ThemedText style={styles.cardTitle}>Next Steps</ThemedText>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <ThemedText style={styles.stepNumberText}>1</ThemedText>
                        </View>
                        <View style={styles.stepContent}>
                            <ThemedText style={styles.stepTitle}>Wait for Freelancer Response</ThemedText>
                            <ThemedText style={styles.stepDescription}>
                                The freelancer will review your order and may contact you for more details.
                            </ThemedText>
                        </View>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <ThemedText style={styles.stepNumberText}>2</ThemedText>
                        </View>
                        <View style={styles.stepContent}>
                            <ThemedText style={styles.stepTitle}>Track Your Order</ThemedText>
                            <ThemedText style={styles.stepDescription}>
                                You can track the progress of your order in the Orders tab.
                            </ThemedText>
                        </View>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <ThemedText style={styles.stepNumberText}>3</ThemedText>
                        </View>
                        <View style={styles.stepContent}>
                            <ThemedText style={styles.stepTitle}>Review the Delivery</ThemedText>
                            <ThemedText style={styles.stepDescription}>
                                Once the order is delivered, review and provide feedback.
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleViewOrder}>
                        <ThemedText style={styles.primaryButtonText}>View Order</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueBrowsing}>
                        <ThemedText style={styles.secondaryButtonText}>Continue Browsing</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    successIconContainer: {
        alignItems: "center",
        marginVertical: 30,
    },
    checkCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    successMessage: {
        fontSize: 16,
        color: "#CFD5D5",
        textAlign: "center",
        marginBottom: 10,
    },
    orderId: {
        fontSize: 14,
        color: "#777",
        textAlign: "center",
        marginBottom: 30,
    },
    card: {
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    orderItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    orderItemLabel: {
        fontSize: 14,
        color: "#777",
    },
    orderItemValue: {
        fontSize: 14,
        fontWeight: "500",
        maxWidth: "60%",
        textAlign: "right",
    },
    divider: {
        height: 1,
        backgroundColor: "#222",
        marginVertical: 10,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "bold",
    },
    totalValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B7172",
    },
    stepItem: {
        flexDirection: "row",
        marginBottom: 15,
    },
    stepNumber: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#4B7172",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    stepNumberText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    stepDescription: {
        fontSize: 14,
        color: "#777",
        lineHeight: 20,
    },
    actionButtons: {
        marginTop: 10,
    },
    primaryButton: {
        backgroundColor: "#4B7172",
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    secondaryButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#4B7172",
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B7172",
    },
})

