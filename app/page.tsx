"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Gift, Shield, Clock, ArrowRight, Star, Users, Zap, Globe } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 shadow-lg border-b border-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={50} height={50} className="rounded-full mr-4" />
              <div>
                <h1 className="text-2xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-purple-200">OTT Subscription Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-white hover:text-purple-200 transition-colors">
                Home
              </Link>
              <Link href="/ott" className="text-white hover:text-purple-200 transition-colors">
                Claim OTT
              </Link>
              <Link href="/login" className="text-white hover:text-purple-200 transition-colors">
                Admin
              </Link>
            </nav>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-purple-200 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-2">
                <Link href="/" className="text-white hover:text-purple-200 transition-colors py-2">
                  Home
                </Link>
                <Link href="/ott" className="text-white hover:text-purple-200 transition-colors py-2">
                  Claim OTT
                </Link>
                <Link href="/login" className="text-white hover:text-purple-200 transition-colors py-2">
                  Admin
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with OTTplay Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get Your <span className="text-green-400">FREE</span> OTT Subscription
            </h2>
            <p className="text-xl text-purple-200 mb-8">
              Claim your complimentary OTTplay Power Play Pack worth ₹3499 - Absolutely FREE!
            </p>
          </div>

          {/* OTTplay Promotional Banner */}
          <div className="flex justify-center mb-12">
            <div className="relative max-w-4xl w-full">
              <Image
                src="/ottplay-banner.png"
                alt="OTTplay Power Play Pack - Free Subscription"
                width={1050}
                height={600}
                className="w-full h-auto rounded-2xl shadow-2xl"
                priority
              />
            </div>
          </div>

          <div className="text-center">
            <Link href="/ott">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Gift className="w-6 h-6 mr-2" />
                Claim Your Free Subscription
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-purple-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">What You Get</h3>
            <p className="text-purple-200 text-lg">Premium entertainment package with incredible value</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-purple-900/50 border-purple-700 hover:bg-purple-900/70 transition-colors">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">500+</h4>
                <p className="text-purple-200">Live TV Channels</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/50 border-purple-700 hover:bg-purple-900/70 transition-colors">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">21+</h4>
                <p className="text-purple-200">OTT Platforms</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/50 border-purple-700 hover:bg-purple-900/70 transition-colors">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Full HD</h4>
                <p className="text-purple-200">Streaming Quality</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/50 border-purple-700 hover:bg-purple-900/70 transition-colors">
              <CardContent className="p-6 text-center">
                <Globe className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Single</h4>
                <p className="text-purple-200">Sign On Access</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Steps to Redeem */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Steps to Redeem</h3>
            <p className="text-purple-200 text-lg">Simple 4-step process to get your free subscription</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Visit Redemption Page</h4>
                <p className="text-purple-200">
                  Visit the custom URL that will be shared once the plan page is created
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Apply Coupon Code</h4>
                <p className="text-purple-200">Tap 'Apply Coupon', enter your unique code & get 100% off</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Subscribe Yearly</h4>
                <p className="text-purple-200">Tap 'Subscribe Yearly' to activate your 12-month subscription</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6">
                4
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Verify & Start Streaming</h4>
                <p className="text-purple-200">
                  Enter your mobile number, verify OTP & start streaming 32 OTTs for 12 months!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms and Conditions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-purple-800/30">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-purple-900/50 border-purple-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Shield className="w-6 h-6 mr-2 text-green-400" />
                Terms and Conditions of the Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-purple-200">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p>This offer is available to Systech IT Solutions Users during the offer period</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p>
                    User agrees to OTTplay terms of use (https://www.ottplay.com/terms-of-use) by participating in this
                    offer
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p>User can cancel the subscriptions before expiry of the plan post purchase</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p>User can connect to OTTplay customer care in case of any issues - 080-62012555</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Once activated, the membership cannot be transferred to another user</p>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p>The Coupon Code comes with an expiration period of 6 months</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Platform Availability */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-8">Available On All Platforms</h3>
          <div className="flex flex-wrap justify-center items-center gap-6 text-purple-200">
            <Badge variant="outline" className="border-purple-400 text-purple-200 px-4 py-2">
              Android TV
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-200 px-4 py-2">
              Fire TV Stick
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-200 px-4 py-2">
              Apple TV
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-200 px-4 py-2">
              Samsung
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-200 px-4 py-2">
              LG
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-200 px-4 py-2">
              Web
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-200 px-4 py-2">
              Android
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-200 px-4 py-2">
              iPhone
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-200 px-4 py-2">
              iPad
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-200 px-4 py-2">
              JioStore
            </Badge>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-800 to-indigo-800">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Start Streaming?</h3>
          <p className="text-xl text-purple-200 mb-8">
            Don't miss out on this exclusive offer. Claim your free OTT subscription today!
          </p>
          <Link href="/ott">
            <Button
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Gift className="w-6 h-6 mr-2" />
              Claim Now - It's FREE!
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 border-t border-purple-700 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Image
                  src="/logo.png"
                  alt="SYSTECH DIGITAL Logo"
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <h4 className="text-xl font-bold text-white">SYSTECH DIGITAL</h4>
              </div>
              <p className="text-purple-200">
                Your trusted partner for premium OTT subscriptions and digital entertainment solutions.
              </p>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-white mb-4">Quick Links</h5>
              <div className="space-y-2">
                <Link href="/ott" className="block text-purple-200 hover:text-white transition-colors">
                  Claim OTT
                </Link>
                <Link href="/terms-and-conditions" className="block text-purple-200 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
                <Link href="/privacy-policy" className="block text-purple-200 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/refund-policy" className="block text-purple-200 hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-white mb-4">Support</h5>
              <div className="space-y-2 text-purple-200">
                <p>OTTplay Customer Care:</p>
                <p className="font-semibold text-green-400">080-62012555</p>
                <p className="mt-4">For more details:</p>
                <p className="font-semibold text-green-400">www.systechdigital.co.in</p>
              </div>
            </div>
          </div>
          <Separator className="my-8 bg-purple-700" />
          <div className="text-center text-purple-200">
            <p>&copy; 2024 SYSTECH DIGITAL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
