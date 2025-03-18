"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import "@/global.css"

// Define types
interface Conversation {
    id: string;
    freelancerId: string;
    freelancerName: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    orderId?: string;
    orderTitle?: string;
}

// Mock data for conversations
const mockConversations: Conversation[] = [
    {
        id: "1",
        freelancerId: "201",
        freelancerName: "John Doe",
        lastMessage: "I've started working on your mobile app. Do you have any specific color preferences?",
        timestamp: "2023-06-18T14:30:00.000Z",
        unread: 2,
        orderId: "1",
        orderTitle: "Professional Mobile App Development"
    },
    {
        id: "2",
        freelancerId: "202",
        freelancerName: "Jane Smith",
        lastMessage: "Thank you for your order! I'll start working on your UI design right away.",
        timestamp: "2023-06-18T10:15:00.000Z",
        unread: 0,
        orderId: "2",
        orderTitle: "Modern UI/UX Design for Web & Mobile"
    },
    {
        id: "3",
        freelancerId: "203",
        freelancerName: "Mike Johnson",
        lastMessage: "I've delivered the content. Please let me know if you need any revisions.",
        timestamp: "2023-06-17T16:45:00.000Z",
        unread: 1,
        orderId: "3",
        orderTitle: "SEO-Optimized Content Writing"
    },
    {
        id: "4",
        freelancerId: "204",
        freelancerName: "Sarah Williams",
        lastMessage: "I'm glad you liked the logo design. It was a pleasure working with you!",
        timestamp: "2023-06-15T09:20:00.000Z",
        unread: 0,
        orderId: "4",
        orderTitle: "Logo Design"
    }
]

export default function MessagesScreen() {
    const router = useRouter()
    const params = useLocalSearchParams()
    const [searchQuery, setSearchQuery] = useState("")
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulate API call
        setIsLoading(true)
        setTimeout(() => {
            setConversations(mockConversations)
            setFilteredConversations(mockConversations)
            setIsLoading(false)

            // If there's a freelancerId in params, navigate to that conversation
            if (params.freelancerId) {
                const conversation = mockConversations.find(c => c.freelancerId === params.freelancerId)
                if (conversation) {
                    router.push({
                        pathname: "/chat",
                        params: {
                            id: conversation.id,
                            freelancerId: conversation.freelancerId,
                            freelancerName: conversation.freelancerName,
                            orderId: conversation.orderId,
                            orderTitle: conversation.orderTitle
                        }
                    })
                }
            }
        }, 1000)
    }, [params.freelancerId])

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredConversations(conversations)
        } else {
            const query = searchQuery.toLowerCase()
            const filtered = conversations.filter(
                conversation =>
                    conversation.freelancerName.toLowerCase().includes(query) ||
                    (conversation.orderTitle && conversation.orderTitle.toLowerCase().includes(query))
            )
            setFilteredConversations(filtered)
        }
    }, [searchQuery, conversations])

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffInDays === 0) {
            // Today - show time
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        } else if (diffInDays === 1) {
            // Yesterday
            return 'Yesterday'
        } else if (diffInDays < 7) {
            // This week - show day name
            return date.toLocaleDateString('en-US', { weekday: 'short' })
        } else {
            // Older - show date
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
    }

    return (
        <ThemedView style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search messages..."
                    placeholderTextColor="#777"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Conversations List */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.conversationsContainer}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4B7172" />
                        <ThemedText style={styles.loadingText}>Loading conversations...</ThemedText>
                    </View>
                ) : filteredConversations.length > 0 ? (
                    filteredConversations.map(conversation => (
                        <TouchableOpacity
                            key={conversation.id}
                            style={styles.conversationCard}
                            onPress={() => router.push({
                                pathname: "/chat",
                                params: {
                                    id: conversation.id,
                                    freelancerId: conversation.freelancerId,
                                    freelancerName: conversation.freelancerName,
                                    orderId: conversation.orderId,
                                    orderTitle: conversation.orderTitle
                                }
                            })}
                        >
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatar}>
                                    <ThemedText style={styles.avatarText}>
                                        {conversation.freelancerName.split(' ').map(n => n[0]).join('')}
                                    </ThemedText>
                                </View>
                                {conversation.unread > 0 && (
                                    <View style={styles.unreadBadge}>
                                        <Text style={styles.unreadText}>{conversation.unread}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.conversationContent}>
                                <View style={styles.conversationHeader}>
                                    <ThemedText style={styles.freelancerName}>{conversation.freelancerName}</ThemedText>
                                    <ThemedText style={styles.timestamp}>{formatTimestamp(conversation.timestamp)}</ThemedText>
                                </View>
                                {conversation.orderTitle && (
                                    <ThemedText style={styles.orderTitle}>{conversation.orderTitle}</ThemedText>
                                )}
                                <ThemedText
                                    style={[styles.lastMessage, conversation.unread > 0 && styles.unreadMessage]}
                                    numberOfLines={2}
                                >
                                    {conversation.lastMessage}
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <Ionicons name="chatbubble-ellipses-outline" size={50} color="#333" />
                        <ThemedText style={styles.emptyStateTitle}>No messages yet</ThemedText>
                        <ThemedText style={styles.emptyStateText}>
                            {searchQuery.trim() !== ""
                                ? "No conversations match your search."
                                : "Start a conversation by placing an order with a freelancer."}
                        </ThemedText>
                        {searchQuery.trim() !== "" && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => setSearchQuery("")}
                            >
                                <ThemedText style={styles.clearButtonText}>Clear Search</ThemedText>
                            </TouchableOpacity>
                        )}
                        {searchQuery.trim() === "" && (
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
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 10,
        margin: 20,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#CFD5D5"
    },
    conversationsContainer: {
        flex: 1,
        paddingHorizontal: 20,
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
    conversationCard: {
        flexDirection: "row",
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 15,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(75, 113, 114, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4B7172",
    },
    unreadBadge: {
        position: "absolute",
        top: -5,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#e74c3c",
        justifyContent: "center",
        alignItems: "center",
    },
    unreadText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    freelancerName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    timestamp: {
        fontSize: 12,
        color: "#777",
    },
    orderTitle: {
        fontSize: 14,
        color: "#4B7172",
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: 14,
        color: "#777",
        lineHeight: 20,
    },
    unreadMessage: {
        color: "#CFD5D5",
        fontWeight: "500",
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
    clearButton: {
        backgroundColor: "#333",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    clearButtonText: {
        color: "#fff",
        fontWeight: "bold",
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
