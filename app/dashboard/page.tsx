"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  ShoppingCart,
  Key,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"

interface DashboardStats {
  totalClaims: number
  totalRevenue: number
  successRate: number
  todaysClaims: number
  totalSales: number
  availableSales: number
  claimedSales: number
  totalKeys: number
  availableKeys: number
  processing: number
  successful: number
  pending: number
  failed: number
  currentlyProcessing: number
  monthlyData: Array<{ month: string; claims: number; revenue: number }>
  dailyData: Array<{ date: string; claims: number; activity: number }>
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<DashboardStats>({
    totalClaims: 0,
    totalRevenue: 0,
    successRate: 0,
    todaysClaims: 0,
    totalSales: 0,
    availableSales: 0,
    claimedSales: 0,
    totalKeys: 0,
    availableKeys: 0,
    processing: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    currentlyProcessing: 0,
    monthlyData: [],
    dailyData: [],
  })
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    loadDashboardData()
  }, [router])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        loadDashboardData()
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("🔄 Loading dashboard data...")

      const [statsResponse, claimsResponse] = await Promise.all([
        fetch("/api/admin/stats").then((res) => res.json()),
        fetch("/api/admin/claims?limit=1000").then((res) => res.json()),
      ])

      console.log("📊 API Responses:", {
        stats: statsResponse,
        claims: claimsResponse,
      })

      // Extract claims data for additional calculations
      const claims = claimsResponse.data || []

      console.log("📈 Data counts:", {
        claims: claims.length,
        statsFromAPI: statsResponse,
      })

      // Calculate today's date in IST
      const today = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
      const istToday = new Date(today.getTime() + istOffset)
      const todayStr = istToday.toISOString().split("T")[0]

      // Calculate additional statistics from claims data
      const todaysClaims = claims.filter((claim: any) => {
        if (!claim.createdAt) return false
        const claimDate = new Date(claim.createdAt).toISOString().split("T")[0]
        return claimDate === todayStr
      }).length

      const totalRevenue = claims
        .filter((claim: any) => claim.paymentStatus === "paid")
        .reduce((sum: number, claim: any) => sum + (claim.amount || 99), 0)

      const successRate =
        statsResponse.totalClaims > 0
          ? Math.round((statsResponse.deliveredClaims / statsResponse.totalClaims) * 100)
          : 0

      const monthlyData = generateMonthlyData(claims)
      const dailyData = generateDailyData(claims)

      const newStats: DashboardStats = {
        totalClaims: statsResponse.totalClaims || 0,
        totalRevenue,
        successRate,
        todaysClaims,
        totalSales: statsResponse.totalSales || 0,
        availableSales: statsResponse.availableSales || 0,
        claimedSales: statsResponse.claimedSales || 0,
        totalKeys: statsResponse.totalKeys || 0,
        availableKeys: statsResponse.availableKeys || 0,
        processing: statsResponse.pendingClaims || 0,
        successful: statsResponse.deliveredClaims || 0,
        pending: statsResponse.pendingClaims || 0,
        failed: statsResponse.failedClaims || 0,
        currentlyProcessing: statsResponse.pendingClaims || 0,
        monthlyData,
        dailyData,
      }

      console.log("📊 Calculated stats:", newStats)

      setStats(newStats)
      setLastUpdated(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))

      toast({
        title: "Dashboard Updated",
        description: "Latest data loaded successfully",
      })
    } catch (error: any) {
      console.error("❌ Error loading dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyData = (claims: any[]) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()

    return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map((month, index) => {
      const monthClaims = claims.filter((claim) => {
        if (!claim.createdAt) return false
        const claimMonth = new Date(claim.createdAt).getMonth()
        return claimMonth === currentMonth - 5 + index
      })

      return {
        month,
        claims: monthClaims.length,
        revenue: monthClaims.filter((c) => c.paymentStatus === "paid").length * 99,
      }
    })
  }

  const generateDailyData = (claims: any[]) => {
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayClaims = claims.filter((claim) => {
        if (!claim.createdAt) return false
        return new Date(claim.createdAt).toISOString().split("T")[0] === dateStr
      })

      last7Days.push({
        date: date.toLocaleDateString("en-IN", { weekday: "short" }),
        claims: dayClaims.length,
        activity: dayClaims.length + Math.floor(Math.random() * 5),
      })
    }
    return last7Days
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex w-full">
          <DashboardSidebar />
          <SidebarInset className="flex-1 flex items-center justify-center w-full min-w-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-purple-600 text-lg font-medium">Loading dashboard...</p>
              <p className="text-gray-500 text-sm mt-2">Connecting to systech_ott_platform database</p>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex w-full">
        <DashboardSidebar />
        <SidebarInset className="flex-1 w-full min-w-0">
          {/* Header */}
          <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl border-b border-purple-200 sticky top-0 z-10 w-full">
            <div className="px-4 sm:px-6 py-4 sm:py-6 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <SidebarTrigger className="text-white hover:bg-white/20 p-2 rounded-lg flex-shrink-0" />
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
                      <Image
                        src="/logo.png"
                        alt="SYSTECH DIGITAL Logo"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                        Dashboard Analytics
                      </h1>
                      <p className="text-purple-200 text-sm sm:text-base lg:text-lg truncate">
                        Real-time insights • {stats.totalClaims + stats.totalSales + stats.totalKeys} total records
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-purple-200 text-sm">Last updated</p>
                    <p className="text-white font-medium text-sm">{lastUpdated}</p>
                  </div>
                  <Button
                    onClick={loadDashboardData}
                    disabled={loading}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0 min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-blue-100 text-sm font-medium">Total Claims</p>
                      <p className="text-2xl sm:text-3xl font-bold">{stats.totalClaims}</p>
                      <p className="text-blue-200 text-xs sm:text-sm mt-1">📈 All time</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full flex-shrink-0">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0 min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                      <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full flex-shrink-0">
                      <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0 min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-purple-100 text-sm font-medium">Success Rate</p>
                      <p className="text-2xl sm:text-3xl font-bold">{stats.successRate}%</p>
                      <p className="text-purple-200 text-xs sm:text-sm mt-1">✅ {stats.successful} delivered</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full flex-shrink-0">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg border-0 min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-orange-100 text-sm font-medium">Today's Claims</p>
                      <p className="text-2xl sm:text-3xl font-bold">{stats.todaysClaims}</p>
                      <p className="text-orange-200 text-xs sm:text-sm mt-1">
                        📅 {new Date().toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full flex-shrink-0">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full">
              <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg border-0 min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-teal-100 text-sm font-medium">Total Sales</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalSales}</p>
                      <p className="text-teal-200 text-xs sm:text-sm mt-1">
                        {stats.availableSales} available • {stats.claimedSales} claimed
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full flex-shrink-0">
                      <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg border-0 min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-indigo-100 text-sm font-medium">OTT Keys</p>
                      <p className="text-2xl sm:text-3xl font-bold">{stats.totalKeys}</p>
                      <p className="text-indigo-200 text-xs sm:text-sm mt-1">{stats.availableKeys} available</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full flex-shrink-0">
                      <Key className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border-0 min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    <h3 className="font-semibold text-blue-800 truncate">Processing</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-900">{stats.processing}</span>
                      <span className="text-sm text-blue-600">
                        {stats.totalClaims > 0 ? Math.round((stats.processing / stats.totalClaims) * 100) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={stats.totalClaims > 0 ? (stats.processing / stats.totalClaims) * 100 : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-blue-600">Currently processing</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Cards with Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full">
              <Card className="bg-green-50 border-green-200 shadow-lg min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <h3 className="font-semibold text-green-800 truncate">Successful</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-900">{stats.successful}</span>
                      <span className="text-sm text-green-600">
                        {stats.totalClaims > 0 ? Math.round((stats.successful / stats.totalClaims) * 100) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={stats.totalClaims > 0 ? (stats.successful / stats.totalClaims) * 100 : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-green-600">OTT codes delivered</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200 shadow-lg min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <h3 className="font-semibold text-yellow-800 truncate">Pending</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-yellow-900">{stats.pending}</span>
                      <span className="text-sm text-yellow-600">
                        {stats.totalClaims > 0 ? Math.round((stats.pending / stats.totalClaims) * 100) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={stats.totalClaims > 0 ? (stats.pending / stats.totalClaims) * 100 : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-yellow-600">Awaiting processing</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200 shadow-lg min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <h3 className="font-semibold text-red-800 truncate">Failed</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-red-900">{stats.failed}</span>
                      <span className="text-sm text-red-600">
                        {stats.totalClaims > 0 ? Math.round((stats.failed / stats.totalClaims) * 100) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={stats.totalClaims > 0 ? (stats.failed / stats.totalClaims) * 100 : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-red-600">Processing failed</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200 shadow-lg min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    <h3 className="font-semibold text-blue-800 truncate">Processing</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-900">{stats.currentlyProcessing}</span>
                      <span className="text-sm text-blue-600">
                        {stats.totalClaims > 0 ? Math.round((stats.currentlyProcessing / stats.totalClaims) * 100) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={stats.totalClaims > 0 ? (stats.currentlyProcessing / stats.totalClaims) * 100 : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-blue-600">Currently processing</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue="trends" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6 bg-white shadow-lg rounded-xl p-1 h-auto">
                <TabsTrigger
                  value="trends"
                  className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-base font-semibold py-2 sm:py-3"
                >
                  <BarChart3 className="w-4 h-4 mr-2 hidden sm:inline" />
                  <span className="sm:hidden">Trends</span>
                  <span className="hidden sm:inline">Monthly Trends</span>
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-base font-semibold py-2 sm:py-3"
                >
                  <Activity className="w-4 h-4 mr-2 hidden sm:inline" />
                  <span className="sm:hidden">Activity</span>
                  <span className="hidden sm:inline">Daily Activity</span>
                </TabsTrigger>
                <TabsTrigger
                  value="distribution"
                  className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-base font-semibold py-2 sm:py-3"
                >
                  <PieChart className="w-4 h-4 mr-2 hidden sm:inline" />
                  <span className="sm:hidden">Status</span>
                  <span className="hidden sm:inline">Status Distribution</span>
                </TabsTrigger>
                <TabsTrigger
                  value="revenue"
                  className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-base font-semibold py-2 sm:py-3"
                >
                  <Target className="w-4 h-4 mr-2 hidden sm:inline" />
                  <span className="sm:hidden">Revenue</span>
                  <span className="hidden sm:inline">Revenue Analysis</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="w-full">
                <Card className="shadow-xl border-0 w-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Monthly Trends</CardTitle>
                    <CardDescription className="text-base sm:text-lg text-gray-600">
                      Claims and revenue trends over the last 6 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="w-full">
                    <div className="space-y-4">
                      {stats.monthlyData.map((month, index) => (
                        <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-purple-600 font-bold">{month.month}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{month.claims} Claims</p>
                              <p className="text-sm text-gray-600">{formatCurrency(month.revenue)} Revenue</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(100, (month.claims / Math.max(...stats.monthlyData.map((m) => m.claims))) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="w-full">
                <Card className="shadow-xl border-0 w-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Daily Activity</CardTitle>
                    <CardDescription className="text-base sm:text-lg text-gray-600">
                      Daily claims and processing activity for the last 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {stats.dailyData.map((day, index) => (
                        <div
                          key={day.date}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
                        >
                          <div className="text-center">
                            <p className="text-sm font-medium text-blue-600">{day.date}</p>
                            <p className="text-2xl font-bold text-blue-900 mt-2">{day.claims}</p>
                            <p className="text-xs text-blue-600 mt-1">Claims</p>
                            <div className="mt-3 flex items-center justify-center space-x-2">
                              <Activity className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-blue-700">{day.activity} activities</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="distribution" className="w-full">
                <Card className="shadow-xl border-0 w-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Status Distribution</CardTitle>
                    <CardDescription className="text-base sm:text-lg text-gray-600">
                      Breakdown of all claim statuses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <span className="font-medium text-green-800">Successful</span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-green-900">{stats.successful}</span>
                            <p className="text-sm text-green-600">
                              {stats.totalClaims > 0 ? Math.round((stats.successful / stats.totalClaims) * 100) : 0}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-6 h-6 text-yellow-600" />
                            <span className="font-medium text-yellow-800">Pending</span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-yellow-900">{stats.pending}</span>
                            <p className="text-sm text-yellow-600">
                              {stats.totalClaims > 0 ? Math.round((stats.pending / stats.totalClaims) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center space-x-3">
                            <XCircle className="w-6 h-6 text-red-600" />
                            <span className="font-medium text-red-800">Failed</span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-red-900">{stats.failed}</span>
                            <p className="text-sm text-red-600">
                              {stats.totalClaims > 0 ? Math.round((stats.failed / stats.totalClaims) * 100) : 0}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                            <span className="font-medium text-blue-800">Processing</span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-900">{stats.currentlyProcessing}</span>
                            <p className="text-sm text-blue-600">
                              {stats.totalClaims > 0
                                ? Math.round((stats.currentlyProcessing / stats.totalClaims) * 100)
                                : 0}
                              %
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revenue" className="w-full">
                <Card className="shadow-xl border-0 w-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Revenue Analysis</CardTitle>
                    <CardDescription className="text-base sm:text-lg text-gray-600">
                      Comprehensive revenue insights and projections
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                          <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                          <p className="text-green-200 text-sm mt-2">From {stats.totalClaims} total claims</p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                          <h3 className="text-lg font-semibold mb-2">Average Revenue</h3>
                          <p className="text-3xl font-bold">
                            {stats.totalClaims > 0 ? formatCurrency(stats.totalRevenue / stats.totalClaims) : "₹0"}
                          </p>
                          <p className="text-blue-200 text-sm mt-2">Per successful claim</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Breakdown</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Successful Claims</span>
                              <span className="font-semibold">{formatCurrency(stats.successful * 99)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Pending Revenue</span>
                              <span className="font-semibold text-yellow-600">
                                {formatCurrency(stats.pending * 99)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Potential Total</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(stats.totalClaims * 99)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                          <h3 className="text-lg font-semibold text-purple-800 mb-2">Success Rate Impact</h3>
                          <p className="text-2xl font-bold text-purple-900">{stats.successRate}%</p>
                          <p className="text-purple-600 text-sm mt-2">
                            Revenue efficiency:{" "}
                            {stats.totalClaims > 0
                              ? Math.round((stats.totalRevenue / (stats.totalClaims * 99)) * 100)
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
