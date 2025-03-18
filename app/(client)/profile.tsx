"use client"

import { View, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native"
import { useAuth } from "@/components/AuthContext"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { getUserPFP } from "@/hooks/getUserPfp"
import { useFocusEffect } from "expo-router"
import React from "react"

export default function ClientProfile() {
    const { user, signOut } = useAuth()
    const [image, setImage] = useState<string | null>(getUserPFP(user?.id))
    const [loading, setLoading] = useState(false)

    useFocusEffect(
        React.useCallback(() => {
            setImage(getUserPFP(user?.id))
        }, [user?.id]),
    )

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.profileImageContainer}>
                    {image ? (
                        <View className="w-32 h-32 rounded-full items-center justify-center relative">
                            {loading && (
                                <View className="absolute w-32 h-32 rounded-full items-center justify-center bg-black/30 z-10">
                                    <ActivityIndicator size="large" color="#fff" />
                                </View>
                            )}
                            <Image
                                source={{ uri: image }}
                                className="w-32 h-32 rounded-full"
                                onLoadStart={() => setLoading(true)}
                                onLoadEnd={() => setLoading(false)}
                                onError={() => setLoading(false)}
                            />
                        </View>
                    ) : (
                        <View className="w-32 h-32 rounded-full bg-gray-700 items-center justify-center">
                            <Ionicons name="person" size={64} color="#4B7172" />
                        </View>
                    )}
                </View>
                <ThemedText style={styles.name}>{user?.name || "Client User"}</ThemedText>
                <ThemedText style={styles.email}>{user?.email || "client@example.com"}</ThemedText>
            </View>

            {/* <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <ThemedText style={styles.statCount}>12</ThemedText>
                    <ThemedText style={styles.statLabel}>Orders</ThemedText>
                </View>
                <View style={styles.statCard}>
                    <ThemedText style={styles.statCount}>8</ThemedText>
                    <ThemedText style={styles.statLabel}>Completed</ThemedText>
                </View>
                <View style={styles.statCard}>
                    <ThemedText style={styles.statCount}>4.8</ThemedText>
                    <ThemedText style={styles.statLabel}>Avg. Rating</ThemedText>
                </View>
            </View> */}

            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/editProfile")}>
                    <Ionicons name="person-outline" size={24} color="#fff" />
                    <ThemedText style={styles.menuText}>Edit Profile</ThemedText>
                </TouchableOpacity>


            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
                <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 30,
    },
    profileImageContainer: {
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: "#999",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        marginHorizontal: 5,
    },
    statCount: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: "#777",
    },
    menuContainer: {
        marginBottom: 40,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    menuText: {
        fontSize: 16,
        color: "#fff",
        marginLeft: 16,
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4B7172",
        padding: 16,
        borderRadius: 8,
        marginTop: "auto",
    },
    signOutText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginLeft: 8,
    },
})

