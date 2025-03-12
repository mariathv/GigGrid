"use client"

import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native"
import { useState, useEffect } from "react"
import { Stack, Link, useRouter, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useAuth } from "@/components/AuthContext"

export default function RegisterScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)

  const router = useRouter()
  const { signUp } = useAuth()
  const params = useLocalSearchParams()

  useEffect(() => {
    // Get userType from params
    if (params.userType) {
      setUserType(params.userType as string)
    }
  }, [params.userType])

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    if (!userType) {
      alert("User type is missing. Please go back and select your user type.")
      return
    }

    setIsLoading(true)
    try {
      const success = await signUp(name, email, password, confirmPassword, userType)
      if (success) {
        // Navigation will be handled by the AuthContext
      } else {
        alert("Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: "#151619" },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <ThemedText style={styles.title}>Create account</ThemedText>
            <ThemedText style={styles.subtitle}>
              Create a new account as {userType === "freelancer" ? "a freelancer" : "a client"}
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Full Name</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Create a password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirm Password</ThemedText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Create Account</ThemedText>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Already have an account?</ThemedText>
            <Link href="/login" asChild>
              <TouchableOpacity disabled={isLoading}>
                <ThemedText style={styles.loginLink}>Sign In</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  button: {
    backgroundColor: "#4B7172",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingBottom: 20,
  },
  footerText: {
    color: "#999",
    marginRight: 4,
  },
  loginLink: {
    color: "#4B7172",
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
})

