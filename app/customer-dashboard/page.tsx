"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  Mail,
  Home,
  RefreshCw,
  LogOut,
  User,
  Key,
  Copy,
  ExternalLink,
  Package,
  Eye,
  Phone,
} from "lucide-react"
import Image from "next/image"

interface OTTKeyData {
  id: string
  activationCode: string
  product: string
  assignedTo: string
  assignedDate: string
  status: string
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [customerEmail, setCustomerEmail] = useState("")
  const [ottKey, setOttKey] = useState<OTTKeyData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const formatDateIST = (dateString: string) => {
    if (!dateString) return "Not specified"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Please wait while we check your OTT key...</p>
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
                <h1 className="text-3xl font-bold text-white">Customer Dashboard</h1>
                <p className="text-sm text-red-200 mt-1">Welcome, {customerEmail}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-white/10 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-white mr-2" />
                <span className="text-white text-sm">{customerEmail}</span>
              </div>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={refreshing}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
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
                <strong>Your OTT Activation Code is ready!</strong> Use the code below to activate your OTTplay
                subscription.
              </AlertDescription>
            </Alert>

            {/* Main Activation Code Card */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-white/20 rounded-lg mr-4">
                      <Key className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Your Activation Code</CardTitle>
                      <p className="text-blue-100 mt-1">{ottKey.product}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {/* Large Activation Code Display */}
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Activation Code</h3>
                    <div className="bg-white rounded-xl p-6 border-2 border-dashed border-blue-300 shadow-inner">
                      <div className="font-mono text-4xl font-bold text-blue-600 tracking-widest mb-3 select-all">
                        {ottKey.activationCode}
                      </div>
                      <p className="text-sm text-gray-600">Click the code to select it, then copy</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleCopyKey}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      {copySuccess ? "Copied!" : "Copy Code"}
                    </Button>
                    <Button
                      onClick={() => window.open("https://ottplay.com", "_blank")}
                      variant="outline"
                      size="lg"
                      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 text-lg"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Go to OTTplay
                    </Button>
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    Assignment Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Assigned To:</p>
                      <p className="font-medium text-gray-900">{ottKey.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Assignment Date:</p>
                      <p className="font-medium text-gray-900">{formatDateIST(ottKey.assignedDate)}</p>
                    </div>
                  </div>
                </div>

                {/* How to Use Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    How to Activate Your Subscription
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Copy your activation code using the button above</li>
                    <li>
                      Visit <strong>ottplay.com</strong> or open the OTTplay mobile app
                    </li>
                    <li>Look for "Activate Subscription" or "Redeem Code" option</li>
                    <li>Enter your activation code when prompted</li>
                    <li>Complete the activation process</li>
                    <li>Start enjoying your OTTplay Power Play Pack!</li>
                  </ol>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> Keep this code safe and don't share it with others. If you face any issues
                      during activation, contact our support team.
                    </p>
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
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Activation Code Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We couldn't find an activation code assigned to your email address <strong>{customerEmail}</strong>.
                Your code might not have been assigned yet.
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
                  onClick={() => router.push("/ottclaim")}
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
}
