"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useRouter, useSegments } from "expo-router"

// Define the auth state type
type AuthState = {
  isAuthenticated: boolean
  user: any | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (name: string, email: string, password: string) => Promise<boolean>
  signOut: () => void
}

// Create the context with a default value
const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  user: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: () => {},
})

// Provider component that wraps your app and makes auth object available to any child component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const segments = useSegments()

  // Check if the user is authenticated when the segments change
  useEffect(() => {
    const inAuthGroup = segments[0] === "(modals)" && (segments[1] === "login" || segments[1] === "register")

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if not authenticated and not already on an auth screen
      router.replace("/login")
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the home page if authenticated but still on an auth screen
      router.replace("/(tabs)")
    }
  }, [isAuthenticated, segments])

  // Mock sign in function - replace with actual authentication
  const signIn = async (email: string, password: string) => {
    try {
      // Here you would typically make an API call to validate credentials
      // For demo purposes, we'll just simulate a successful login
      // In a real app, you would verify credentials with your backend

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful authentication
      const userData = { id: "1", email, name: "User" }
      setUser(userData)
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error("Sign in error:", error)
      return false
    }
  }

  // Mock sign up function - replace with actual registration
  const signUp = async (name: string, email: string, password: string) => {
    try {
      // Here you would typically make an API call to register the user
      // For demo purposes, we'll just simulate a successful registration

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful registration
      const userData = { id: "1", email, name }
      setUser(userData)
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error("Sign up error:", error)
      return false
    }
  }

  // Sign out function
  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    router.replace("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)

