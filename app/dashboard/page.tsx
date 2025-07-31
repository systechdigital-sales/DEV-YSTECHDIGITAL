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
} from "lucide-react"
import Image from "next/image"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

interface DashboardStats {
  totalClaims: number
  totalRevenue: number
  successfulClaims: number
  pendingClaims: number
  failedClaims: number
  todayClaims: number
  totalSalesRecords: number // New metric for sales records
  monthlyData: Array<{
    month: string
    claims: number
    revenue: number
    success: number
  }>
}

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6B7280"]

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClaims: 0,
    totalRevenue: 0,
    successfulClaims: 0,
    pendingClaims: 0,
    failedClaims: 0,
    todayClaims: 0,
    totalSalesRecords: 0, // Initialize new metric
    monthlyData: [],
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch claims data from database
      const claimsResponse = await fetch("/api/admin/claims")
      const claims = await claimsResponse.json() // claimsData is directly the array

      // Fetch sales data from database
      const salesResponse = await fetch("/api/admin/sales")
      const sales = await salesResponse.json() // salesData is directly the array

      // Calculate statistics from claims data
      const totalClaims = claims.length
      const successfulClaims = claims.filter((claim: any) => claim.ottCodeStatus === "delivered").length
      const pendingClaims = claims.filter((claim: any) => claim.ottCodeStatus === "pending").length
      const failedClaims = claims.filter((claim: any) => claim.ottCodeStatus === "failed").length
      const paidClaims = claims.filter((claim: any) => claim.paymentStatus === "paid").length
      const totalRevenue = paidClaims * 99 // ₹99 per claim

      // Today's claims (IST timezone)
      const todayIST = new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
      const todayClaims = claims.filter((claim: any) => {
        const claimDate = new Date(claim.createdAt || Date.now())
        const claimDateIST = claimDate.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
        return claimDateIST === todayIST
      }).length

      // Monthly data for the last 6 months (real data from database)
      const monthlyData = []
      const currentDate = new Date()

      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthName = monthDate.toLocaleDateString("en-US", { month: "short" })
        const year = monthDate.getFullYear()

        // Filter claims for this month from database
        const monthClaims = claims.filter((claim: any) => {
          const claimDate = new Date(claim.createdAt || Date.now())
          return claimDate.getMonth() === monthDate.getMonth() && claimDate.getFullYear() === monthDate.getFullYear()
        })

        const monthSuccessful = monthClaims.filter((claim: any) => claim.ottCodeStatus === "delivered").length
        const monthPaid = monthClaims.filter((claim: any) => claim.paymentStatus === "paid").length

        monthlyData.push({
          month: `${monthName} ${year}`,
          claims: monthClaims.length,
          revenue: monthPaid * 99,
          success: monthSuccessful,
        })
      }

      // Calculate total sales records
      const totalSalesRecords = sales.length

      setStats({
        totalClaims,
        totalRevenue,
        successfulClaims,
        pendingClaims,
        failedClaims,
        todayClaims,
        totalSalesRecords, // Set the new metric
        monthlyData,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Set fallback data only if database fetch fails
      setStats({
        totalClaims: 0,
        totalRevenue: 0,
        successfulClaims: 0,
        pendingClaims: 0,
        failedClaims: 0,
        todayClaims: 0,
        totalSalesRecords: 0, // Fallback for new metric
        monthlyData: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const pieData = [
    { name: "Successful", value: stats.successfulClaims, color: "#10B981" },
    { name: "Pending", value: stats.pendingClaims, color: "#F59E0B" },
    { name: "Failed", value: stats.failedClaims, color: "#EF4444" },
  ]

  const successRate = stats.totalClaims > 0 ? (stats.successfulClaims / stats.totalClaims) * 100 : 0

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex">
          <DashboardSidebar />
          <SidebarInset className="flex-1">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading real-time dashboard data from systech_ott_platform database...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          {/* Header */}
          <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl border-b border-blue-200 sticky top-0 z-10">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-white hover:bg-white/20 p-2 rounded-lg" />
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
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
                        Dashboard Overview
                      </h1>
                      <p className="text-sm text-blue-200 mt-1">Real-time analytics from database (IST)</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-200">Last updated</p>
                  <p className="text-white font-semibold">
                    {new Date().toLocaleTimeString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      hour12: true,
                    })}{" "}
                    IST
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto">
            <div className="space-y-8">
              {/* Key Metrics - Real Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-semibold">Total Claims</p>
                        <p className="text-3xl font-bold">{stats.totalClaims.toLocaleString()}</p>
                        <p className="text-blue-200 text-xs mt-1">From database</p>
                      </div>
                      <Users className="w-10 h-10 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-semibold">Total Revenue</p>
                        <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-green-200 text-xs mt-1">From paid claims</p>
                      </div>
                      <DollarSign className="w-10 h-10 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-semibold">Success Rate</p>
                        <p className="text-3xl font-bold">{successRate.toFixed(1)}%</p>
                        <p className="text-purple-200 text-xs mt-1">OTT delivery success</p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-semibold">Today's Claims</p>
                        <p className="text-3xl font-bold">{stats.todayClaims}</p>
                        <p className="text-orange-200 text-xs mt-1">New today (IST)</p>
                      </div>
                      <Activity className="w-10 h-10 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>

                {/* New Card for Total Sales Records */}
                <Card className="shadow-xl border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-semibold">Total Sales Records</p>
                        <p className="text-3xl font-bold">{stats.totalSalesRecords.toLocaleString()}</p>
                        <p className="text-red-200 text-xs mt-1">From database</p>
                      </div>
                      <ShoppingCart className="w-10 h-10 text-red-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Overview - Real Data */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                    <CardTitle className="flex items-center text-green-800">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Successful Claims
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-green-600 mb-2">{stats.successfulClaims}</p>
                      <p className="text-gray-600">OTT codes delivered</p>
                      <Progress
                        value={stats.totalClaims > 0 ? (stats.successfulClaims / stats.totalClaims) * 100 : 0}
                        className="mt-4 h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg border-b">
                    <CardTitle className="flex items-center text-yellow-800">
                      <Clock className="w-5 h-5 mr-2" />
                      Pending Claims
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-yellow-600 mb-2">{stats.pendingClaims}</p>
                      <p className="text-gray-600">Awaiting processing</p>
                      <Progress
                        value={stats.totalClaims > 0 ? (stats.pendingClaims / stats.totalClaims) * 100 : 0}
                        className="mt-4 h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg border-b">
                    <CardTitle className="flex items-center text-red-800">
                      <XCircle className="w-5 h-5 mr-2" />
                      Failed Claims
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-red-600 mb-2">{stats.failedClaims}</p>
                      <p className="text-gray-600">Processing failed</p>
                      <Progress
                        value={stats.totalClaims > 0 ? (stats.failedClaims / stats.totalClaims) * 100 : 0}
                        className="mt-4 h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts - Real Data */}
              <Tabs defaultValue="trends" className="space-y-6">
                <TabsList className="grid grid-cols-3 mb-6 bg-white shadow-lg rounded-xl p-1 h-14">
                  <TabsTrigger
                    value="trends"
                    className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-lg font-semibold"
                  >
                    Monthly Trends
                  </TabsTrigger>
                  <TabsTrigger
                    value="distribution"
                    className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-lg font-semibold"
                  >
                    Status Distribution
                  </TabsTrigger>
                  <TabsTrigger
                    value="revenue"
                    className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-lg font-semibold"
                  >
                    Revenue Analysis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="trends">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                      <CardTitle className="text-2xl font-bold text-gray-800">Monthly Performance Trends</CardTitle>
                      <p className="text-gray-600 mt-2">Real data from Claims collection (6-month performance)</p>
                    </CardHeader>
                    <CardContent className="p-8">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={stats.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="claims" stroke="#3B82F6" strokeWidth={3} name="Total Claims" />
                          <Line
                            type="monotone"
                            dataKey="success"
                            stroke="#10B981"
                            strokeWidth={3}
                            name="Successful Claims"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="distribution">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
                      <CardTitle className="text-2xl font-bold text-gray-800">Claim Status Distribution</CardTitle>
                      <p className="text-gray-600 mt-2">Current distribution from database</p>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-4">
                          {pieData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="font-semibold text-gray-800">{item.name}</span>
                              </div>
                              <Badge variant="outline" className="text-lg px-3 py-1">
                                {item.value}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="revenue">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                      <CardTitle className="text-2xl font-bold text-gray-800">Monthly Revenue Analysis</CardTitle>
                      <p className="text-gray-600 mt-2">Revenue from paid claims (₹99 per claim)</p>
                    </CardHeader>
                    <CardContent className="p-8">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={stats.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                          <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* System Health */}
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg border-b">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <Database className="w-6 h-6 mr-3 text-gray-600" />
                    System Health & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                      <Database className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h3 className="font-bold text-green-800 mb-2">Database Status</h3>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                      <p className="text-sm text-green-700 mt-2">systech_ott_platform</p>
                    </div>

                    <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-bold text-blue-800 mb-2">Email Service</h3>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Active
                      </Badge>
                      <p className="text-sm text-blue-700 mt-2">Gmail SMTP</p>
                    </div>

                    <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                      <Target className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-bold text-purple-800 mb-2">Auto-Processing</h3>
                      <Badge variant="default" className="bg-purple-100 text-purple-800">
                        Ready
                      </Badge>
                      <p className="text-sm text-purple-700 mt-2">Every 60 seconds</p>
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
