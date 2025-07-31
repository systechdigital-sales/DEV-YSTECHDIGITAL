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
}
