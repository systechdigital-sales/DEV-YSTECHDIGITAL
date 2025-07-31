<<<<<<< HEAD
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  Package,
  Eye,
  Home,
  RefreshCw,
  LogOut,
  User,
  Key,
  Copy,
  ExternalLink,
} from "lucide-react"
import Image from "next/image"

interface OTTKeyData {
  id: string
  activationCode: string
  product: string
  productSubCategory: string
  status: string
  assignedEmail: string
  assignedDate: string
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [customerEmail, setCustomerEmail] = useState("")
  const [ottKey, setOttKey] = useState<OTTKeyData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const formatDateIST = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("customerAuthenticated")
    const email = sessionStorage.getItem("customerEmail")

    if (!isAuthenticated || !email) {
      router.push("/customer-login")
      return
    }

    setCustomerEmail(email)
    fetchOTTKey(email)
  }, [router])

  const fetchOTTKey = async (email: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/customer/ott-key?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (data.success) {
        setOttKey(data.ottKey)
      } else {
        setOttKey(null)
        console.log("No OTT key found:", data.message)
      }
    } catch (error) {
      console.error("Error fetching OTT key:", error)
      setOttKey(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOTTKey(customerEmail)
    setRefreshing(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("customerAuthenticated")
    sessionStorage.removeItem("customerEmail")
    router.push("/customer-login")
  }

  const handleCopyKey = async () => {
    if (ottKey?.activationCode) {
      try {
        await navigator.clipboard.writeText(ottKey.activationCode)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (error) {
        console.error("Failed to copy:", error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "assigned":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Assigned
          </Badge>
        )
      case "available":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Clock className="w-3 h-3 mr-1" />
            Available
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Please wait while we fetch your OTT key...</p>
          </CardContent>
        </Card>
      </div>
    )
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
                <h1 className="text-3xl font-bold text-white">My OTT Dashboard</h1>
                <p className="text-sm text-red-200 mt-1">Welcome back, {customerEmail}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-white/10 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-white mr-2" />
                <span className="text-white text-sm">{customerEmail}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/20">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ottKey ? (
          <div className="space-y-6">
            {/* Success Alert */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Great news!</strong> Your OTT key has been found and is ready to use.
              </AlertDescription>
            </Alert>

            {/* OTT Key Card */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-white/20 rounded-lg mr-4">
                      <Key className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Your OTT Play Key</CardTitle>
                      <p className="text-blue-100 mt-1">Ready to activate your subscription</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(ottKey.status)}
                    <Button
                      onClick={handleRefresh}
                      variant="ghost"
                      size="sm"
                      disabled={refreshing}
                      className="text-white hover:bg-white/20"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Activation Code */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Activation Code</h3>
                      <Badge className="bg-blue-100 text-blue-800">Ready to Use</Badge>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300 mb-4">
                      <div className="text-center">
                        <div className="font-mono text-2xl font-bold text-blue-600 tracking-wider mb-2">
                          {ottKey.activationCode}
                        </div>
                        <p className="text-sm text-gray-600">Use this code to activate your OTTplay subscription</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleCopyKey} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        <Copy className="w-4 h-4 mr-2" />
                        {copySuccess ? "Copied!" : "Copy Code"}
                      </Button>
                      <Button
                        onClick={() => window.open("https://ottplay.com", "_blank")}
                        variant="outline"
                        className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Go to OTTplay
                      </Button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 text-lg">Product Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-500 mr-3" />
                          <span className="text-sm text-gray-600 min-w-[100px]">Product:</span>
                          <span className="text-sm font-medium">{ottKey.product}</span>
                        </div>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-500 mr-3" />
                          <span className="text-sm text-gray-600 min-w-[100px]">Category:</span>
                          <span className="text-sm font-medium">{ottKey.productSubCategory}</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-gray-500 mr-3" />
                          <span className="text-sm text-gray-600 min-w-[100px]">Status:</span>
                          {getStatusBadge(ottKey.status)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 text-lg">Assignment Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-500 mr-3" />
                          <span className="text-sm text-gray-600 min-w-[100px]">Email:</span>
                          <span className="text-sm font-medium">{ottKey.assignedEmail}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                          <span className="text-sm text-gray-600 min-w-[100px]">Assigned:</span>
                          <span className="text-sm font-medium">
                            {ottKey.assignedDate ? formatDateIST(ottKey.assignedDate) : "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Key className="w-4 h-4 text-gray-500 mr-3" />
                          <span className="text-sm text-gray-600 min-w-[100px]">Key ID:</span>
                          <span className="text-sm font-medium font-mono">{ottKey.id.slice(-8).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      How to Use Your OTT Key
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      <li>Copy your activation code using the button above</li>
                      <li>Visit OTTplay website or open the OTTplay app</li>
                      <li>Go to the subscription or activation section</li>
                      <li>Enter your activation code when prompted</li>
                      <li>Enjoy your OTTplay Power Play Pack subscription!</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* No OTT Key Found */
          <Card className="shadow-xl border-0">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No OTT Key Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We couldn't find an OTT key assigned to your email address ({customerEmail}). Your key might not have
                been assigned yet, or there might be an issue with your account.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Checking..." : "Check Again"}
                </Button>
                <Button
                  onClick={() => router.push("/ott")}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Submit New Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8 shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2 text-purple-600" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Call Support</h4>
                <p className="text-sm text-gray-600 mb-2">+91 7709803412</p>
                <p className="text-xs text-gray-500">Mon-Sat: 9 AM - 6 PM IST</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
                <p className="text-sm text-gray-600 mb-2">sales.systechdigital@gmail.com</p>
                <p className="text-xs text-gray-500">Response within 24 hours</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ExternalLink className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">OTTplay Website</h4>
                <Button
                  onClick={() => window.open("https://ottplay.com", "_blank")}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Visit OTTplay
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
=======
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, CheckCircle, XCircle, Clock, Mail, Phone, Calendar, Package, Eye, Home, RefreshCw } from "lucide-react"
import Image from "next/image"

interface ClaimData {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  activationCode: string
  purchaseDate: string
  ottCodeStatus: string
  paymentStatus: string
  ottCode?: string
  createdAt: string
  updatedAt: string
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [claims, setClaims] = useState<ClaimData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  const formatDateIST = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter your email address or phone number")
      return
    }

    setLoading(true)
    setSearchPerformed(true)

    try {
      const response = await fetch(`/api/customer/claims?search=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.success) {
        setClaims(data.claims || [])
      } else {
        setClaims([])
        alert(data.message || "No claims found")
      }
    } catch (error) {
      console.error("Error searching claims:", error)
      alert("Error searching for claims. Please try again.")
      setClaims([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
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
                <h1 className="text-3xl font-bold text-white">Customer Dashboard</h1>
                <p className="text-sm text-red-200 mt-1">Track your OTT subscription claims</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-8 shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center text-2xl">
              <Search className="w-6 h-6 mr-3 text-blue-600" />
              Find Your Claims
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Enter your email address or phone number to view your OTT subscription claims
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Email Address or Phone Number</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Enter your email or phone number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search Claims
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {searchPerformed && (
          <div className="space-y-6">
            {claims.length === 0 ? (
              <Card className="shadow-xl border-0">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Claims Found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any claims associated with the provided email or phone number.
                  </p>
                  <Button onClick={() => router.push("/ott")} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Submit New Claim
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Your Claims ({claims.length})</h2>
                  <Button
                    onClick={handleSearch}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="grid gap-6">
                  {claims.map((claim) => (
                    <Card key={claim._id} className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {claim.firstName} {claim.lastName}
                              </CardTitle>
                              <p className="text-sm text-gray-600">Claim ID: {claim._id.slice(-8).toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(claim.ottCodeStatus)}
                            {getPaymentBadge(claim.paymentStatus)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <Tabs defaultValue="details" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="status">Status</TabsTrigger>
                            <TabsTrigger value="code">OTT Code</TabsTrigger>
                          </TabsList>

                          <TabsContent value="details" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-600">Email:</span>
                                  <span className="text-sm font-medium ml-2">{claim.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-600">Phone:</span>
                                  <span className="text-sm font-medium ml-2">{claim.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  <Package className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-600">Activation Code:</span>
                                  <span className="text-sm font-medium ml-2">{claim.activationCode}</span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-600">Purchase Date:</span>
                                  <span className="text-sm font-medium ml-2">
                                    {new Date(claim.purchaseDate).toLocaleDateString("en-IN")}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-600">Submitted:</span>
                                  <span className="text-sm font-medium ml-2">{formatDateIST(claim.createdAt)}</span>
                                </div>
                                <div className="flex items-center">
                                  <RefreshCw className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-600">Last Updated:</span>
                                  <span className="text-sm font-medium ml-2">{formatDateIST(claim.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="status" className="mt-4">
                            <div className="space-y-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Processing Status</h4>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Payment Status:</span>
                                    {getPaymentBadge(claim.paymentStatus)}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">OTT Code Status:</span>
                                    {getStatusBadge(claim.ottCodeStatus)}
                                  </div>
                                </div>
                              </div>

                              {claim.ottCodeStatus === "pending" && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                  <div className="flex items-start">
                                    <Clock className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                                    <div>
                                      <h5 className="font-semibold text-yellow-800">Processing in Progress</h5>
                                      <p className="text-sm text-yellow-700 mt-1">
                                        Your claim is being processed. You will receive your OTT code via email once
                                        processing is complete.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {claim.ottCodeStatus === "failed" && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                  <div className="flex items-start">
                                    <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                                    <div>
                                      <h5 className="font-semibold text-red-800">Processing Failed</h5>
                                      <p className="text-sm text-red-700 mt-1">
                                        There was an issue processing your claim. Please contact support for assistance.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="code" className="mt-4">
                            {claim.ottCode ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                                  <h4 className="font-semibold text-green-800">Your OTT Code is Ready!</h4>
                                </div>
                                <div className="bg-white border border-green-300 rounded-lg p-4 mb-4">
                                  <Label className="text-sm font-medium text-gray-700">OTT Subscription Code:</Label>
                                  <div className="mt-2 p-3 bg-gray-50 rounded border font-mono text-lg text-center">
                                    {claim.ottCode}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => navigator.clipboard.writeText(claim.ottCode!)}
                                    variant="outline"
                                    size="sm"
                                    className="border-green-600 text-green-600 hover:bg-green-50"
                                  >
                                    Copy Code
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      window.open(
                                        `mailto:${claim.email}?subject=Your OTT Subscription Code&body=Your OTT Code: ${claim.ottCode}`,
                                      )
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                  >
                                    <Mail className="w-4 h-4 mr-1" />
                                    Email Code
                                  </Button>
                                </div>
                                <p className="text-xs text-green-700 mt-3">
                                  Use this code to activate your OTTplay Power Play Pack subscription.
                                </p>
                              </div>
                            ) : (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h4 className="font-semibold text-gray-700 mb-2">OTT Code Not Available</h4>
                                <p className="text-sm text-gray-600">
                                  Your OTT code will appear here once your claim has been processed and approved.
                                </p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8 shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2 text-purple-600" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Call Support</h4>
                <p className="text-sm text-gray-600 mb-2">+91 7709803412</p>
                <p className="text-xs text-gray-500">Mon-Sat: 9 AM - 6 PM IST</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
                <p className="text-sm text-gray-600 mb-2">sales.systechdigital@gmail.com</p>
                <p className="text-xs text-gray-500">Response within 24 hours</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">New Claim</h4>
                <Button
                  onClick={() => router.push("/ott")}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Submit Claim
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
>>>>>>> 964eef0457bbdac9ac6a92244ba1e49899a1a733
}
