"use client"

import { useEffect, useState, Suspense, act } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, AlertCircle, ArrowLeft, CheckCircle, User, Mail, Phone, Package } from "lucide-react"
import Image from "next/image"
import { verifyPayment, logClient } from "@/lib/payment-helpers"

interface PaymentData {
  claimId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  amount: string
  activationCode?: string
  purchaseType?: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    // Extract payment data from URL parameters
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

    // Validate required parameters
    if (!claimId || !customerName || !customerEmail || !customerPhone || !amount) {
      console.error("Missing required payment parameters:", {
        claimId: !!claimId,
        customerName: !!customerName,
        customerEmail: !!customerEmail,
        customerPhone: !!customerPhone,
        amount: !!amount,
      })
      setError("Missing required payment information. Please go back and fill the form again.")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      setError("Invalid email address format. Please go back and correct your email.")
      return
    }

    // Validate phone format (Indian mobile number)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(customerPhone)) {
      setError("Invalid phone number format. Please enter a valid 10-digit Indian mobile number.")
      return
    }

    // Validate amount
    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Invalid payment amount. Please go back and try again.")
      return
    }

    setPaymentData({
      claimId,
      customerName: decodeURIComponent(customerName),
      customerEmail: decodeURIComponent(customerEmail),
      customerPhone: decodeURIComponent(customerPhone),
      amount,
      activationCode: activationCode ? decodeURIComponent(activationCode) : undefined,
      purchaseType: purchaseType ? decodeURIComponent(purchaseType) : undefined,
    })

    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => {
      console.log("Razorpay script loaded successfully")
      setRazorpayLoaded(true)
    }
    script.onerror = () => {
      console.error("Failed to load Razorpay script")
      setError("Failed to load payment gateway. Please refresh and try again.")
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [searchParams])

  const handlePayment = async () => {
    if (!paymentData || !razorpayLoaded) {
      setError("Payment system not ready. Please refresh and try again.")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("Creating Razorpay order...")

      // Create Razorpay order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(paymentData.amount) * 100, // Convert to paise
          currency: "INR",
          claimId: paymentData.claimId,
          customerEmail: paymentData.customerEmail,
          customerPhone: paymentData.customerPhone,
          activationCode: paymentData.activationCode,
        }),
      })

      const orderData = await orderResponse.json()
      console.log("Order response:", orderData)

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order")
      }

      // Get Razorpay key
      console.log("Fetching Razorpay key...")
      const keyResponse = await fetch("/api/razorpay-key")
      const keyData = await keyResponse.json()
      console.log("Key response:", keyData)

      if (!keyData.key) {
        throw new Error("Payment configuration error")
      }

      console.log("Initializing Razorpay payment...")

      // Initialize Razorpay payment
      const options = {
        key: keyData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "SYSTECH DIGITAL",
        description: `OTT Code Claim - ${paymentData.claimId}`,
        order_id: orderData.order.id,
        prefill: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          contact: paymentData.customerPhone,
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (response: any) => {
          console.log("Payment successful:", response)
          try {
            const verifyData = await verifyPayment(response, paymentData.claimId)

            console.log("Verification response:", verifyData)
            logClient("Payment verification completed successfully", verifyData)

            if (verifyData.success) {
              // Redirect to success page
              router.push(
                `/payment/success?claimId=${paymentData.claimId}&paymentId=${response.razorpay_payment_id}&amount=${paymentData.amount}`,
              )
            } else {
              throw new Error(verifyData.error || "Payment verification failed")
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError)
            logClient("Payment verification failed", verifyError)
            setError("Payment verification failed. Please contact support if amount was deducted.")
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed")
            setLoading(false)
            setError("Payment was cancelled. You can try again.")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error)
        setError(`Payment failed: ${response.error.description}`)
        setLoading(false)
      })

      console.log("Opening Razorpay modal...")
      razorpay.open()
    } catch (error: any) {
      console.error("Payment error:", error)
      setError(error.message || "Payment failed. Please try again.")
      setLoading(false)
    }
  }

  const handleBackToForm = () => {
    router.push("/ott")
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <AlertCircle className="w-6 h-6 mr-3" />
              Payment Error
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Alert className="border-red-200 bg-red-50 mb-6">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800 whitespace-pre-line">{error}</AlertDescription>
            </Alert>
            <Button onClick={handleBackToForm} className="w-full bg-transparent" variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-blue-600 font-medium">Loading payment details...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full mr-3" />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Complete Your Payment</h1>
                <p className="text-xs sm:text-sm text-red-200 mt-1">Secure payment for your OTT code claim</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleBackToForm} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Progress Indicator */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-green-600">Submit Claim</span>
            </div>
            <div className="w-8 sm:w-16 h-1 bg-blue-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                2
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-blue-600">Payment</span>
            </div>
            <div className="w-8 sm:w-16 h-1 bg-gray-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                3
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-500">Get Code</span>
            </div>
          </div>
        </div>

        {/* Payment Details Card */}
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium">{paymentData.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{paymentData.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{paymentData.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Claim ID</p>
                    <p className="font-medium font-mono text-sm">{paymentData.claimId}</p>
                  </div>
                </div>
              </div>

              {paymentData.activationCode && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Activation Code</p>
                  <p className="font-medium font-mono">{paymentData.activationCode}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amount Card */}
        <Card className="shadow-xl border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">OTT Code Processing Fee</h3>
                <p className="text-sm text-gray-500">One-time payment for activation code processing</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">₹{paymentData.amount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <Button
              onClick={handlePayment}
              disabled={loading || !razorpayLoaded}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : !razorpayLoaded ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading Payment Gateway...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ₹{paymentData.amount} Securely
                </>
              )}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 Secured by Razorpay • Your payment information is encrypted and secure
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            After successful payment, your claim will be processed within 24-48 hours and the OTT code will be sent to
            your email.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-blue-600 font-medium">Loading payment page...</span>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
