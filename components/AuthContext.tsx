"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useRouter, useSegments } from "expo-router"
import { apiRequest } from "@/hooks/api/api-gg"

type User = {
  id: string
  email: string
  name: string
  userType?: "Freelancer" | "Client"
}

type AuthState = {
  isAuthenticated: boolean
  user: User | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (name: string, email: string, password: string, confirmPassword: string, userType: string) => Promise<boolean>
  signOut: () => void
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  user: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    const inAuthGroup =
      segments[0] === "(modals)" &&
      (segments[1] === "login" || segments[1] === "register" || segments[1] === "user-type")

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/user-type")
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)")
    }
  }, [isAuthenticated, segments])

  const signIn = async (email: string, password: string) => {
    try {

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const userData: User = {
        id: "1",
        email,
        name: "User",
        userType: "Freelancer",
      }
      setUser(userData)
      setIsAuthenticated(true)
      return true
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
        userType
      };

      const response = await apiRequest<{
        status: string;
        data: {
          user: {
            _id: string;
            email: string;
            name: string;
            userType: "Freelancer" | "Client";
          };
        };
        token?: string;
      }>("auth/register", requestBody, "POST", 20000);


      if (response.status === "success" && response.data?.user) {
        const userData: User = {
          id: response.data.user._id,
          email: response.data.user.email,
          name: response.data.user.name,
          userType: response.data.user.userType as "Freelancer" | "Client",
        };

        if (response.token) {
          // Store token
        }

        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error("Registration failed");
      }

    } catch (error) {
      console.error("Sign up error:", error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // Sign out function
  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    router.replace("/user-type")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

