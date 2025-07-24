"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react"
import Image from "next/image"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const claimId = searchParams.get("claimId")
  const amount = searchParams.get("amount") || "99"
  const customerName = searchParams.get("customerName") || ""
  const customerEmail = searchParams.get("customerEmail") || ""
  const customerPhone = searchParams.get("customerPhone") || ""

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (!scriptLoaded) {
      alert("Payment system is loading. Please try again in a moment.")
      return
    }

    if (!claimId) {
      alert("Invalid claim ID. Please submit the form again.")
      router.push("/ott")
      return
    }

    setLoading(true)

    try {
      // Create Razorpay order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseInt(amount) * 100, // Convert to paise
          claimId,
          customerName: decodeURIComponent(customerName),
          customerEmail: decodeURIComponent(customerEmail),
          customerPhone: decodeURIComponent(customerPhone),
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order")
      }

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "SYSTECH DIGITAL",
        description: "OTT Platform Claim Processing Fee",
        image: "/logo.png",
        order_id: orderData.order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                claimId,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              router.push(`/payment/success?paymentId=${response.razorpay_payment_id}`)
            } else {
              router.push("/payment/cancelled")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            router.push("/payment/cancelled")
          }
        },
        prefill: {
          name: decodeURIComponent(customerName),
          email: decodeURIComponent(customerEmail),
          contact: decodeURIComponent(customerPhone),
        },
        notes: {
          claimId: claimId,
        },
        theme: {
          color: "#DC2626",
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment initialization failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-red-200 mt-1">Secure Payment Gateway</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-sm">Contact: sales.systechdigital@gmail.com</p>
              <p className="text-red-200 text-xs">Phone: +91-9876543210</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-red-600 to-black text-white rounded-t-lg">
            <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
            <p className="text-red-100 mt-2">Secure payment processing via Razorpay</p>
          </CardHeader>

          <CardContent className="p-8">
            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium">OTT Platform Claim Processing</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Claim ID</span>
                  <span className="font-mono text-sm">{claimId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-medium">{decodeURIComponent(customerName)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{decodeURIComponent(customerEmail)}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-red-600">₹{amount}</span>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>All Cards Accepted</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Instant Processing</span>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={loading || !scriptLoaded}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay ₹{amount} via Razorpay
                </>
              )}
            </Button>

            {/* Payment Methods */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">Accepted Payment Methods</p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline" className="text-xs">
                  Credit Card
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Debit Card
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Net Banking
                </Badge>
                <Badge variant="outline" className="text-xs">
                  UPI
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Wallets
                </Badge>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>
                By proceeding with payment, you agree to our{" "}
                <a href="/terms-and-conditions" className="text-red-600 hover:underline">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="text-red-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">What happens after payment?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-bold">1</span>
                </div>
                <p>Payment confirmation email will be sent immediately</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-bold">2</span>
                </div>
                <p>Your claim will be processed within 24 working hours</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-bold">3</span>
                </div>
                <p>OTT platform access codes will be delivered via email</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={30} height={30} className="rounded-full mr-2" />
              <span className="text-xl font-bold">SYSTECH DIGITAL</span>
            </div>
            <p className="text-gray-400 mb-2">Contact: sales.systechdigital@gmail.com | Phone: +91-9876543210</p>
            <p className="text-gray-500 text-sm">© 2025 SYSTECH DIGITAL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
