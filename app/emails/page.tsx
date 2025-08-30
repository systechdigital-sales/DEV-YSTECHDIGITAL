"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  Search,
  Download,
  RefreshCw,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Users,
  TrendingUp,
  Eye,
  Calendar,
  Phone,
  CreditCard,
  Monitor,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ClaimData {
  _id: string
  claimId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  phone?: string
  activationCode: string
  paymentStatus: string
  ottStatus?: string
  ottCodeStatus?: string
  ottCode?: string
  platform?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
  failureReason?: string
}

export default function EmailsPage() {
  const [claims, setClaims] = useState<ClaimData[]>([])
  const [filteredClaims, setFilteredClaims] = useState<ClaimData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState<ClaimData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchClaims = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("BytewiseTestingpoint Fetching comprehensive claims data for emails page...")

      // Fetch claims with all email-related data
      const response = await fetch("/api/admin/claims?limit=1000", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("BytewiseTestingpoint Claims API response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("BytewiseTestingpoint Claims API response data structure:", {
        hasSuccess: "success" in data,
        hasClaims: "claims" in data,
        isArray: Array.isArray(data),
        hasData: "data" in data,
        dataType: typeof data,
        keysCount: Object.keys(data).length,
      })

      let claimsData: ClaimData[] = []

      if (data.success && Array.isArray(data.claims)) {
        claimsData = data.claims
        console.log("BytewiseTestingpoint Using data.claims array, length:", claimsData.length)
      } else if (Array.isArray(data)) {
        claimsData = data
        console.log("BytewiseTestingpoint Using direct data array, length:", claimsData.length)
      } else if (data.data && Array.isArray(data.data)) {
        claimsData = data.data
        console.log("BytewiseTestingpoint Using data.data array, length:", claimsData.length)
      } else {
        claimsData = []
        console.log("BytewiseTestingpoint No valid claims data found, using empty array")
      }

      // Ensure all required email fields are present
      claimsData = claimsData.map((claim) => ({
        ...claim,
        ottStatus: claim.ottStatus || claim.ottCodeStatus || "pending",
        phoneNumber: claim.phoneNumber || claim.phone || "",
        platform: claim.platform || "OTTplay",
      }))

      if (claimsData.length > 0) {
        console.log("BytewiseTestingpoint Sample claim data structure:", {
          firstClaim: {
            hasClaimId: "claimId" in claimsData[0],
            hasEmail: "email" in claimsData[0],
            hasOttStatus: "ottStatus" in claimsData[0],
            hasOttCodeStatus: "ottCodeStatus" in claimsData[0],
            hasPaymentStatus: "paymentStatus" in claimsData[0],
            keys: Object.keys(claimsData[0]),
          },
        })
      }

      setClaims(claimsData)
      setFilteredClaims(claimsData)
      console.log("BytewiseTestingpoint Successfully set claims data, total:", claimsData.length)
    } catch (err) {
      console.error("BytewiseTestingpoint Error fetching claims:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch claims data")
      setClaims([])
      setFilteredClaims([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  useEffect(() => {
    let filtered = claims

    if (searchTerm) {
      filtered = filtered.filter(
        (claim) =>
          claim.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.claimId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${claim.firstName} ${claim.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.activationCode?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((claim) => {
        const ottStatus = claim.ottStatus || claim.ottCodeStatus || "pending"
        return ottStatus === statusFilter
      })
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter((claim) => claim.paymentStatus === paymentFilter)
    }

    setFilteredClaims(filtered)
    setCurrentPage(1)
  }, [claims, searchTerm, statusFilter, paymentFilter])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "success":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        )
      case "failed":
      case "error":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-medium">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 font-medium">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-slate-200 font-medium">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "success":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium">
            <CreditCard className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-medium">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 font-medium">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-slate-200 font-medium">
            Unknown
          </Badge>
        )
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Claim ID",
      "Customer Name",
      "Email",
      "Phone",
      "Activation Code",
      "Payment Status",
      "OTT Status",
      "OTT Code",
      "Platform",
      "Created At",
      "Updated At",
    ]

    const csvData = filteredClaims.map((claim) => [
      claim.claimId || "",
      `${claim.firstName || ""} ${claim.lastName || ""}`.trim(),
      claim.email || "",
      claim.phoneNumber || claim.phone || "",
      claim.activationCode || "",
      claim.paymentStatus || "",
      claim.ottStatus || claim.ottCodeStatus || "",
      claim.ottCode || "",
      claim.platform || "",
      claim.createdAt ? new Date(claim.createdAt).toLocaleString("en-IN") : "",
      claim.updatedAt ? new Date(claim.updatedAt).toLocaleString("en-IN") : "",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `email_claims_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPaymentFilter("all")
  }

  const deliveredCount = claims.filter((c) => {
    const status = c.ottStatus || c.ottCodeStatus
    const isDelivered = status === "delivered"
    return isDelivered
  }).length

  const pendingCount = claims.filter((c) => {
    const status = c.ottStatus || c.ottCodeStatus
    const isPending = status === "pending"
    return isPending
  }).length

  const failedCount = claims.filter((c) => {
    const status = c.ottStatus || c.ottCodeStatus
    const isFailed = status === "failed"
    return isFailed
  }).length

  const deliveryRate = claims.length > 0 ? Math.round((deliveredCount / claims.length) * 100) : 0

  console.log("BytewiseTestingpoint Email statistics:", {
    totalClaims: claims.length,
    deliveredCount,
    pendingCount,
    failedCount,
    deliveryRate,
  })

  // Pagination
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClaims = filteredClaims.slice(startIndex, endIndex)

  if (loading) {
    return (
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center space-y-6 p-8">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                <Loader2 className="h-8 w-8 animate-spin absolute -bottom-1 -right-1 text-blue-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-800">Loading Email Communications</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Fetching customer email data and OTT delivery status...
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 px-6 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard" className="text-slate-600 hover:text-slate-900">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-slate-900">Email Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Main Content */}
        <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-slate-50/50 to-white">
          {/* Page Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Email Management</h1>
                  <p className="text-slate-600 mt-1">
                    Track and manage customer email communications and OTT code deliveries
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchClaims}
                variant="outline"
                size="sm"
                className="gap-2 bg-white hover:bg-slate-50 border-slate-200 shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                className="gap-2 bg-white hover:bg-slate-50 border-slate-200 shadow-sm"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => window.open("/emails/send-manual", "_blank")}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Mail className="h-4 w-4" />
                Send Manual Mail
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50 shadow-sm">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Error loading data:</strong> {error}
                  </div>
                  <Button onClick={fetchClaims} variant="outline" size="sm" className="ml-2 bg-white hover:bg-red-50">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-blue-700">Total Emails</CardTitle>
                <div className="p-2.5 bg-blue-500 rounded-xl shadow-md">
                  <Mail className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800 mb-1">{claims.length.toLocaleString()}</div>
                <p className="text-xs text-blue-600">All customer communications</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-emerald-700">Delivered</CardTitle>
                <div className="p-2.5 bg-emerald-500 rounded-xl shadow-md">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-800 mb-1">{deliveredCount.toLocaleString()}</div>
                <p className="text-xs text-emerald-600">Successfully delivered codes</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-amber-700">Pending</CardTitle>
                <div className="p-2.5 bg-amber-500 rounded-xl shadow-md">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-800 mb-1">{pendingCount.toLocaleString()}</div>
                <p className="text-xs text-amber-600">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-purple-700">Success Rate</CardTitle>
                <div className="p-2.5 bg-purple-500 rounded-xl shadow-md">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800 mb-1">{deliveryRate}%</div>
                <p className="text-xs text-purple-600">Delivery success rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Filter className="h-5 w-5 text-slate-600" />
                    Filters & Search
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Filter and search through {claims.length.toLocaleString()} email communications
                  </CardDescription>
                </div>
                {(searchTerm || statusFilter !== "all" || paymentFilter !== "all") && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-slate-50 hover:bg-slate-100 border-slate-200"
                  >
                    <XCircle className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by email, claim ID, name, or activation code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-[180px] h-11 bg-slate-50 border-slate-200 focus:bg-white">
                      <SelectValue placeholder="OTT Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-full lg:w-[180px] h-11 bg-slate-50 border-slate-200 focus:bg-white">
                      <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Communications Table */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Users className="h-5 w-5 text-slate-600" />
                    Email Communications
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredClaims.length)} of{" "}
                    {filteredClaims.length.toLocaleString()} records
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredClaims.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Mail className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-800">No Email Records Found</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    {claims.length === 0
                      ? "No email communications have been recorded yet. Check back later or refresh the data."
                      : "No records match your current filters. Try adjusting your search criteria."}
                  </p>
                  <div className="flex gap-3 justify-center">
                    {claims.length === 0 && (
                      <Button onClick={fetchClaims} variant="outline" className="gap-2 bg-white hover:bg-slate-50">
                        <RefreshCw className="h-4 w-4" />
                        Refresh Data
                      </Button>
                    )}
                    {claims.length > 0 && (
                      <Button onClick={clearFilters} variant="outline" className="gap-2 bg-white hover:bg-slate-50">
                        <XCircle className="h-4 w-4" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <ScrollArea className="h-[600px]">
                      <Table>
                        <TableHeader className="bg-slate-50 sticky top-0 z-10">
                          <TableRow className="hover:bg-slate-50">
                            <TableHead className="font-semibold text-slate-700 py-4">Claim ID</TableHead>
                            <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                            <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                            <TableHead className="font-semibold text-slate-700">Activation</TableHead>
                            <TableHead className="font-semibold text-slate-700">Payment</TableHead>
                            <TableHead className="font-semibold text-slate-700">OTT Status</TableHead>
                            <TableHead className="font-semibold text-slate-700">Platform</TableHead>
                            <TableHead className="font-semibold text-slate-700">Created</TableHead>
                            <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentClaims.map((claim, index) => (
                            <TableRow
                              key={claim._id}
                              className={`hover:bg-slate-50 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-slate-25"
                              }`}
                            >
                              <TableCell className="font-medium py-4">
                                {claim.claimId ? (
                                  <code className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1.5 rounded-md font-mono">
                                    {claim.claimId}
                                  </code>
                                ) : (
                                  <span className="text-slate-400 text-sm">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium text-slate-900">
                                    {`${claim.firstName || ""} ${claim.lastName || ""}`.trim() || "N/A"}
                                  </div>
                                  <div
                                    className="text-sm text-slate-500 font-mono truncate max-w-[200px]"
                                    title={claim.email}
                                  >
                                    {claim.email || "N/A"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  <span className="font-mono text-sm text-slate-600">
                                    {claim.phoneNumber || claim.phone || "N/A"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {claim.activationCode ? (
                                  <code className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded-md font-mono">
                                    {claim.activationCode}
                                  </code>
                                ) : (
                                  <span className="text-slate-400 text-sm">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>{getPaymentBadge(claim.paymentStatus)}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {getStatusBadge(claim.ottStatus || claim.ottCodeStatus || "pending")}
                                  {claim.ottCode && (
                                    <div>
                                      <code className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-mono">
                                        {claim.ottCode}
                                      </code>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {claim.platform ? (
                                  <div className="flex items-center gap-2">
                                    <Monitor className="h-3 w-3 text-slate-400" />
                                    <Badge variant="outline" className="font-medium text-slate-700 border-slate-300">
                                      {claim.platform}
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-sm">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-slate-400" />
                                  <span className="text-sm text-slate-600 font-mono">
                                    {claim.createdAt
                                      ? new Date(claim.createdAt).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "N/A"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-slate-100"
                                      onClick={() => setSelectedClaim(claim)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        Claim Details
                                      </DialogTitle>
                                      <DialogDescription>
                                        Complete information for claim {selectedClaim?.claimId}
                                      </DialogDescription>
                                    </DialogHeader>
                                    {selectedClaim && (
                                      <div className="grid grid-cols-2 gap-4 py-4">
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-slate-700">Customer Name</label>
                                          <p className="text-sm text-slate-900">
                                            {`${selectedClaim.firstName || ""} ${selectedClaim.lastName || ""}`.trim() ||
                                              "N/A"}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-slate-700">Email</label>
                                          <p className="text-sm text-slate-900 font-mono">
                                            {selectedClaim.email || "N/A"}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-slate-700">Phone</label>
                                          <p className="text-sm text-slate-900 font-mono">
                                            {selectedClaim.phoneNumber || selectedClaim.phone || "N/A"}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-slate-700">Activation Code</label>
                                          <p className="text-sm text-slate-900 font-mono">
                                            {selectedClaim.activationCode || "N/A"}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-slate-700">Payment Status</label>
                                          <div>{getPaymentBadge(selectedClaim.paymentStatus)}</div>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-slate-700">OTT Status</label>
                                          <div>
                                            {getStatusBadge(
                                              selectedClaim.ottStatus || selectedClaim.ottCodeStatus || "pending",
                                            )}
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-slate-700">OTT Code</label>
                                          <p className="text-sm text-slate-900 font-mono">
                                            {selectedClaim.ottCode || "Not assigned"}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-slate-700">Platform</label>
                                          <p className="text-sm text-slate-900">{selectedClaim.platform || "N/A"}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-slate-700">Created At</label>
                                          <p className="text-sm text-slate-900 font-mono">
                                            {selectedClaim.createdAt
                                              ? new Date(selectedClaim.createdAt).toLocaleString("en-IN")
                                              : "N/A"}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-slate-700">Updated At</label>
                                          <p className="text-sm text-slate-900 font-mono">
                                            {selectedClaim.updatedAt
                                              ? new Date(selectedClaim.updatedAt).toLocaleString("en-IN")
                                              : "N/A"}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                      <div className="text-sm text-slate-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredClaims.length)} of{" "}
                        {filteredClaims.length} results
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="bg-white hover:bg-slate-50"
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={
                                  currentPage === page ? "bg-blue-600 hover:bg-blue-700" : "bg-white hover:bg-slate-50"
                                }
                              >
                                {page}
                              </Button>
                            )
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="bg-white hover:bg-slate-50"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
