import api from './index';

interface ReviewData {
  gigID: string
  orderID: string
  rating: number
  comment: string
}

export const submitReview = async (reviewData: ReviewData) => {
  try {
    // The controller expects the order ID as a parameter and rating/comment in the body
    const { orderID, rating, comment } = reviewData

    // Make the API request to post a review
    const response = await api.post(`reviews/${orderID}`, { rating, comment })
    return response.data
  } catch (error) {
    console.error("Error submitting review:", error)
    throw error
  }
}



