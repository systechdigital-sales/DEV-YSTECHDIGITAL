"use client"

import { Mail, MapPin, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-10">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-black via-red-900 to-black shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={50} height={50} className="rounded-full mr-3" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Systech Digital</h1>
                <p className="text-xs sm:text-sm text-red-200">Simplifying the Digital Experience</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-gray-200 hover:text-gray-800 border border-white/30 px-2 py-1 text-sm"
            >
              <Home className="w-4 h-4 mr-1" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20 sm:h-24 md:h-28" />

      {/* Contact Info Cards */}
      <div className="max-w-4xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Card */}
        <Card className="shadow-md border-0">
          <CardHeader className="flex items-center gap-2 bg-blue-600 text-white rounded-t-md py-3 px-4">
            <Mail className="w-5 h-5" />
            <CardTitle className="text-base sm:text-lg font-semibold">Email Us</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-gray-700 text-sm sm:text-base">
              sales.systechdigital@gmail.com
            </p>
            <p className="text-gray-500 text-xs mt-1">We typically reply within 24 hours.</p>
          </CardContent>
        </Card>

        {/* Address Card */}
        <Card className="shadow-md border-0">
          <CardHeader className="flex items-center gap-2 bg-green-600 text-white rounded-t-md py-3 px-4">
            <MapPin className="w-5 h-5" />
            <CardTitle className="text-base sm:text-lg font-semibold">Our Address</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p>Systech IT Solution Pvt. Ltd</p>
                <p>#23/1, 1st floor , J.C.1st cross</p>
                <p>JC Road , Near Poornima Theatre , Bangaluru</p>
                <p>Karnataka, India - 560027</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
