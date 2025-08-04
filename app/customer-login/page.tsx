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

  // Cooldown logic
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStep("otp")
      setSuccess("OTP sent successfully.")
      setResendCooldown(60)
    } catch {
      setError("Failed to send OTP.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (otp === "123456") {
        setSuccess("OTP Verified! Redirecting...")
        setTimeout(() => router.push("/dashboard"), 1000)
      } else {
        setAttempts(prev => prev + 1)
        setError("Invalid OTP.")
      }
    } catch {
      setError("Verification failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = () => {
    if (resendCooldown === 0) {
      setSuccess("OTP resent.")
      setResendCooldown(60)
    }
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
                className="text-gray-200 hover:text-white border border-white/30 px-2 py-1 text-sm"
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
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Verify OTP
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Email Form */}
            {step === "email" ? (
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
                  <p className="text-xs text-gray-500 mt-1">
                    Email linked to your OTT subscription
                  </p>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    <>
                      Send OTP <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              // OTP Form
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
                  />
                  <p className="text-xs text-gray-500 mt-1">OTP sent to: <strong>{email}</strong></p>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2" disabled={loading}>
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
                  <Button type="button" variant="ghost" className="p-0 text-gray-600" onClick={() => {
                    setStep("email")
                    setOtp("")
                    setError("")
                    setAttempts(0)
                  }}>
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

            {/* Security Notice */}
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
          </CardContent>
        </Card>

        {/* Footer spacer */}
        <div className="h-8 sm:h-0" />
      </div>
    </div>
  )
}
