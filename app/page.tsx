"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, CheckCircle, Gift, Play, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

const ottPlatforms = [
  "SonyLiv",
  "Zee5",
  "Fancode",
  "Lionsgate Play",
  "STAGE",
  "DistroTV",
  "ShemarooMe",
  "Hubhopper",
  "ALTT",
  "aha Tamil",
  "Red Hot",
  "Runn TV",
  "OM TV",
  "Dangal Play",
  "PremiumFlix",
  "Chaupal",
  "ShortsTV",
  "Sun NXT",
  "Playflix",
  "Shemaroo Gujarati",
  "Dollywood Play",
  "Nammaflix",
  "Chaupal Bhojpuri",
  "Shemaroo Bhakti",
  "ETV Win",
  "aha",
  "VROTT",
  "Shortfundly",
  "Atrangi",
  "BhaktiFlix",
  "Fridaay",
  "Gurjari",
]

export default function OTTRedemptionPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    city: "",
    state: "",
    country: "",
    batchNumber: "",
    serialNumber: "",
    purchaseDate: "",
    invoiceNumber: "",
    sellerName: "",
    declaration: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer flex items-center" onClick={() => (window.location.href = "/")}>
              <div className="relative h-10 w-10 mr-3">
                <Image
                  src="/logo.png"
                  alt="SYSTECH DIGITAL Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-red-200 mt-1">IT Solutions & Mobile Technology</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2 border border-red-300">
              <Gift className="w-4 h-4 mr-2" />
              Free OTT Subscription
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full mb-6 cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-colors"
            onClick={() => (window.location.href = "/ottclaim")}
          >
            <Play className="w-5 h-5 mr-2" />
            <span className="font-semibold">🎉 Unlock Your Complimentary OTT Subscription!</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Claim Guidelines – Issued by Systech IT Solutions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get a FREE 1-Year OTT Subscription Pack with access to 32 premium platforms when you purchase eligible
            products from us!
          </p>
        </div>

        {/* Offer Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />🎯 Offer Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              As part of our promotional campaign, customers purchasing{" "}
              <strong>IT Peripherals, Mobile Phones, PCs, or Laptops</strong> from Systech IT Solutions or Sara Mobiles
              between <strong>1st July 2025 and 30th September 2025</strong> are eligible to claim a complimentary
              1-Year OTT Subscription Pack powered by OTTplay.
            </p>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />✅ 1. Offer Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Valid only for end customers who have purchased eligible products within the offer period.
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Each product serial number is entitled to one OTT subscription claim.
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Claims must be submitted before 30th September 2025. Late entries will not be processed.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Claim Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />📝 2. How to Claim - Submit Your Details
            </CardTitle>
            <CardDescription>
              Click the button below to access our secure claim form and submit your purchase details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Fill out our secure online form with your purchase details to claim your free OTT subscription.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Required Information:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 text-left">
                  <div>• Full Name & Contact Details</div>
                  <div>• Purchase Date & Invoice Number</div>
                  <div>• Product Serial Number</div>
                  <div>• Batch Number from Invoice</div>
                  <div>• Seller Name (Systech/Sara Mobiles)</div>
                  <div>• Invoice Upload (PDF/Image)</div>
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg"
                onClick={() => (window.location.href = "/ottclaim")}
              >
                🎯 Submit Your Claim Now
              </Button>
              <p className="text-xs text-gray-500">
                You will be redirected to our secure Zoho form to complete your claim submission.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Verification Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-500" />🔍 3. Verification & Subscription Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Verification</h4>
                  <p className="text-gray-600">
                    Claims will be verified by Systech IT Solutions / Sara Mobiles within 3 working days.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Code Delivery</h4>
                  <p className="text-gray-600">
                    Once approved, your OTT subscription code will be sent via registered email or WhatsApp.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Activation</h4>
                  <p className="text-gray-600">
                    Customers must activate their subscription within 7 days of receiving the code.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redemption Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎬 Steps to Redeem the OTT Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                  1
                </span>
                Visit the redemption link (URL will be provided with your subscription code).
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                  2
                </span>
                Tap "Apply Coupon" and enter your code to receive 100% discount.
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                  3
                </span>
                Tap "Subscribe Yearly".
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                  4
                </span>
                Enter your mobile number, verify with OTP, and enjoy 12 months of access to 32 OTT platforms!
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* OTT Platforms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎭 5. OTT Platforms Included (Powered by OTTplay)</CardTitle>
            <CardDescription>Access to 32 premium OTT platforms for 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {ottPlatforms.map((platform, index) => (
                <Badge key={index} variant="outline" className="justify-center py-2 px-3">
                  {platform}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📋 Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Terms of the Subscription</h4>
              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                <li>• Offer valid only for purchases through Systech IT Solutions and Sara Mobiles.</li>
                <li>• By redeeming, you agree to OTTplay's Terms of Use: ottplay.com/terms-of-use.</li>
                <li>• Subscription is cancellable anytime by the user (before expiry).</li>
                <li>• For support, contact OTTplay Customer Care: 📞 080-62012555.</li>
                <li>• Once activated, the subscription cannot be transferred to another user.</li>
                <li>• Coupon codes must be redeemed within 6 months of issue date.</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">⚠️ 6. Important Disclaimers</h4>
              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                <li>
                  • The OTT subscription is a free promotional bundle and cannot be refunded, exchanged, or transferred.
                </li>
                <li>• OTTplay reserves the right to modify the list of included platforms without prior notice.</li>
                <li>
                  • No replacement/refund will be offered in case of any platform changes or service modifications.
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📜 7. General Terms</h4>
              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                <li>• All OTTplay platform terms apply, including app usage and streaming policies.</li>
                <li>
                  • Systech IT Solutions and Sara Mobiles are not responsible for subscription service delivery or
                  support.
                </li>
                <li>• Any technical/service-related concerns must be directed to OTTplay.</li>
                <li>• All decisions regarding claim eligibility are final and binding.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📞 8. Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 mb-2">
                For subscription-related queries or activation issues, please contact:
              </p>
              <p className="font-semibold text-blue-600">📞 OTTplay Customer Care – 080-62012555</p>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Disclaimer:</strong> This is a limited-time offer and may be modified or discontinued at any
                time by Systech IT Solutions or Sara Mobiles without prior notice.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black via-red-900 to-black text-white py-8 border-t border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center md:items-start">
              <div className="relative h-10 w-10 mr-3 hidden md:block">
                <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">SYSTECH DIGITAL</h3>
                <p className="text-red-200 text-sm">Your trusted partner for IT Solutions & Mobile Technology</p>
                <div className="mt-4 text-xs text-red-200">
                  <p>Unit NO H-04, 4th Floor, SOLUS No 2</p>
                  <p>JC Road, Bangalore South</p>
                  <p>Karnataka, India - 560027</p>
                </div>
              </div>
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
                    OTT Claim Form
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
            <p className="text-sm text-red-200">
              © 2025 Systech IT Solutions. All rights reserved. | Offer valid till 30th September 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
