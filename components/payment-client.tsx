"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard, Shield, AlertCircle, RefreshCw, X, Lock, Star, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import PaymentCooldownDialog from "./payment-cooldown-dialog"
import { logClient } from "@/lib/payment-helpers"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentClientProps {
  claimId: string
  customerName: string
  customerEmail: string
  customerPhone: string
}

const PAYMENT_AMOUNT = 99 // Fixed price of 99 rs

export default function PaymentClient({ claimId, customerName, customerEmail, customerPhone }: PaymentClientProps) {
  const [loading, setLoading] = useState(false)
  const [razorpayKey, setRazorpayKey] = useState<string | null>(null)
  const [keyLoading, setKeyLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [showCooldownDialog, setShowCooldownDialog] = useState(false)
  const [cooldownData, setCooldownData] = useState<{
    cooldownUntil: Date
    remainingMinutes: number
  } | null>(null)
  const [attemptInfo, setAttemptInfo] = useState<{
    attemptCount: number
    remainingAttempts: number
    canAttemptPayment: boolean
  } | null>(null)

  useEffect(() => {
    fetchRazorpayKey()
    loadRazorpayScript()
    checkPaymentAttempts()
  }, [])

  const checkPaymentAttempts = async () => {
    try {
      const response = await fetch("/api/payment/check-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail,
          customerPhone,
          claimId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAttemptInfo({
          attemptCount: data.attemptCount,
          remainingAttempts: data.remainingAttempts || 0,
          canAttemptPayment: data.canAttemptPayment,
        })

        if (data.inCooldown) {
          setCooldownData({
            cooldownUntil: new Date(data.cooldownUntil),
            remainingMinutes: data.remainingMinutes,
          })
          setShowCooldownDialog(true)
        }
      }
    } catch (error) {
      console.error("Error checking payment attempts:", error)
    }
  }

  const fetchRazorpayKey = async () => {
    try {
      setKeyLoading(true)
      const response = await fetch("/api/razorpay-key")
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setRazorpayKey(data.key)
    } catch (error) {
      console.error("Error fetching Razorpay key:", error)
      setError("Failed to load payment configuration")
    } finally {
      setKeyLoading(false)
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const createOrder = async () => {
    try {
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: PAYMENT_AMOUNT * 100,
          claimId,
          customerEmail,
          customerPhone,
          
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "PAYMENT_COOLDOWN" || data.error === "PAYMENT_LIMIT_EXCEEDED") {
          setCooldownData({
            cooldownUntil: new Date(data.cooldownUntil),
            remainingMinutes: data.remainingMinutes,
          })
          setShowCooldownDialog(true)
          return null
        }
        throw new Error(data.error || data.details || "Failed to create order")
      }

      if (!data.success) {
        throw new Error(data.error || data.details || "Failed to create order")
      }

      return data
    } catch (error) {
      console.error("Order creation error:", error)
      throw error
    }
  }

  const verifyPayment = async (paymentData: any) => {
    try {
      console.log("BytewiseTestingpoint Starting payment verification with data:", paymentData)

      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentData,
          claimId,
          customerName,
          customerEmail,
          customerPhone,
        }),
      })

      console.log("BytewiseTestingpoint Payment verification response status:", response.status)

      const data = await response.json()
      console.log("BytewiseTestingpoint Payment verification response data:", data)

      if (response.ok && data.success) {
        console.log("BytewiseTestingpoint Payment verification successful")
        return data
      }

      if (data.duplicate) {
        console.log("BytewiseTestingpoint Duplicate payment detected, treating as success")
        return data
      }

      console.error("BytewiseTestingpoint Payment verification failed:", {
        status: response.status,
        success: data.success,
        error: data.error,
        responseOk: response.ok,
      })

      throw new Error(data.error || `Payment verification failed (Status: ${response.status})`)
    } catch (error) {
      console.error("BytewiseTestingpoint Payment verification error:", error)
      throw error
    }
  }

  const handlePayment = async () => {
    if (!razorpayKey) {
      setError("Payment configuration not loaded")
      return
    }

    if (attemptInfo && !attemptInfo.canAttemptPayment) {
      await checkPaymentAttempts()
      return
    }

    try {
      setLoading(true)
      setError(null)
      setPaymentError(null)

      const orderData = await createOrder()

      if (!orderData) {
        setLoading(false)
        return
      }

      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "SYSTECH DIGITAL",
        description: "OTT Platform Access - Processing Fee",
        order_id: orderData.order.id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async (response: any) => {
          try {
            console.log("BytewiseTestingpoint Payment successful, verifying...", response)

            const verificationPromise = verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Verification timeout - payment may still be processing")), 30000),
            )

            const verificationResult = await Promise.race([verificationPromise, timeoutPromise])

            console.log("BytewiseTestingpoint Payment verification successful:", verificationResult)

            const successUrl = new URL("/payment/success", window.location.origin)
            successUrl.searchParams.set("payment_id", response.razorpay_payment_id)
            successUrl.searchParams.set("order_id", response.razorpay_order_id)
            successUrl.searchParams.set("transaction_id", response.razorpay_payment_id)
            successUrl.searchParams.set("customerName", customerName)
            successUrl.searchParams.set("customerEmail", customerEmail)
            successUrl.searchParams.set("customerPhone", customerPhone)
            successUrl.searchParams.set("claimId", claimId)
            successUrl.searchParams.set("amount", PAYMENT_AMOUNT.toString())
            successUrl.searchParams.set("status", "success")

            window.location.replace(successUrl.toString())
          } catch (error) {
            console.error("BytewiseTestingpoint Payment verification failed:", error)

            let errorMessage = "Payment verification failed. Please contact support if amount was deducted."
            if (error instanceof Error && error.message.includes("timeout")) {
              errorMessage =
                "Payment verification is taking longer than expected. Your payment may still be processing. Please check your email or contact support."
            }

            setPaymentError(errorMessage)
            setShowErrorDialog(true)
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed")
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)

      razorpay.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error)
        logClient("RAZOR PAY PAYMENT FAILEDDDDD:", response.error);
        setPaymentError(`Payment failed: ${response.error.description}`)
        setShowErrorDialog(true)
        setLoading(false)

        setTimeout(() => {
          checkPaymentAttempts()
        }, 1000)
      })

      razorpay.open()
    } catch (error) {
      logClient("RAZOR PAY PAYMENT FAILED:", error);
      console.error("Payment initiation error:", error)
      setError(error instanceof Error ? error.message : "Failed to initiate payment")
      setLoading(false)
    }
  }

  const handleRetryPayment = () => {
    setRetryCount((prev) => prev + 1)
    setShowErrorDialog(false)
    setPaymentError(null)
    checkPaymentAttempts().then(() => {
      if (attemptInfo?.canAttemptPayment) {
        handlePayment()
      }
    })
  }

  const handleCancelPayment = () => {
    setShowErrorDialog(false)
    window.location.href = "/ott"
  }

  const handleReturnToForm = () => {
    setShowCooldownDialog(false)
    window.location.href = "/ott"
  }

  if (keyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Setting up payment</h3>
              <p className="text-gray-600">Please wait while we prepare your secure payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Error</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Secure payment processing for your OTT subscription</p>
        </div>

        <Card className="shadow-2xl border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-center text-xl font-semibold">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Customer Name</span>
                <span className="font-semibold text-gray-900">{customerName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Email Address</span>
                <span className="font-semibold text-gray-900 text-sm">{customerEmail}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Phone Number</span>
                <span className="font-semibold text-gray-900">{customerPhone}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Claim ID</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{claimId}</span>
              </div>
            </div>

            {attemptInfo && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Payment Attempts</span>
                  <span className="text-sm text-blue-700">{attemptInfo.attemptCount} of 3 used</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(attemptInfo.attemptCount / 3) * 100}%` }}
                  ></div>
                </div>
                {attemptInfo.remainingAttempts > 0 && (
                  <p className="text-xs text-blue-700 mt-2">{attemptInfo.remainingAttempts} attempts remaining</p>
                )}
              </div>
            )}

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-gray-700">Processing Fee</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">₹{PAYMENT_AMOUNT}</div>
                  <div className="text-sm text-gray-500">One-time payment</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Instant Activation</div>
                  <div className="text-sm text-gray-600">OTT codes delivered within 24 hours</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">100% Secure</div>
                  <div className="text-sm text-gray-600">Bank-grade security & encryption</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Premium Access</div>
                  <div className="text-sm text-gray-600">Full OTT platform subscription</div>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading || (attemptInfo && !attemptInfo.canAttemptPayment)}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:transform-none"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  Processing Payment...
                </>
              ) : attemptInfo && !attemptInfo.canAttemptPayment ? (
                <>
                  <Clock className="w-5 h-5 mr-3" />
                  Payment Limit Reached
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-3" />
                  Pay ₹{PAYMENT_AMOUNT} Securely
                </>
              )}
            </Button>

            <div className="flex items-center justify-center space-x-2 mt-6 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Secured by</span>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Razorpay
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <Lock className="w-4 h-4" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>PCI Compliant</span>
            </div>
          </div>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </div>

      {cooldownData && (
        <PaymentCooldownDialog
          open={showCooldownDialog}
          onOpenChange={setShowCooldownDialog}
          cooldownUntil={cooldownData.cooldownUntil}
          remainingMinutes={cooldownData.remainingMinutes}
          onReturnToForm={handleReturnToForm}
        />
      )}

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Payment Issue</span>
            </DialogTitle>
            <DialogDescription className="text-left">
              {paymentError || "There was an issue processing your payment. You can try again or cancel."}
              {retryCount > 0 && <div className="mt-2 text-sm text-gray-500">Retry attempt: {retryCount}</div>}
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={handleRetryPayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={attemptInfo && !attemptInfo.canAttemptPayment}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Payment
            </Button>
            <Button onClick={handleCancelPayment} variant="outline" className="flex-1 bg-transparent">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
