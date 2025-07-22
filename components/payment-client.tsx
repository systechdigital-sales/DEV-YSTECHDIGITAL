"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Shield } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentClientProps {
  publicKey: string
}

export default function PaymentClient({ publicKey }: PaymentClientProps) {
  const [orderData, setOrderData] = useState({
    amount: 0,
    currency: "INR",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    productName: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (k: string, v: string | number) => setOrderData((p) => ({ ...p, [k]: v }))

  const createOrder = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: orderData.amount * 100,
          currency: orderData.currency,
          receipt: `receipt_${Date.now()}`,
          notes: {
            customer_name: orderData.customerName,
            customer_email: orderData.customerEmail,
            product_name: orderData.productName,
          },
        }),
      })
      const order = await res.json()
      if (order.id) openRzp(order)
    } catch {
      alert("Order creation failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const openRzp = (order: any) => {
    const opts = {
      key: publicKey, // now injected from server
      amount: order.amount,
      currency: order.currency,
      name: "SYSTECH IT SOLUTIONS LIMITED",
      description: orderData.description || "Purchase from Systech Digital",
      image: "/placeholder.svg?height=60&width=60",
      order_id: order.id,
      handler: (resp: any) =>
        (window.location.href = `/payment/success?payment_id=${resp.razorpay_payment_id}&order_id=${resp.razorpay_order_id}&signature=${resp.razorpay_signature}`),
      prefill: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        contact: orderData.customerPhone,
      },
      notes: {
        address:
          "Unit NO H-04, 4th Floor, SOLUS No 2, 8/9, No 23, PID No 48-74-2, 1st Cross, JC Road, Bangalore South, Karnataka, India - 560027",
      },
      theme: { color: "#2563eb" },
      modal: { ondismiss: () => (window.location.href = "/payment/cancelled") },
    }

    new window.Razorpay(opts).open()
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
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling.style.display = "block"
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
        <Card className="w-full max-w-md mx-auto bg-white shadow-md rounded-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Payment Details</CardTitle>
            <CardDescription>Enter your payment information below</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (INR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Amount"
                value={orderData.amount}
                onChange={(e) => handleChange("amount", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                placeholder="Product Name"
                value={orderData.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description"
                value={orderData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="Customer Name"
                value={orderData.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="Customer Email"
                value={orderData.customerEmail}
                onChange={(e) => handleChange("customerEmail", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="Customer Phone"
                value={orderData.customerPhone}
                onChange={(e) => handleChange("customerPhone", e.target.value)}
              />
            </div>
            <Button onClick={createOrder} disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
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
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}
