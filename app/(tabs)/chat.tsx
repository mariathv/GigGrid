"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { getChatById, sendMessage as sendMessageApi, markMessagesAsRead as markMessagesAsReadApi, Message as MessageType } from "@/api/chats"
import socketService from "@/api/socket"

interface MessageItemProps {
  message: MessageType;
  isCurrentUser: boolean;
}

const MessageItem = ({ message, isCurrentUser }: MessageItemProps) => {
  return (
    <View style={[
      styles.messageContainer,
      isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
    ]}>
      <ThemedText style={styles.messageText}>{message.content}</ThemedText>
      <ThemedText style={styles.messageTime}>
        {new Date(message.timestamp).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        })}
      </ThemedText>
    </View>
  )
}

export default function ChatScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [useSocketConnection, setUseSocketConnection] = useState(true)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  
  // Refs to store cleanup functions and connection status
  const socketCleanupRef = useRef<(() => void) | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)
  const flatListRef = useRef<FlatList>(null)
  
  const chatId = params.id as string
  const clientId = params.clientId as string
  const clientName = params.clientName as string
  const orderId = params.orderId as string
  const orderTitle = params.orderTitle as string
  
  // Function to fetch chat data via REST API - only used for initial load or fallback
  const fetchChat = useCallback(async (shouldSetLoading = true) => {
    if (shouldSetLoading) {
      setIsLoading(true)
    }
    
    try {
      const response = await getChatById(chatId)
      if (response.status === 'success' && mountedRef.current) {
        setMessages(response.data.chat.messages)
        
        // Only mark messages as read on initial load or fallback mode
        await markMessagesAsReadApi(chatId)
        
        // Store user ID to determine message alignment (now we're the freelancer)
        setUserId(response.data.chat.freelancer._id)
        setInitialLoadDone(true)
      }
    } catch (error) {
      console.error('Error fetching chat:', error)
      if (mountedRef.current) {
        Alert.alert('Error', 'Failed to load chat messages')
      }
    } finally {
      if (mountedRef.current && shouldSetLoading) {
        setIsLoading(false)
      }
    }
  }, [chatId])
  
  // Function to handle sending messages via REST API
  const sendViaRestApi = useCallback(async (content: string) => {
    try {
      const response = await sendMessageApi(chatId, content)
      if (response.status === 'success') {
        // Add the new message locally to avoid having to refetch
        const newMsg = response.data.message
        setMessages(prev => [...prev, newMsg])
        
        // Scroll to bottom
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true })
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error('Error sending message via API:', error)
      return false
    }
  }, [chatId])
  
  // Setup socket connection only once when component mounts
  useEffect(() => {
    mountedRef.current = true
    
    // Only try to setup socket connection once
    const setupSocketConnection = async () => {
      try {
        // Connect to socket if not already connected
        if (!socketService.isConnected()) {
          await socketService.connect()
        }
        
        // If still not connected after attempt, fall back to REST API
        if (!socketService.isConnected()) {
          console.warn('Socket connection failed, using REST API fallback')
          setUseSocketConnection(false)
          return false
        }
        
        // Join the chat room
        const joined = await socketService.joinChat(chatId)
        if (!joined) {
          setUseSocketConnection(false)
          return false
        }
        
        return true
      } catch (error) {
        console.error('Error setting up socket:', error)
        setUseSocketConnection(false)
        return false
      }
    }
    
    // Function to setup socket listeners
    const setupSocketListeners = async () => {
      if (!mountedRef.current) return null
      
      try {
        // Listen for chat history
        const unsubHistory = await socketService.on('chat_history', (data) => {
          if (data.chatId === chatId && mountedRef.current) {
            setMessages(data.messages)
            setIsLoading(false)
            setInitialLoadDone(true)
          }
        })
        
        // Listen for new messages
        const unsubNewMessage = await socketService.on('new_message', (data) => {
          if (data.chatId === chatId && mountedRef.current) {
            setMessages(prev => [...prev, data.message])
            
            // Mark messages as read since we're actively viewing the chat
            socketService.markMessagesAsRead(chatId)
            
            // Scroll to bottom on new message
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true })
            }
          }
        })
        
        // Listen for typing indicators
        const unsubTyping = await socketService.on('user_typing', (data) => {
          if (data.chatId === chatId && data.userId === clientId && mountedRef.current) {
            setIsTyping(data.isTyping)
          }
        })
        
        // Listen for socket errors
        const unsubError = await socketService.on('error', (data) => {
          console.error('Socket error:', data.message)
          if (data.message.includes('Authentication required') && mountedRef.current) {
            setUseSocketConnection(false)
          }
        })
        
        // Return cleanup function
        return () => {
          unsubHistory()
          unsubNewMessage()
          unsubTyping()
          unsubError()
        }
      } catch (error) {
        console.error('Error setting up socket listeners:', error)
        return null
      }
    }
    
    // Main initialization function
    const initializeChat = async () => {
      // Start loading
      setIsLoading(true)
      
      // Always fetch chat initially via REST API to ensure we have data
      await fetchChat(false)
      
      // Try to set up socket connection
      const socketConnected = await setupSocketConnection()
      
      if (socketConnected) {
        // If socket connected successfully, set up listeners
        const cleanup = await setupSocketListeners()
        if (cleanup) {
          socketCleanupRef.current = cleanup
        } else {
          // Fall back to REST API if socket listeners failed
          setUseSocketConnection(false)
        }
      } else {
        // Fall back to REST API if socket connection failed
        setUseSocketConnection(false)
      }
      
      // Set loading to false after initialization
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
    
    // Start initialization
    initializeChat()
    
    // Clean up on unmount
    return () => {
      mountedRef.current = false
      
      // Clear polling interval if it exists
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      
      // Run socket cleanup if it exists
      if (socketCleanupRef.current) {
        socketCleanupRef.current()
        socketCleanupRef.current = null
      }
    }
  }, [chatId, fetchChat])
  
  // Setup polling if socket connection is not available
  useEffect(() => {
    // Don't start polling until initial load is done
    if (!initialLoadDone) return
    
    // Clear existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    // If using REST API, set up polling for updates
    if (!useSocketConnection) {
      pollingIntervalRef.current = setInterval(() => {
        if (mountedRef.current && !isSending) {
          fetchChat(false)
        }
      }, 5000)
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [useSocketConnection, initialLoadDone, fetchChat, isSending])
  
  // Handle typing indicator
  const handleTyping = useCallback(() => {
    // Only send typing indicators if using socket connection
    if (!useSocketConnection) return
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    // Send typing indicator
    socketService.sendTypingStatus(chatId, true)
    
    // Set timeout to stop typing indicator after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      socketService.sendTypingStatus(chatId, false)
    }, 2000)
    
    setTypingTimeout(timeout)
  }, [useSocketConnection, chatId, typingTimeout])
  
  // Send a new message
  const handleSendMessage = useCallback(async () => {
    if (newMessage.trim() === "") return
    
    setIsSending(true)
    try {
      let success = false
      
      if (useSocketConnection) {
        // Send message via socket
        success = await socketService.sendMessage(chatId, newMessage.trim())
        
        if (success) {
          // Clear typing indicator
          if (typingTimeout) {
            clearTimeout(typingTimeout)
          }
          socketService.sendTypingStatus(chatId, false)
        } else {
          // Fall back to REST API
          success = await sendViaRestApi(newMessage.trim())
        }
      } else {
        // Use REST API directly
        success = await sendViaRestApi(newMessage.trim())
      }
      
      if (success) {
        // Clear input
        setNewMessage("")
      } else {
        Alert.alert('Error', 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      Alert.alert('Error', 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }, [useSocketConnection, chatId, newMessage, typingTimeout, sendViaRestApi])
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#CFD5D5" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.clientName}>{clientName}</ThemedText>
            <ThemedText style={styles.orderTitle}>{orderTitle}</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => router.push({
              pathname: "/orders",
              params: { id: orderId }
            })}
          >
            <Ionicons name="document-text-outline" size={22} color="#CFD5D5" />
            <ThemedText style={styles.orderButtonText}>View Order</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Messages */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B7172" />
            <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => (
              <MessageItem 
                message={item} 
                isCurrentUser={item.sender === userId}
              />
            )}
            keyExtractor={(item) => item._id || item.timestamp}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            onLayout={() => {
              if (flatListRef.current && messages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: false })
              }
            }}
          />
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <ThemedText style={styles.typingText}>{clientName} is typing...</ThemedText>
          </View>
        )}
        
        {/* Input area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#777"
            value={newMessage}
            onChangeText={(text) => {
              setNewMessage(text)
              handleTyping()
            }}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSendMessage}
            disabled={isSending || newMessage.trim() === ""}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  orderTitle: {
    fontSize: 14,
    color: "#4B7172",
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(75, 113, 114, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  orderButtonText: {
    fontSize: 12,
    color: "#4B7172",
    marginLeft: 5,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#777",
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  currentUserMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4B7172",
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#333",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  messageTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  typingContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  typingText: {
    fontSize: 12,
    color: "#777",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  input: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: "#CFD5D5",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#4B7172",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
}) 