"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, ArrowRight, Home, Shield, Clock, CheckCircle } from "lucide-react"
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
  const [attempts, setAttempts] = useState(0)

  // Check if already authenticated
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("customerAuthenticated")
    if (isAuthenticated) {
      router.push("/customer-dashboard")
    }
  }, [router])

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/customer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("OTP sent successfully! Please check your email.")
        setStep("otp")
        setResendCooldown(60)
        setAttempts(0)
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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) {
      setError("Please enter the OTP")
      return
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store authentication in session
        sessionStorage.setItem("customerAuthenticated", "true")
        sessionStorage.setItem("customerEmail", email.trim().toLowerCase())

        setSuccess("Login successful! Redirecting to dashboard...")
        setTimeout(() => {
          router.push("/customer-dashboard")
        }, 1000)
      } else {
        setAttempts((prev) => prev + 1)
        setError(data.message || "Invalid OTP. Please try again.")

        if (attempts >= 2) {
          setError("Too many failed attempts. Please request a new OTP.")
          setStep("email")
          setOtp("")
          setAttempts(0)
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
    if (resendCooldown > 0) return

    setOtp("")
    setError("")
    setAttempts(0)
    await handleSendOTP({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Image
            src="/logo.png"
            alt="SYSTECH DIGITAL Logo"
            width={60}
            height={60}
            className="rounded-full mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Login</h1>
          <p className="text-gray-600">Access your OTT activation code</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center">
              {step === "email" ? (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Enter Your Email
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Verify OTP
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the email address associated with your OTT subscription
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="mt-1 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
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
                      Verify & Login
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex justify-between items-center text-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep("email")
                      setOtp("")
                      setError("")
                      setAttempts(0)
                    }}
                    className="text-gray-600 hover:text-gray-900 p-0"
                  >
                    Change Email
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || loading}
                    className="text-blue-600 hover:text-blue-700 p-0"
                  >
                    {resendCooldown > 0 ? (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Resend in {resendCooldown}s
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

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Security Notice</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    We'll send a 6-digit OTP to your email for secure access. The OTP expires in 10 minutes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Need help?</p>
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span>📞 +91 7709803412</span>
            <span>✉️ sales.systechdigital@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
