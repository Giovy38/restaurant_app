import type { Review, Participant, Category, Score } from "@/types/review"

const LOCAL_STORAGE_KEY = "restaurant_reviews"
const LOCAL_STORAGE_DRAFT_KEY = "restaurant_review_draft" // Nuova chiave per la bozza

export type ReviewDraft = {
  // Nuovo tipo per la bozza
  restaurantName: string
  participants: Participant[]
  categories: Category[]
  scores: Score[]
}

export const loadReviews = (): Review[] => {
  if (typeof window === "undefined") {
    return []
  }
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (serializedState === null) {
      return []
    }
    return JSON.parse(serializedState)
  } catch (error) {
    console.error("Error loading reviews from local storage:", error)
    return []
  }
}

export const saveReviews = (reviews: Review[]) => {
  if (typeof window === "undefined") {
    return
  }
  try {
    const serializedState = JSON.stringify(reviews)
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState)
  } catch (error) {
    console.error("Error saving reviews to local storage:", error)
  }
}

export const addReview = (newReview: Review) => {
  const currentReviews = loadReviews()
  const updatedReviews = [...currentReviews, newReview]
  saveReviews(updatedReviews)
}

export const deleteReview = (id: string) => {
  const currentReviews = loadReviews()
  const updatedReviews = currentReviews.filter((review) => review.id !== id)
  saveReviews(updatedReviews)
}

export const clearAllReviews = () => {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing reviews from local storage:", error)
  }
}

// Nuove funzioni per la bozza temporanea
export const saveReviewDraft = (draft: ReviewDraft) => {
  if (typeof window === "undefined") {
    return
  }
  try {
    const serializedState = JSON.stringify(draft)
    localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, serializedState)
  } catch (error) {
    console.error("Error saving review draft to local storage:", error)
  }
}

export const loadReviewDraft = (): ReviewDraft | null => {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY)
    if (serializedState === null) {
      return null
    }
    return JSON.parse(serializedState)
  } catch (error) {
    console.error("Error loading review draft from local storage:", error)
    return null
  }
}

export const clearReviewDraft = () => {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY)
  } catch (error) {
    console.error("Error clearing review draft from local storage:", error)
  }
}
