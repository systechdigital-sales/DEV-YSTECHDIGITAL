"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, CreditCard, CheckCircle, AlertCircle, Home, User, Package, Shield, Clock } from "lucide-react"
import Image from "next/image"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  streetAddress: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  purchaseType: string
  activationCode: string
  purchaseDate: string
  invoiceNumber: string
  sellerName: string
  billFile: File | null
  agreeToTerms: boolean
}

export default function OTTClaimPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    streetAddress: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    purchaseType: "", // Initialize with empty string
    activationCode: "",
    purchaseDate: "",
    invoiceNumber: "",
    sellerName: "",
    billFile: null,
    agreeToTerms: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (field: keyof FormData, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("") // Clear error when input changes
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid file (JPG, PNG, or PDF)")
        handleInputChange("billFile", null) // Clear file if invalid
        return
      }

      if (file.size > maxSize) {
        setError("File size must be less than 5MB")
        handleInputChange("billFile", null) // Clear file if invalid
        return
      }
    }
    handleInputChange("billFile", file)
  }

  const validateForm = (): boolean => {
    console.log("Starting form validation...")

    const requiredFields: (keyof FormData)[] = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "purchaseType",
      "activationCode",
      "purchaseDate",
    ]

    for (const field of requiredFields) {
      if (!formData[field]) {
        const fieldName = field.replace(/([A-Z])/g, " $1").toLowerCase()
        setError(`Please fill in the ${fieldName} field`)
        console.log(`Validation failed: ${fieldName} is empty.`)
        return false
      }
    }

    // Conditional validation for hardware purchase
    if (formData.purchaseType === "hardware") {
      if (!formData.invoiceNumber) {
        setError("Invoice Number is required for Hardware Purchase")
        console.log("Validation failed: Invoice Number is empty for Hardware Purchase.")
        return false
      }
      if (!formData.sellerName) {
        setError("Seller Name is required for Hardware Purchase")
        console.log("Validation failed: Seller Name is empty for Hardware Purchase.")
        return false
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      console.log("Validation failed: Invalid email format.")
      return false
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Please enter a valid 10-digit Indian mobile number")
      console.log("Validation failed: Invalid phone number format.")
      return false
    }

    // Terms agreement
    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      console.log("Validation failed: Terms and conditions not agreed.")
      return false
    }

    console.log("Form validation successful.")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Attempting to submit form...")

    if (!validateForm()) {
      console.log("Form validation failed, stopping submission.")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")
    console.log("Validation passed. Setting loading state and clearing messages.")

    try {
      const submitData = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "billFile" && value instanceof File) {
          submitData.append(key, value)
        } else if (key !== "billFile") {
          submitData.append(key, String(value))
        }
      })
      console.log("FormData prepared:", Object.fromEntries(submitData.entries()))

      const response = await fetch("/api/ott-claim/submit", {
        method: "POST",
        body: submitData,
      })
      console.log("API response received. Status:", response.status)

      const data = await response.json()
      console.log("API response data:", data)

      if (data.success) {
        setSuccess("Claim submitted successfully! Redirecting to payment...")
        console.log("Claim submission successful. Redirecting...")
        setTimeout(() => {
          // Use the full redirectUrl provided by the API
          router.push(data.redirectUrl)
        }, 2000)
      } else {
        setError(data.message || "Failed to submit claim. Please try again.")
        console.error("Claim submission failed:", data.message)
      }
    } catch (error) {
      console.error("Error submitting claim:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
      console.log("Submission process finished. Loading state reset.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">Systech Digital</h1>
                <p className="text-sm text-red-200 mt-1">Simplifying the Digital Experience</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-white hover:bg-white/20 mr-4"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/customer-login")}
                className="text-white hover:bg-white/20 border border-white/30"
              >
                <User className="w-4 h-4 mr-2" />
                My Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Submit Claim</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Get Code</span>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center text-xl">
                <User className="w-5 h-5 mr-3 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="mt-1"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="mt-1"
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="mt-1"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center text-xl">
                <Home className="w-5 h-5 mr-3 text-green-600" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    className="mt-1"
                    placeholder="Enter your street address"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                    className="mt-1"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="mt-1"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="mt-1"
                      placeholder="Enter your state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      className="mt-1"
                      placeholder="Enter postal code"
                      maxLength={6}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Information */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center text-xl">
                <Package className="w-5 h-5 mr-3 text-purple-600" />
                Purchase Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="purchaseType">Purchase Type *</Label>
                  <Select
                    value={formData.purchaseType}
                    onValueChange={(value) => handleInputChange("purchaseType", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select purchase type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware Purchase</SelectItem>
                      <SelectItem value="software">Software Purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="activationCode">Activation Code/Product Serial Number/IMEI Number *</Label>
                  <Input
                    id="activationCode"
                    type="text"
                    value={formData.activationCode}
                    onChange={(e) => handleInputChange("activationCode", e.target.value.toUpperCase())}
                    className="mt-1 font-mono"
                    placeholder="Enter your activation code"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is the code you received with your purchase</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date *</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                      className="mt-1"
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceNumber">
                      Invoice Number {formData.purchaseType === "hardware" ? "*" : "(Optional)"}
                    </Label>
                    <Input
                      id="invoiceNumber"
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                      className="mt-1"
                      placeholder="Enter invoice number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sellerName">
                    Seller Name {formData.purchaseType === "hardware" ? "*" : "(Optional)"}
                  </Label>
                  <Input
                    id="sellerName"
                    type="text"
                    value={formData.sellerName}
                    onChange={(e) => handleInputChange("sellerName", e.target.value)}
                    className="mt-1"
                    placeholder="Enter seller or store name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center text-xl">
                <Upload className="w-5 h-5 mr-3 text-orange-600" />
                Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <Label htmlFor="billFile">Purchase Bill/Receipt (Optional)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    {formData.billFile ? (
                      <span className="text-green-600 font-medium">{formData.billFile.name}</span>
                    ) : (
                      "Click to upload or drag and drop"
                    )}
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG or PDF (Max 5MB)</p>
                  <input
                    id="billFile"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                    onClick={() => document.getElementById("billFile")?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <Label htmlFor="agreeToTerms" className="cursor-pointer">
                    I agree to the{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-blue-600 underline"
                      onClick={() => router.push("/terms-and-conditions")}
                    >
                      Terms and Conditions
                    </Button>{" "}
                    and{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-blue-600 underline"
                      onClick={() => router.push("/privacy-policy")}
                    >
                      Privacy Policy
                    </Button>
                  </Label>
                  <p className="text-gray-500 mt-1">
                    By submitting this claim, you confirm that all information provided is accurate and complete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Claim...
                </>
              ) : (
                <>
                  Submit Claim & Proceed to Payment
                  <CreditCard className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Process</h4>
              <p className="text-sm text-gray-600">
                Your data is encrypted and protected with industry-standard security measures.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Quick Processing</h4>
              <p className="text-sm text-gray-600">
                Claims are processed within 24-48 hours after successful payment verification.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Guaranteed Delivery</h4>
              <p className="text-sm text-gray-600">100% genuine OTT codes delivered directly to your email address.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
