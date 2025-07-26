"use client"

import { useRouter } from "next/navigation"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, AlertCircle } from "lucide-react"
import Image from "next/image"

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Italy",
  "Japan",
  "Jordan",
  "Kenya",
  "Malaysia",
  "Mexico",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Philippines",
  "Poland",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
]

export default function OTTClaimPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    purchaseType: "",
    activationCode: "",
    purchaseDate: "",
    invoiceNumber: "",
    sellerName: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Please upload only JPG, PNG, or PDF files")
        return
      }

      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB")
        return
      }

      setFile(selectedFile)
    }
  }

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country",
      "purchaseType",
      "activationCode",
      "purchaseDate",
    ]

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`)
        return false
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address")
      return false
    }

    // Phone validation
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid phone number")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })

      // Add file if selected (optional)
      if (file) {
        submitData.append("bill", file)
      }

      const response = await fetch("/api/ott-claim/submit", {
        method: "POST",
        body: submitData,
      })

      const result = await response.json()

      if (result.success) {
        // Redirect to payment page
        window.location.href = result.redirectUrl
      } else {
        alert(result.message || "Failed to submit claim. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting claim:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-white">SYSTECH DIGITAL</h1>
              <p className="text-sm text-red-200 mt-1">OTT Subscription Claim Form</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Important Notice */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-1">Important Notice:</p>
                <p>
                  A processing fee of ₹99 is required to verify your claim and process your OTT subscription code. This
                  fee helps us maintain our verification system and ensure genuine claims.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                  placeholder="Enter your street address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                  placeholder="Apartment, suite, etc."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter your city"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter your state"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    placeholder="Enter postal code"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Information */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="purchaseType">Purchase Type *</Label>
                <Select
                  value={formData.purchaseType}
                  onValueChange={(value) => handleInputChange("purchaseType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purchase type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware Purchase</SelectItem>
                    <SelectItem value="software">Software Purchase</SelectItem>
                    <SelectItem value="subscription">Subscription Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="activationCode">Activation Code / Serial Number *</Label>
                <Input
                  id="activationCode"
                  value={formData.activationCode}
                  onChange={(e) => handleInputChange("activationCode", e.target.value)}
                  placeholder="Enter activation code or serial number"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchaseDate">Purchase Date *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number (Optional)</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                    placeholder="Enter invoice number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="sellerName">Seller/Store Name (Optional)</Label>
                <Input
                  id="sellerName"
                  value={formData.sellerName}
                  onChange={(e) => handleInputChange("sellerName", e.target.value)}
                  placeholder="Enter seller or store name"
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Upload Purchase Bill/Receipt
                <Badge variant="secondary" className="ml-2 text-xs">
                  Optional
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="bill"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="bill" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">JPG, PNG or PDF (Max 5MB) - Optional</p>
                </label>
                {file && (
                  <div className="mt-3 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-600">{file.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Claim...
                </>
              ) : (
                "Submit Claim & Proceed to Payment"
              )}
            </Button>
            <p className="text-sm text-gray-600 mt-3">
              You will be redirected to secure payment processing after submission
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}
