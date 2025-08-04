"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Loader2, Home, Info, CheckCircle, XCircle, ShieldAlert } from "lucide-react"
import Image from "next/image"

// Hardcoded lists for Indian states and major cities
const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Lakshadweep",
  "Puducherry",
]

const indianCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Surat",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Kalyan-Dombivli",
  "Vasai-Virar",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Navi Mumbai",
  "Allahabad",
  "Howrah",
  "Ranchi",
  "Jabalpur",
  "Coimbatore",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kota",
  "Guwahati",
  "Chandigarh",
  "Thiruvananthapuram",
  "Solapur",
  "Hubli-Dharwad",
  "Mysore",
  "Tiruchirappalli",
  "Bareilly",
  "Aligarh",
  "Moradabad",
  "Jalandhar",
  "Bhubaneswar",
  "Salem",
  "Warangal",
  "Guntur",
  "Bhiwandi",
  "Saharanpur",
  "Gorakhpur",
  "Bikaner",
  "Amravati",
  "Noida",
  "Jamshedpur",
  "Bhilai",
  "Cuttack",
  "Firozabad",
  "Kochi",
  "Nellore",
  "Bhavnagar",
  "Dehradun",
  "Durgapur",
  "Asansol",
  "Nanded",
  "Kolhapur",
  "Ajmer",
  "Gulbarga",
  "Jamnagar",
  "Ujjain",
  "Loni",
  "Siliguri",
  "Jhansi",
  "Ulhasnagar",
  "Jammu",
  "Sangli-Miraj & Kupwad",
  "Mangalore",
  "Belgaum",
  "Ambattur",
  "Tirunelveli",
  "Malegaon",
  "Gaya",
  "Jalgaon",
  "Udaipur",
  "Maheshtala",
  "Davanagere",
  "Kozhikode",
  "Akola",
  "Kurnool",
  "Bokaro",
  "Rajahmundry",
  "Ahmednagar",
  "Bihar Sharif",
  "Latur",
  "Dhule",
  "Mirzapur",
  "Bhagalpur",
  "Muzaffarpur",
]

export default function OttClaimPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [activationCode, setActivationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [activationCodeValidationMessage, setActivationCodeValidationMessage] = useState("")
  const [activationCodeValidationStatus, setActivationCodeValidationStatus] = useState<
    "idle" | "valid" | "invalid" | "claimed" | "rate-limited"
  >("idle")
  const [failedValidationAttempts, setFailedValidationAttempts] = useState(0)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaChecked, setCaptchaChecked] = useState(false)

  const router = useRouter()

  const validateForm = () => {
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !postalCode || !activationCode) {
      setFormError("All fields are required.")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.")
      return false
    }
    if (!/^\d{10}$/.test(phone)) {
      setFormError("Please enter a valid 10-digit phone number.")
      return false
    }
    if (!/^\d{6}$/.test(postalCode)) {
      setFormError("Please enter a valid 6-digit postal code.")
      return false
    }
    if (activationCodeValidationStatus !== "valid") {
      setFormError("Please enter a valid and available Activation Code/Product Serial Number/IMEI Number.")
      return false
    }
    if (showCaptcha && !captchaChecked) {
      setFormError("Please complete the security check.")
      return false
    }
    setFormError("")
    return true
  }

  const handleActivationCodeBlur = async () => {
    if (!activationCode) {
      setActivationCodeValidationMessage("")
      setActivationCodeValidationStatus("idle")
      return
    }

    setActivationCodeValidationStatus("idle") // Reset status
    setActivationCodeValidationMessage("Verifying activation code...")

    try {
      const response = await fetch("/api/ott-claim/verify-activation-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activationCode }),
      })

      const data = await response.json()

      if (response.status === 429) {
        setActivationCodeValidationMessage("Too many attempts. Please try again later.")
        setActivationCodeValidationStatus("rate-limited")
        setFailedValidationAttempts((prev) => prev + 1) // Increment for rate limit
        return
      }

      if (data.success) {
        setActivationCodeValidationMessage("Activation code is valid and available. You can proceed.")
        setActivationCodeValidationStatus("valid")
        setFailedValidationAttempts(0) // Reset on success
        setShowCaptcha(false) // Hide captcha on success
        setCaptchaChecked(false)
      } else {
        setActivationCodeValidationMessage(data.error || "Activation code not found or invalid.")
        setActivationCodeValidationStatus("invalid")
        setFailedValidationAttempts((prev) => prev + 1) // Increment on failure
      }
    } catch (error) {
      console.error("Error verifying activation code:", error)
      setActivationCodeValidationMessage("An error occurred during verification. Please try again.")
      setActivationCodeValidationStatus("invalid")
      setFailedValidationAttempts((prev) => prev + 1) // Increment on error
    }
  }

  useEffect(() => {
    if (failedValidationAttempts >= 3) {
      setShowCaptcha(true)
    } else {
      setShowCaptcha(false)
      setCaptchaChecked(false)
    }
  }, [failedValidationAttempts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: formError,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setFormError("")

    try {
      const response = await fetch("/api/ott-claim/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          address,
          city,
          state,
          postalCode,
          activationCode,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Claim Submitted",
          description: "Your claim has been submitted. Redirecting to payment...",
        })
        router.push(data.redirectUrl)
      } else {
        setFormError(data.error || "Failed to submit claim. Please try again.")
        toast({
          title: "Submission Failed",
          description: data.error || "There was an issue submitting your claim.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting claim:", error)
      setFormError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred while submitting your claim.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full" />
          <h1 className="text-3xl font-bold text-gray-800">OTT Code Redemption</h1>
        </div>
        <Button variant="ghost" onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-900">
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
      </header>

      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b text-center py-6">
          <CardTitle className="text-3xl font-bold text-gray-800">Claim Your OTT Subscription</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Fill out the form below to redeem your OTT activation code
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Info className="w-6 h-6 mr-2 text-purple-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-lg font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-2 p-3 text-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-lg font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="mt-2 p-3 text-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-lg font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 p-3 text-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-lg font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-2 p-3 text-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Home className="w-6 h-6 mr-2 text-blue-600" />
                Address Information
              </h2>
              <div>
                <Label htmlFor="address" className="text-lg font-medium text-gray-700">
                  Full Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123, Main Street, Near Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="mt-2 p-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city" className="text-lg font-medium text-gray-700">
                    City
                  </Label>
                  <Select value={city} onValueChange={setCity} required>
                    <SelectTrigger className="w-full mt-2 p-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianCities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="state" className="text-lg font-medium text-gray-700">
                    State
                  </Label>
                  <Select value={state} onValueChange={setState} required>
                    <SelectTrigger className="w-full mt-2 p-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postalCode" className="text-lg font-medium text-gray-700">
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    type="text" // Changed to text for better mobile keyboard, inputMode numeric for number pad
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="123456"
                    value={postalCode}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^\d*$/.test(value) && value.length <= 6) {
                        // Only allow digits and max 6 length
                        setPostalCode(value)
                      }
                    }}
                    required
                    className="mt-2 p-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                Purchase Information
              </h2>
              <div>
                <Label htmlFor="activationCode" className="text-lg font-medium text-gray-700">
                  Activation Code/Product Serial Number/IMEI Number
                </Label>
                <Input
                  id="activationCode"
                  type="text"
                  placeholder="Enter your code here"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  onBlur={handleActivationCodeBlur}
                  required
                  className="mt-2 p-3 text-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                {activationCodeValidationMessage && (
                  <p
                    className={`mt-2 text-sm flex items-center ${
                      activationCodeValidationStatus === "valid"
                        ? "text-green-600"
                        : activationCodeValidationStatus === "rate-limited"
                          ? "text-orange-600"
                          : "text-red-600"
                    }`}
                  >
                    {activationCodeValidationStatus === "valid" && <CheckCircle className="w-4 h-4 mr-1" />}
                    {(activationCodeValidationStatus === "invalid" ||
                      activationCodeValidationStatus === "rate-limited") && <XCircle className="w-4 h-4 mr-1" />}
                    {activationCodeValidationMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Captcha / Security Check */}
            {showCaptcha && (
              <Card className="shadow-md border-yellow-300 bg-yellow-50 p-6 space-y-4">
                <CardTitle className="text-xl font-bold text-yellow-800 flex items-center">
                  <ShieldAlert className="w-6 h-6 mr-2 text-yellow-600" />
                  Security Check
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  We've detected multiple attempts to verify an activation code. Please complete this security check to
                  proceed.
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="captcha"
                    checked={captchaChecked}
                    onCheckedChange={(checked) => setCaptchaChecked(checked as boolean)}
                    className="border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:text-white"
                  />
                  <Label htmlFor="captcha" className="text-lg font-medium text-yellow-800">
                    I am not a robot
                  </Label>
                </div>
              </Card>
            )}

            {formError && (
              <div className="text-red-600 text-center font-medium text-lg p-3 bg-red-50 border border-red-200 rounded-md">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              disabled={
                isLoading ||
                (showCaptcha && !captchaChecked) ||
                activationCodeValidationStatus === "invalid" ||
                activationCodeValidationStatus === "rate-limited"
              }
              className="w-full py-4 text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Submitting Claim...
                </>
              ) : (
                "Submit Claim & Proceed to Payment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
