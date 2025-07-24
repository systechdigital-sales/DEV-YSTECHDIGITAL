"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Users, Shield, Zap, Gift } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
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
                <p className="text-sm text-red-200 mt-1">Your Digital Solutions Partner</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-white hover:text-red-200 transition-colors">
                Home
              </Link>
              <Link href="/ott" className="text-white hover:text-red-200 transition-colors">
                OTT Claim
              </Link>
              <Link href="/admin" className="text-white hover:text-red-200 transition-colors">
                Admin
              </Link>
            </nav>
            <div className="text-right">
              <p className="text-white text-sm">Contact: sales.systechdigital@gmail.com</p>
              <p className="text-red-200 text-xs">Phone: +91-9876543210</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-red-100 text-red-800 hover:bg-red-200">
            🎉 Limited Time Offer - Get Your OTT Subscription Now!
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Unlock Premium{" "}
            <Link href="/ott" className="text-red-600 hover:text-red-700 underline decoration-2 underline-offset-4">
              OTT Platform Access
            </Link>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get instant access to Netflix, Prime Video, Disney+, and more premium streaming platforms. Simple claim
            process, instant activation, and 24/7 support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ott">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
                <Gift className="mr-2 h-5 w-5" />
                Claim Your OTT Access
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg bg-transparent">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SYSTECH DIGITAL?</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make it easy to access premium streaming services with our streamlined claim process and reliable
              support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Instant Activation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get your OTT platform access activated within 24 hours of successful payment verification.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Secure Process</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your data is protected with enterprise-grade security. Safe payment processing through Razorpay.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our dedicated support team is available round the clock to assist you with any queries or issues.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-lg text-gray-600">Simple 3-step process to get your OTT access</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">Fill the Claim Form</h4>
              <p className="text-gray-600">
                Provide your purchase details and upload your bill/receipt for verification.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">Make Payment</h4>
              <p className="text-gray-600">Pay the processing fee of ₹99 securely through Razorpay payment gateway.</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">Get Your Access</h4>
              <p className="text-gray-600">Receive your OTT platform access codes via email within 24 working hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Supported OTT Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-sm font-medium">Netflix</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-sm font-medium">Prime Video</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold">D+</span>
              </div>
              <span className="text-sm font-medium">Disney+</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold">H</span>
              </div>
              <span className="text-sm font-medium">Hotstar</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h3>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of satisfied customers who have unlocked premium streaming access through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ott">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg">
                <CheckCircle className="mr-2 h-5 w-5" />
                Start Your Claim Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Image
                  src="/logo.png"
                  alt="SYSTECH DIGITAL Logo"
                  width={30}
                  height={30}
                  className="rounded-full mr-2"
                />
                <span className="text-xl font-bold">SYSTECH DIGITAL</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for digital solutions and premium OTT platform access. We make technology
                accessible for everyone.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm">4.8/5 Customer Rating</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/ott" className="text-gray-400 hover:text-white transition-colors">
                    OTT Claim
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="text-gray-400 hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <p>Email: sales.systechdigital@gmail.com</p>
                <p>Phone: +91-9876543210</p>
                <p>Support: 24/7 Available</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 SYSTECH DIGITAL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
