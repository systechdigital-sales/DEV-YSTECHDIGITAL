"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/customer/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "OTP sent successfully! Please check your inbox and spam folder.")
        setOtpSent(true)
      } else {
        toast.error(data.message || "Failed to send OTP. Please try again later.")
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      toast.error("An unexpected error occurred while sending OTP. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/customer/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "Login successful!")
        router.push("/customer-dashboard") // Redirect to customer dashboard
      } else {
        toast.error(data.message || "OTP verification failed. Please try again.")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast.error("An unexpected error occurred during OTP verification. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-800 to-indigo-900 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-lg rounded-xl">
        <CardHeader className="space-y-1 text-center">
          <Image src="/logo.png" alt="Systech Logo" width={100} height={100} className="mx-auto mb-4" priority />
          <CardTitle className="text-3xl font-bold text-purple-900">Customer Login</CardTitle>
          <CardDescription className="text-gray-700">Enter your email to receive an OTP for login.</CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-800">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 bg-white/70 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <Label htmlFor="otp" className="text-gray-800">
                  OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter your 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="mt-1 bg-white/70 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full text-purple-700 hover:text-purple-900"
              >
                Resend OTP
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-purple-700 hover:text-purple-900">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
