"use client"

import { useState, useCallback } from "react"
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { StatusBar } from "expo-status-bar"
import "@/global.css"
import type { OrderStatus, Order } from "@/types/order"
import { getAllMyOrders_Freelancer } from "@/api/orders"
import { confirmOrder, cancelOrder } from "@/api/orders"

export default function FreelancerOrdersScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "cancelled">("active")
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      const fetchMyOrders = async () => {
        try {
          setIsLoading(true)
          const response = await getAllMyOrders_Freelancer()
          console.log("Freelancer orders:", response)

          if (response?.status === "success") {
            setOrders(response.data.orders)
          }
        } catch (error) {
          console.error("Error fetching freelancer orders:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchMyOrders()

      return () => {}
    }, []),
  )

  const filteredOrders = orders.filter((order) => {
    if (!order.status) return false

    if (activeTab === "active") {
      return ["pending"].includes(order.status)
    } else if (activeTab === "completed") {
      return order.status === "completed"
    } else {
      return order.status === "cancelled"
    }
  })

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-[#4B7172]"
      case "completed":
        return "bg-green-600"
      case "cancelled":
        return "bg-red-600"
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
    }
  }

  const formatDate = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return "N/A"
    const date = new Date(dateInput)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleOrderAction = async (orderId: string | undefined, action: "complete" | "cancel" | "message") => {
    if (!orderId) return

    try {
      if (action === "complete") {
        const response = await confirmOrder(orderId)
        console.log("Order confirmed:", response)

        if (response?.status === "success") {
          setOrders((prevOrders) =>
            prevOrders.map((order) => (order._id === orderId ? { ...order, status: "completed" } : order)),
          )
        }
      } else if (action === "cancel") {
        const response = await cancelOrder(orderId)
        console.log("Order cancelled:", response)

        if (response?.status === "success") {
          setOrders((prevOrders) =>
            prevOrders.map((order) => (order._id === orderId ? { ...order, status: "cancelled" } : order)),
          )
        }
      } else if (action === "message") {
        // Navigate to chat with client
        // router.push({ pathname: "/message", params: { orderId } });
      }
    } catch (error) {
      console.error(`Error processing order action (${action}):`, error)
    }
  }

  return (
    <ThemedView className="flex-1 bg-black">
      <StatusBar style="light" />
      <View className="flex-row justify-between items-center px-5 pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 justify-center items-center">
          <Ionicons name="arrow-back" size={24} color="#4B7172" />
        </TouchableOpacity>
        <ThemedText className="text-xl font-bold">My Orders</ThemedText>
        <TouchableOpacity className="w-10 h-10 justify-center items-center">
          <Ionicons name="options-outline" size={22} color="#4B7172" />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View className="flex-row justify-between mx-5 mb-6">
        <View className="items-center">
          <Text className="text-lg font-bold text-white">{orders.filter((o) => o.status === "pending").length}</Text>
          <Text className="text-xs text-gray-400">Active</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-white">{orders.filter((o) => o.status === "completed").length}</Text>
          <Text className="text-xs text-gray-400">Completed</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-white">{orders.filter((o) => o.status === "cancelled").length}</Text>
          <Text className="text-xs text-gray-400">Cancelled</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-5 mb-6">
        <TouchableOpacity
          className={`py-2 px-5 rounded-full mr-2 ${activeTab === "active" ? "bg-[#4B7172]" : "bg-transparent"}`}
          onPress={() => setActiveTab("active")}
        >
          <Text className={`text-sm ${activeTab === "active" ? "text-white font-bold" : "text-gray-400"}`}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`py-2 px-5 rounded-full mr-2 ${activeTab === "completed" ? "bg-[#4B7172]" : "bg-transparent"}`}
          onPress={() => setActiveTab("completed")}
        >
          <Text className={`text-sm ${activeTab === "completed" ? "text-white font-bold" : "text-gray-400"}`}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`py-2 px-5 rounded-full ${activeTab === "cancelled" ? "bg-[#4B7172]" : "bg-transparent"}`}
          onPress={() => setActiveTab("cancelled")}
        >
          <Text className={`text-sm ${activeTab === "cancelled" ? "text-white font-bold" : "text-gray-400"}`}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#4B7172" />
            <Text className="mt-2 text-gray-400">Loading your orders...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <TouchableOpacity
              key={order._id}
              className="bg-[#111] rounded-lg p-4 mb-4"
              //   onPress={() =>
              //     router.push({
              //       pathname: "/order-details",
              //       params: { id: order._id },
              //     })
              //   }
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base font-bold text-white flex-1 mr-2" numberOfLines={1}>
                  {order.gig?.title || "Untitled Gig"}
                </Text>
                <View>
                  <Text className="text-base font-bold text-white text-right">
                    ${order.gig?.selectedPackage?.price || 0}
                  </Text>
                  {order.status === "pending" && (
                    <TouchableOpacity
                      className="bg-red-600 w-6 h-6 rounded-full items-center justify-center self-end mt-1"
                      onPress={() => handleOrderAction(order._id, "cancel")}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Text className="text-sm text-gray-600 mb-3">Client ID: {order.clientID}</Text>

              <View className="mb-4">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="calendar-outline" size={14} color="#777" />
                  <Text className="text-sm text-gray-600 ml-2">Ordered: {formatDate(order.createdAt)}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#777" />
                  <Text className="text-sm text-gray-600 ml-2">Due: {formatDate(order.deliveryTime)}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <View className={`px-5 py-2 rounded-md ${getStatusColor(order.status ?? "pending")}`}>
                  <Text className="text-xs font-bold text-white">{getStatusText(order.status ?? "pending")}</Text>
                </View>

                <View className="flex-row">
                  {order.status === "pending" && (
                    <>
                      <TouchableOpacity
                        className="bg-[#4B7172] px-4 py-2 rounded-md mr-2"
                        onPress={() => handleOrderAction(order._id, "complete")}
                      >
                        <Text className="text-xs font-bold text-white">Complete</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="bg-white border border-gray-300 px-4 py-2 rounded-md flex-row items-center"
                        onPress={() => handleOrderAction(order._id, "message")}
                      >
                        <Ionicons name="chatbubble-outline" size={14} color="#333" />
                        <Text className="text-xs font-bold text-gray-800 ml-1">Message</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {order.status === "completed" && (
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text className="text-sm text-gray-800 ml-1">
                        {order.gig?.rating ? order.gig.rating : "Not rated yet"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center py-10">
            <Ionicons name="receipt-outline" size={50} color="#777" />
            <Text className="mt-4 text-lg font-semibold text-white">No {activeTab} orders</Text>
            <Text className="mt-2 text-gray-400 text-center">
              {activeTab === "active"
                ? "You don't have any active orders at the moment."
                : activeTab === "completed"
                  ? "You don't have any completed orders yet."
                  : "You don't have any cancelled orders."}
            </Text>
            {activeTab !== "active" && (
              <TouchableOpacity
                className="mt-6 bg-[#4B7172] py-3 px-6 rounded-lg"
                onPress={() => setActiveTab("active")}
              >
                <Text className="text-white font-semibold">View Active Orders</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom padding for scrolling */}
        <View className="h-20" />
      </ScrollView>
    </ThemedView>
  )
}

