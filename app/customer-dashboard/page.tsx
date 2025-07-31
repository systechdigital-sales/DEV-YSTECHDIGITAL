"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Key, Tv, Calendar, LogOut, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"

interface OttKeyData {
  activationCode: string
  product: string
  productSubCategory: string
  status: "available" | "assigned" | "expired"
  assignedDate?: string
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ottKey, setOttKey] = useState<OttKeyData | null>(null)
  const [error, setError] = useState("")
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("customerAuthenticated")
    const email = sessionStorage.getItem("customerEmail")

    if (!isAuthenticated || !email) {
      router.push("/customer-login")
      return
    }
    setCustomerEmail(email)
    fetchOttKey(email)
  }, [router])

  const fetchOttKey = async (email: string) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/customer/ott-key?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (data.success) {
        setOttKey(data.data)
      } else {
        setError(data.message || "Failed to fetch OTT key.")
      }
    } catch (err) {
      console.error("Error fetching OTT key:", err)
      setError("Network error or server issue. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("customerAuthenticated")
    sessionStorage.removeItem("customerEmail")
    router.push("/customer-login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl mt-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={50} height={50} className="rounded-full" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600">Welcome, {customerEmail}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-800 bg-transparent">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {!ottKey && !error && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              No OTT key found for your account. If you believe this is an error, please contact support.
            </AlertDescription>
          </Alert>
        )}

        {ottKey && (
          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-center">
                <Tv className="w-5 h-5 mr-2" />
                Your OTT Activation Code
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-semibold text-gray-700 flex items-center">
                  <Key className="w-5 h-5 mr-2 text-blue-500" />
                  Activation Code:
                </span>
                <span className="text-2xl font-bold text-blue-800 tracking-wide">{ottKey.activationCode}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-semibold text-gray-700 flex items-center">
                  <Tv className="w-5 h-5 mr-2 text-purple-500" />
                  Product:
                </span>
                <span className="text-gray-800">{ottKey.product}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-semibold text-gray-700 flex items-center">
                  <Tv className="w-5 h-5 mr-2 text-purple-500" />
                  Sub-Category:
                </span>
                <span className="text-gray-800">{ottKey.productSubCategory}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-semibold text-gray-700 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Status:
                </span>
                <span className={`font-bold ${ottKey.status === "assigned" ? "text-green-600" : "text-orange-600"}`}>
                  {ottKey.status.charAt(0).toUpperCase() + ottKey.status.slice(1)}
                </span>
              </div>
              {ottKey.assignedDate && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                    Assigned Date:
                  </span>
                  <span className="text-gray-800">{new Date(ottKey.assignedDate).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">Need assistance?</p>
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span>📞 +91 7709803412</span>
            <span>✉️ sales.systechdigital@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
