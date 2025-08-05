"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Download, RefreshCw, Mail, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const fetchClaims = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Fetching claims data...")

      const response = await fetch("/api/admin/claims", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Raw response data:", data)

      // Handle different response formats
      let claimsData: ClaimData[] = []

      if (data.success && Array.isArray(data.claims)) {
        claimsData = data.claims
      } else if (Array.isArray(data)) {
        claimsData = data
      } else if (data.data && Array.isArray(data.data)) {
        claimsData = data.data
      } else {
        console.warn("⚠️ Unexpected data format:", data)
        claimsData = []
      }

      console.log(`✅ Processed ${claimsData.length} claims`)

      // Set debug info
      setDebugInfo({
        totalClaims: claimsData.length,
        responseFormat: data.success ? "success format" : "direct array",
        sampleClaim: claimsData[0] || null,
        lastFetch: new Date().toLocaleTimeString(),
      })

      setClaims(claimsData)
      setFilteredClaims(claimsData)
    } catch (err) {
      console.error("❌ Error fetching claims:", err)
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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (claim) =>
          claim.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.claimId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${claim.firstName} ${claim.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.activationCode?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((claim) => {
        const ottStatus = claim.ottStatus || claim.ottCodeStatus || "pending"
        return ottStatus === statusFilter
      })
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((claim) => claim.paymentStatus === paymentFilter)
    }

    setFilteredClaims(filtered)
  }, [claims, searchTerm, statusFilter, paymentFilter])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        )
      case "failed":
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading email data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">
            Track and manage customer email communications and OTT code deliveries
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchClaims} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Debug Information Card */}
      {debugInfo && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Total Claims:</span>
                <p className="text-blue-600">{debugInfo.totalClaims}</p>
              </div>
              <div>
                <span className="font-medium text-blue-700">Response Format:</span>
                <p className="text-blue-600">{debugInfo.responseFormat}</p>
              </div>
              <div>
                <span className="font-medium text-blue-700">Last Fetch:</span>
                <p className="text-blue-600">{debugInfo.lastFetch}</p>
              </div>
              <div>
                <span className="font-medium text-blue-700">Sample Available:</span>
                <p className="text-blue-600">{debugInfo.sampleClaim ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error loading data:</strong> {error}
            <Button onClick={fetchClaims} variant="outline" size="sm" className="ml-2 bg-transparent">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
            <p className="text-xs text-muted-foreground">All customer communications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {claims.filter((c) => (c.ottStatus || c.ottCodeStatus) === "delivered").length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully delivered codes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {claims.filter((c) => (c.ottStatus || c.ottCodeStatus) === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {claims.filter((c) => (c.ottStatus || c.ottCodeStatus) === "failed").length}
            </div>
            <p className="text-xs text-muted-foreground">Processing failures</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search through email communications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, claim ID, name, or activation code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
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
              <SelectTrigger className="w-full md:w-[180px]">
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
        </CardContent>
      </Card>

      {/* Email Communications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Communications</CardTitle>
          <CardDescription>
            Showing {filteredClaims.length} of {claims.length} email records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClaims.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Email Records Found</h3>
              <p className="text-muted-foreground mb-4">
                {claims.length === 0
                  ? "No email communications have been recorded yet."
                  : "No records match your current filters."}
              </p>
              {claims.length === 0 && (
                <Button onClick={fetchClaims} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Activation Code</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>OTT Status</TableHead>
                    <TableHead>OTT Code</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => (
                    <TableRow key={claim._id}>
                      <TableCell className="font-medium">{claim.claimId || "N/A"}</TableCell>
                      <TableCell>{`${claim.firstName || ""} ${claim.lastName || ""}`.trim() || "N/A"}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={claim.email}>
                          {claim.email || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{claim.phoneNumber || claim.phone || "N/A"}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{claim.activationCode || "N/A"}</code>
                      </TableCell>
                      <TableCell>{getPaymentBadge(claim.paymentStatus)}</TableCell>
                      <TableCell>{getStatusBadge(claim.ottStatus || claim.ottCodeStatus || "pending")}</TableCell>
                      <TableCell>
                        {claim.ottCode ? (
                          <code className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                            {claim.ottCode}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {claim.platform ? (
                          <Badge variant="outline">{claim.platform}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {claim.createdAt
                          ? new Date(claim.createdAt).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {claim.updatedAt
                          ? new Date(claim.updatedAt).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
