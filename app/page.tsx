"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Gift,
  Smartphone,
  Tv,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Shield,
  Award,
  Zap,
  User,
} from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    router.push("/ott")
  }

  const handleCustomerDashboard = () => {
    router.push("/customer-login")
  }

  const features = [
    {
      icon: <Tv className="w-8 h-8 text-blue-600" />,
      title: "Premium OTT Content",
      description: "Access to 15+ premium OTT platforms including Netflix, Amazon Prime, Disney+ and more",
    },
    {
      icon: <Smartphone className="w-8 h-8 text-green-600" />,
      title: "Multi-Device Support",
      description: "Watch on TV, mobile, tablet, or laptop - anywhere, anytime with seamless streaming",
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Family Sharing",
      description: "Share your subscription with family members and create multiple user profiles",
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Secure & Reliable",
      description: "100% secure activation process with 24/7 customer support and money-back guarantee",
    },
  ]

  const benefits = [
    "15+ Premium OTT Platforms",
    "4K Ultra HD Streaming",
    "Offline Download Support",
    "Ad-Free Experience",
    "Multi-Language Content",
    "Live TV Channels",
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Mumbai",
      rating: 5,
      comment: "Amazing service! Got my OTT codes instantly and the support team is very helpful.",
    },
    {
      name: "Priya Sharma",
      location: "Delhi",
      rating: 5,
      comment: "Best value for money. All premium platforms at one place with excellent customer service.",
    },
    {
      name: "Amit Patel",
      location: "Bangalore",
      rating: 5,
      comment: "Quick delivery and genuine codes. Highly recommended for OTT entertainment needs.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={50} height={50} className="rounded-full mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-red-200">Premium OTT Subscription Services</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleCustomerDashboard}
                variant="ghost"
                className="text-white hover:bg-white/20 border border-white/30"
              >
                <User className="w-4 h-4 mr-2" />
                My Dashboard
              </Button>
              <Button
                onClick={() => router.push("/ott")}
                className="bg-white text-red-900 hover:bg-red-50 font-semibold"
              >
                Claim Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium">
                  <Gift className="w-4 h-4 mr-2" />
                  Limited Time Offer
                </Badge>
                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                  Unlock Premium
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    OTT Entertainment
                  </span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Get instant access to 15+ premium OTT platforms with our exclusive OTTplay Power Play Pack. Stream
                  unlimited movies, shows, and live content across all your devices.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      Claim Your OTT Code
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCustomerDashboard}
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold bg-transparent"
                >
                  <User className="w-5 h-5 mr-2" />
                  Access Dashboard
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Instant Activation</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">100% Secure</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Genuine Codes</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/ottplay-banner.png"
                  alt="OTTplay Banner"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Service?</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the best of entertainment with our premium OTT subscription service designed for modern
              viewers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-8">What You Get</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started Now
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">OTTplay Power Play Pack</h4>
                    <p className="text-gray-600 mt-2">Premium subscription bundle</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Netflix Premium</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Amazon Prime Video</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Disney+ Hotstar</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">+ 12 More Platforms</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h3>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers enjoying premium entertainment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">{testimonial.name}</h5>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Start Streaming?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers and get instant access to premium OTT content today. Your entertainment
            journey starts here!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-xl"
            >
              <Gift className="w-5 h-5 mr-2" />
              Claim Your OTT Code Now
            </Button>
            <Button
              onClick={handleCustomerDashboard}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold bg-transparent"
            >
              <User className="w-5 h-5 mr-2" />
              Access My Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <Image
                  src="/logo.png"
                  alt="SYSTECH DIGITAL Logo"
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <div>
                  <h4 className="text-2xl font-bold">SYSTECH DIGITAL</h4>
                  <p className="text-gray-400">Premium OTT Solutions</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Your trusted partner for premium OTT subscriptions. We provide genuine activation codes and exceptional
                customer service to enhance your entertainment experience.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">i</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-lg font-semibold mb-6">Quick Links</h5>
              <ul className="space-y-3">
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white p-0 h-auto font-normal"
                    onClick={() => router.push("/ott")}
                  >
                    Claim OTT Code
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white p-0 h-auto font-normal"
                    onClick={handleCustomerDashboard}
                  >
                    Customer Dashboard
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white p-0 h-auto font-normal"
                    onClick={() => router.push("/terms-and-conditions")}
                  >
                    Terms & Conditions
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white p-0 h-auto font-normal"
                    onClick={() => router.push("/privacy-policy")}
                  >
                    Privacy Policy
                  </Button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-lg font-semibold mb-6">Contact Info</h5>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-400 mr-3" />
                  <div>
                    <p className="text-white">+91 7709803412</p>
                    <p className="text-gray-400 text-sm">Mon-Sat: 9 AM - 6 PM IST</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-400 mr-3" />
                  <div>
                    <p className="text-white">sales.systechdigital@gmail.com</p>
                    <p className="text-gray-400 text-sm">24/7 Email Support</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-blue-400 mr-3" />
                  <div>
                    <p className="text-white">India</p>
                    <p className="text-gray-400 text-sm">Serving Nationwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2024 SYSTECH DIGITAL. All rights reserved.</p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => router.push("/terms-and-conditions")}
                >
                  Terms
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => router.push("/privacy-policy")}
                >
                  Privacy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => router.push("/refund-policy")}
                >
                  Refunds
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
