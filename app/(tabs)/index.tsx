"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import GigCard from "@/components/GigCard"
import OrderItemCard from "@/components/OrderItem"
import { GigData } from "@/types/gigs"
import "@/global.css"
import { getMyGigs } from "@/api/gigs"



interface OrderItem {
  id: string;
  clientName: string;
  gigTitle: string;
  amount: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
}








const recentOrders: OrderItem[] = [
  {
    id: "1",
    clientName: "Maria Naeem",
    gigTitle: "Professional Mobile App Development",
    amount: "$250",
    status: "in_progress",
    date: "2 days ago",
  },
  {
    id: "2",
    clientName: "Hussnain Ul Abidin",
    gigTitle: "Modern UI/UX Design for Web & Mobile",
    amount: "$180",
    status: "pending",
    date: "5 hours ago",
  },
  {
    id: "3",
    clientName: "Hamdan Sajid",
    gigTitle: "SEO-Optimized Content Writing",
    amount: "$75",
    status: "completed",
    date: "1 week ago",
  },
]





export default function HomeScreen() {

  const [myGigs, setGigs] = useState<GigData[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await getMyGigs();

        const gigsArray = Array.isArray(response?.data?.myGigs)
          ? response.data.myGigs
          : [];

        setGigs(gigsArray);
      } catch (error) {
        console.error("Failed to fetch gigs", error);

        setGigs([]);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchGigs();
  }, []);


  const router = useRouter()

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting} className="text-red-600">Hello, Freelancer</ThemedText>
            <ThemedText style={styles.subGreeting}>Manage your gigs and orders</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#4B7172" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Create New Gig Button */}
        <TouchableOpacity
          style={styles.createGigButton}
          onPress={() => router.push('/addGig')}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <ThemedText style={styles.createGigText}>Create New Gig</ThemedText>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
          >
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(75, 113, 114, 0.1)' }]}>
              <Ionicons name="cash-outline" size={24} color="#4B7172" />
            </View>
            <ThemedText style={styles.statCount}>$1,250</ThemedText>
            <ThemedText style={styles.statLabel}>This Month</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/orders')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(75, 113, 114, 0.1)' }]}>
              <Ionicons name="cart-outline" size={24} color="#4B7172" />
            </View>
            <ThemedText style={styles.statCount}>8</ThemedText>
            <ThemedText style={styles.statLabel}>Active Orders</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/myGigs')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(75, 113, 114, 0.1)' }]}>
              <Ionicons name="briefcase-outline" size={24} color="#4B7172" />
            </View>
            <ThemedText style={styles.statCount}>{myGigs.filter(g => g.isActive).length}</ThemedText>
            <ThemedText style={styles.statLabel}>Active Gigs</ThemedText>
          </TouchableOpacity>
        </View>

        {/* My Gigs Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>My Gigs</ThemedText>
            <TouchableOpacity onPress={() => router.push('/myGigs')}>
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>

          {isLoading || initialLoading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#4B7172" />
              <Text className="mt-2 text-gray-400">Loading your gigs...</Text>
            </View>
          ) : myGigs.length > 0 ? (
            myGigs.slice(0, 3).map(gig => (
              <GigCard key={gig._id} gig={gig} />
            ))
          ) : (
            <View className="items-center justify-center py-10">
              <Ionicons name="search" size={50} color="#333" />
              <Text className="mt-4 text-lg font-semibold text-white">No gigs found</Text>
              <Text className="mt-2 text-gray-400 text-center">
                We couldn't find any gigs matching your search criteria.
              </Text>
            </View>
          )}

        </View>

        {/* Recent Orders Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Orders</ThemedText>
            <TouchableOpacity onPress={() => router.push('/orders')}>
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>

          {recentOrders.map(item => (
            <OrderItemCard key={item.id} item={item} />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionButton}
          >
            <Ionicons name="bar-chart" size={20} color="#fff" />
            <ThemedText style={styles.quickActionText}>Analytics</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/message')}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <ThemedText style={styles.quickActionText}>Messages</ThemedText>
          </TouchableOpacity>
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
    paddingTop: 40,
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
    color: "#CFD5D5"
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
