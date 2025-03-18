"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import "@/global.css"
import { OrderStatus, Order } from "@/types/order"
import { getAllMyOrders_Client } from "@/api/orders"



export default function OrdersScreen() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active')
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)


    useFocusEffect(
        useCallback(() => {

            const fetchMyRecentOrders = async () => {
                try {
                    setIsLoading(true)
                    const response = await getAllMyOrders_Client()
                    console.log(response)

                    if (response?.status === "success") {
                        setOrders(response.data.orders)
                    }
                } catch (error) {
                    console.error("Error fetching featured gigs:", error)
                } finally {
                    setIsLoading(false)
                }
            }


            fetchMyRecentOrders();

            return () => {
            }
        }, [])
    )

    const filteredOrders = orders.filter(order => {
        if (!order.status) return false

        if (activeTab === 'active') {
            return ['pending'].includes(order.status)
        } else if (activeTab === 'completed') {
            return order.status === 'completed'
        } else {
            return order.status === 'cancelled'
        }
    })


    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return '#295C65'
            case 'completed':
                return '#4CAF50'
            case 'cancelled':
                return '#F44336'
        }
    }

    const getStatusText = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return 'Pending'
            case 'completed':
                return 'Completed'
            case 'cancelled':
                return 'Cancelled'
        }
    }

    const formatDate = (dateInput: string | Date | undefined): string => {
        if (!dateInput) return 'N/A';
        const date = new Date(dateInput);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };


    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#4B7172" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>My Orders</ThemedText>
                <View style={styles.placeholder} />
            </View>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <ThemedText style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        Active
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
                    onPress={() => setActiveTab('completed')}
                >
                    <ThemedText style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
                        Completed
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
                    onPress={() => setActiveTab('cancelled')}
                >
                    <ThemedText style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>
                        Cancelled
                    </ThemedText>
                </TouchableOpacity>
            </View>

            {/* Orders List */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.ordersContainer}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4B7172" />
                        <ThemedText style={styles.loadingText}>Loading your orders...</ThemedText>
                    </View>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <TouchableOpacity
                            key={order._id}
                            style={styles.orderCard}
                        // onPress={() => router.push({
                        //     pathname: "/order-details",
                        //     params: { id: order.id }
                        // })}
                        >
                            <View style={styles.orderHeader}>
                                <View style={styles.orderInfo}>
                                    <ThemedText style={styles.orderTitle}>{order.gig?.title}</ThemedText>
                                    {/* <ThemedText style={styles.freelancerName}>by {order.freelancerName}</ThemedText> */}
                                </View>
                                <ThemedText style={styles.orderAmount}>${order.gig?.selectedPackage.price}</ThemedText>
                            </View>

                            <View style={styles.orderDates}>
                                <View style={styles.dateItem}>
                                    <Ionicons name="calendar-outline" size={14} color="#777" />
                                    <ThemedText style={styles.dateText}>Ordered: {formatDate(order.createdAt)}</ThemedText>
                                </View>
                                <View style={styles.dateItem}>
                                    <Ionicons name="time-outline" size={14} color="#777" />
                                    <ThemedText style={styles.dateText}>Delivery: {formatDate(order.deliveryTime)}</ThemedText>
                                </View>
                            </View>

                            <View style={styles.orderFooter}>
                                <View style={[
                                    styles.statusBadge,
                                    {
                                        borderColor: getStatusColor(order.status ?? 'pending'),
                                        backgroundColor: `${getStatusColor(order.status ?? 'pending')}20`
                                    }
                                ]}>
                                    <ThemedText style={[styles.statusText, { color: getStatusColor(order.status ?? 'pending') }]}>
                                        {getStatusText(order.status ?? 'pending')}
                                    </ThemedText>
                                </View>

                                {order.status === 'completed' && (
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                    // onPress={() => router.push({
                                    //     pathname: "/review-order",
                                    //     params: { id: order.id }
                                    // })}
                                    >
                                        <ThemedText style={styles.actionButtonText}>Review</ThemedText>
                                    </TouchableOpacity>
                                )}

                                {order.status === 'pending' && (
                                    <TouchableOpacity
                                        style={styles.messageButton}
                                    // onPress={() => router.push({
                                    //     pathname: "/messages",
                                    //     params: { freelancerId: order.freelancerId }
                                    // })}
                                    >
                                        <Ionicons name="chatbubble-outline" size={16} color="#4B7172" />
                                        <ThemedText style={styles.messageButtonText}>Message</ThemedText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <Ionicons name="receipt-outline" size={50} color="#333" />
                        <ThemedText style={styles.emptyStateTitle}>No {activeTab} orders</ThemedText>
                        <ThemedText style={styles.emptyStateText}>
                            {activeTab === 'active'
                                ? "You don't have any active orders at the moment."
                                : activeTab === 'completed'
                                    ? "You don't have any completed orders yet."
                                    : "You don't have any cancelled orders."}
                        </ThemedText>
                        {activeTab !== 'active' && (
                            <TouchableOpacity
                                style={styles.browseButton}
                                onPress={() => setActiveTab('active')}
                            >
                                <ThemedText style={styles.browseButtonText}>View Active Orders</ThemedText>
                            </TouchableOpacity>
                        )}
                        {activeTab === 'active' && filteredOrders.length === 0 && (
                            <TouchableOpacity
                                style={styles.browseButton}
                                onPress={() => router.push('/browse')}
                            >
                                <ThemedText style={styles.browseButtonText}>Browse Gigs</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Bottom padding for scrolling */}
                <View style={{ height: 20 }} />
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30
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
        fontSize: 18,
        fontWeight: "bold",
    },
    placeholder: {
        width: 40,
    },
    tabsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#4B7172",
    },
    tabText: {
        fontSize: 14,
        color: "#777",
    },
    activeTabText: {
        color: "#4B7172",
        fontWeight: "bold",
    },
    ordersContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 30,
    },
    loadingText: {
        marginTop: 10,
        color: "#777",
    },
    orderCard: {
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    orderInfo: {
        flex: 1,
        marginRight: 10,
    },
    orderTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    freelancerName: {
        fontSize: 14,
        color: "#777",
    },
    orderAmount: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B7172",
    },
    orderDates: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    dateItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateText: {
        fontSize: 12,
        color: "#777",
        marginLeft: 4,
    },
    orderFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#222",
        paddingTop: 15,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "500",
    },
    actionButton: {
        backgroundColor: "#4B7172",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    messageButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(75, 113, 114, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    messageButtonText: {
        color: "#4B7172",
        fontSize: 12,
        fontWeight: "bold",
        marginLeft: 4,
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
    }
})
