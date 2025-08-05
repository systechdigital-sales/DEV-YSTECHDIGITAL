"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Database,
  Target,
  ShoppingCart,
  RefreshCw,
  AlertCircle,
  Calendar,
} from "lucide-react"
import Image from "next/image"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface Claim {
  _id: string
  claimId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address: string
  state: string
  city: string
  pincode: string
  activationCode: string
  paymentStatus: "pending" | "paid" | "failed"
  ottStatus: "pending" | "delivered" | "failed" | "processing"
  ottCode: string
  paymentId: string
  razorpayOrderId: string
  createdAt: string
  updatedAt: string
  amount: number
}

interface SalesRecord {
  _id: string
  productSubCategory: string
  product: string
  activationCode: string
  status: "available" | "claimed"
  claimedBy?: string
  claimedDate?: string
  createdAt: string
}

interface DashboardStats {
  totalClaims: number
  totalRevenue: number
  successfulClaims: number
  pendingClaims: number
  failedClaims: number
  processingClaims: number
  todayClaims: number
  totalSalesRecords: number
  availableSalesRecords: number
  claimedSalesRecords: number
  conversionRate: number
  averageClaimValue: number
  monthlyData: Array<{
    month: string
    claims: number
    revenue: number
    success: number
    failed: number
  }>
  dailyData: Array<{
    date: string
    claims: number
    revenue: number
  }>
  statusDistribution: Array<{
    name: string
    value: number
    color: string
  }>
}

const COLORS = {
  success: "#10B981",
  pending: "#F59E0B",
  failed: "#EF4444",
  processing: "#8B5CF6",
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

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

const getDateIST = () => {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClaims: 0,
    totalRevenue: 0,
    successfulClaims: 0,
    pendingClaims: 0,
    failedClaims: 0,
    processingClaims: 0,
    todayClaims: 0,
    totalSalesRecords: 0,
    availableSalesRecords: 0,
    claimedSalesRecords: 0,
    conversionRate: 0,
    averageClaimValue: 0,
    monthlyData: [],
    dailyData: [],
    statusDistribution: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchDashboardData()

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Fetching dashboard data...")

      // Fetch claims data
      const claimsResponse = await fetch("/api/admin/claims", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!claimsResponse.ok) {
        throw new Error(`Claims API error: ${claimsResponse.status}`)
      }

      const claimsData = await claimsResponse.json()
      console.log("📊 Claims response:", claimsData)

      const claims: Claim[] = claimsData.success ? claimsData.claims || [] : []

      // Fetch sales data
      const salesResponse = await fetch("/api/admin/sales", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!salesResponse.ok) {
        throw new Error(`Sales API error: ${salesResponse.status}`)
      }

      const salesData = await salesResponse.json()
      console.log("🛒 Sales response:", salesData)

      const sales: SalesRecord[] = salesData.success ? salesData.sales || [] : []

      // Calculate comprehensive statistics
      const totalClaims = claims.length
      const successfulClaims = claims.filter(
        (claim) => claim.ottStatus === "delivered" || claim.ottStatus === "success",
      ).length
      const pendingClaims = claims.filter((claim) => claim.ottStatus === "pending").length
      const failedClaims = claims.filter((claim) => claim.ottStatus === "failed").length
      const processingClaims = claims.filter((claim) => claim.ottStatus === "processing").length

      // Revenue calculations
      const paidClaims = claims.filter((claim) => claim.paymentStatus === "paid")
      const totalRevenue = paidClaims.reduce((sum, claim) => sum + (claim.amount || 99), 0)
      const averageClaimValue = paidClaims.length > 0 ? totalRevenue / paidClaims.length : 99

      // Today's claims (IST timezone)
      const todayIST = getDateIST()
      const todayClaims = claims.filter((claim) => {
        if (!claim.createdAt) return false
        const claimDate = new Date(claim.createdAt)
        const claimDateIST = claimDate.toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        return claimDateIST === todayIST
      }).length

      // Sales statistics
      const totalSalesRecords = sales.length
      const claimedSalesRecords = sales.filter((sale) => sale.status === "claimed").length
      const availableSalesRecords = sales.filter((sale) => sale.status === "available").length
      const conversionRate = totalSalesRecords > 0 ? (claimedSalesRecords / totalSalesRecords) * 100 : 0

      // Monthly data for the last 6 months
      const monthlyData = []
      const currentDate = new Date()

      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthName = monthDate.toLocaleDateString("en-US", { month: "short" })
        const year = monthDate.getFullYear()

        const monthClaims = claims.filter((claim) => {
          if (!claim.createdAt) return false
          const claimDate = new Date(claim.createdAt)
          return claimDate.getMonth() === monthDate.getMonth() && claimDate.getFullYear() === monthDate.getFullYear()
        })

        const monthSuccessful = monthClaims.filter(
          (claim) => claim.ottStatus === "delivered" || claim.ottStatus === "success",
        ).length
        const monthFailed = monthClaims.filter((claim) => claim.ottStatus === "failed").length
        const monthPaid = monthClaims.filter((claim) => claim.paymentStatus === "paid")
        const monthRevenue = monthPaid.reduce((sum, claim) => sum + (claim.amount || 99), 0)

        monthlyData.push({
          month: `${monthName} ${year}`,
          claims: monthClaims.length,
          revenue: monthRevenue,
          success: monthSuccessful,
          failed: monthFailed,
        })
      }

      // Daily data for the last 7 days
      const dailyData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })

        const dayClaims = claims.filter((claim) => {
          if (!claim.createdAt) return false
          const claimDate = new Date(claim.createdAt)
          const claimDateStr = claimDate.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          return claimDateStr === dateStr
        })

        const dayPaid = dayClaims.filter((claim) => claim.paymentStatus === "paid")
        const dayRevenue = dayPaid.reduce((sum, claim) => sum + (claim.amount || 99), 0)

        dailyData.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          claims: dayClaims.length,
          revenue: dayRevenue,
        })
      }

      // Status distribution for pie chart
      const statusDistribution = [
        { name: "Successful", value: successfulClaims, color: COLORS.success },
        { name: "Pending", value: pendingClaims, color: COLORS.pending },
        { name: "Failed", value: failedClaims, color: COLORS.failed },
        { name: "Processing", value: processingClaims, color: COLORS.processing },
      ].filter((item) => item.value > 0)

      setStats({
        totalClaims,
        totalRevenue,
        successfulClaims,
        pendingClaims,
        failedClaims,
        processingClaims,
        todayClaims,
        totalSalesRecords,
        availableSalesRecords,
        claimedSalesRecords,
        conversionRate,
        averageClaimValue,
        monthlyData,
        dailyData,
        statusDistribution,
      })

      setLastUpdated(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: true,
        }),
      )

      console.log("✅ Dashboard data updated successfully")
    } catch (error: any) {
      console.error("❌ Error fetching dashboard data:", error)
      setError(error.message || "Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const successRate = stats.totalClaims > 0 ? (stats.successfulClaims / stats.totalClaims) * 100 : 0

  if (loading && stats.totalClaims === 0) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
          <DashboardSidebar />
          <SidebarInset className="flex-1">
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">Loading Dashboard</h3>
                  <p className="text-gray-600">Fetching real-time data from database...</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Database className="w-4 h-4" />
                    <span>systech_ott_platform</span>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          {/* Header */}
          <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-2xl border-b border-slate-200 sticky top-0 z-10">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors" />
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Image
                        src="/logo.png"
                        alt="SYSTECH DIGITAL Logo"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white flex items-center">
                        <BarChart className="w-6 h-6 mr-2" />
                        Dashboard Analytics
                      </h1>
                      <p className="text-sm text-slate-300 mt-1">
                        Real-time insights • {stats.totalClaims.toLocaleString()} total records
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">Last updated</p>
                    <p className="text-white font-semibold">{lastUpdated} IST</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-medium">Error loading data</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
                <Button onClick={fetchDashboardData} size="sm" variant="outline">
                  Retry
                </Button>
              </div>
            )}

            <div className="space-y-8">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Claims</p>
                        <p className="text-3xl font-bold">{stats.totalClaims.toLocaleString()}</p>
                        <div className="flex items-center mt-2 text-blue-200 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          <span>All time</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-full">
                        <Users className="w-8 h-8 text-blue-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                        <div className="flex items-center mt-2 text-emerald-200 text-xs">
                          <DollarSign className="w-3 h-3 mr-1" />
                          <span>Avg: {formatCurrency(stats.averageClaimValue)}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-full">
                        <DollarSign className="w-8 h-8 text-emerald-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-violet-600 to-violet-700 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-violet-100 text-sm font-medium">Success Rate</p>
                        <p className="text-3xl font-bold">{successRate.toFixed(1)}%</p>
                        <div className="flex items-center mt-2 text-violet-200 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span>{stats.successfulClaims} delivered</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-full">
                        <TrendingUp className="w-8 h-8 text-violet-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-600 to-orange-700 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Today's Claims</p>
                        <p className="text-3xl font-bold">{stats.todayClaims}</p>
                        <div className="flex items-center mt-2 text-orange-200 text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{getDateIST()}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-full">
                        <Activity className="w-8 h-8 text-orange-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">Sales Records</p>
                        <p className="text-2xl font-bold">{stats.totalSalesRecords.toLocaleString()}</p>
                        <p className="text-red-200 text-xs mt-1">
                          {stats.availableSalesRecords} available • {stats.claimedSalesRecords} claimed
                        </p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-red-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-teal-100 text-sm font-medium">Conversion Rate</p>
                        <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                        <p className="text-teal-200 text-xs mt-1">Sales to claims ratio</p>
                      </div>
                      <Target className="w-8 h-8 text-teal-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm font-medium">Processing</p>
                        <p className="text-2xl font-bold">{stats.processingClaims}</p>
                        <p className="text-indigo-200 text-xs mt-1">Currently processing</p>
                      </div>
                      <RefreshCw className="w-8 h-8 text-indigo-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-emerald-800 text-lg">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Successful
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-emerald-600 mb-2">{stats.successfulClaims}</p>
                      <p className="text-emerald-700 text-sm mb-3">OTT codes delivered</p>
                      <Progress
                        value={stats.totalClaims > 0 ? (stats.successfulClaims / stats.totalClaims) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-amber-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-amber-800 text-lg">
                      <Clock className="w-5 h-5 mr-2" />
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-amber-600 mb-2">{stats.pendingClaims}</p>
                      <p className="text-amber-700 text-sm mb-3">Awaiting processing</p>
                      <Progress
                        value={stats.totalClaims > 0 ? (stats.pendingClaims / stats.totalClaims) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-red-50 to-red-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-red-800 text-lg">
                      <XCircle className="w-5 h-5 mr-2" />
                      Failed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-red-600 mb-2">{stats.failedClaims}</p>
                      <p className="text-red-700 text-sm mb-3">Processing failed</p>
                      <Progress
                        value={stats.totalClaims > 0 ? (stats.failedClaims / stats.totalClaims) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-violet-50 to-violet-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-violet-800 text-lg">
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Processing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-violet-600 mb-2">{stats.processingClaims}</p>
                      <p className="text-violet-700 text-sm mb-3">Currently processing</p>
                      <Progress
                        value={stats.totalClaims > 0 ? (stats.processingClaims / stats.totalClaims) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <Tabs defaultValue="trends" className="space-y-6">
                <TabsList className="grid grid-cols-4 mb-6 bg-white shadow-lg rounded-xl p-1 h-14">
                  <TabsTrigger
                    value="trends"
                    className="rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white text-base font-medium"
                  >
                    Monthly Trends
                  </TabsTrigger>
                  <TabsTrigger
                    value="daily"
                    className="rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white text-base font-medium"
                  >
                    Daily Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="distribution"
                    className="rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white text-base font-medium"
                  >
                    Status Distribution
                  </TabsTrigger>
                  <TabsTrigger
                    value="revenue"
                    className="rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white text-base font-medium"
                  >
                    Revenue Analysis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="trends">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b">
                      <CardTitle className="text-2xl font-bold text-slate-800">Monthly Performance Trends</CardTitle>
                      <p className="text-slate-600 mt-2">6-month performance overview with success/failure rates</p>
                    </CardHeader>
                    <CardContent className="p-8">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={stats.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="claims"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            name="Total Claims"
                            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="success"
                            stroke="#10b981"
                            strokeWidth={3}
                            name="Successful Claims"
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="failed"
                            stroke="#ef4444"
                            strokeWidth={3}
                            name="Failed Claims"
                            dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="daily">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                      <CardTitle className="text-2xl font-bold text-slate-800">Daily Activity (Last 7 Days)</CardTitle>
                      <p className="text-slate-600 mt-2">Recent daily claims and revenue trends</p>
                    </CardHeader>
                    <CardContent className="p-8">
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={stats.dailyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                            }}
                            formatter={(value, name) => [
                              name === "revenue" ? formatCurrency(Number(value)) : value,
                              name === "revenue" ? "Revenue" : "Claims",
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="claims"
                            stackId="1"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                            name="claims"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="distribution">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
                      <CardTitle className="text-2xl font-bold text-slate-800">Claim Status Distribution</CardTitle>
                      <p className="text-slate-600 mt-2">Current distribution of claim statuses</p>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={stats.statusDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {stats.statusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-4">
                          {stats.statusDistribution.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="font-semibold text-slate-800">{item.name}</span>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-lg px-3 py-1 font-bold">
                                  {item.value.toLocaleString()}
                                </Badge>
                                <p className="text-xs text-slate-500 mt-1">
                                  {stats.totalClaims > 0 ? ((item.value / stats.totalClaims) * 100).toFixed(1) : 0}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="revenue">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b">
                      <CardTitle className="text-2xl font-bold text-slate-800">Monthly Revenue Analysis</CardTitle>
                      <p className="text-slate-600 mt-2">Revenue trends from paid claims</p>
                    </CardHeader>
                    <CardContent className="p-8">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={stats.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                            contentStyle={{
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* System Health */}
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b">
                  <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                    <Database className="w-6 h-6 mr-3 text-slate-600" />
                    System Health & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                      <Database className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                      <h3 className="font-bold text-emerald-800 mb-2">Database Status</h3>
                      <Badge variant="default" className="bg-emerald-100 text-emerald-800 mb-2">
                        Connected
                      </Badge>
                      <p className="text-sm text-emerald-700">systech_ott_platform</p>
                      <p className="text-xs text-emerald-600 mt-1">
                        {stats.totalClaims + stats.totalSalesRecords} total records
                      </p>
                    </div>

                    <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-bold text-blue-800 mb-2">Email Service</h3>
                      <Badge variant="default" className="bg-blue-100 text-blue-800 mb-2">
                        Active
                      </Badge>
                      <p className="text-sm text-blue-700">Gmail SMTP</p>
                      <p className="text-xs text-blue-600 mt-1">{stats.successfulClaims} emails sent</p>
                    </div>

                    <div className="text-center p-6 bg-violet-50 rounded-xl border border-violet-200">
                      <Target className="w-12 h-12 text-violet-600 mx-auto mb-3" />
                      <h3 className="font-bold text-violet-800 mb-2">Auto-Processing</h3>
                      <Badge variant="default" className="bg-violet-100 text-violet-800 mb-2">
                        Ready
                      </Badge>
                      <p className="text-sm text-violet-700">Every 60 seconds</p>
                      <p className="text-xs text-violet-600 mt-1">{stats.pendingClaims} pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
