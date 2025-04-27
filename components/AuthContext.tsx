"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useRouter, useSegments } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { apiRequest } from "@/hooks/api/api-gg"
import { setGlobalAuthToken } from "@/api"

// Storage keys
const AUTH_TOKEN_KEY = "auth_token"
export const USER_DATA_KEY = "user_data"

type User = {
  id: string
  email: string
  name: string
  userType?: "Freelancer" | "Client"
}

type AuthState = {
  isAuthenticated: boolean
  user: User | null
  token: string | null // ← add this
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  signUp: (name: string, email: string, password: string, confirmPassword: string, userType: string) => Promise<boolean>
  signOut: () => void
  updateUserData: (newUser: Partial<User>) => Promise<void>
}


const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  user: null,
  token: null, // ✅ Add this line
  signIn: async () => false,
  signUp: async () => false,
  signOut: () => { },
  updateUserData: async () => { },
})


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null);
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

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup =
      segments[0] === "(modals)" &&
      (segments[1] === "login" || segments[1] === "register" || segments[1] === "user-type")

    if (!isAuthenticated && !inAuthGroup) {
      // Use setTimeout to ensure navigation happens after layout is mounted
      setTimeout(() => {
        router.replace("/login")
      }, 0)
    } else if (isAuthenticated && inAuthGroup) {
      // Use setTimeout to ensure navigation happens after layout is mounted
      setTimeout(() => {
        if (user?.userType === "Freelancer") {
          console.log("redirecting to freelancer tabs")
          router.replace("/(tabs)")
        } else if (user?.userType === "Client") {
          console.log("redirecting to client tabs")
          router.replace("/(client)")
        }
      }, 0)
    }
  }, [isAuthenticated, segments, isLoading, user?.userType])

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const requestBody = { email, password }

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

      if (response.status && response.data?.user && response.token) {
        const userData: User = {
          id: response.data.user._id,
          email: response.data.user.email,
          name: response.data.user.name,
          userType: response.data.user.userType,
        }

        // Set state in the next tick to avoid immediate navigation
        const token = response.token
        setTimeout(() => {
          setUser(userData)
          setToken(token)
          setGlobalAuthToken(token)
          setIsAuthenticated(true)
        }, 0)

        if (rememberMe) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, token)
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
        }

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

        // Set state in the next tick to avoid immediate navigation
        setTimeout(() => {
          setUser(userData)
          setIsAuthenticated(true)
        }, 0)

        return true
      } else {
        throw new Error("Registration failed")
      }
    } catch (error) {
      console.error("Sign up error:", error instanceof Error ? error.message : String(error))
      return false
    }
  }

  const updateUserData = async (newUser: Partial<User>) => {

    if (!user) return;
    const updatedUser = { ...user, ...newUser };
    setUser(updatedUser);

    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
  }


  const signOut = async () => {
    try {
      // Clear stored token and user data
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
      await AsyncStorage.removeItem(USER_DATA_KEY)

      setToken(null)
      setUser(null)
      setGlobalAuthToken(null)
      setIsAuthenticated(false)
      router.replace("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, signIn, signUp, signOut, updateUserData, token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

/*

  create context for user image too with cache busting -> hamdan will do this
  steps:
    on image change -> save that image url with cache busted to context
    -> use that image then to load pfp eveywhere unless updated again
    this will result in literally 0s delay when loading image

*/

