export type Participant = {
  id: string
  name: string
}

export type Category = {
  id: string
  name: string
}

export type Score = {
  participantId: string
  categoryId: string
  score: number // 1-10
}

export type Review = {
  id: string
  restaurantName: string
  participants: Participant[]
  categories: Category[]
  scores: Score[]
  averageScore?: number // Calculated
  starRating?: number // Calculated
  createdAt: string
}
