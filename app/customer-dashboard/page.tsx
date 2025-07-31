"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, CheckCircle, LogOut, RefreshCw, ExternalLink, Loader2, User } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"

export default function CustomerDashboard() {
  const router = useRouter()
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [activationCode, setActivationCode] = useState<string | null>(null)
  const [assignedDate, setAssignedDate] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const email = sessionStorage.getItem("customerEmail")
    const isAuthenticated = sessionStorage.getItem("customerAuthenticated")

    if (!isAuthenticated || !email) {
      router.push("/customer-login")
      return
    }
    setCustomerEmail(email)
    fetchOttKey(email)
  }, [router])

  const fetchOttKey = async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/customer/ott-key?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (data.success) {
        setActivationCode(data.activationCode)
        setAssignedDate(data.assignedDate)
        setStatus(data.status)
      } else {
        setError(data.message || "Failed to retrieve activation code.")
        setActivationCode(null)
        setAssignedDate(null)
        setStatus(null)
      }
    } catch (err) {
      console.error("Error fetching OTT key:", err)
      setError("Network error. Could not fetch activation code.")
      setActivationCode(null)
      setAssignedDate(null)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (activationCode) {
      navigator.clipboard.writeText(activationCode)
      toast({
        title: "Copied!",
        description: "Activation code copied to clipboard.",
      })
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("customerAuthenticated")
    sessionStorage.removeItem("customerEmail")
    router.push("/customer-login")
  }

  const getStatusBadgeClass = (currentStatus: string | null) => {
    switch (currentStatus?.toLowerCase()) {
      case "assigned":
        return "bg-blue-500 text-white"
      case "activated":
        return "bg-green-500 text-white"
      case "expired":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full mr-3" />
          <h1 className="text-2xl font-bold text-white">Customer Dashboard</h1>
        </div>
        <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-white/20">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl py-8">
        <Card className="w-full shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg text-center py-6">
            <CardTitle className="text-3xl font-extrabold">Welcome, {customerEmail || "Customer"}!</CardTitle>
            <p className="text-blue-100 mt-2">Your OTT Activation Code</p>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="mt-4 text-gray-600">Loading your activation code...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="text-center">
                <AlertDescription className="text-red-800 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {error}
                </AlertDescription>
                <Button onClick={() => customerEmail && fetchOttKey(customerEmail)} className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </Alert>
            ) : activationCode ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-lg text-gray-700 font-medium mb-2">Your Assigned Activation Code:</p>
                  <div className="relative bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-3xl font-bold text-blue-700 tracking-wider select-all break-all">
                      {activationCode}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyCode}
                      className="ml-4 text-gray-600 hover:text-blue-600"
                      aria-label="Copy activation code"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                  {status && (
                    <span
                      className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(status)}`}
                    >
                      Status: {status}
                    </span>
                  )}
                  {assignedDate && <p className="text-sm text-gray-500 mt-2">Assigned on: {assignedDate}</p>}
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 text-center">How to Activate:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Copy the activation code above.</li>
                    <li>Click the button below to go to the OTTplay website.</li>
                    <li>Paste the code into the activation field on the OTTplay website.</li>
                    <li>Enjoy your subscription!</li>
                  </ol>
                  <div className="flex justify-center mt-6">
                    <Button asChild className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 text-lg">
                      <a href="https://www.ottplay.com/" target="_blank" rel="noopener noreferrer">
                        Go to OTTplay <ExternalLink className="w-5 h-5 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <User className="w-12 h-12 text-gray-400 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800">No Activation Code Found</h3>
                <p className="text-gray-600">
                  It seems there is no OTT activation code assigned to your email address ({customerEmail}).
                </p>
                <p className="text-sm text-gray-500">
                  If you believe this is an error, please contact support or try refreshing.
                </p>
                <Button onClick={() => customerEmail && fetchOttKey(customerEmail)} className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 w-full shadow-xl border-0">
          <CardContent className="p-6 text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Need Assistance?</h4>
            <div className="flex justify-center space-x-4 text-sm text-gray-600">
              <span>📞 +91 7709803412</span>
              <span>✉️ sales.systechdigital@gmail.com</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Available Mon-Sat: 9 AM - 6 PM IST</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
