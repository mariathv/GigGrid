import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants'


Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });


  
  export async function sendPushNotification(expoPushToken: string) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Original Title',
      body: 'And here is the body!',
      data: { someData: 'goes here' },
    };
  
    try {
      console.log('Sending push notification:', message);
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const responseData = await response.json();
      console.log('Push notification response:', responseData);

      if (!response.ok) {
        throw new Error(`Push notification failed: ${responseData.message || response.statusText}`);
      }

      return responseData;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }
  
  export function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }
  
  export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
        return null;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          return new Promise<string | null>((resolve) => {
                Alert.alert(
                    "Enable Notifications",
                    "Would you like to receive notifications for new orders and updates?",
                    [
                        {
                            text: "Not Now",
                            style: "cancel",
                            onPress: () => resolve(null)
                        },
                        {
                            text: "Yes",
                            onPress: async () => {
                                const { status } = await Notifications.requestPermissionsAsync();
                                finalStatus = status;
                                if (finalStatus !== 'granted') {
                                    console.warn('Failed to get push token for push notification!');
                                    resolve(null);
                                    return;
                                }
                                try {
                                    const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
                                    const token = await Notifications.getExpoPushTokenAsync({
                                        projectId: projectId || '30d20816-69f7-4a6f-88d0-6fc7c460d97c'
                                    });
                                    console.log("Push token:", token.data);
                                    resolve(token.data);
                                } catch (error) {
                                    console.warn('Error getting push token:', error);
                                    resolve(null);
                                }
                            }
                        }
                    ],
                    { cancelable: true }
                );
            });
        }

        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
            const token = await Notifications.getExpoPushTokenAsync({
                projectId: projectId || '30d20816-69f7-4a6f-88d0-6fc7c460d97c'
            });
            console.log("Push token:", token.data);
            return token.data;
        } catch (error) {
            console.warn('Error getting push token:', error);
            return null;
        }
    } catch (error) {
        console.error('Error setting up notifications:', error);
        return null;
    }
  }
  
  export async function sendOrderCompletionNotification(expoPushToken: string, orderTitle: string) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Order Completed',
      body: `Your order "${orderTitle}" has been completed by the freelancer. Check it out!`,
      data: { type: 'order_completion' },
    };
  
    try {
      console.log('Sending order completion notification:', message);
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const responseData = await response.json();
      console.log('Push notification response:', responseData);

      if (!response.ok) {
        throw new Error(`Push notification failed: ${responseData.message || response.statusText}`);
      }

      return responseData;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }
  
  export async function sendNewOrderNotification(expoPushToken: string, gigTitle: string) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'New Order Received',
      body: `You have received a new order for "${gigTitle}". Check it out!`,
      data: { type: 'new_order' },
    };

    try {
      console.log('Sending new order notification:', message);
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const responseData = await response.json();
      console.log('Push notification response:', responseData);

      if (!response.ok) {
        throw new Error(`Push notification failed: ${responseData.message || response.statusText}`);
      }

      return responseData;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }
  