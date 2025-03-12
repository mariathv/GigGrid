"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useRouter, useSegments } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { apiRequest } from "@/hooks/api/api-gg"

// Storage keys
const AUTH_TOKEN_KEY = "auth_token"
const USER_DATA_KEY = "user_data"

type User = {
  id: string
  email: string
  name: string
  userType?: "Freelancer" | "Client"
}

type AuthState = {
  isAuthenticated: boolean
  user: User | null
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  signUp: (name: string, email: string, password: string, confirmPassword: string, userType: string) => Promise<boolean>
  signOut: () => void
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  user: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  // Check for existing token on startup
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY)
        const userData = await AsyncStorage.getItem(USER_DATA_KEY)

        if (token && userData) {
          // Token exists, set authenticated state
          setUser(JSON.parse(userData))
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkToken()
  }, [])

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return // Don't redirect while checking auth state

    const inAuthGroup =
      segments[0] === "(modals)" &&
      (segments[1] === "login" || segments[1] === "register" || segments[1] === "user-type")

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login")
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)")
    }
  }, [isAuthenticated, segments, isLoading])

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const requestBody = {
        email,
        password,
      }

      const response = await apiRequest<{
        status: string
        data: {
          user: {
            _id: string
            email: string
            name: string
            userType: "Freelancer" | "Client"
          }
        }
        token?: string
      }>("auth/login", requestBody, "POST", 20000)

      if (response.status && response.data?.user) {
        const userData: User = {
          id: response.data.user._id,
          email: response.data.user.email,
          name: response.data.user.name,
          userType: response.data.user.userType,
        }

        // Store token and user data if remember me is checked
        if (rememberMe && response.token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token)
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
        }

        setUser(userData)
        setIsAuthenticated(true)
        return true
      } else {
        throw new Error("Sign in failed")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      return false
    }
  }

  const signUp = async (name: string, email: string, password: string, passwordConfirm: string, userType: string) => {
    try {
      const requestBody = {
        name,
        email,
        password,
        passwordConfirm,
        userType,
      }

      const response = await apiRequest<{
        status: string
        data: {
          user: {
            _id: string
            email: string
            name: string
            userType: "Freelancer" | "Client"
          }
        }
        token?: string
      }>("auth/register", requestBody, "POST", 20000)

      if (response.status === "success" && response.data?.user) {
        const userData: User = {
          id: response.data.user._id,
          email: response.data.user.email,
          name: response.data.user.name,
          userType: response.data.user.userType as "Freelancer" | "Client",
        }

        // Store token and user data on successful registration
        if (response.token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token)
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
        }

        setUser(userData)
        setIsAuthenticated(true)
        return true
      } else {
        throw new Error("Registration failed")
      }
    } catch (error) {
      console.error("Sign up error:", error instanceof Error ? error.message : String(error))
      return false
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      // Clear stored token and user data
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
      await AsyncStorage.removeItem(USER_DATA_KEY)

      setUser(null)
      setIsAuthenticated(false)
      router.replace("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

