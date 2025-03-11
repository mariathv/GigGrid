"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"

interface GigCardProps {
    gig: Gig;
}

interface Gig {
    id: string;
    title: string;
    category: string;
    price: string;
    rating: number;
    orders: number;
    image: string;
    isActive: boolean;
}

const GigCard = ({ gig }: GigCardProps) => {
    const router = useRouter()

    return (
        <TouchableOpacity style={styles.gigCard}>
            <View style={styles.gigImageContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: gig.isActive ? "#4CAF50" : "#FFA000" }]} />
                <Image
                    source={{ uri: gig.image || "/placeholder.svg?height=100&width=100" }}
                    style={styles.gigImage}
                />
            </View>
            <View style={styles.gigContent}>
                <ThemedText style={styles.gigTitle} numberOfLines={2}>{gig.title}</ThemedText>
                <ThemedText style={styles.gigCategory}>{gig.category}</ThemedText>

                <View style={styles.gigMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="star" size={14} color="#FFC107" />
                        <ThemedText style={styles.metaText}>{gig.rating}</ThemedText>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="cart-outline" size={14} color="#777" />
                        <ThemedText style={styles.metaText}>{gig.orders} orders</ThemedText>
                    </View>
                </View>

                <ThemedText style={styles.gigPrice}>{gig.price}</ThemedText>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    greeting: {
        fontSize: 24,
        fontWeight: "bold",
    },
    subGreeting: {
        fontSize: 16,
        color: "#777",
        marginTop: 4,
    },
    notificationButton: {
        position: "relative",
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(75, 113, 114, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    notificationBadge: {
        position: "absolute",
        top: 5,
        right: 5,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#e74c3c",
        justifyContent: "center",
        alignItems: "center",
    },
    notificationCount: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    createGigButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4B7172",
        borderRadius: 10,
        marginHorizontal: 20,
        marginVertical: 15,
        paddingVertical: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    createGigText: {
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 8,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterButton: {
        padding: 5,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    statCard: {
        width: "30%",
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    statCount: {
        fontSize: 16,
        fontWeight: "bold",
    },
    statLabel: {
        fontSize: 12,
        textAlign: "center",
        marginTop: 4,
    },
    sectionContainer: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    seeAllText: {
        fontSize: 14,
        color: "#4B7172",
        fontWeight: "500",
    },
    gigCard: {
        backgroundColor: "#111",
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        flexDirection: "row",
        overflow: "hidden",
    },
    gigImageContainer: {
        width: 100,
        height: 100,
        position: "relative",
    },
    statusIndicator: {
        position: "absolute",
        top: 8,
        left: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        zIndex: 1,
    },
    gigImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    gigContent: {
        flex: 1,
        padding: 12,
        justifyContent: "space-between",
    },
    gigTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    gigCategory: {
        fontSize: 12,
        color: "#777",
        marginBottom: 8,
    },
    gigMeta: {
        flexDirection: "row",
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
    },
    metaText: {
        fontSize: 12,
        color: "#777",
        marginLeft: 4,
    },
    gigPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B7172",
    },
    orderItem: {
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    },
    clientName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    orderAmount: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B7172",
    },
    orderTitle: {
        fontSize: 14,
        color: "#555",
        marginBottom: 10,
    },
    orderFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "500",
    },
    orderDate: {
        fontSize: 12,
        color: "#777",
    },
    quickActionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    quickActionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4B7172",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: "48%",
    },
    quickActionText: {
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8,
    },
})


export default GigCard;