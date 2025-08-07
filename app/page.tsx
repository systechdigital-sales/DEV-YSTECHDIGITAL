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
import OttGridSection from "@/components/home-contents"

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
      description: "Access to 28 premium OTT platforms and more",
    },
    {
      icon: <Smartphone className="w-8 h-8 text-green-600" />,
      title: "Multi-Device Support",
      description: "Watch on TV, mobile, tablet, and web",
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Titles",
      description: "Upto 2L+ Titles to watch",
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Streaming",
      description: "Stream up to Full HD quality",
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
    "Runn Tv",
    "OM TV",
    "Dangal Play",
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
            {/* <div className="flex items-center space-x-4">
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
            </div> */}
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
                  Get instant access to 28 premium OTT platforms with our exclusive OTTplay Power Play Pack. Stream
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
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Why Choose OTTplay?</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the best of entertainment with OTTplay subscription service designed for modern
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
       <OttGridSection handleGetStarted={function (): void {
        throw new Error("Function not implemented.")
      } }/>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h3 className="text-4xl font-bold text-white mb-6">Ready to Start Streaming?</h3>
    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
      Join thousands of happy customers and get instant access to premium OTT content today. Your entertainment
      journey starts here!
    </p>
    <div className="flex justify-center">
      <a
        href="https://www.ottplay.com/partner/systech-it-solution/ott_sustech_annualtest"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-xl rounded-md flex items-center gap-2"
      >
        Redeem Your Code
      </a>
    </div>
  </div>
</section>


      {/* Footer */}
      <Footer />
    </div>
  )
}
