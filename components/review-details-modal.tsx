"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star, X, Edit } from "lucide-react"
import type { Review } from "@/types/review"

interface ReviewDetailsModalProps {
  review: Review
  onClose: () => void
  onEdit: (review: Review) => void
}

export default function ReviewDetailsModal({ review, onClose, onEdit }: ReviewDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{review.restaurantName}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(review)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-500">Salvato il: {new Date(review.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Partecipanti:</h3>
            <div className="flex flex-wrap gap-2">
              {review.participants.map((p) => (
                <span key={p.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Voti per Categoria:</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px] sticky left-0 bg-white z-10">Categoria</TableHead>
                    {review.participants.map((p) => (
                      <TableHead key={p.id} className="text-center min-w-[100px]">
                        {p.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {review.categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium sticky left-0 bg-white z-10">{category.name}</TableCell>
                      {review.participants.map((participant) => {
                        const score = review.scores.find(
                          (s) => s.participantId === participant.id && s.categoryId === category.id,
                        )
                        return (
                          <TableCell key={`${participant.id}-${category.id}`} className="text-center">
                            {score ? score.score.toFixed(2) : "-"}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="text-center border-t pt-4">
            <h3 className="text-2xl font-semibold mb-2">Risultato Finale:</h3>
            <p className="text-xl">
              Media Voti: <span className="font-bold">{review.averageScore?.toFixed(2)} / 10</span>
            </p>
            <div className="flex items-center justify-center mt-2 text-yellow-500">
              {review.starRating !== undefined &&
                Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-6 w-6 ${i < Math.floor(review.starRating) ? "fill-current" : ""}`} />
                ))}
              <span className="ml-2 text-lg font-bold text-gray-800">({review.starRating?.toFixed(1)} / 5 Stelle)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
