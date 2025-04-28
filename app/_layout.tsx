"use client"

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import "react-native-reanimated"

import { useColorScheme } from "@/hooks/useColorScheme"
import { View } from "react-native"
import { AuthProvider, useAuth } from "@/components/AuthContext"
import { registerForPushNotificationsAsync } from "@/api/expo-notifications/notif"
import { API_URL } from "@/constants"

import { useState, useRef } from 'react';
import { Text, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants'


import "@/global.css"

SplashScreen.preventAutoHideAsync()

function RootLayoutContent() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const { token } = useAuth();

  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  useEffect(() => {
    async function setupNotifications() {
      try {
        const pushToken = await registerForPushNotificationsAsync();
        //kindly IGNORE The error/warning here, doesnt effect anything, ty bery much
        setExpoPushToken(pushToken ?? '');
        
        // Only update the token if we got one and the user is logged in
        if (pushToken && token) {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              expoPushToken: pushToken
            })
          });
          
          if (!response.ok) {
            console.error('Failed to update push token:', await response.text());
          }
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
        setExpoPushToken(`${error}`);
      }
    }

    setupNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [token]); 

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme

  return (
    <AuthProvider>
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(modals)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(client)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </View>
    </AuthProvider>
  )
}

export default function RootLayout() {
  return (
    
      <RootLayoutContent />
    
  )
}

