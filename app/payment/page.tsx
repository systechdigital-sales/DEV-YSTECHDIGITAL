"use client"

import { Suspense } from "react"
import PaymentClient from "@/components/payment-client"

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentClient />
    </Suspense>
  )
}
