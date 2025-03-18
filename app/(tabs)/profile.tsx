import { View, StyleSheet, TouchableOpacity } from "react-native"
import { useAuth } from "@/components/AuthContext"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { getUserPFP } from "@/hooks/getUserPfp"
import { Image, ActivityIndicator } from "react-native"
import { useFocusEffect } from "expo-router"; // or from @react-navigation/native
import React from "react"
import { fetchUserPFP } from "@/api/user"



const Profile = () => {
  const { user, signOut } = useAuth()
  const [image, setImage] = useState<string | null>(getUserPFP(user?.id, true));
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setImage(getUserPFP(user?.id, true))
    }, [user?.id]),
  )

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {image ? (
            <View className="w-32 h-32 rounded-full items-center justify-center relative">

              <Image
                source={{ uri: image }}
                className="w-32 h-32 rounded-full"
              />
            </View>
          ) : (
            <View className="w-32 h-32 rounded-full bg-gray-700 items-center justify-center">
              <Ionicons name="person" size={64} color="#4B7172" />
            </View>
          )}
        </View>
        <ThemedText style={styles.name}>{user?.name || "User"}</ThemedText>
        <ThemedText style={styles.email}>{user?.email || "user@example.com"}</ThemedText>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/editProfile')}>
          <Ionicons name="person-outline" size={24} color="#fff" />
          <ThemedText style={styles.menuText}>Edit Profile</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={24} color="#fff" />
          <ThemedText style={styles.menuText}>Payment Methods</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <ThemedText style={styles.menuText}>Notifications</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#fff" />
          <ThemedText style={styles.menuText}>Privacy & Security</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#fff" />
          <ThemedText style={styles.menuText}>Help & Support</ThemedText>
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
    marginBottom: 40,
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

export default Profile

