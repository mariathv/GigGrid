"use client"

import React, { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import "@/global.css"
import { getOrderById } from "@/api/orders"
import type { Order, OrderStatus } from "@/types/order"

export default function OrderDetailsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { id } = params
  const orderId = Array.isArray(id) ? id[0] : id

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return

      try {
        setIsLoading(true)
        const response = await getOrderById(orderId)
        console.log("Order details response:", response)

        if (response?.status === "success"){
          setOrder(response.data.orders)
          console.log("Order completion link:", response.data.orders.completionLink)
        } else {
          Alert.alert("Error", "Failed to load order details")
        }
      } catch (error) {
        console.error("Error fetching order details:", error)
        Alert.alert("Error", "Something went wrong while loading order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "#FF9800"
      case "completed":
        return "#4CAF50"
      case "cancelled":
        return "#F44336"
      default:
        return "#777"
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleMessageFreelancer = () => {
    if (!order?.freelancerID) return

    // router.push({
    //   pathname: "/chat",
    //   params: {
    //     freelancerId: order.freelancerID,
    //     orderId: order._id,
    //     orderTitle: order.gig?.title,
    //   },
    // })
  }

  const handleReviewOrder = () => {
    if (!order?._id) return

    router.push({
      pathname: "/review-order",
      params: {
        orderId: order._id,
        gigId: order.gigID,
        gigTitle: order.gig?.title,
      },
    })
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B7172" />
        <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
      </ThemedView>
    )
  }

  if (!order) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#F44336" />
        <ThemedText style={styles.errorTitle}>Order Not Found</ThemedText>
        <ThemedText style={styles.errorText}>
          The order you're looking for doesn't exist or has been removed.
        </ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4B7172" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Order ID and Status */}
        <View style={styles.orderHeader}>
          <View>
            <ThemedText style={styles.orderIdLabel}>Order ID</ThemedText>
            <ThemedText style={styles.orderId}>{order._id}</ThemedText>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${getStatusColor(order.status || "pending")}20`,
                borderColor: getStatusColor(order.status || "pending"),
              },
            ]}
          >
            <ThemedText style={[styles.statusText, { color: getStatusColor(order.status || "pending") }]}>
              {getStatusText(order.status || "pending")}
            </ThemedText>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Order Summary</ThemedText>
          <View style={styles.gigInfo}>
            <View style={styles.gigImagePlaceholder} />
            <View style={styles.gigDetails}>
              <ThemedText style={styles.gigTitle}>{order.gig?.title || "Untitled Gig"}</ThemedText>
              <ThemedText style={styles.packageType}>
                {order.gig?.selectedPackage?.type?.charAt(0).toUpperCase() +
                  (order.gig?.selectedPackage?.type?.slice(1) || "Basic")}{" "}
                Package
              </ThemedText>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderItem}>
            <ThemedText style={styles.orderItemLabel}>Package Price</ThemedText>
            <ThemedText style={styles.orderItemValue}>${order.gig?.selectedPackage?.price || 0}</ThemedText>
          </View>
          <View style={styles.orderItem}>
            <ThemedText style={styles.orderItemLabel}>Service Fee</ThemedText>
            <ThemedText style={styles.orderItemValue}>$5.00</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderItem}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>
              ${((order.gig?.selectedPackage?.price || 0) + 5).toFixed(2)}
            </ThemedText>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Order Timeline</ThemedText>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: "#4B7172" }]} />
            <View style={styles.timelineContent}>
              <ThemedText style={styles.timelineTitle}>Order Placed</ThemedText>
              <ThemedText style={styles.timelineDate}>{formatDate(order.createdAt)}</ThemedText>
            </View>
          </View>
          <View style={styles.timelineConnector} />
          <View style={styles.timelineItem}>
            <View
              style={[styles.timelineDot, { backgroundColor: order.status === "completed" ? "#4CAF50" : "#777" }]}
            />
            <View style={styles.timelineContent}>
              <ThemedText style={styles.timelineTitle}>Expected Delivery</ThemedText>
              <ThemedText style={styles.timelineDate}>{formatDate(order.deliveryTime)}</ThemedText>
            </View>
          </View>
          {order.status === "completed" && (
            <>
              <View style={styles.timelineConnector} />
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: "#4CAF50" }]} />
                <View style={styles.timelineContent}>
                  <ThemedText style={styles.timelineTitle}>Order Completed</ThemedText>
                  {/* <ThemedText style={styles.timelineDate}>{formatDate(order.updatedAt)}</ThemedText> */}
                </View>
              </View>
              
              {order.completionLink && (
                <View style={styles.deliverableContainer}>
                  <ThemedText style={styles.deliverableTitle}>Delivered Work</ThemedText>
                  <TouchableOpacity 
                    style={styles.deliverableLink}
                    onPress={() => {
                      // Open link in browser
                      if (order.completionLink) {
                        const url = order.completionLink.startsWith('http') 
                          ? order.completionLink 
                          : `https://${order.completionLink}`;
                        
                        // Use the Linking API from react-native
                        Linking.openURL(url).catch((err: Error) => {
                          console.error('Error opening URL:', err);
                          Alert.alert('Error', 'Could not open the link');
                        });
                      }
                    }}
                  >
                    <Ionicons name="link-outline" size={18} color="#FFFFFF" />
                    <ThemedText style={styles.deliverableLinkText}>View Completion Link</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
          {order.status === "cancelled" && (
            <>
              <View style={styles.timelineConnector} />
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: "#F44336" }]} />
                <View style={styles.timelineContent}>
                  <ThemedText style={styles.timelineTitle}>Order Cancelled</ThemedText>
                  {/* <ThemedText style={styles.timelineDate}>{formatDate(order.updatedAt)}</ThemedText> */}
                </View>
              </View>
            </>
          )}
        </View>

        {/* Package Details */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Package Details</ThemedText>
          <View style={styles.packageDetail}>
            <Ionicons name="time-outline" size={20} color="#777" />
            <ThemedText style={styles.packageDetailText}>
              {order.gig?.selectedPackage?.deliveryTime || 0} days delivery
            </ThemedText>
          </View>
          <View style={styles.packageDetail}>
            <Ionicons name="refresh-outline" size={20} color="#777" />
            <ThemedText style={styles.packageDetailText}>
              {order.gig?.selectedPackage?.numberOfRevisions || 0} revisions
            </ThemedText>
          </View>
          <View style={styles.divider} />
          <ThemedText style={styles.featuresTitle}>Features Included</ThemedText>
          {order.gig?.selectedPackage?.featuresIncluded?.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4B7172" />
              <ThemedText style={styles.featureText}>{feature}</ThemedText>
            </View>
          )) || <ThemedText style={styles.noFeaturesText}>No features specified</ThemedText>}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.messageButton} onPress={handleMessageFreelancer}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>Message Freelancer</ThemedText>
          </TouchableOpacity>

          {order.status === "completed" && (
            <TouchableOpacity style={styles.reviewButton} onPress={handleReviewOrder}>
              <Ionicons name="star-outline" size={20} color="#fff" />
              <ThemedText style={styles.buttonText}>Leave a Review</ThemedText>
            </TouchableOpacity>
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
    flex: 1,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#777",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
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
  gigInfo: {
    flexDirection: "row",
    marginBottom: 15,
  },
  gigImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#222",
    marginRight: 15,
  },
  gigDetails: {
    flex: 1,
    justifyContent: "center",
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  packageType: {
    fontSize: 14,
    color: "#777",
  },
  divider: {
    height: 1,
    backgroundColor: "#222",
    marginVertical: 15,
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
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B7172",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 15,
    marginTop: 3,
  },
  timelineConnector: {
    width: 2,
    height: 30,
    backgroundColor: "#222",
    marginLeft: 7,
    marginBottom: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: "#777",
  },
  packageDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  packageDetailText: {
    fontSize: 14,
    marginLeft: 10,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 10,
  },
  noFeaturesText: {
    fontSize: 14,
    color: "#777",
    fontStyle: "italic",
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  messageButton: {
    backgroundColor: "#4B7172",
    borderRadius: 8,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewButton: {
    backgroundColor: "#FF9800",
    borderRadius: 8,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  deliverableContainer: {
    marginTop: 15,
    marginLeft: 30,
    padding: 15,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  deliverableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  deliverableLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4B7172",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deliverableLinkText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "bold",
  },
})

