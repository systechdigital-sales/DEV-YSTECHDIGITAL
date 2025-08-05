"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, ArrowRight, Home, Shield, Clock, CheckCircle, XCircle, Phone } from "lucide-react"
import Image from "next/image"

export default function CustomerLogin() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp" | "no-key">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const [attempts, setAttempts] = useState(0)

  // Check if user is already authenticated
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("customerAuthenticated")
    if (isAuthenticated) {
      console.log("User already authenticated, redirecting to dashboard")
      router.push("/customer-dashboard")
    }
  }, [router])

  // Cooldown logic
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    console.log("Sending OTP for email:", email)

    try {
      const response = await fetch("/api/customer/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()
      console.log("Send OTP response:", data)

      if (data.success) {
        setStep("otp")
        setSuccess(data.message || "OTP sent successfully to your email address")
        setResendCooldown(60)
        console.log("OTP sent successfully, moving to OTP step")
      } else {
        if (data.noOttKey) {
          console.log("No OTT key found, showing no-key step")
          setStep("no-key")
        } else {
          setError(data.message || "Failed to send OTP. Please try again.")
        }
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    console.log("Verifying OTP:", otp, "for email:", email)

    try {
      const response = await fetch("/api/customer/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
        }),
      })

      const data = await response.json()
      console.log("Verify OTP response:", data)

      if (data.success) {
        setSuccess("OTP verified successfully! Redirecting to dashboard...")

        // Store authentication in sessionStorage
        sessionStorage.setItem("customerAuthenticated", "true")
        sessionStorage.setItem("customerEmail", email.toLowerCase().trim())

        console.log("Authentication stored in sessionStorage")
        console.log("customerAuthenticated:", sessionStorage.getItem("customerAuthenticated"))
        console.log("customerEmail:", sessionStorage.getItem("customerEmail"))

        // Redirect to customer dashboard after a short delay
        setTimeout(() => {
          console.log("Redirecting to customer dashboard...")
          router.push("/customer-dashboard")
        }, 2000)
      } else {
        setAttempts((prev) => prev + 1)
        setError(data.message || "Invalid OTP. Please try again.")

        // Clear OTP field on error
        setOtp("")

        // If too many attempts, reset to email step
        if (attempts >= 2) {
          setStep("email")
          setAttempts(0)
          setError("Too many failed attempts. Please request a new OTP.")
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown === 0) {
      setLoading(true)
      setError("")

      try {
        const response = await fetch("/api/customer/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.toLowerCase().trim() }),
        })

        const data = await response.json()

        if (data.success) {
          setSuccess("New OTP sent successfully to your email address")
          setResendCooldown(60)
          setOtp("") // Clear current OTP
        } else {
          setError(data.message || "Failed to resend OTP. Please try again.")
        }
      } catch (error) {
        console.error("Error resending OTP:", error)
        setError("Network error. Please check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const resetToEmailStep = () => {
    setStep("email")
    setEmail("")
    setOtp("")
    setError("")
    setSuccess("")
    setAttempts(0)
    setResendCooldown(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
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

        {/* Spacer for header */}
        <div className="h-20 sm:h-24 md:h-28" />

        {/* Page description */}
        <p className="text-center text-sm sm:text-base text-gray-600 mb-4">Access your OTT activation code</p>

        {/* Main Card */}
        <Card className="shadow-xl border-0 w-full">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center justify-center text-base sm:text-lg md:text-xl">
              {step === "email" ? (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Enter Your Email
                </>
              ) : step === "otp" ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Verify OTP
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-2" />
                  No OTT Key Found
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <XCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Email Form */}
            {step === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="mt-1 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email linked to your OTT subscription</p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking account...
                    </div>
                  ) : (
                    <>
                      Send OTP <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* OTP Form */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="mt-1 text-center text-lg tracking-widest"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    OTP sent to: <strong>{email}</strong>
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    <>
                      Verify & Login <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex justify-between items-center text-xs sm:text-sm mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="p-0 text-gray-600"
                    onClick={() => {
                      setStep("email")
                      setOtp("")
                      setError("")
                      setAttempts(0)
                    }}
                  >
                    Change Email
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="p-0 text-blue-600"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || loading}
                  >
                    {resendCooldown > 0 ? (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Resend in {resendCooldown}s
                      </span>
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
                </div>

                {attempts > 0 && (
                  <p className="text-xs text-orange-600 text-center">Attempts remaining: {3 - attempts}</p>
                )}
              </form>
            )}

            {/* No OTT Key Found */}
            {step === "no-key" && (
              <div className="text-center space-y-6">
                <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                  <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">No OTT Play Key Found</h3>
                  <p className="text-orange-800 mb-4">
                    No OTT Play key found against your email ID: <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-orange-700">
                    Please wait for your key to be assigned or contact our support team for assistance.
                  </p>
                </div>

                {/* Contact Support */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Contact Support Team</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center text-blue-800">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>+91 7709803412</span>
                    </div>
                    <div className="flex items-center justify-center text-blue-800">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>sales.systechdigital@gmail.com</span>
                    </div>
                  </div>
                </div>

                <Button onClick={resetToEmailStep} variant="outline" className="w-full bg-transparent">
                  Try Different Email
                </Button>
              </div>
            )}

            {/* Security Notice */}
            {step !== "no-key" && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Security Notice</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      We'll send a 6-digit OTP to your email for secure access. The OTP expires in 10 minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer spacer */}
        <div className="h-8 sm:h-0" />
      </div>
    </div>
  )
}
