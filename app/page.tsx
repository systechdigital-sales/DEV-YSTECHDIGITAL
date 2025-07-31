"use client"

<<<<<<< HEAD
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
=======
import { useState, useEffect } from "react"
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Gift,
<<<<<<< HEAD
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
=======
  Star,
  Shield,
  Clock,
  Play,
  Smartphone,
  Tv,
  Monitor,
  ArrowRight,
  Users,
  Award,
  Zap,
  Heart,
} from "lucide-react"
import Image from "next/image"

const ottPlatforms = [
  "Netflix",
  "Amazon Prime",
  "Disney+ Hotstar",
  "Sony LIV",
  "Zee5",
  "Voot",
  "MX Player",
  "ALTBalaji",
  "Eros Now",
  "Hungama Play",
  "ShemarooMe",
  "Hoichoi",
  "Sun NXT",
  "Aha",
  "Discovery+",
  "Lionsgate Play",
  "Apple TV+",
  "YouTube Premium",
  "JioCinema",
  "Fancode",
  "Epic ON",
  "DocuBay",
  "Planet Marathi",
  "Stage",
  "Chaupal",
  "Koode",
  "MUBI",
  "Curiosity Stream",
  "Hallmark Movies Now",
  "Tata Play Binge",
  "Vi Movies & TV",
  "Airtel Xstream",
]

const features = [
  {
    icon: <Gift className="w-8 h-8 text-blue-600" />,
    title: "Absolutely FREE",
    description: "Get your OTTplay Power Play Pack worth ₹3499 at no cost with eligible purchases",
  },
  {
    icon: <Star className="w-8 h-8 text-yellow-600" />,
    title: "32+ Premium Platforms",
    description: "Access to all major OTT platforms including Netflix, Prime Video, Disney+ and more",
  },
  {
    icon: <Shield className="w-8 h-8 text-green-600" />,
    title: "Secure & Verified",
    description: "100% genuine subscription codes with secure payment processing",
  },
  {
    icon: <Clock className="w-8 h-8 text-purple-600" />,
    title: "12 Months Access",
    description: "Full year subscription to enjoy unlimited streaming across all platforms",
  },
]

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Mumbai, Maharashtra",
    rating: 5,
    comment: "Amazing offer! Got my OTT subscription within 24 hours. All platforms working perfectly.",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Priya Sharma",
    location: "Delhi, NCR",
    rating: 5,
    comment: "Genuine service. The process was smooth and customer support was very helpful.",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Arjun Patel",
    location: "Bangalore, Karnataka",
    rating: 5,
    comment: "Worth every penny! Now I can enjoy all my favorite shows on multiple platforms.",
    avatar: "/placeholder-user.jpg",
  },
]

const stats = [
  { number: "50,000+", label: "Happy Customers", icon: <Users className="w-6 h-6" /> },
  { number: "32+", label: "OTT Platforms", icon: <Play className="w-6 h-6" /> },
  { number: "99.9%", label: "Success Rate", icon: <Award className="w-6 h-6" /> },
  { number: "24/7", label: "Support", icon: <Heart className="w-6 h-6" /> },
]

export default function HomePage() {
  const [currentPlatform, setCurrentPlatform] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlatform((prev) => (prev + 1) % ottPlatforms.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-xl border-b border-red-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full mr-3" />
              <div>
<<<<<<< HEAD
                <h1 className="text-3xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-red-200">Premium OTT Subscription Services</p>
=======
                <h1 className="text-2xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-red-200">Your Digital Entertainment Partner</p>
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
<<<<<<< HEAD
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
=======
                onClick={() => (window.location.href = "/customer-dashboard")}
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                My Dashboard
              </Button>
              <Button
                onClick={() => (window.location.href = "/ott")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
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
<<<<<<< HEAD
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
=======
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                LIMITED TIME OFFER
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Claim your complimentary
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  OTTplay Power Play Pack
                </span>
                <span className="text-3xl lg:text-4xl text-green-600 font-extrabold">
                  worth ₹3499* - Absolutely FREE!
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-2">*Terms and conditions applied</p>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl">
                Get instant access to 32+ premium OTT platforms including Netflix, Amazon Prime, Disney+ Hotstar and
                more. Valid for purchases made between July 1, 2025 - September 30, 2025.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => (window.location.href = "/ott")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl"
                >
                  Claim Your Free Subscription
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => (window.location.href = "/customer-dashboard")}
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
                >
                  Check My Status
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Now Streaming On</h3>
                  <div className="h-8 flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600 animate-pulse">
                      {ottPlatforms[currentPlatform]}
                    </span>
                  </div>
                </div>
                <Image
                  src="/ottplay-banner.png"
                  alt="OTTplay Power Play Pack"
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg"
                />
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Tv className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-700">Smart TV</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Smartphone className="w-8 h-8 text-green-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-700">Mobile</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Monitor className="w-8 h-8 text-purple-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-700">Desktop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
          </div>
        </div>
      </section>

      {/* Features Section */}
<<<<<<< HEAD
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Service?</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the best of entertainment with our premium OTT subscription service designed for modern
              viewers.
=======
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our OTT Subscription?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the best of digital entertainment with our comprehensive OTT package
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
<<<<<<< HEAD
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
=======
              <Card
                key={index}
                className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">{feature.description}</p>
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
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
=======
      {/* OTT Platforms Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">32+ Premium OTT Platforms Included</h2>
            <p className="text-xl text-gray-600">Access all your favorite content in one subscription</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ottPlatforms.slice(0, 24).map((platform, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 text-center border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">{platform}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              + 8 More Platforms
            </Badge>
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
          </div>
        </div>
      </section>

<<<<<<< HEAD
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
=======
      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-xl border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={50}
                      height={50}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.comment}"</p>
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
<<<<<<< HEAD
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Start Streaming?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers and get instant access to premium OTT content today. Your entertainment
            journey starts here!
=======
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Don't Miss Out on This Limited Time Offer!</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Claim your free OTTplay Power Play Pack worth ₹3499 today. Offer valid until September 30, 2025.
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
<<<<<<< HEAD
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
=======
              onClick={() => (window.location.href = "/ott")}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl"
            >
              Claim Now - It's FREE!
              <Gift className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = "/terms-and-conditions")}
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
            >
              View Terms & Conditions
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
<<<<<<< HEAD
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
=======
      <footer className="bg-gradient-to-r from-black via-red-900 to-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
                <Image
                  src="/logo.png"
                  alt="SYSTECH DIGITAL Logo"
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <div>
<<<<<<< HEAD
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
=======
                  <h3 className="text-xl font-bold text-white">SYSTECH DIGITAL</h3>
                  <p className="text-red-200 text-sm">Your Digital Entertainment Partner</p>
                </div>
              </div>
              <p className="text-red-200 text-sm">
                Leading provider of IT solutions and digital entertainment services across India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => (window.location.href = "/ott")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Claim OTT Subscription
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => (window.location.href = "/customer-dashboard")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Customer Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => (window.location.href = "/terms-and-conditions")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Terms & Conditions
                  </button>
                </li>
              </ul>
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
            </div>

            <div>
<<<<<<< HEAD
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
=======
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => (window.location.href = "/privacy-policy")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Privacy Policy
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
              <h4 className="font-semibold mb-4 text-white">Contact Us</h4>
              <ul className="space-y-2 text-sm text-red-200">
                <li>📞 +91 7709803412</li>
                <li>📧 sales.systechdigital@gmail.com</li>
                <li>🌐 www.systechdigital.co.in</li>
                <li>📍 Bangalore, Karnataka</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-red-800 mt-8 pt-8 text-center">
            <p className="text-sm text-red-200">© 2025 Systech IT Solutions Limited. All rights reserved.</p>
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
          </div>
        </div>
      </footer>
    </div>
  )
}
