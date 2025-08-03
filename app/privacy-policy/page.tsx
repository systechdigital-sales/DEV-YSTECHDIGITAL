"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Footer from "@/components/footer"

export default function PrivacyPolicyPage() {
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
                <h1 className="text-3xl font-bold text-white">Systech Digital</h1>
                <p className="text-sm text-red-200 mt-1">Simplifying the Digital Experience</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2 border border-red-300">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h2>
          <p className="text-gray-600">Last updated: July 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>We collect information you provide directly to us, such as:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Personal information (name, email, phone number, address)</li>
                  <li>Payment information (processed securely through Razorpay)</li>
                  <li>Purchase history and transaction details</li>
                  <li>Communication preferences</li>
                  <li>Support requests and feedback</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>We use the information we collect to:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Process your orders and payments</li>
                  <li>Provide customer support</li>
                  <li>Send order confirmations and updates</li>
                  <li>Process OTT subscription claims</li>
                  <li>Improve our products and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>We may share your information with:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    <strong>Razorpay:</strong> For payment processing
                  </li>
                  <li>
                    <strong>OTTplay:</strong> For OTT subscription services
                  </li>
                  <li>
                    <strong>Service providers:</strong> Who assist in our operations
                  </li>
                  <li>
                    <strong>Legal authorities:</strong> When required by law
                  </li>
                </ul>
                <p>We do not sell or rent your personal information to third parties.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. All payment information is processed securely through
                Razorpay's encrypted payment gateway.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>You have the right to:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>File a complaint with relevant authorities</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                <p>For privacy-related questions or requests, contact us:</p>
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <p>
                    <strong>Email:</strong> sales.systechdigital@gmail.com
                  </p>
                  <p>
                    <strong>Address:</strong> Unit NO H-04, 4th Floor, SOLUS No 2, JC Road, Bangalore South, Karnataka -
                    560027
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  )
}
