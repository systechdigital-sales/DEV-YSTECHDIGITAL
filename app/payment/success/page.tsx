"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Download,
  Mail,
  Phone,
  User,
  CreditCard,
  Hash,
  Calendar,
  Loader2,
  Home,
  LayoutDashboard,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PaymentDetails {
  paymentId: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  claimId: string
  amount: string
  activationCode: string
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    paymentId: "Not Available",
    orderId: "Not Available",
    customerName: "Not Available",
    customerEmail: "Not Available",
    customerPhone: "Not Available",
    claimId: "Not Available",
    amount: "99",
    activationCode: "Not Available",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("Payment success page - All URL parameters:", Object.fromEntries(searchParams.entries()))

    // Get payment details from URL parameters with multiple fallback options
    const urlDetails: PaymentDetails = {
      paymentId:
        searchParams.get("payment_id") ||
        searchParams.get("razorpay_payment_id") ||
        searchParams.get("paymentId") ||
        "Not Available",
      orderId:
        searchParams.get("order_id") ||
        searchParams.get("razorpay_order_id") ||
        searchParams.get("orderId") ||
        "Not Available",
      customerName:
        searchParams.get("customerName") ||
        searchParams.get("customer_name") ||
        searchParams.get("name") ||
        "Not Available",
      customerEmail:
        searchParams.get("customerEmail") ||
        searchParams.get("customer_email") ||
        searchParams.get("email") ||
        "Not Available",
      customerPhone:
        searchParams.get("customerPhone") ||
        searchParams.get("customer_phone") ||
        searchParams.get("phone") ||
        "Not Available",
      claimId: searchParams.get("claimId") || searchParams.get("claim_id") || "Not Available",
      amount: searchParams.get("amount") || "99",
      activationCode: searchParams.get("activationCode") || searchParams.get("activation_code") || "Not Available",
    }

    console.log("Payment success page - URL extracted details:", urlDetails)

    // If we have a claimId, try to fetch complete details from API
    if (urlDetails.claimId !== "Not Available") {
      console.log("Fetching claim details from API for claimId:", urlDetails.claimId)

      fetch(`/api/admin/claims?claimId=${urlDetails.claimId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("API response for claim details:", data)

          if (data.success && data.claim) {
            const claim = data.claim
            const apiDetails: PaymentDetails = {
              paymentId: claim.paymentId || urlDetails.paymentId,
              orderId: claim.razorpayOrderId || urlDetails.orderId,
              customerName: `${claim.firstName || ""} ${claim.lastName || ""}`.trim() || urlDetails.customerName,
              customerEmail: claim.email || urlDetails.customerEmail,
              customerPhone: claim.phoneNumber || urlDetails.customerPhone,
              claimId: claim.claimId || urlDetails.claimId,
              amount: urlDetails.amount,
              activationCode: claim.activationCode || urlDetails.activationCode,
            }

            console.log("Final payment details from API:", apiDetails)
            setPaymentDetails(apiDetails)
          } else {
            console.log("API call failed or no claim found, using URL details")
            setPaymentDetails(urlDetails)
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching claim details:", error)
          console.log("Using URL details due to API error")
          setPaymentDetails(urlDetails)
          setLoading(false)
        })
    } else {
      console.log("No claimId available, using URL details only")
      setPaymentDetails(urlDetails)
      setLoading(false)
    }
  }, [searchParams])

  const handleDownloadReceipt = () => {
    const receiptContent = `
SYSTECH DIGITAL - Payment Receipt
================================

Payment ID: ${paymentDetails.paymentId}
Order ID: ${paymentDetails.orderId}
Claim ID: ${paymentDetails.claimId}

Customer Details:
Name: ${paymentDetails.customerName}
Email: ${paymentDetails.customerEmail}
Phone: ${paymentDetails.customerPhone}

Activation Code: ${paymentDetails.activationCode}
Amount Paid: ₹${paymentDetails.amount}
Date: ${new Date().toLocaleDateString("en-IN")}
Time: ${new Date().toLocaleTimeString("en-IN")}
Status: Successful

Thank you for your payment!
Your OTT subscription will be activated within 24-48 hours.

For support, contact: support@systechdigital.in
    `

    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payment-receipt-${paymentDetails.claimId}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600 text-lg">Loading payment confirmation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Thank you for your payment. Your OTT subscription is being processed.</p>
        </div>

        {/* Payment Details Card */}
        <Card className="shadow-2xl border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-center text-xl font-semibold flex items-center justify-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Hash className="w-5 h-5 mr-2 text-blue-600" />
                  Transaction Details
                </h3>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium">Payment ID</span>
                    <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg mt-1">
                      {paymentDetails.paymentId}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium">Order ID</span>
                    <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg mt-1">
                      {paymentDetails.orderId}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium">Claim ID</span>
                    <span className="font-mono text-sm bg-blue-100 px-3 py-2 rounded-lg mt-1 text-blue-800">
                      {paymentDetails.claimId}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium">Activation Code</span>
                    <span className="font-mono text-sm bg-purple-100 px-3 py-2 rounded-lg mt-1 text-purple-800">
                      {paymentDetails.activationCode}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium">Amount Paid</span>
                    <span className="text-2xl font-bold text-green-600 mt-1">₹{paymentDetails.amount}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Customer Details
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-semibold text-gray-900">{paymentDetails.customerName}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-semibold text-gray-900 text-sm break-all">
                        {paymentDetails.customerEmail}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-semibold text-gray-900">{paymentDetails.customerPhone}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-500">Date & Time</div>
                      <div className="font-semibold text-gray-900">
                        {new Date().toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date().toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-8 text-center">
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg font-semibold">
                <CheckCircle className="w-5 h-5 mr-2" />
                Payment Completed Successfully
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="shadow-xl border-0 mb-6">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">What happens next?</h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Processing Your Request</h4>
                  <p className="text-gray-600 text-sm">
                    Your payment has been received and your OTT subscription request is being processed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Activation Code Verification</h4>
                  <p className="text-gray-600 text-sm">
                    Your activation code <strong>{paymentDetails.activationCode}</strong> is being verified against our
                    sales records.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">OTT Code Generation</h4>
                  <p className="text-gray-600 text-sm">
                    Your unique OTT access codes will be generated and verified within 24-48 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email Delivery</h4>
                  <p className="text-gray-600 text-sm">
                    You'll receive an email at <strong>{paymentDetails.customerEmail}</strong> with your OTT access
                    codes and activation instructions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownloadReceipt}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </Button>

          <Button
            onClick={() => (window.location.href = "/ott")}
            variant="outline"
            className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-lg font-semibold transform transition-all duration-200 hover:scale-105"
          >
            Make Another Claim
          </Button>

          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-lg font-semibold transform transition-all duration-200 hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Button>

          <Button
            onClick={() => (window.location.href = "/customer-dashboard")}
            variant="outline"
            className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-lg font-semibold transform transition-all duration-200 hover:scale-105"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 p-6 bg-white rounded-xl shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
          <p className="text-gray-600 text-sm mb-4">
            If you don't receive your OTT codes within 24-48 hours or have any questions, please contact our support
            team.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>support@systechdigital.in</span>
            </div>
            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>+91-XXXXXXXXXX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600 text-lg">Loading payment confirmation...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
