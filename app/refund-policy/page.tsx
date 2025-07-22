"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                <p className="text-sm text-red-200 mt-1">Refund Policy</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2 border border-red-300">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refund Policy
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mb-4 border-red-300 text-red-700 hover:bg-red-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h2>
          <p className="text-gray-600">Last updated: January 2025</p>
        </div>

        {/* Important Notice */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Important Notice - OTT Subscription Refunds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 font-semibold">
              Once an OTT subscription is activated, no refunds will be provided. Please ensure you understand the terms
              before activating your subscription.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. General Refund Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                SYSTECH IT SOLUTIONS LIMITED is committed to customer satisfaction. This refund policy outlines the
                conditions under which refunds may be processed for products and services purchased from us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Product Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <h4 className="font-semibold">Eligible for Refund:</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Defective products received within 7 days of delivery</li>
                  <li>Wrong products delivered due to our error</li>
                  <li>Products damaged during shipping</li>
                  <li>Products not matching the description provided</li>
                </ul>

                <h4 className="font-semibold mt-4">Refund Process:</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Contact us within 7 days of delivery</li>
                  <li>Provide order details and reason for refund</li>
                  <li>Return the product in original packaging</li>
                  <li>Refund will be processed within 7-10 business days</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. OTT Subscription Refund Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">No Refund After Activation</h4>
                  <p className="text-red-700">
                    <strong>
                      Once an OTT subscription is activated, no refunds will be provided under any circumstances.
                    </strong>{" "}
                    This includes but is not limited to:
                  </p>
                  <ul className="list-disc ml-6 mt-2 text-red-700">
                    <li>Change of mind after activation</li>
                    <li>Inability to use the service</li>
                    <li>Technical issues with OTT platforms</li>
                    <li>Dissatisfaction with content</li>
                  </ul>
                </div>

                <h4 className="font-semibold">Before Activation:</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>OTT subscription codes can be cancelled before activation</li>
                  <li>Contact us within 24 hours of receiving the code</li>
                  <li>Provide valid reason for cancellation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Payment Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <ul className="list-disc ml-6 space-y-2">
                  <li>Refunds will be processed to the original payment method</li>
                  <li>Credit card refunds may take 5-7 business days to reflect</li>
                  <li>UPI and net banking refunds typically process within 2-3 business days</li>
                  <li>Processing fees may be deducted from the refund amount</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Non-Refundable Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                <p className="mb-3">The following items are not eligible for refunds:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Activated OTT subscriptions</li>
                  <li>Digital products after download</li>
                  <li>Products damaged by misuse</li>
                  <li>Products returned after 7 days</li>
                  <li>Products without original packaging</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Refund Request Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>To request a refund, please follow these steps:</p>
                <ol className="list-decimal ml-6 space-y-2">
                  <li>Contact our customer support team</li>
                  <li>Provide your order number and purchase details</li>
                  <li>Explain the reason for the refund request</li>
                  <li>Provide supporting documentation if required</li>
                  <li>Wait for our team to review and approve the request</li>
                  <li>Return the product if applicable</li>
                  <li>Receive refund confirmation</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                <p>For refund requests or questions about this policy, please contact us:</p>
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <p>
                    <strong>Email:</strong> sales.systechdigital@gmail.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +91 7709803412
                  </p>
                  <p>
                    <strong>Address:</strong> Unit NO H-04, 4th Floor, SOLUS No 2, JC Road, Bangalore South, Karnataka -
                    560027
                  </p>
                  <p>
                    <strong>Business Hours:</strong> Monday to Saturday, 9:00 AM to 6:00 PM IST
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black via-red-900 to-black text-white py-8 border-t border-red-200 mt-8">
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
