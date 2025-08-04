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
import Footer from "@/components/footer"

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

const benefits = [
  { name: "Sony LIV", image: "/ott-logos/Sony LIV.png" },
  { name: "Zee5", image: "/ott-logos/Zee.png" },
  { name: "Fancode", image: "/ott-logos/Fancode.png" },
  { name: "LIONSGATE PLAY", image: "/ott-logos/Lionsgate Play.png" },
  { name: "STAGE", image: "/ott-logos/Stage.png" },
  { name: "DistroTV", image: "/ott-logos/Distro TV.png" },
  { name: "ShemarooMe", image: "/ott-logos/Shemaroo Me.png" },
  { name: "Hubhopper", image: "/ott-logos/placeholder.jpg" }, // example fallback
  { name: "ALTT", image: "/ott-logos/Altt.png" },
  { name: "aha Tamil", image: "/ott-logos/Aha Tamil.png" },
  { name: "Red hot", image: "/ott-logos/Shemaroo Redhot_2X3_logo.png" },
  { name: "Runn Tv", image: "/ott-logos/RUnn.png" },
  { name: "OM TV", image: "/ott-logos/OM Tv.png" },
  { name: "Dangal Play", image: "/ott-logos/Dangal play logo.png" },
  { name: "Premiumflix", image: "/ott-logos/Premiumflix Logo_Color.png" },
  { name: "CHAUPAL", image: "/ott-logos/chaupal hd logo.png" },
  { name: "ShortsTV", image: "/ott-logos/Shorts TV.png" },
  { name: "Sun NXT", image: "/ott-logos/Sun NXT.png" },
  { name: "Playflix", image: "/ott-logos/playflix_logo.png" },
  { name: "Shemaroo Gujarati", image: "/ott-logos/Shemaroo_Gujarati_16X9_logo.png" },
  { name: "Dollywood Play", image: "/ott-logos/Dollywood Play.png" },
  { name: "Nammaflix", image: "/ott-logos/Nammaflix.png" },
  { name: "Chaupal Bhojpuri", image: "/ott-logos/placeholder-logo.png" },
  { name: "ShemarooBhakti", image: "/ott-logos/Shemaroo Bhakti_2X3_logo.png" },
  { name: "ETV Win", image: "/ott-logos/ETV WIN.png" },
  { name: "aha", image: "/ott-logos/aha telugu.png" },
  { name: "VROTT", image: "/ott-logos/VR.png" },
  { name: "Shortfundly", image: "/ott-logos/Shortfundly.png" },
  { name: "Atrangi", image: "/ott-logos/Atrangi.png" },
  { name: "Bhaktiflix", image: "/ott-logos/BHAKTI FLIX.png" },
  { name: "Fridaay", image: "/ott-logos/placeholder-logo.png" },
  { name: "Gurjari", image: "/ott-logos/Gurjari.png" },
]

  const features = [
    {
      icon: <Tv className="w-8 h-8 text-blue-600" />,
      title: "Premium OTT Content",
      description: "Access to 29 premium OTT platforms and more",
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
      description: "100% secure activation process with 24/7 customer support",
    },
  ]

  const benefits = [
    "OTT Pack",
    "SonyLiv",
    "Zee5",
    "Fancode",
    "LIONSGATE PLAY",
    "STAGE",
    "DistroTV",
    "ShemarooMe",
    "Hubhopper",
    "ALTT",
    "aha Tamil",
    "Red hot",
    "Runn Tv",
    "OM TV",
    "Dangal Play",
    "Premiumflix",
    "CHAUPAL",
    "ShortsTV",
    "Sun NXT",
    "Playflix",
    "Shemaroo Gujarati",
    "Dollywood Play",
    "Nammaflix",
    "Chaupal Bhojpuri",
    "ShemarooBhakti",
    "ETV Win",
    "aha",
    "VROTT",
    "Shortfundly",
    "Atrangi",
    "Bhaktiflix",
    "Fridaay",
    "Gurjari",
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
                <h1 className="text-3xl font-bold text-white">Systech Digital</h1>
                <p className="text-sm text-red-200">Simplifying the Digital Experience</p>
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
                  Get instant access to 29 premium OTT platforms with our exclusive OTTplay Power Play Pack. Stream
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
                  src="/B2B_1050x600.png"
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
{/* Benefits Section */}
<section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h3 className="text-4xl font-bold text-gray-900 mb-8">What You Get</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { name: "Sony LIV", image: "/Sony LIV.png" },
            { name: "Zee5", image: "/Zee.png" },
            { name: "Fancode", image: "/Fancode.png" },
            { name: "LIONSGATE PLAY", image: "/Lionsgate Play.png" },
            { name: "STAGE", image: "/Stage.png" },
            { name: "DistroTV", image: "/Distro TV.png" },
            { name: "ShemarooMe", image: "/Shemaroo Me.png" },
            { name: "Hubhopper", image: "/placeholder.jpg" },
            { name: "ALTT", image: "/Altt.png" },
            { name: "aha Tamil", image: "/Aha Tamil.png" },
            { name: "Red hot", image: "/Shemaroo Redhot_2X3_logo.png" },
            { name: "Runn Tv", image: "/RUnn.png" },
            { name: "OM TV", image: "/OM Tv.png" },
            { name: "Dangal Play", image: "/Dangal play logo.png" },
            { name: "Premiumflix", image: "/Premiumflix Logo_Color.png" },
            { name: "CHAUPAL", image: "/chaupal hd logo.png" },
            { name: "ShortsTV", image: "/Shorts TV.png" },
            { name: "Sun NXT", image: "/Sun NXT.png" },
            { name: "Playflix", image: "/playflix_logo.png" },
            { name: "Shemaroo Gujarati", image: "/Shemaroo_Gujarati_16X9_logo.png" },
            { name: "Dollywood Play", image: "/Dollywood Play.png" },
            { name: "Nammaflix", image: "/Nammaflix.png" },
            { name: "Chaupal Bhojpuri", image: "/placeholder-logo.png" },
            { name: "ShemarooBhakti", image: "/Shemaroo Bhakti_2X3_logo.png" },
            { name: "ETV Win", image: "/ETV WIN.png" },
            { name: "aha", image: "/aha telugu.png" },
            { name: "VROTT", image: "/VR.png" },
            { name: "Shortfundly", image: "/Shortfundly.png" },
            { name: "Atrangi", image: "/Atrangi.png" },
            { name: "Bhaktiflix", image: "/BHAKTI FLIX.png" },
            { name: "Fridaay", image: "/placeholder-logo.png" },
            { name: "Gurjari", image: "/Gurjari.png" },
          ].map((benefit, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Image
                src={benefit.image}
                alt={benefit.name}
                width={40}
                height={40}
                className="rounded-md shadow"
              />
              <span className="text-gray-700 font-medium">{benefit.name}</span>
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

      {/* Right Side Card */}
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
                <span className="text-gray-600">Access to 29 Premium OTT Platforms</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">4K Ultra HD Streaming</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Offline Download Support</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Ad-Free Experience</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</section>


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
                      <span className="text-gray-600">Access to 29 Premium OTT Platforms</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">4K Ultra HD Streaming</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Offline Download Support</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Ad-Free Experience</span>
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
      <Footer />
    </div>
  )
}
