"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Home, LogOut, Key, Mail, Phone, CalendarDays, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CustomerClaimData {
  name: string
  email: string
  phone: string
  ottCode: string
  status: string
  claimedAt: string
  deliveredAt?: string
}

export default function CustomerDashboardPage() {
  const router = useRouter()
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [claimData, setClaimData] = useState<CustomerClaimData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("customerAuthenticated")
    const email = sessionStorage.getItem("customerEmail")

    if (!isAuthenticated || !email) {
      toast.error("Please log in to access the dashboard.")
      router.push("/customer-login")
      return
    }
    setCustomerEmail(email)
  }, [router])

  useEffect(() => {
    if (customerEmail) {
      fetchCustomerData(customerEmail)
    }
  }, [customerEmail])

  const fetchCustomerData = async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/customer/claims?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (response.ok) {
        if (data.claim) {
          setClaimData(data.claim)
          toast.success("Customer data loaded successfully!")
        } else {
          setError("No claim data found for this email.")
          toast.info("No claim data found for your account. Please contact support.")
        }
      } else {
        setError(data.message || "Failed to fetch customer data.")
        toast.error(data.message || "Failed to fetch customer data. Please try again.")
      }
    } catch (err) {
      console.error("Error fetching customer data:", err)
      setError("Network error or server issue. Please try again later.")
      toast.error("Network error or server issue. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("customerAuthenticated")
    sessionStorage.removeItem("customerEmail")
    toast.info("You have been logged out.")
    router.push("/customer-login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-lg rounded-xl text-center p-6">
          <CardTitle className="text-red-600 text-2xl mb-4">Error</CardTitle>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button
            onClick={() => router.push("/customer-login")}
            className="bg-purple-700 hover:bg-purple-800 text-white"
          >
            Go to Login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 flex flex-col items-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <header className="flex justify-between items-center py-6 px-4 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg mb-8">
          <Link href="/" className="flex items-center space-x-3 text-white hover:text-purple-200">
            <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full" />
            <span className="text-xl font-bold hidden sm:block">SYSTECH DIGITAL</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="text-white hover:bg-white/20">
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
            <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-6">
            <CardHeader className="text-center mb-6">
              <CardTitle className="text-3xl font-bold text-purple-900">
                Welcome, {claimData?.name || "Customer"}!
              </CardTitle>
              <p className="text-gray-700 mt-2">Your OTT Activation Details</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Mail className="w-6 h-6 text-purple-700" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-purple-800">{claimData?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Phone className="w-6 h-6 text-purple-700" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-purple-800">{claimData?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="text-center p-6 bg-purple-100 rounded-lg border-2 border-purple-400 shadow-inner">
                <h3 className="text-xl font-semibold text-purple-900 mb-3 flex items-center justify-center">
                  <Key className="w-7 h-7 mr-2 text-purple-700" />
                  Your OTT Activation Code
                </h3>
                <p className="text-5xl font-extrabold text-indigo-700 tracking-wider break-all">
                  {claimData?.ottCode || "N/A"}
                </p>
                <p className="text-sm text-gray-600 mt-3">Use this code to activate your OTT subscription.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  {claimData?.status === "delivered" ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p
                      className={`font-semibold ${claimData?.status === "delivered" ? "text-green-700" : "text-red-700"}`}
                    >
                      {claimData?.status ? claimData.status.toUpperCase() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <CalendarDays className="w-6 h-6 text-purple-700" />
                  <div>
                    <p className="text-sm text-gray-600">Claimed On</p>
                    <p className="font-semibold text-purple-800">
                      {claimData?.claimedAt ? new Date(claimData.claimedAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info / Support */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-purple-900 mb-4">Need Assistance?</h3>
            <p className="text-gray-700 mb-4">
              If you have any issues with your OTT code or account, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Phone className="w-4 h-4 mr-2" />
                Call Support (+91 7709803412)
              </Button>
              <Button variant="outline" className="border-purple-700 text-purple-700 hover:bg-purple-50 bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
