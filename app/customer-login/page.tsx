"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, ArrowRight, Home, Clock, Shield, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function CustomerLogin() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  // Start cooldown timer
  const startCooldown = () => {
    setResendCooldown(60)
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/customer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("OTP sent successfully! Please check your email.")
        setStep("otp")
        startCooldown()
      } else {
        setError(data.message || "Failed to send OTP. Please try again.")
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otp.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        // Store authentication in session
        sessionStorage.setItem("customerAuthenticated", "true")
        sessionStorage.setItem("customerEmail", email.toLowerCase().trim())

        setSuccess("Login successful! Redirecting to dashboard...")
        setTimeout(() => {
          router.push("/customer-dashboard")
        }, 1500)
      } else {
        setError(data.message || "Invalid OTP. Please try again.")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    await handleSendOTP()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-white hover:bg-white/20 mr-4"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">Customer Login</h1>
                <p className="text-sm text-red-200 mt-1">Access your OTT subscription dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center text-2xl">
              {step === "email" ? (
                <>
                  <Mail className="w-6 h-6 mr-3 text-blue-600" />
                  Enter Email
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6 mr-3 text-blue-600" />
                  Verify OTP
                </>
              )}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {step === "email"
                ? "Enter your email address to receive a verification code"
                : "Enter the 6-digit code sent to your email"}
            </p>
          </CardHeader>

          <CardContent className="p-8">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {step === "email" ? (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendOTP()}
                    className="mt-2"
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyPress={(e) => e.key === "Enter" && handleVerifyOTP()}
                    className="mt-2 text-center text-lg tracking-widest"
                    maxLength={6}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Code sent to: <span className="font-medium">{email}</span>
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Login
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStep("email")
                      setOtp("")
                      setError("")
                      setSuccess("")
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ← Change Email
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || loading}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {resendCooldown > 0 ? (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Resend in {resendCooldown}s
                      </>
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center text-lg">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Security Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>OTP is valid for 10 minutes only</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Maximum 3 login attempts per 15 minutes</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Your data is encrypted and secure</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📞 Call: +91 7709803412</p>
                <p>📧 Email: sales.systechdigital@gmail.com</p>
                <p>🕒 Mon-Sat: 9 AM - 6 PM IST</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
