"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Shield,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Wrench,
  FolderSyncIcon as Sync,
} from "lucide-react"
import Image from "next/image"

interface ComparisonData {
  matchedRecords: Array<{
    paymentId: string
    claimEmail: string
    razorpayEmail: string
    claimContact: string
    razorpayContact: string
    claimAmount: number
    razorpayAmount: number
    claimStatus: string
    razorpayStatus: string
    claimDate: string
    razorpayDate: string
  }>
  unclaimedPayments: Array<{
    razorpay_payment_id: string
    email: string
    contact: string
    amount: number
    status: string
    created_at: string
  }>
  paymentsWithoutClaims: Array<{
    razorpay_payment_id: string
    email: string
    contact: string
    amount: number
    status: string
    created_at: string
  }>
  stats: {
    totalClaims: number
    totalPayments: number
    matchedCount: number
    unclaimedCount: number
    paymentsWithoutClaimsCount: number
  }
}

export default function DataComparisonPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoveryResult, setRecoveryResult] = useState<string>("")
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string>("")

  useEffect(() => {
    const adminAuth = sessionStorage.getItem("adminAuthenticated")
    const comparisonAuth = sessionStorage.getItem("dataComparisonAuthenticated")

    if (!adminAuth) {
      router.push("/login")
      return
    }

    if (comparisonAuth === "true") {
      setIsAuthenticated(true)
      loadComparisonData()
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (loginData.email === "nabaratanpatra@gmail.com" && loginData.password === "Admin@12345") {
      sessionStorage.setItem("dataComparisonAuthenticated", "true")
      setIsAuthenticated(true)
      await loadComparisonData()
    } else {
      setError("Invalid credentials. Access denied.")
    }

    setIsLoading(false)
  }

  const loadComparisonData = async () => {
    setIsLoadingData(true)
    try {
      const response = await fetch("/api/admin/data-comparison")
      const data = await response.json()

      if (data.success) {
        setComparisonData(data.data)
      } else {
        setError(data.message || "Failed to load comparison data")
      }
    } catch (error) {
      console.error("Error loading comparison data:", error)
      setError("Failed to load comparison data")
    } finally {
      setIsLoadingData(false)
    }
  }

  const runDataRecovery = async () => {
    setIsRecovering(true)
    setRecoveryResult("")
    setError("")

    try {
      const response = await fetch("/api/admin/run-data-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setRecoveryResult(data.message)
        await loadComparisonData()
      } else {
        setError(data.message || "Data recovery failed")
      }
    } catch (error) {
      console.error("Error running data recovery:", error)
      setError("Failed to run data recovery script")
    } finally {
      setIsRecovering(false)
    }
  }

  const syncPaymentStatus = async () => {
    setIsSyncing(true)
    setSyncResult("")
    setError("")

    try {
      const response = await fetch("/api/admin/sync-payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setSyncResult(data.message)
        await loadComparisonData()
      } else {
        setError(data.message || "Payment sync failed")
      }
    } catch (error) {
      console.error("Error syncing payment status:", error)
      setError("Failed to sync payment status")
    } finally {
      setIsSyncing(false)
    }
  }

  const exportData = (dataType: string) => {
    if (!comparisonData) return

    let csvContent = ""
    let filename = ""

    switch (dataType) {
      case "matched":
        csvContent =
          "Payment ID,Claim Email,Razorpay Email,Claim Contact,Razorpay Contact,Claim Amount,Razorpay Amount,Claim Status,Razorpay Status,Claim Date,Razorpay Date\n"
        comparisonData.matchedRecords.forEach((record) => {
          csvContent += `${record.paymentId},${record.claimEmail},${record.razorpayEmail},${record.claimContact},${record.razorpayContact},${record.claimAmount},${record.razorpayAmount},${record.claimStatus},${record.razorpayStatus},${record.claimDate},${record.razorpayDate}\n`
        })
        filename = "matched_records.csv"
        break
      case "unclaimed":
        csvContent = "Payment ID,Email,Contact,Amount,Status,Date\n"
        comparisonData.unclaimedPayments.forEach((record) => {
          csvContent += `${record.razorpay_payment_id},${record.email},${record.contact},${record.amount},${record.status},${record.created_at}\n`
        })
        filename = "unclaimed_payments.csv"
        break
      case "without_claims":
        csvContent = "Payment ID,Email,Contact,Amount,Status,Date\n"
        comparisonData.paymentsWithoutClaims.forEach((record) => {
          csvContent += `${record.razorpay_payment_id},${record.email},${record.contact},${record.amount},${record.status},${record.created_at}\n`
        })
        filename = "payments_without_claims.csv"
        break
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-2xl">Secure Data Access</CardTitle>
            <p className="text-red-100">Data Comparison Portal</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter authorized email"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="password">Access Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter access password"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Access Data Comparison
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-orange-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={32} height={32} className="rounded-full" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Database className="w-6 h-6 mr-2" />
                  Data Comparison Portal
                </h1>
                <p className="text-sm text-red-200">Razorpay Transactions vs Claims Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={syncPaymentStatus}
                disabled={isSyncing || isLoadingData}
                variant="outline"
                className="bg-blue-500/20 border-blue-300/50 text-white hover:bg-blue-500/30"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sync className="w-4 h-4 mr-2" />}
                {isSyncing ? "Syncing..." : "Sync Payment Status"}
              </Button>
              <Button
                onClick={runDataRecovery}
                disabled={isRecovering || isLoadingData}
                variant="outline"
                className="bg-yellow-500/20 border-yellow-300/50 text-white hover:bg-yellow-500/30"
              >
                {isRecovering ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wrench className="w-4 h-4 mr-2" />
                )}
                {isRecovering ? "Recovering..." : "Fix Missing Data"}
              </Button>
              <Button
                onClick={loadComparisonData}
                disabled={isLoadingData}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                {isLoadingData ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Data
              </Button>
              <Button
                onClick={() => router.push("/admin")}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Back to Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {syncResult && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">{syncResult}</AlertDescription>
          </Alert>
        )}

        {recoveryResult && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{recoveryResult}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-lg font-semibold text-gray-700">Loading comparison data...</p>
              <p className="text-sm text-gray-500">Analyzing razorpay_transactions and claims collections</p>
            </div>
          </div>
        ) : comparisonData ? (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100">Total Claims</p>
                      <p className="text-2xl font-bold">{comparisonData.stats.totalClaims}</p>
                    </div>
                    <Database className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-100">Total Payments</p>
                      <p className="text-2xl font-bold">{comparisonData.stats.totalPayments}</p>
                    </div>
                    <Database className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-100">Matched Records</p>
                      <p className="text-2xl font-bold">{comparisonData.stats.matchedCount}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-100">Unclaimed Payments</p>
                      <p className="text-2xl font-bold">{comparisonData.stats.unclaimedCount}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-500 to-slate-500 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-100">No Claims</p>
                      <p className="text-2xl font-bold">{comparisonData.stats.paymentsWithoutClaimsCount}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-gray-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Matched Records */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Matched Records ({comparisonData.stats.matchedCount})
                  </CardTitle>
                  <Button onClick={() => exportData("matched")} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-semibold">Payment ID</th>
                          <th className="text-left p-3 font-semibold">Claim Email</th>
                          <th className="text-left p-3 font-semibold">Razorpay Email</th>
                          <th className="text-left p-3 font-semibold">Contact</th>
                          <th className="text-left p-3 font-semibold">Amount</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Dates</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.matchedRecords.map((record, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-xs">{record.paymentId}</td>
                            <td className="p-3">{record.claimEmail}</td>
                            <td className="p-3">{record.razorpayEmail}</td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <div>Claim: {record.claimContact}</div>
                                <div>Razorpay: {record.razorpayContact}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <div>Claim: ₹{record.claimAmount}</div>
                                <div>Razorpay: ₹{record.razorpayAmount}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-xs">
                                  {record.claimStatus}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {record.razorpayStatus}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3 text-xs">
                              <div className="space-y-1">
                                <div>Claim: {record.claimDate}</div>
                                <div>Payment: {record.razorpayDate}</div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Unclaimed Payments */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                    Payments Without Claims ({comparisonData.stats.unclaimedCount})
                  </CardTitle>
                  <Button
                    onClick={() => exportData("unclaimed")}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-semibold">Payment ID</th>
                          <th className="text-left p-3 font-semibold">Email</th>
                          <th className="text-left p-3 font-semibold">Contact</th>
                          <th className="text-left p-3 font-semibold">Amount</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.unclaimedPayments.map((record, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-xs">{record.razorpay_payment_id}</td>
                            <td className="p-3">{record.email}</td>
                            <td className="p-3">{record.contact}</td>
                            <td className="p-3 font-semibold">₹{record.amount}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {record.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-xs">{record.created_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Payments Without Claims */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                    <XCircle className="w-5 h-5 mr-2 text-gray-600" />
                    Payments Without Claims ({comparisonData.stats.paymentsWithoutClaimsCount})
                  </CardTitle>
                  <Button
                    onClick={() => exportData("without_claims")}
                    size="sm"
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-semibold">Payment ID</th>
                          <th className="text-left p-3 font-semibold">Email</th>
                          <th className="text-left p-3 font-semibold">Contact</th>
                          <th className="text-left p-3 font-semibold">Amount</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.paymentsWithoutClaims.map((record, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-xs">{record.razorpay_payment_id}</td>
                            <td className="p-3">{record.email}</td>
                            <td className="p-3">{record.contact}</td>
                            <td className="p-3 font-semibold">₹{record.amount}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {record.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-xs">{record.created_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">No comparison data available</p>
            <p className="text-sm text-gray-500 mb-4">Click refresh to load data comparison</p>
            <Button onClick={loadComparisonData} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Load Data
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
