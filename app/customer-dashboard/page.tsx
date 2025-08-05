"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Mail,
  Key,
  Calendar,
  Package,
  RefreshCw,
  LogOut,
  Phone,
  MessageCircle,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Star,
  Shield,
  Database,
} from "lucide-react"
import Image from "next/image"

interface OTTKeyData {
  id: string
  activationCode: string
  product: string
  productSubCategory: string
  status: string
  assignedDate: string
  assignedEmail: string
  expiryDate?: string | null
  duration?: string | null
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>("")
  const [ottKeys, setOttKeys] = useState<OTTKeyData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("customerAuthenticated")
    const email = sessionStorage.getItem("customerEmail")

    console.log("Dashboard - checking authentication...")
    console.log("isAuthenticated:", isAuthenticated)
    console.log("email:", email)

    if (!isAuthenticated || !email) {
      console.log("Not authenticated, redirecting to login")
      router.push("/customer-login")
      return
    }

    setUserEmail(email)
    fetchOTTKeysData(email)
  }, [router])

  const fetchOTTKeysData = async (email: string) => {
    console.log("Fetching OTT keys data from ottkeys collection for:", email)
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/customer/ott-key?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      console.log("OTT keys fetch response:", data)

      if (data.success && data.data) {
        // Handle both single object and array responses
        const keysArray = Array.isArray(data.data) ? data.data : [data.data]
        setOttKeys(keysArray)
        console.log("OTT keys data set:", keysArray)
      } else {
        setError(data.message || "No OTT keys found for your account in the ottkeys collection")
        setOttKeys([])
        console.log("Failed to fetch OTT keys:", data.message)
      }
    } catch (error) {
      console.error("Error fetching OTT keys data:", error)
      setError("Network error. Please check your connection and try again.")
      setOttKeys([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOTTKeysData(userEmail)
  }

  const handleLogout = () => {
    console.log("Logging out...")
    sessionStorage.removeItem("customerAuthenticated")
    sessionStorage.removeItem("customerEmail")
    router.push("/customer-login")
  }

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(keyId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Date not available"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "assigned":
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "expired":
      case "used":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isExpired = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return false
    try {
      return new Date(expiryDate) < new Date()
    } catch {
      return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading your OTT keys from ottkeys collection...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={50} height={50} className="rounded-full mr-3" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Customer Dashboard</h1>
                <p className="text-sm text-red-200">Systech Digital - OTT Key Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-gray-200 hover:text-gray-800 border border-white/30"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-200 hover:text-gray-800 border border-white/30"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h2>
          <p className="text-gray-600">
            Logged in as: <span className="font-semibold text-blue-600">{userEmail}</span>
          </p>
          {ottKeys.length > 0 && (
            <div className="flex items-center mt-2">
              <Database className="w-4 h-4 text-green-600 mr-1" />
              <p className="text-sm text-gray-500">
                You have <span className="font-semibold text-green-600">{ottKeys.length}</span> OTT key
                {ottKeys.length > 1 ? "s" : ""} from the ottkeys collection
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main OTT Keys Section */}
          <div className="xl:col-span-3">
            {ottKeys.length > 0 ? (
              <div className="space-y-6">
                {/* Header with refresh button */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Key className="w-5 h-5 mr-2 text-purple-600" />
                    Your OTT Activation Keys ({ottKeys.length})
                    <Badge className="ml-2 bg-purple-100 text-purple-800">From ottkeys Collection</Badge>
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-blue-600 hover:text-blue-800 bg-transparent"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>

                {/* OTT Keys Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {ottKeys.map((ottKey, index) => (
                    <Card key={ottKey.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <div className="flex items-center">
                            <Key className="w-5 h-5 mr-2" />
                            {ottKey.product}
                            {index === 0 && ottKeys.length > 1 && <Star className="w-4 h-4 ml-2 text-yellow-300" />}
                          </div>
                          <Badge
                            className={`${getStatusColor(ottKey.status)} ${
                              isExpired(ottKey.expiryDate) ? "bg-red-100 text-red-800 border-red-200" : ""
                            }`}
                          >
                            {isExpired(ottKey.expiryDate) ? "Expired" : ottKey.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Activation Code Highlight */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-dashed border-blue-300">
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-2">Activation Code</p>
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <code className="text-xl font-bold text-blue-600 bg-white px-3 py-2 rounded-lg border tracking-wider">
                                  {ottKey.activationCode}
                                </code>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(ottKey.activationCode, ottKey.id)}
                                  className="ml-2"
                                >
                                  {copiedId === ottKey.id ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                              {copiedId === ottKey.id && <p className="text-sm text-green-600">Copied to clipboard!</p>}
                            </div>
                          </div>

                          {/* Key Details */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center">
                              <Package className="w-4 h-4 text-gray-500 mr-2" />
                              <div>
                                <p className="text-gray-500">Category</p>
                                <p className="font-semibold">{ottKey.productSubCategory}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                              <div>
                                <p className="text-gray-500">Assigned</p>
                                <p className="font-semibold">{formatDate(ottKey.assignedDate)}</p>
                              </div>
                            </div>
                            {ottKey.expiryDate && (
                              <div className="flex items-center col-span-2">
                                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                                <div>
                                  <p className="text-gray-500">Expires</p>
                                  <p
                                    className={`font-semibold ${isExpired(ottKey.expiryDate) ? "text-red-600" : "text-gray-800"}`}
                                  >
                                    {formatDate(ottKey.expiryDate)}
                                  </p>
                                </div>
                              </div>
                            )}
                            {ottKey.duration && (
                              <div className="flex items-center col-span-2">
                                <Shield className="w-4 h-4 text-gray-500 mr-2" />
                                <div>
                                  <p className="text-gray-500">Duration</p>
                                  <p className="font-semibold">{ottKey.duration}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quick Instructions */}
                          <div
                            className={`p-3 rounded-lg border ${
                              isExpired(ottKey.expiryDate) ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
                            }`}
                          >
                            {isExpired(ottKey.expiryDate) ? (
                              <p className="text-sm text-red-800">
                                <strong>⚠️ Expired:</strong> This activation code has expired. Please contact support for
                                assistance.
                              </p>
                            ) : (
                              <p className="text-sm text-blue-800">
                                <strong>Quick Start:</strong> Download the {ottKey.product} app and use code{" "}
                                <strong>{ottKey.activationCode}</strong> to activate your subscription.
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* General Usage Instructions */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                    <CardTitle className="text-lg">📱 How to Use Your Activation Codes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ol className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                          1
                        </span>
                        Download the respective OTT platform app from your device's app store
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                          2
                        </span>
                        Open the app and look for "Redeem Code", "Activate", or "Promo Code" section
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                          3
                        </span>
                        Enter your activation code exactly as shown above
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                          4
                        </span>
                        Follow the on-screen instructions to complete activation
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                          5
                        </span>
                        Start enjoying your premium content!
                      </li>
                    </ol>
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-800">
                        <strong>📊 Data Source:</strong> These keys are fetched directly from the "ottkeys" collection
                        in our database. All email matching is performed against the email column and related fields.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="p-8">
                  <div className="text-center py-8">
                    <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No OTT Keys Found</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn't find any OTT activation codes assigned to your email address in the ottkeys
                      collection.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      The system searched for your email ({userEmail}) in various email columns within the ottkeys
                      collection. If you recently received keys, please wait a few minutes and refresh, or contact our
                      support team.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={handleRefresh} disabled={refreshing} className="bg-blue-600 hover:bg-blue-700">
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh Data
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open("mailto:sales.systechdigital@gmail.com", "_blank")}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                <CardTitle className="flex items-center text-lg">
                  <User className="w-5 h-5 mr-2" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-sm">{userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Key className="w-4 h-4 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Active Keys</p>
                      <p className="font-semibold text-sm">{ottKeys.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Database className="w-4 h-4 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Source</p>
                      <p className="font-semibold text-sm">ottkeys Collection</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-semibold text-sm">{new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <CardTitle className="flex items-center text-lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Having trouble with your OTT codes? Our support team is here to help!
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center text-sm">
                      <Phone className="w-4 h-4 text-green-600 mr-2" />
                      <span className="font-semibold">+91 7709803412</span>
                    </div>
                    <div className="flex items-center justify-center text-sm">
                      <Mail className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="font-semibold">sales.systechdigital@gmail.com</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Available 9 AM - 9 PM IST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh ottkeys Data
                  </Button>
                  <Button onClick={handleLogout} variant="outline" className="w-full justify-start bg-transparent">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
