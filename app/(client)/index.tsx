"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import "@/global.css"
import type { GigData } from "@/types/gigs"
import React from "react"
import { getFeaturedGigs } from "@/api/gigs"
import GigCard from "@/components/BasicGigCard"
import { getMyRecentOrders_Client } from "@/api/orders"
import type { Order } from "@/types/order"
import { useAuth } from "@/components/AuthContext"

const popularCategories = [
    { id: "1", name: "Graphic Design", icon: "color-palette" },
    { id: "2", name: "Writing", icon: "document-text" },
    { id: "3", name: "Web Development", icon: "code-slash" },
    { id: "4", name: "Mobile Development", icon: "phone-portrait" },
    { id: "5", name: "Digital Marketing", icon: "megaphone" },
    { id: "6", name: "Video Editing", icon: "videocam" },
]

export default function ClientHomeScreen() {
    const [searchQuery, setSearchQuery] = useState("")
    const [featuredGigs, setFeaturedGigs] = useState<GigData[]>([])
    const [recentOrders, setRecentOrders] = useState<Order[]>([])
    const [isLoadingGigs, setIsLoadingGigs] = useState(true)
    const [isLoadingOrders, setIsLoadingOrders] = useState(true)
    const { user } = useAuth()
    const router = useRouter()

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push({
                pathname: "/(client)/browse",
                params: { search: searchQuery },
            })
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            const fetchFeaturedGigs = async () => {
                try {
                    setIsLoadingGigs(true)
                    const response = await getFeaturedGigs()
                    console.log(response)

                    if (response?.status === "success") {
                        setFeaturedGigs(response.data.allGigs)
                    }
                } catch (error) {
                    console.error("Error fetching featured gigs:", error)
                } finally {
                    setIsLoadingGigs(false)
                }
            }

            const fetchMyRecentOrders = async () => {
                try {
                    setIsLoadingOrders(true)
                    const response = await getMyRecentOrders_Client()
                    console.log(response)

                    if (response?.status === "success") {
                        setRecentOrders(response.data.orders)
                    }
                } catch (error) {
                    console.error("Error fetching featured gigs:", error)
                } finally {
                    setIsLoadingOrders(false)
                }
            }

            fetchFeaturedGigs()
            fetchMyRecentOrders()

            return () => { }
        }, []),
    )

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.greeting}>Hello, {user?.name}</ThemedText>
                        <ThemedText style={styles.subGreeting}>Find the perfect service for your needs</ThemedText>
                    </View>
                    <TouchableOpacity style={styles.notificationButton} onPress={() => router.push("/notifications")}>
                        <Ionicons name="notifications-outline" size={24} color="#4B7172" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationCount}>2</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for services..."
                        placeholderTextColor="#777"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                </View>

                {/* Popular Categories */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Popular Categories</ThemedText>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                        {popularCategories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.categoryCard}
                                onPress={() =>
                                    router.push({
                                        pathname: "/browse",
                                        params: { category: category.name },
                                    })
                                }
                            >
                                <View style={styles.categoryIconContainer}>
                                    <Ionicons name={category.icon as any} size={24} color="#4B7172" />
                                </View>
                                <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Featured Gigs */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Featured Gigs</ThemedText>
                        <TouchableOpacity onPress={() => router.push("/browse")}>
                            <ThemedText style={styles.seeAllText}>See All</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {isLoadingGigs ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4B7172" />
                            <ThemedText style={styles.loadingText}>Loading gigs...</ThemedText>
                        </View>
                    ) : featuredGigs.length > 0 ? (
                        featuredGigs.map((gig) => (
                            <TouchableOpacity
                                key={gig._id}
                                style={styles.gigCard}
                                onPress={() =>
                                    router.push({
                                        pathname: "/gig-details",
                                        params: { id: gig._id },
                                    })
                                }
                            >
                                <GigCard gig={gig} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="briefcase-outline" size={50} color="#333" />
                            <ThemedText style={styles.emptyStateTitle}>No gigs available</ThemedText>
                            <ThemedText style={styles.emptyStateText}>Check back later for featured gigs</ThemedText>
                        </View>
                    )}
                </View>

                {/* Recent Orders */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Recent Orders</ThemedText>
                        <TouchableOpacity onPress={() => router.push("/orders")}>
                            <ThemedText style={styles.seeAllText}>See All</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {isLoadingOrders ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4B7172" />
                            <ThemedText style={styles.loadingText}>Loading orders...</ThemedText>
                        </View>
                    ) : recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                            <TouchableOpacity key={order._id} style={styles.orderItem}>
                                <View style={styles.orderHeader}>
                                    <ThemedText style={styles.clientName}>{order.gig?.title}</ThemedText>
                                    <ThemedText style={styles.orderAmount}>${order.gig?.selectedPackage.price}</ThemedText>
                                </View>

                                <View style={styles.orderFooter}>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            {
                                                borderColor:
                                                    order.status === "completed" ? "#4CAF50" : order.status === "pending" ? "#FF9800" : "#F44336",

                                                backgroundColor:
                                                    order.status === "completed"
                                                        ? "rgba(76, 175, 80, 0.1)"
                                                        : order.status === "pending"
                                                            ? "rgba(255, 152, 0, 0.1)"
                                                            : "rgba(244, 67, 54, 0.1)",
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.statusText,
                                                {
                                                    color:
                                                        order.status === "completed"
                                                            ? "#4CAF50"
                                                            : order.status === "pending"
                                                                ? "#FF9800"
                                                                : "#F44336",
                                                },
                                            ]}
                                        >
                                            {order.status === "completed"
                                                ? "Completed"
                                                : order.status === "pending"
                                                    ? "Pending"
                                                    : "Cancelled"}
                                        </ThemedText>
                                    </View>
                                </View>
                                <ThemedText style={styles.orderDate}>
                                    {order.createdAt
                                        ? new Date(order.createdAt).toLocaleDateString(undefined, {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })
                                        : "N/A"}
                                </ThemedText>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="receipt-outline" size={50} color="#333" />
                            <ThemedText style={styles.emptyStateTitle}>No orders yet</ThemedText>
                            <ThemedText style={styles.emptyStateText}>Browse gigs and place your first order</ThemedText>
                            <TouchableOpacity style={styles.browseButton} onPress={() => router.push("/browse")}>
                                <ThemedText style={styles.browseButtonText}>Browse Gigs</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Bottom padding for scrolling */}
                <View style={{ height: 20 }} />
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 40,
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
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 10,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#CFD5D5",
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
    categoriesContainer: {
        marginBottom: 10,
    },
    categoryCard: {
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 15,
        marginRight: 12,
        width: 130,
        alignItems: "center",
    },
    categoryIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(75, 113, 114, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    categoryName: {
        fontSize: 12,
        textAlign: "center",
    },
    gigCard: {
        backgroundColor: "#111",
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: "row",
        overflow: "hidden",
    },
    gigImageContainer: {
        width: 20,
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
    emptyStateContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 30,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 15,
    },
    emptyStateText: {
        fontSize: 14,
        color: "#777",
        textAlign: "center",
        marginTop: 5,
        marginBottom: 20,
    },
    browseButton: {
        backgroundColor: "#4B7172",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    browseButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
        backgroundColor: "#111",
        borderRadius: 10,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: "#777",
    },
})

