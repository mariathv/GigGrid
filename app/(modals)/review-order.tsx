"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import "@/global.css"
import { submitReview } from "@/api/reviews"

export default function ReviewOrderScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { orderId, gigId, gigTitle } = params

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating)
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating")
      return
    }

    if (!comment.trim()) {
      Alert.alert("Error", "Please write a comment")
      return
    }

    try {
      setIsSubmitting(true)

      const reviewData = {
        gigID: gigId as string,
        orderID: orderId as string,
        rating,
        comment,
      }

      const response = await submitReview(reviewData)

      if (response?.status === "success") {
        Alert.alert("Success", "Your review has been submitted successfully!", [
          { text: "OK", onPress: () => router.back() },
        ])
      } else {
        Alert.alert("Error", response?.message || "Failed to submit review. Please try again.")
      }
    } catch (error: any) {
      console.error("Error submitting review:", error)
      Alert.alert("Error", error?.response?.data?.message || "Something went wrong while submitting your review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4B7172" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Write a Review</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Gig Info */}
        <View style={styles.gigInfoContainer}>
          <ThemedText style={styles.gigTitle}>{gigTitle || "Untitled Gig"}</ThemedText>
          <ThemedText style={styles.orderIdText}>Order ID: {orderId}</ThemedText>
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <ThemedText style={styles.ratingTitle}>How would you rate this service?</ThemedText>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRatingPress(star)} style={styles.starButton}>
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color={star <= rating ? "#FFD700" : "#777"}
                />
              </TouchableOpacity>
            ))}
          </View>
          <ThemedText style={styles.ratingText}>
            {rating === 0
              ? "Tap a star to rate"
              : rating === 1
                ? "Poor"
                : rating === 2
                  ? "Fair"
                  : rating === 3
                    ? "Good"
                    : rating === 4
                      ? "Very Good"
                      : "Excellent"}
          </ThemedText>
        </View>

        {/* Comment */}
        <View style={styles.commentContainer}>
          <ThemedText style={styles.commentTitle}>Write your review</ThemedText>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your experience with this service..."
            placeholderTextColor="#777"
            multiline
            numberOfLines={6}
            value={comment}
            onChangeText={setComment}
          />
          <ThemedText style={styles.commentHelp}>Your review will help other clients make better decisions.</ThemedText>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (rating === 0 || !comment.trim() || isSubmitting) && styles.disabledButton]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || !comment.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Submit Review</ThemedText>
          )}
        </TouchableOpacity>

        {/* Bottom padding for scrolling */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  gigInfoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  gigTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  orderIdText: {
    fontSize: 14,
    color: "#777",
  },
  ratingContainer: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    fontSize: 16,
    color: "#FFD700",
    fontWeight: "bold",
  },
  commentContainer: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  commentInput: {
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 15,
    color: "#fff",
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 150,
    marginBottom: 10,
  },
  commentHelp: {
    fontSize: 14,
    color: "#777",
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: "#4B7172",
    borderRadius: 8,
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

