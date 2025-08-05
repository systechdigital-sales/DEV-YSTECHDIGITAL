"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import PaymentClient from "@/components/payment-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

function PaymentPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<{
    claimId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    amount: string
    activationCode: string
    purchaseType: string
  } | null>(null)

  useEffect(() => {
    try {
      // Extract all required parameters from URL
      const claimId = searchParams.get("claimId")
      const customerName = searchParams.get("customerName")
      const customerEmail = searchParams.get("customerEmail")
      const customerPhone = searchParams.get("customerPhone")
      const amount = searchParams.get("amount")
      const activationCode = searchParams.get("activationCode")
      const purchaseType = searchParams.get("purchaseType")

      console.log("Payment page parameters:", {
        claimId,
        customerName,
        customerEmail,
        customerPhone,
        amount,
        activationCode,
        purchaseType,
      })

      // Validate all required parameters
      if (!claimId || !customerName || !customerEmail || !customerPhone) {
        setError("Missing required payment information. Please go back and fill the form again.")
        setLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEmail)) {
        setError("Invalid email format. Please go back and check your email address.")
        setLoading(false)
        return
      }

      // Validate phone format (10 digits)
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(customerPhone)) {
        setError("Invalid phone number format. Please go back and check your phone number.")
        setLoading(false)
        return
      }

      // Set payment data
      setPaymentData({
        claimId,
        customerName,
        customerEmail,
        customerPhone,
        amount: amount || "99", // Default to 99 if not provided
        activationCode: activationCode || "",
        purchaseType: purchaseType || "",
      })

      setLoading(false)
    } catch (err) {
      console.error("Error processing payment parameters:", err)
      setError("Failed to process payment information. Please try again.")
      setLoading(false)
    }
  }, [searchParams])

  const handleBackToForm = () => {
    router.push("/ott")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Payment</h3>
              <p className="text-gray-600">Please wait while we prepare your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid Payment Request</h3>
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error || "Missing required payment information. Please go back and fill the form again."}
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleBackToForm}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <PaymentClient
      claimId={paymentData.claimId}
      customerName={paymentData.customerName}
      customerEmail={paymentData.customerEmail}
      customerPhone={paymentData.customerPhone}
    />
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading</h3>
                <p className="text-gray-600">Please wait...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  )
}
