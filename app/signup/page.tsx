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
import { z } from "zod"
import { signupFormSchema } from "@/lib/definitions"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [errors, setErrors] = useState<z.ZodIssue[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [ottCode, setOttCode] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors(null)
    setOttCode(null)

    try {
      signupFormSchema.parse(formData) // Validate with Zod client-side

      const response = await fetch("/api/customer/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "Signup successful!")
        setOttCode(data.ottCode)
        // Optionally redirect after a short delay or show a success message
        // setTimeout(() => router.push('/customer-login'), 3000);
      } else {
        if (data.errors) {
          setErrors(data.errors)
          toast.error("Validation failed. Please check your input.")
        } else {
          toast.error(data.message || "Signup failed. Please try again.")
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors)
        toast.error("Validation failed. Please check your input.")
      } else {
        console.error("Error during signup:", error)
        toast.error("An unexpected error occurred during signup. Please try again later.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-800 to-indigo-900 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-lg rounded-xl">
        <CardHeader className="space-y-1 text-center">
          <Image src="/logo.png" alt="Systech Logo" width={100} height={100} className="mx-auto mb-4" priority />
          <CardTitle className="text-3xl font-bold text-purple-900">Sign Up</CardTitle>
          <CardDescription className="text-gray-700">Create your account to get your OTT Code.</CardDescription>
        </CardHeader>
        <CardContent>
          {ottCode ? (
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold text-green-700">Congratulations! Your account has been created.</p>
              <p className="text-2xl font-bold text-purple-800">
                Your OTT Code: <span className="text-indigo-600">{ottCode}</span>
              </p>
              <p className="text-sm text-gray-600">Please save this code. You can now proceed to login.</p>
              <Button
                onClick={() => router.push("/customer-login")}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-800">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white/70 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
                {errors?.find((e) => e.path[0] === "name") && (
                  <p className="text-red-500 text-sm mt-1">{errors.find((e) => e.path[0] === "name")?.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-800">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white/70 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
                {errors?.find((e) => e.path[0] === "email") && (
                  <p className="text-red-500 text-sm mt-1">{errors.find((e) => e.path[0] === "email")?.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-800">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white/70 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
                {errors?.find((e) => e.path[0] === "phone") && (
                  <p className="text-red-500 text-sm mt-1">{errors.find((e) => e.path[0] === "phone")?.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white" disabled={loading}>
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/customer-login" className="font-medium text-purple-700 hover:text-purple-900">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
