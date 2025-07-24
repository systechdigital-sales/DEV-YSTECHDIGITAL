"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Shield, CheckCircle } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentClientProps {
  publicKey: string
}

export default function PaymentClient({ publicKey }: PaymentClientProps) {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState({
    amount: 99,
    currency: "INR",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    productName: "OTT Platform Subscription",
    description: "Processing fee for OTT platform claim verification",
    claimId: "",
  })

  useEffect(() => {
    // Get data from URL parameters
    const claimId = searchParams.get("claimId") || ""
    const amount = Number.parseInt(searchParams.get("amount") || "99")
    const customerName = searchParams.get("customerName") || ""
    const customerEmail = searchParams.get("customerEmail") || ""
    const customerPhone = searchParams.get("customerPhone") || ""

    setOrderData((prev) => ({
      ...prev,
      claimId,
      amount,
      customerName: decodeURIComponent(customerName),
      customerEmail: decodeURIComponent(customerEmail),
      customerPhone: decodeURIComponent(customerPhone),
    }))
  }, [searchParams])

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          resolve(true)
        }
        script.onerror = () => {
          resolve(false)
        }
        document.body.appendChild(script)
      })
    }

    loadRazorpayScript()
  }, [])

  const handleChange = (k: string, v: string | number) => setOrderData((p) => ({ ...p, [k]: v }))

  const createOrder = async () => {
    if (!orderData.claimId) {
      alert("Invalid claim ID. Please go back and submit the form again.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: orderData.amount * 100, // Convert to paise
          currency: orderData.currency,
          receipt: `receipt_${orderData.claimId}`,
          notes: {
            claim_id: orderData.claimId,
            customer_name: orderData.customerName,
            customer_email: orderData.customerEmail,
            product_name: orderData.productName,
          },
        }),
      })

      const order = await res.json()
      console.log("Order created:", order)

      if (order.id) {
        openRzp(order)
      } else {
        throw new Error("Failed to create order")
      }
    } catch (error) {
      console.error("Order creation failed:", error)
      alert("Order creation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const openRzp = (order: any) => {
    const opts = {
      key: publicKey,
      amount: order.amount,
      currency: order.currency,
      name: "SYSTECH DIGITAL",
      description: orderData.description,
      image: "/logo.png",
      order_id: order.id,
      handler: (resp: any) => {
        console.log("Payment successful:", resp)
        window.location.href = `/payment/success?payment_id=${resp.razorpay_payment_id}&order_id=${resp.razorpay_order_id}&signature=${resp.razorpay_signature}&claim_id=${orderData.claimId}`
      },
      prefill: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        contact: orderData.customerPhone,
      },
      notes: {
        claim_id: orderData.claimId,
        address:
          "Unit NO H-04, 4th Floor, SOLUS No 2, 8/9, No 23, PID No 48-74-2, 1st Cross, JC Road, Bangalore South, Karnataka, India - 560027",
      },
      theme: { color: "#dc2626" },
      modal: {
        ondismiss: () => {
          console.log("Payment cancelled")
          window.location.href = `/payment/cancelled?claim_id=${orderData.claimId}`
        },
      },
    }

    if (window.Razorpay) {
      new window.Razorpay(opts).open()
    } else {
      alert("Payment gateway not loaded. Please refresh and try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer flex items-center" onClick={() => (window.location.href = "/")}>
              <img
                src="/logo-white.png"
                alt="SYSTECH DIGITAL Logo"
                className="h-10 w-auto mr-3"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling!.style.display = "block"
                }}
              />
              <div style={{ display: "none" }}>
                <h1 className="text-3xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-red-200 mt-1">Secure Payment Gateway</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2 border border-red-300">
              <Shield className="w-4 h-4 mr-2" />
              Secure Payment
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Process Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Claim Submitted</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-red-600">Payment (₹99)</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">Get OTT Key</span>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold">💳 Payment Details</CardTitle>
            <CardDescription className="text-red-100">Complete your payment to process the OTT claim</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Claim Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Claim Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Claim ID:</strong> {orderData.claimId}
                </p>
                <p>
                  <strong>Customer:</strong> {orderData.customerName}
                </p>
                <p>
                  <strong>Email:</strong> {orderData.customerEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {orderData.customerPhone}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (INR)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={orderData.amount}
                  onChange={(e) => handleChange("amount", Number(e.target.value))}
                  className="mt-1"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="productName">Product</Label>
                <Input
                  id="productName"
                  value={orderData.productName}
                  onChange={(e) => handleChange("productName", e.target.value)}
                  className="mt-1"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={orderData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-1"
                  readOnly
                />
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={createOrder}
              disabled={loading || !orderData.claimId}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ₹{orderData.amount}
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="text-center text-xs text-gray-500 mt-4">
              <Shield className="w-4 h-4 inline mr-1" />
              Your payment is secured by Razorpay
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black via-red-900 to-black text-white py-8 border-t border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">SYSTECH DIGITAL</h3>
              <p className="text-red-200 text-sm">Your trusted partner for IT Solutions & Mobile Technology</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => (window.location.href = "/ottclaim")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    OTT Claim
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Policies</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => (window.location.href = "/terms-and-conditions")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => (window.location.href = "/refund-policy")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Refund Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => (window.location.href = "/cookie-policy")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Contact Us</h4>
              <ul className="space-y-2 text-sm text-red-200">
                <li>📞 +91 7709803412</li>
                <li>📧 sales.systechdigital@gmail.com</li>
                <li>🌐 www.systechdigital.co.in</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-red-800 mt-8 pt-8 text-center">
            <p className="text-sm text-red-200">© 2025 Systech IT Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
