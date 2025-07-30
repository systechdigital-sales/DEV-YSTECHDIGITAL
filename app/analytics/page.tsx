"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Mail, DollarSign, Activity, Target } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { format, subDays, startOfDay } from "date-fns"

export default function AnalyticsPage() {
  const [claimResponses, setClaimResponses] = useState<ClaimResponse[]>([])
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([])
  const [ottKeys, setOTTKeys] = useState<OTTKey[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchAnalyticsData()
  }, [router])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const timestamp = new Date().getTime()

      const [claimsResponse, salesResponse, keysResponse] = await Promise.all([
        fetch(`/api/admin/claims?_=${timestamp}`),
        fetch(`/api/admin/sales?_=${timestamp}`),
        fetch(`/api/admin/keys?_=${timestamp}`),
      ])

      const claimsData = await claimsResponse.json()
      const salesData = await salesResponse.json()
      const keysData = await keysResponse.json()

      setClaimResponses(Array.isArray(claimsData) ? claimsData : [])
      setSalesRecords(Array.isArray(salesData) ? salesData : [])
      setOTTKeys(Array.isArray(keysData) ? keysData : [])
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Generate daily data for the selected time range
  const generateDailyData = () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      const dateStr = format(date, "MMM dd")

      const claimsOnDate = claimResponses.filter(
        (claim) => format(new Date(claim.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
      )

      data.push({
        date: dateStr,
        claims: claimsOnDate.length,
        paid: claimsOnDate.filter((c) => c.paymentStatus === "paid").length,
        delivered: claimsOnDate.filter((c) => c.ottCodeStatus === "delivered").length,
        failed: claimsOnDate.filter((c) => c.paymentStatus === "failed").length,
      })
    }

    return data
  }

  // Product category analysis
  const getProductCategoryData = () => {
    const categoryMap = new Map<string, number>()

    salesRecords.forEach((sale) => {
      const category = sale.productSubCategory || "Unknown"
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }))
  }

  // Payment method analysis
  const getPaymentStatusData = () => {
    const statusMap = new Map<string, number>()

    claimResponses.forEach((claim) => {
      const status = claim.paymentStatus
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })

    return [
      { name: "Paid", value: statusMap.get("paid") || 0, color: "#10b981" },
      { name: "Pending", value: statusMap.get("pending") || 0, color: "#f59e0b" },
      { name: "Failed", value: statusMap.get("failed") || 0, color: "#ef4444" },
    ]
  }

  // OTT delivery success rate over time
  const getDeliveryTrendData = () => {
    const days = 14 // Last 14 days
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      const dateStr = format(date, "MMM dd")

      const claimsOnDate = claimResponses.filter(
        (claim) => format(new Date(claim.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
      )

      const delivered = claimsOnDate.filter((c) => c.ottCodeStatus === "delivered").length
      const total = claimsOnDate.filter((c) => c.paymentStatus === "paid").length
      const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0

      data.push({
        date: dateStr,
        successRate,
        delivered,
        total,
      })
    }

    return data
  }

  const dailyData = generateDailyData()
  const productCategoryData = getProductCategoryData()
  const paymentStatusData = getPaymentStatusData()
  const deliveryTrendData = getDeliveryTrendData()

  // Calculate key metrics
  const totalRevenue = claimResponses.filter((c) => c.paymentStatus === "paid").length * 3499 // Assuming ₹3499 per subscription
  const conversionRate =
    claimResponses.length > 0
      ? Math.round((claimResponses.filter((c) => c.paymentStatus === "paid").length / claimResponses.length) * 100)
      : 0
  const deliveryRate =
    claimResponses.filter((c) => c.paymentStatus === "paid").length > 0
      ? Math.round(
          (claimResponses.filter((c) => c.ottCodeStatus === "delivered").length /
            claimResponses.filter((c) => c.paymentStatus === "paid").length) *
            100,
        )
      : 0

  const chartConfig = {
    claims: { label: "Claims", color: "hsl(var(--chart-1))" },
    paid: { label: "Paid", color: "hsl(var(--chart-2))" },
    delivered: { label: "Delivered", color: "hsl(var(--chart-3))" },
    failed: { label: "Failed", color: "hsl(var(--chart-4))" },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 text-lg">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights into your OTT subscription platform</p>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline w-3 h-3 mr-1" />
                    From paid subscriptions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">Claims to paid conversions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delivery Success</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{deliveryRate}%</div>
                  <p className="text-xs text-muted-foreground">OTT codes delivered successfully</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{claimResponses.length}</div>
                  <p className="text-xs text-muted-foreground">Total registered users</p>
                </CardContent>
              </Card>
            </div>

            {/* Time Range Selector */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <Button
                  variant={timeRange === "7d" ? "default" : "outline"}
                  onClick={() => setTimeRange("7d")}
                  size="sm"
                >
                  7 Days
                </Button>
                <Button
                  variant={timeRange === "30d" ? "default" : "outline"}
                  onClick={() => setTimeRange("30d")}
                  size="sm"
                >
                  30 Days
                </Button>
                <Button
                  variant={timeRange === "90d" ? "default" : "outline"}
                  onClick={() => setTimeRange("90d")}
                  size="sm"
                >
                  90 Days
                </Button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Daily Claims Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Activity</CardTitle>
                    <CardDescription>Claims, payments, and deliveries over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="claims"
                            stackId="1"
                            stroke="var(--color-claims)"
                            fill="var(--color-claims)"
                            fillOpacity={0.6}
                          />
                          <Area
                            type="monotone"
                            dataKey="paid"
                            stackId="2"
                            stroke="var(--color-paid)"
                            fill="var(--color-paid)"
                            fillOpacity={0.6}
                          />
                          <Area
                            type="monotone"
                            dataKey="delivered"
                            stackId="3"
                            stroke="var(--color-delivered)"
                            fill="var(--color-delivered)"
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Payment Status Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Status Distribution</CardTitle>
                      <CardDescription>Breakdown of payment statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {paymentStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Product Categories</CardTitle>
                      <CardDescription>Distribution by product category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={productCategoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {productCategoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                {/* Delivery Success Rate Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Success Rate Trend</CardTitle>
                    <CardDescription>OTT code delivery performance over the last 14 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={deliveryTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="w-5 h-5 text-blue-500 mr-2" />
                        System Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">API Response Time</span>
                          <Badge variant="outline">~200ms</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Uptime</span>
                          <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Error Rate</span>
                          <Badge variant="outline">0.1%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Mail className="w-5 h-5 text-green-500 mr-2" />
                        Email Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Delivery Rate</span>
                          <Badge className="bg-green-100 text-green-800">{deliveryRate}%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Bounce Rate</span>
                          <Badge variant="outline">2.1%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg. Send Time</span>
                          <Badge variant="outline">~5s</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="w-5 h-5 text-purple-500 mr-2" />
                        Conversion Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Claim to Payment</span>
                          <Badge className="bg-blue-100 text-blue-800">{conversionRate}%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Payment to Delivery</span>
                          <Badge className="bg-green-100 text-green-800">{deliveryRate}%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Overall Success</span>
                          <Badge className="bg-purple-100 text-purple-800">
                            {Math.round((conversionRate * deliveryRate) / 100)}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                {/* Product Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Category Performance</CardTitle>
                    <CardDescription>Sales distribution across different product categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productCategoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                    <CardDescription>Most popular products by sales volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {productCategoryData.slice(0, 5).map((product, index) => (
                        <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm mr-3">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.value} sales</p>
                            </div>
                          </div>
                          <Badge variant="outline">{Math.round((product.value / salesRecords.length) * 100)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                {/* Growth Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Growth Trends</CardTitle>
                    <CardDescription>User acquisition and revenue trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line type="monotone" dataKey="claims" stroke="var(--color-claims)" strokeWidth={2} />
                          <Line type="monotone" dataKey="paid" stroke="var(--color-paid)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Trend Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Claims Growth</span>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-green-600 font-medium">+12%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Payment Success</span>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-green-600 font-medium">+8%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Delivery Rate</span>
                          <div className="flex items-center">
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-red-600 font-medium">-2%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Forecasting</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Expected Claims (Next 7 days)</span>
                          <Badge variant="outline">
                            ~{Math.round(dailyData.slice(-7).reduce((sum, day) => sum + day.claims, 0) * 1.1)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Projected Revenue</span>
                          <Badge variant="outline">
                            ₹
                            {Math.round(
                              dailyData.slice(-7).reduce((sum, day) => sum + day.paid, 0) * 1.1 * 3499,
                            ).toLocaleString()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Key Inventory Needed</span>
                          <Badge variant="outline">
                            {Math.round(dailyData.slice(-7).reduce((sum, day) => sum + day.delivered, 0) * 1.1)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
