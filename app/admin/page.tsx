"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, CreditCard, RefreshCw, Download, Loader2, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Claim {
  _id: string
  claimId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  activationCode: string
  paymentStatus: string
  ottStatus: string
  ottCode: string
  paymentId: string
  razorpayOrderId: string
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalClaims: number
  paidClaims: number
  pendingClaims: number
  deliveredClaims: number
  failedClaims: number
}

export default function AdminPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [stats, setStats] = useState<Stats>({
    totalClaims: 0,
    paidClaims: 0,
    pendingClaims: 0,
    deliveredClaims: 0,
    failedClaims: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchClaims()
  }, [router])

  const fetchClaims = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/admin/claims")
      const data = await response.json()

      if (data.success) {
        setClaims(data.claims || [])
        calculateStats(data.claims || [])
      } else {
        console.error("Failed to fetch claims:", data.error)
        toast({
          title: "Error",
          description: "Failed to fetch claims data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching claims:", error)
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateStats = (claimsData: Claim[]) => {
    const stats = {
      totalClaims: claimsData.length,
      paidClaims: claimsData.filter((c) => c.paymentStatus === "paid").length,
      pendingClaims: claimsData.filter((c) => c.ottStatus === "pending").length,
      deliveredClaims: claimsData.filter((c) => c.ottStatus === "delivered" || c.ottStatus === "completed").length,
      failedClaims: claimsData.filter((c) => c.ottStatus === "failed").length,
    }
    setStats(stats)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "delivered":
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Delivered</Badge>
      case "processing":
        return <Badge className="bg-purple-100 text-purple-800">Processing</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const exportClaims = () => {
    const csvContent = [
      [
        "Claim ID",
        "Name",
        "Email",
        "Phone",
        "Activation Code",
        "Payment Status",
        "OTT Status",
        "OTT Code",
        "Created At",
      ].join(","),
      ...claims.map((claim) =>
        [
          claim.claimId,
          `${claim.firstName} ${claim.lastName}`,
          claim.email,
          claim.phoneNumber,
          claim.activationCode,
          claim.paymentStatus,
          claim.ottStatus,
          claim.ottCode,
          new Date(claim.createdAt).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `claims-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage OTT claims and monitor system performance</p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={fetchClaims}
              disabled={refreshing}
              variant="outline"
              className="flex items-center space-x-2 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button onClick={exportClaims} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalClaims}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Claims</p>
                  <p className="text-3xl font-bold text-green-600">{stats.paidClaims}</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingClaims}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.deliveredClaims}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-3xl font-bold text-red-600">{stats.failedClaims}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Claims Management</span>
              <Badge variant="outline">{claims.length} total claims</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Claim ID</th>
                    <th className="text-left p-4 font-semibold">Customer</th>
                    <th className="text-left p-4 font-semibold">Contact</th>
                    <th className="text-left p-4 font-semibold">Activation Code</th>
                    <th className="text-left p-4 font-semibold">Payment Status</th>
                    <th className="text-left p-4 font-semibold">OTT Status</th>
                    <th className="text-left p-4 font-semibold">OTT Code</th>
                    <th className="text-left p-4 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No claims found</p>
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim) => (
                      <tr key={claim._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{claim.claimId}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-semibold">
                              {claim.firstName} {claim.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{claim.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{claim.phoneNumber}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded text-blue-800">
                            {claim.activationCode}
                          </span>
                        </td>
                        <td className="p-4">{getStatusBadge(claim.paymentStatus)}</td>
                        <td className="p-4">{getStatusBadge(claim.ottStatus)}</td>
                        <td className="p-4">
                          {claim.ottCode ? (
                            <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded text-green-800">
                              {claim.ottCode}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not assigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{new Date(claim.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{new Date(claim.createdAt).toLocaleTimeString()}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
