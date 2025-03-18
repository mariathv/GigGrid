"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import "@/global.css"
import { useAuth } from "@/components/AuthContext"
import { placeGigOrder } from "@/api/orders"

export default function OrderConfirmationScreen() {
    const router = useRouter()
    const params = useLocalSearchParams()
    const { user } = useAuth();


    const [requirements, setRequirements] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handlePlaceOrder = async () => {
        try {
            setIsSubmitting(true);

            const bodyData = {
                gigID: params.gigId,
                clientID: user?.id,
                selectedPackage: params.package,
            };

            const response = await placeGigOrder(bodyData);

            if (response?.status === "success") {
                const orderId = response.data?.order?._id;

                console.log("Successfully placed order 😄");

                router.push({
                    pathname: "/order-success",
                    params: {
                        orderId: orderId || Math.floor(Math.random() * 1000000).toString(),
                        price: params.price,
                        freelancerName: params.freelancerName
                    },
                });
            }
        } catch (error) {
            console.error("Error placing order:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#4B7172" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Order Confirmation</ThemedText>
                    <View style={styles.placeholder} />
                </View>

                {/* Order Summary */}
                <View style={styles.card}>
                    <ThemedText style={styles.cardTitle}>Order Summary</ThemedText>
                    <View style={styles.orderItem}>
                        <ThemedText style={styles.orderItemLabel}>Package</ThemedText>
                        <ThemedText style={styles.orderItemValue}>
                            {params.package === "basic" ? "Basic" : params.package === "standard" ? "Standard" : "Premium"} Package
                        </ThemedText>
                    </View>
                    <View style={styles.orderItem}>
                        <ThemedText style={styles.orderItemLabel}>Price</ThemedText>
                        <ThemedText style={styles.orderItemValue}>${params.price}</ThemedText>
                    </View>
                    <View style={styles.orderItem}>
                        <ThemedText style={styles.orderItemLabel}>Service Fee</ThemedText>
                        <ThemedText style={styles.orderItemValue}>$5.00</ThemedText>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.orderItem}>
                        <ThemedText style={styles.totalLabel}>Total</ThemedText>
                        <ThemedText style={styles.totalValue}>${(Number(params.price) + 5).toFixed(2)}</ThemedText>
                    </View>
                </View>

                {/* Requirements */}
                <View style={styles.card}>
                    <ThemedText style={styles.cardTitle}>Project Requirements</ThemedText>
                    <ThemedText style={styles.cardDescription}>
                        Provide specific details about what you need for this project
                    </ThemedText>
                    <TextInput
                        style={styles.requirementsInput}
                        placeholder="Describe your requirements in detail..."
                        placeholderTextColor="#777"
                        multiline
                        numberOfLines={6}
                        value={requirements}
                        onChangeText={setRequirements}
                    />
                </View>

                {/* Payment Method */}
                <View style={styles.card}>
                    <ThemedText style={styles.cardTitle}>Payment Method</ThemedText>
                    <View style={styles.paymentMethod}>
                        <Ionicons name="card-outline" size={24} color="#4B7172" />
                        <View style={styles.paymentMethodInfo}>
                            <ThemedText style={styles.paymentMethodTitle}>Credit Card</ThemedText>
                            <ThemedText style={styles.paymentMethodSubtitle}>**** **** **** 4242</ThemedText>
                        </View>
                        <Ionicons name="checkmark-circle" size={24} color="#4B7172" />
                    </View>
                    <TouchableOpacity style={styles.addPaymentButton}>
                        <Ionicons name="add-circle-outline" size={20} color="#4B7172" />
                        <ThemedText style={styles.addPaymentText}>Add Payment Method</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Bottom padding for scrolling */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.placeOrderContainer}>
                <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <ThemedText style={styles.placeOrderText}>Place Order</ThemedText>
                    )}
                </TouchableOpacity>
                <ThemedText style={styles.termsText}>
                    By placing this order, you agree to our Terms of Service and Privacy Policy
                </ThemedText>
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingBottom: 50
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    placeholder: {
        width: 40,
    },
    card: {
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    cardDescription: {
        fontSize: 14,
        color: "#777",
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
    requirementsInput: {
        backgroundColor: "#222",
        borderRadius: 8,
        padding: 15,
        color: "#CFD5D5",
        fontSize: 14,
        textAlignVertical: "top",
        minHeight: 120,
    },
    paymentMethod: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#222",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    paymentMethodInfo: {
        flex: 1,
        marginLeft: 15,
    },
    paymentMethodTitle: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 2,
    },
    paymentMethodSubtitle: {
        fontSize: 14,
        color: "#777",
    },
    addPaymentButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
    },
    addPaymentText: {
        fontSize: 14,
        color: "#4B7172",
        marginLeft: 5,
    },
    placeOrderContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#111",
        borderTopWidth: 1,
        borderTopColor: "#222",
        padding: 20,
    },
    placeOrderButton: {
        backgroundColor: "#4B7172",
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    placeOrderText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    termsText: {
        fontSize: 12,
        color: "#777",
        textAlign: "center",
    },
})

