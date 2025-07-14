"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Minus, Star, Trash2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { Review, Participant, Category, Score } from "@/types/review"
import {
  loadReviews,
  addReview,
  deleteReview,
  clearAllReviews,
  saveReviewDraft, // Importa la nuova funzione
  loadReviewDraft, // Importa la nuova funzione
  clearReviewDraft, // Importa la nuova funzione
  type ReviewDraft, // Importa il nuovo tipo
} from "@/lib/local-storage"
import { generateReviewPdf } from "@/lib/pdf-generator" // Mantenuto per inferenza, anche se non usato direttamente
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Genera tutti i valori possibili per i voti da 1 a 10 con incrementi di 0.25
const scoreOptions = Array.from({ length: (10 - 1) * 4 + 1 }, (_, i) => (1 + i * 0.25).toFixed(2))

// Categorie predefinite
const predefinedCategoriesList = [
  "location",
  "varietà menu",
  "servizio",
  "rapporto qualità prezzo",
  "gusto",
  "mise en place",
]

export default function RestaurantReviewForm() {
  const [restaurantName, setRestaurantName] = useState<string>("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [currentScores, setCurrentScores] = useState<Score[]>([])
  const [averageScore, setAverageScore] = useState<number | null>(null)
  const [starRating, setStarRating] = useState<number | null>(null)
  const [savedReviews, setSavedReviews] = useState<Review[]>([])

  useEffect(() => {
    setSavedReviews(loadReviews())
    const draft = loadReviewDraft()
    if (draft) {
      setRestaurantName(draft.restaurantName)
      setParticipants(draft.participants)
      setCategories(draft.categories)
      setCurrentScores(draft.scores)
      // Potresti aggiungere un alert o un toast per informare l'utente che una bozza è stata caricata
    }
  }, [])

  const addParticipant = useCallback(() => {
    setParticipants((prev) => [...prev, { id: uuidv4(), name: "" }])
  }, [])

  const updateParticipantName = useCallback((id: string, name: string) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }, [])

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id))
    setCurrentScores((prev) => prev.filter((score) => score.participantId !== id))
  }, [])

  const addCategory = useCallback(() => {
    setCategories((prev) => [...prev, { id: uuidv4(), name: "" }])
  }, [])

  const addPredefinedCategories = useCallback(() => {
    setCategories((prev) => {
      const existingCategoryNames = new Set(prev.map((c) => c.name.toLowerCase()))
      const newCategoriesToAdd = predefinedCategoriesList
        .filter((name) => !existingCategoryNames.has(name.toLowerCase()))
        .map((name) => ({ id: uuidv4(), name }))
      return [...prev, ...newCategoriesToAdd]
    })
  }, [])

  const updateCategoryName = useCallback((id: string, name: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }, [])

  const removeCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setCurrentScores((prev) => prev.filter((score) => score.categoryId !== id))
  }, [])

  const updateScore = useCallback((participantId: string, categoryId: string, score: number) => {
    setCurrentScores((prev) => {
      const existingScoreIndex = prev.findIndex((s) => s.participantId === participantId && s.categoryId === categoryId)
      if (existingScoreIndex > -1) {
        const updatedScores = [...prev]
        updatedScores[existingScoreIndex] = { ...updatedScores[existingScoreIndex], score }
        return updatedScores
      } else {
        return [...prev, { participantId, categoryId, score }]
      }
    })
  }, [])

  const getScore = useCallback(
    (participantId: string, categoryId: string) => {
      const score = currentScores.find((s) => s.participantId === participantId && s.categoryId === categoryId)?.score
      return score !== undefined ? score.toFixed(2) : ""
    },
    [currentScores],
  )

  const calculateScores = useCallback(() => {
    if (currentScores.length === 0 || participants.length === 0 || categories.length === 0) {
      setAverageScore(null)
      setStarRating(null)
      return
    }

    const totalExpectedScores = participants.length * categories.length
    const filledScores = currentScores.filter((s) => s.score >= 1 && s.score <= 10)

    if (filledScores.length !== totalExpectedScores) {
      alert("Per favore, inserisci un voto per ogni partecipante e categoria (da 1 a 10).")
      setAverageScore(null)
      setStarRating(null)
      return
    }

    const sumOfScores = filledScores.reduce((sum, score) => sum + score.score, 0)
    const avg = sumOfScores / filledScores.length
    setAverageScore(avg)
    setStarRating(avg / 2) // Convert 1-10 to 1-5 stars

    clearReviewDraft() // Cancella la bozza dopo il calcolo dei voti
    alert("Voti calcolati e dati temporanei cancellati!")
  }, [currentScores, participants, categories])

  const resetForm = useCallback(() => {
    setRestaurantName("")
    setParticipants([])
    setCategories([])
    setCurrentScores([])
    setAverageScore(null)
    setStarRating(null)
    clearReviewDraft() // Assicurati che anche il reset cancelli la bozza
  }, [])

  const handleSaveDraft = useCallback(() => {
    const draft: ReviewDraft = {
      restaurantName,
      participants,
      categories,
      scores: currentScores,
    }
    saveReviewDraft(draft)
    alert("Dati temporanei salvati! Puoi continuare più tardi.")
  }, [restaurantName, participants, categories, currentScores])

  const handleSaveReview = useCallback(() => {
    if (!restaurantName || participants.length === 0 || categories.length === 0 || currentScores.length === 0) {
      alert("Per favore, compila tutti i campi e calcola i voti prima di salvare.")
      return
    }
    if (averageScore === null || starRating === null) {
      alert("Per favor, calcola i voti prima di salvare.")
      return
    }

    const newReview: Review = {
      id: uuidv4(),
      restaurantName,
      participants,
      categories,
      scores: currentScores,
      averageScore,
      starRating,
      createdAt: new Date().toISOString(),
    }
    addReview(newReview)
    setSavedReviews(loadReviews()) // Ricarica per assicurare che lo stato sia sincronizzato
    resetForm() // Resetta il form dopo il salvataggio finale
  }, [restaurantName, participants, categories, currentScores, averageScore, starRating, resetForm])

  const handleDeleteSavedReview = useCallback((id: string) => {
    if (confirm("Sei sicuro di voler cancellare questa recensione?")) {
      deleteReview(id)
      setSavedReviews(loadReviews())
    }
  }, [])

  const handleClearAllData = useCallback(() => {
    if (confirm("Sei sicuro di voler cancellare TUTTI i dati salvati? Questa azione è irreversibile.")) {
      clearAllReviews()
      setSavedReviews([])
      resetForm() // Resetta anche il form corrente e la bozza
    }
  }, [resetForm])

  // La funzione handleGeneratePdf è mantenuta per l'inferenza, ma non è più collegata a nessun pulsante
  const handleGeneratePdf = useCallback((reviewToPdf: Review) => {
    if (
      !reviewToPdf.restaurantName ||
      reviewToPdf.participants.length === 0 ||
      reviewToPdf.categories.length === 0 ||
      reviewToPdf.scores.length === 0
    ) {
      alert("Nessun dato da generare in PDF.")
      return
    }
    generateReviewPdf(reviewToPdf)
  }, [])

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">Recensione Ristorante</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Dettagli Ristorante e Voti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="restaurantName" className="mb-2 block">
              Nome Ristorante
            </Label>
            <Input
              id="restaurantName"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Es. Pizzeria Da Mario"
            />
          </div>

          <div className="mb-6">
            <Label className="mb-2 block">Partecipanti</Label>
            {participants.map((p, index) => (
              <div key={p.id} className="flex items-center gap-2 mb-2">
                <Input
                  value={p.name}
                  onChange={(e) => updateParticipantName(p.id, e.target.value)}
                  placeholder={`Nome Partecipante ${index + 1}`}
                />
                <Button variant="outline" size="icon" onClick={() => removeParticipant(p.id)}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addParticipant} variant="outline" className="mt-2 bg-transparent">
              <Plus className="h-4 w-4 mr-2" /> Aggiungi Partecipante
            </Button>
          </div>

          <div className="mb-6">
            <Label className="mb-2 block">Categorie da Votare</Label>
            {categories.map((c, index) => (
              <div key={c.id} className="flex items-center gap-2 mb-2">
                <Input
                  value={c.name}
                  onChange={(e) => updateCategoryName(c.id, e.target.value)}
                  placeholder={`Nome Categoria ${index + 1}`}
                />
                <Button variant="outline" size="icon" onClick={() => removeCategory(c.id)}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 mt-2">
              {" "}
              {/* Modificato per flex-wrap */}
              <Button onClick={addCategory} variant="outline" className="bg-transparent">
                <Plus className="h-4 w-4 mr-2" /> Aggiungi Categoria
              </Button>
              <Button onClick={addPredefinedCategories} variant="outline" className="bg-transparent">
                <Plus className="h-4 w-4 mr-2" /> Aggiungi Categorie Predefinite
              </Button>
            </div>
          </div>

          {participants.length > 0 && categories.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <Label className="mb-2 block">Inserisci i Voti (1-10)</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Categoria</TableHead>
                    {participants.map((p) => (
                      <TableHead key={p.id} className="text-center">
                        {p.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      {participants.map((participant) => (
                        <TableCell key={`${participant.id}-${category.id}`} className="text-center">
                          <Select
                            value={getScore(participant.id, category.id)}
                            onValueChange={(value) =>
                              updateScore(participant.id, category.id, Number.parseFloat(value))
                            }
                          >
                            <SelectTrigger className="w-24 mx-auto">
                              <SelectValue placeholder="Voto" />
                            </SelectTrigger>
                            <SelectContent>
                              {scoreOptions.map((score) => (
                                <SelectItem key={score} value={score}>
                                  {score}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button onClick={handleSaveDraft} variant="outline" className="flex-1 bg-transparent">
              Continua dopo
            </Button>
            <Button onClick={calculateScores} className="flex-1">
              Genera Voto
            </Button>
            <Button onClick={handleSaveReview} variant="secondary" className="flex-1">
              Salva Recensione
            </Button>
          </div>

          {averageScore !== null && (
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-semibold">Risultato Finale:</h2>
              <p className="text-xl mt-2">
                Media Voti: <span className="font-bold">{averageScore.toFixed(2)} / 10</span>
              </p>
              <div className="flex items-center justify-center mt-2 text-yellow-500">
                {starRating !== null &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-8 w-8 ${i < Math.floor(starRating) ? "fill-current" : ""}`} />
                  ))}
                <span className="ml-2 text-xl font-bold text-gray-800">({starRating?.toFixed(1)} / 5 Stelle)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recensioni Salvate</CardTitle>
          {savedReviews.length > 0 && (
            <Button onClick={handleClearAllData} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" /> Cancella Tutti i Dati
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {savedReviews.length === 0 ? (
            <p className="text-center text-gray-500">Nessuna recensione salvata.</p>
          ) : (
            <div className="space-y-4">
              {savedReviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{review.restaurantName}</h3>
                      <p className="text-sm text-gray-500">
                        Salvato il: {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-md mt-1">
                        Media: <span className="font-bold">{review.averageScore?.toFixed(2)} / 10</span>
                      </p>
                      <div className="flex items-center text-yellow-500">
                        {review.starRating !== undefined &&
                          Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < Math.floor(review.starRating) ? "fill-current" : ""}`}
                            />
                          ))}
                        <span className="ml-1 text-sm text-gray-800">({review.starRating?.toFixed(1)} / 5)</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteSavedReview(review.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
