"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import PaymentClient from "@/components/payment-client"
import { Loader2 } from "lucide-react"

function PaymentContent() {
  const searchParams = useSearchParams()

  const claimId = searchParams.get("claimId")
  const customerName = searchParams.get("customerName") || ""
  const customerEmail = searchParams.get("customerEmail") || ""
  const customerPhone = searchParams.get("customerPhone") || ""

  if (!claimId || !customerName || !customerEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Payment Request</h2>
          <p className="text-gray-600 mb-6">
            Missing required payment information. Please go back and fill the form again.
          </p>
          <button
            onClick={() => (window.location.href = "/ott")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Back to Form
          </button>
        </div>
      </div>
    )
  }

  return (
    <PaymentClient
      claimId={claimId}
      customerName={decodeURIComponent(customerName)}
      customerEmail={decodeURIComponent(customerEmail)}
      customerPhone={decodeURIComponent(customerPhone)}
    />
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 text-lg">Loading payment details...</p>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
