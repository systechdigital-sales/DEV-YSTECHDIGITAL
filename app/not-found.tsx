"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Clock } from "lucide-react"
import Image from "next/image"

export default function NotFound() {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const goHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer flex items-center" onClick={goHome}>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="border-red-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-red-600">404</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Page Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-gray-600">
                Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or the URL
                might be incorrect.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-semibold">Auto-redirecting in {countdown} seconds</span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={goHome} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
                <Button variant="outline" onClick={() => window.history.back()} className="flex-1 border-red-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                <p>Need help? Contact our support team:</p>
                <p className="font-semibold text-red-600">sales.systechdigital@gmail.com</p>
                <p className="font-semibold text-red-600">+91 7709803412</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black via-red-900 to-black text-white py-8 border-t border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center md:items-start">
              <div className="relative h-8 w-8 mr-3 hidden md:block">
                <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={32} height={32} className="rounded-full" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">SYSTECH DIGITAL</h3>
                <p className="text-red-200 text-sm">Your trusted partner for IT Solutions & Mobile Technology</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={goHome} className="text-red-200 hover:text-white transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/ottclaim")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    OTT Claim
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
