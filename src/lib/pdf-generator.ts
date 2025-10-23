import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { Review } from "@/types/review"

export const generateReviewPdf = (review: Review) => {
  const doc = new jsPDF()

  doc.setFontSize(22)
  doc.text(`Recensione Ristorante: ${review.restaurantName}`, 10, 20)

  doc.setFontSize(14)
  doc.text(`Data: ${new Date(review.createdAt).toLocaleDateString()}`, 10, 30)

  let yOffset = 45

  // Participants
  doc.setFontSize(16)
  doc.text("Partecipanti:", 10, yOffset)
  yOffset += 10
  review.participants.forEach((p) => {
    doc.setFontSize(12)
    doc.text(`- ${p.name}`, 15, yOffset)
    yOffset += 7
  })

  yOffset += 10

  // Categories and Scores
  doc.setFontSize(16)
  doc.text("Voti per Categoria:", 10, yOffset)
  yOffset += 10

  // Prepare data for autoTable
  const headers = ["Categoria", ...review.participants.map((p) => p.name)]
  const data: string[][] = []

  review.categories.forEach((category) => {
    const row: string[] = [category.name]
    review.participants.forEach((participant) => {
      const score = review.scores.find((s) => s.participantId === participant.id && s.categoryId === category.id)
      row.push(score ? score.score.toString() : "-")
    })
    data.push(row)
  })

  // Use autoTable to generate the table
  autoTable(doc, {
    startY: yOffset,
    head: [headers],
    body: data,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold" },
    columnStyles: { 0: { fontStyle: "bold" } },
  })

  // Update yOffset after the table
  const finalY = (doc as any).lastAutoTable.finalY
  yOffset = finalY + 15

  // Average Score and Star Rating
  doc.setFontSize(18)
  doc.text(`Media Voti: ${review.averageScore?.toFixed(2) || "N/A"} / 10`, 10, yOffset)
  yOffset += 10

  const stars = review.starRating ? "⭐".repeat(Math.round(review.starRating)) : "N/A"
  doc.text(`Valutazione a Stelle: ${stars} (${review.starRating?.toFixed(1) || "N/A"} / 5)`, 10, yOffset)

  doc.save(`${review.restaurantName.replace(/\s/g, "_")}_recensione.pdf`)
}
