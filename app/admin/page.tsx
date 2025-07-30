"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Users,
  Key,
  DollarSign,
  FileSpreadsheet,
  RefreshCw,
  Trash2,
  Lock,
  X,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"

export default function AdminPage() {
  const [claimResponses, setClaimResponses] = useState<ClaimResponse[]>([])
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([])
  const [ottKeys, setOTTKeys] = useState<OTTKey[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("claims")
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<{ type: string; id: string; name: string } | null>(null)
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([])
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    setError("")

    try {
      const timestamp = new Date().getTime()

      // Fetch all data with error handling for each endpoint
      const fetchWithFallback = async (url: string, fallback: any[] = []) => {
        try {
          const response = await fetch(`${url}?_=${timestamp}`)
          if (response.ok) {
            const data = await response.json()
            return Array.isArray(data) ? data : fallback
          } else {
            console.warn(`Failed to fetch from ${url}:`, response.status)
            return fallback
          }
        } catch (error) {
          console.warn(`Error fetching from ${url}:`, error)
          return fallback
        }
      }

      const [claimsData, salesData, keysData] = await Promise.all([
        fetchWithFallback("/api/admin/claims", []),
        fetchWithFallback("/api/admin/sales", []),
        fetchWithFallback("/api/admin/keys", []),
      ])

      setClaimResponses(claimsData)
      setSalesRecords(salesData)
      setOTTKeys(keysData)

      console.log("Data fetched successfully:", {
        claims: claimsData.length,
        sales: salesData.length,
        keys: keysData.length,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to fetch data from systech_ott_platform database")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "sales" | "keys") => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage("")
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`/api/admin/upload-${type}`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || `${type} data uploaded successfully`)
        fetchData() // Refresh data
      } else {
        setError(result.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setError("Upload failed")
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch("/api/admin/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `systech_ott_platform_export_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setMessage("Data exported successfully")
      } else {
        setError("Failed to export data")
      }
    } catch (error) {
      console.error("Export error:", error)
      setError("Export failed")
    }
  }

  const handleDeleteClick = (type: string, id: string, name: string) => {
    console.log("Delete clicked:", { type, id, name })
    setRecordToDelete({ type, id, name })
    setDeletePassword("")
    setDeleteDialogOpen(true)
  }

  const handleBulkDeleteClick = (type: string) => {
    if (selectedRecords.size === 0) {
      setError("Please select records to delete")
      return
    }
    setBulkDeleteIds(Array.from(selectedRecords))
    setRecordToDelete({ type, id: "", name: `${selectedRecords.size} records` })
    setDeletePassword("")
    setBulkDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async (isBulk = false) => {
    if (!recordToDelete || deletePassword !== "Admin@12345") {
      setError("Invalid password. Please enter the correct admin password.")
      return
    }

    setDeleting(true)
    setError("")

    try {
      let url = `/api/admin/delete?type=${recordToDelete.type}&password=${encodeURIComponent(deletePassword)}`

      if (isBulk) {
        url += `&ids=${bulkDeleteIds.join(",")}`
        console.log("Bulk delete URL:", url)
      } else {
        url += `&id=${encodeURIComponent(recordToDelete.id)}`
        console.log("Single delete URL:", url)
      }

      const response = await fetch(url, {
        method: "DELETE",
      })

      const result = await response.json()
      console.log("Delete response:", result)

      if (response.ok) {
        setMessage(result.message || "Record(s) deleted successfully")
        if (isBulk) {
          setBulkDeleteDialogOpen(false)
          setSelectedRecords(new Set())
          setBulkDeleteIds([])
        } else {
          setDeleteDialogOpen(false)
        }
        setRecordToDelete(null)
        setDeletePassword("")
        fetchData() // Refresh data
      } else {
        setError(result.error || "Delete failed")
      }
    } catch (error) {
      console.error("Delete error:", error)
      setError("Delete operation failed")
    } finally {
      setDeleting(false)
    }
  }

  const handleSelectRecord = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRecords)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRecords(newSelected)
  }

  const handleSelectAll = (records: any[], checked: boolean) => {
    const newSelected = new Set(selectedRecords)
    if (checked) {
      records.forEach((record) => newSelected.add(record._id || record.id))
    } else {
      records.forEach((record) => newSelected.delete(record._id || record.id))
    }
    setSelectedRecords(newSelected)
  }

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="outline">UNKNOWN</Badge>

    switch (status.toLowerCase()) {
      case "paid":
      case "delivered":
      case "available":
      case "claimed":
        return <Badge className="bg-green-100 text-green-800 border-green-300">{status.toUpperCase()}</Badge>
      case "pending":
      case "assigned":
      case "sold":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">{status.toUpperCase()}</Badge>
      case "failed":
      case "used":
      case "expired":
        return <Badge className="bg-red-100 text-red-800 border-red-300">{status.toUpperCase()}</Badge>
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>
    }
  }

  // Safe statistics calculation
  const stats = {
    totalClaims: claimResponses?.length || 0,
    paidClaims: claimResponses?.filter((c) => c.paymentStatus === "paid")?.length || 0,
    pendingClaims: claimResponses?.filter((c) => c.paymentStatus === "pending")?.length || 0,
    failedClaims: claimResponses?.filter((c) => c.paymentStatus === "failed")?.length || 0,
    totalSales: salesRecords?.length || 0,
    claimedSales: salesRecords?.filter((s) => s.status === "claimed")?.length || 0,
    availableKeys: ottKeys?.filter((k) => k.status === "available")?.length || 0,
    assignedKeys: ottKeys?.filter((k) => k.status === "assigned")?.length || 0,
    usedKeys: ottKeys?.filter((k) => k.status === "used")?.length || 0,
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex">
          <DashboardSidebar />
          <SidebarInset className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-purple-600 text-lg font-medium">Loading admin panel...</p>
              <p className="text-gray-500 text-sm mt-2">Connecting to systech_ott_platform database</p>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          {/* Header */}
          <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl border-b border-purple-200 sticky top-0 z-10">
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
                      <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                      <p className="text-purple-200 text-lg">systech_ott_platform Database Management</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {selectedRecords.size > 0 && (
                    <div className="bg-white/20 px-4 py-2 rounded-lg">
                      <span className="text-white font-medium">{selectedRecords.size} selected</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecords(new Set())}
                        className="ml-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <Button onClick={fetchData} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-lg border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Claims</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalClaims}</p>
                      <p className="text-sm text-gray-500">
                        {stats.paidClaims} paid • {stats.pendingClaims} pending
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sales Records</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalSales}</p>
                      <p className="text-sm text-gray-500">{stats.claimedSales} claimed</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">OTT Keys</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalClaims + stats.totalSales}</p>
                      <p className="text-sm text-gray-500">{stats.availableKeys} available</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Key className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalClaims > 0 ? Math.round((stats.paidClaims / stats.totalClaims) * 100) : 0}%
                      </p>
                      <p className="text-sm text-gray-500">Payment success</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <CheckCircle className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Messages */}
            {message && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* File Upload Section */}
            <Card className="mb-8 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg border-b">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                  <Upload className="w-6 h-6 mr-3 text-blue-600" />
                  Data Management
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Upload Excel files and export data from systech_ott_platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Sales Upload */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                        <FileSpreadsheet className="w-5 h-5 mr-2" />📊 Sales Records Upload
                      </h3>
                      <p className="text-blue-800 mb-4">Upload Excel file to salesrecords collection</p>
                      <div className="space-y-3">
                        <Label htmlFor="sales-file" className="text-blue-900 font-medium">
                          Select Sales Excel File
                        </Label>
                        <Input
                          id="sales-file"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleFileUpload(e, "sales")}
                          disabled={uploading}
                          className="border-blue-300 focus:border-blue-500"
                        />
                        <p className="text-sm text-blue-700">
                          📋 Required columns: Activation Code, Product, Category, Status
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Keys Upload */}
                  <div className="space-y-4">
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                      <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                        <Key className="w-5 h-5 mr-2" />🔑 OTT Keys Upload
                      </h3>
                      <p className="text-green-800 mb-4">Upload Excel file to ottkeys collection</p>
                      <div className="space-y-3">
                        <Label htmlFor="keys-file" className="text-green-900 font-medium">
                          Select Keys Excel File
                        </Label>
                        <Input
                          id="keys-file"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleFileUpload(e, "keys")}
                          disabled={uploading}
                          className="border-green-300 focus:border-green-500"
                        />
                        <p className="text-sm text-green-700">
                          📋 Required columns: Activation Code, Product, Category, Status
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">📤 Export Data</h3>
                      <p className="text-gray-600">Download all data from systech_ott_platform database</p>
                    </div>
                    <Button onClick={exportData} className="bg-purple-600 hover:bg-purple-700">
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Tables */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6 bg-white shadow-lg rounded-xl p-1 h-14">
                <TabsTrigger
                  value="claims"
                  className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-lg font-semibold"
                >
                  Claims ({stats.totalClaims})
                </TabsTrigger>
                <TabsTrigger
                  value="sales"
                  className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-lg font-semibold"
                >
                  Sales ({stats.totalSales})
                </TabsTrigger>
                <TabsTrigger
                  value="keys"
                  className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-lg font-semibold"
                >
                  OTT Keys ({ottKeys?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="claims">
                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">Claims Management</CardTitle>
                        <CardDescription className="text-lg text-gray-600">
                          Customer claims from systech_ott_platform.claims collection
                        </CardDescription>
                      </div>
                      {selectedRecords.size > 0 && (
                        <Button
                          variant="destructive"
                          onClick={() => handleBulkDeleteClick("claims")}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Selected ({selectedRecords.size})
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  claimResponses?.length > 0 &&
                                  claimResponses.every((claim) => selectedRecords.has(claim._id || claim.id))
                                }
                                onCheckedChange={(checked) => handleSelectAll(claimResponses || [], checked as boolean)}
                              />
                            </TableHead>
                            <TableHead className="font-bold text-gray-800">Email</TableHead>
                            <TableHead className="font-bold text-gray-800">Phone</TableHead>
                            <TableHead className="font-bold text-gray-800">Activation Code</TableHead>
                            <TableHead className="font-bold text-gray-800">Payment Status</TableHead>
                            <TableHead className="font-bold text-gray-800">OTT Status</TableHead>
                            <TableHead className="font-bold text-gray-800">OTT Code</TableHead>
                            <TableHead className="font-bold text-gray-800">Created</TableHead>
                            <TableHead className="font-bold text-gray-800">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {claimResponses?.map((claim, index) => (
                            <TableRow
                              key={claim._id || claim.id}
                              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedRecords.has(claim._id || claim.id)}
                                  onCheckedChange={(checked) =>
                                    handleSelectRecord(claim._id || claim.id, checked as boolean)
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-medium">{claim.email || "N/A"}</TableCell>
                              <TableCell>{claim.phone || "N/A"}</TableCell>
                              <TableCell className="font-mono text-sm">{claim.activationCode || "N/A"}</TableCell>
                              <TableCell>{getStatusBadge(claim.paymentStatus)}</TableCell>
                              <TableCell>{getStatusBadge(claim.ottCodeStatus)}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {claim.ottCode || <span className="text-gray-400">-</span>}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClick("claims", claim._id || claim.id, claim.email || "Unknown")
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )) || (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                No claims data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sales">
                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">Sales Records</CardTitle>
                        <CardDescription className="text-lg text-gray-600">
                          Sales data from systech_ott_platform.salesrecords collection
                        </CardDescription>
                      </div>
                      {selectedRecords.size > 0 && (
                        <Button
                          variant="destructive"
                          onClick={() => handleBulkDeleteClick("sales")}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Selected ({selectedRecords.size})
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  salesRecords?.length > 0 &&
                                  salesRecords.every((sale) => selectedRecords.has(sale._id || sale.id))
                                }
                                onCheckedChange={(checked) => handleSelectAll(salesRecords || [], checked as boolean)}
                              />
                            </TableHead>
                            <TableHead className="font-bold text-gray-800">Activation Code</TableHead>
                            <TableHead className="font-bold text-gray-800">Product</TableHead>
                            <TableHead className="font-bold text-gray-800">Category</TableHead>
                            <TableHead className="font-bold text-gray-800">Status</TableHead>
                            <TableHead className="font-bold text-gray-800">Claimed By</TableHead>
                            <TableHead className="font-bold text-gray-800">Created</TableHead>
                            <TableHead className="font-bold text-gray-800">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesRecords?.map((sale, index) => (
                            <TableRow key={sale._id || sale.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedRecords.has(sale._id || sale.id)}
                                  onCheckedChange={(checked) =>
                                    handleSelectRecord(sale._id || sale.id, checked as boolean)
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-mono text-sm">{sale.activationCode || "N/A"}</TableCell>
                              <TableCell>{sale.product || "N/A"}</TableCell>
                              <TableCell>{sale.productSubCategory || "N/A"}</TableCell>
                              <TableCell>{getStatusBadge(sale.status)}</TableCell>
                              <TableCell>{sale.claimedBy || <span className="text-gray-400">-</span>}</TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClick("sales", sale._id || sale.id, sale.activationCode || "Unknown")
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )) || (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No sales data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keys">
                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">OTT Keys Inventory</CardTitle>
                        <CardDescription className="text-lg text-gray-600">
                          OTT keys from systech_ott_platform.ottkeys collection
                        </CardDescription>
                      </div>
                      {selectedRecords.size > 0 && (
                        <Button
                          variant="destructive"
                          onClick={() => handleBulkDeleteClick("keys")}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Selected ({selectedRecords.size})
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  ottKeys?.length > 0 && ottKeys.every((key) => selectedRecords.has(key._id || key.id))
                                }
                                onCheckedChange={(checked) => handleSelectAll(ottKeys || [], checked as boolean)}
                              />
                            </TableHead>
                            <TableHead className="font-bold text-gray-800">Activation Code</TableHead>
                            <TableHead className="font-bold text-gray-800">Product</TableHead>
                            <TableHead className="font-bold text-gray-800">Category</TableHead>
                            <TableHead className="font-bold text-gray-800">Status</TableHead>
                            <TableHead className="font-bold text-gray-800">Assigned To</TableHead>
                            <TableHead className="font-bold text-gray-800">Created</TableHead>
                            <TableHead className="font-bold text-gray-800">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ottKeys?.map((key, index) => (
                            <TableRow key={key._id || key.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedRecords.has(key._id || key.id)}
                                  onCheckedChange={(checked) =>
                                    handleSelectRecord(key._id || key.id, checked as boolean)
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-mono text-sm">{key.activationCode || "N/A"}</TableCell>
                              <TableCell>{key.product || "N/A"}</TableCell>
                              <TableCell>{key.productSubCategory || "N/A"}</TableCell>
                              <TableCell>{getStatusBadge(key.status)}</TableCell>
                              <TableCell>{key.assignedEmail || <span className="text-gray-400">-</span>}</TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClick("keys", key._id || key.id, key.activationCode || "Unknown")
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )) || (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No keys data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Single Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                  <Lock className="w-5 h-5 mr-2" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  You are about to delete the {recordToDelete?.type} record: <strong>{recordToDelete?.name}</strong>
                  <br />
                  <br />
                  This action cannot be undone and will permanently remove the record from systech_ott_platform
                  database.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-password" className="text-sm font-medium">
                    Admin Password
                  </Label>
                  <Input
                    id="delete-password"
                    type="password"
                    placeholder="Enter admin password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="border-red-200 focus:border-red-500"
                  />
                  <p className="text-xs text-gray-500">Required password: Admin@12345</p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false)
                    setDeletePassword("")
                    setRecordToDelete(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteConfirm(false)}
                  disabled={deleting || deletePassword !== "Admin@12345"}
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Record
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk Delete Confirmation Dialog */}
          <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                  <Lock className="w-5 h-5 mr-2" />
                  Confirm Bulk Deletion
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  You are about to delete <strong>{bulkDeleteIds.length}</strong> {recordToDelete?.type} records.
                  <br />
                  <br />
                  This action cannot be undone and will permanently remove all selected records from
                  systech_ott_platform database.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-delete-password" className="text-sm font-medium">
                    Admin Password
                  </Label>
                  <Input
                    id="bulk-delete-password"
                    type="password"
                    placeholder="Enter admin password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="border-red-200 focus:border-red-500"
                  />
                  <p className="text-xs text-gray-500">Required password: Admin@12345</p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setBulkDeleteDialogOpen(false)
                    setDeletePassword("")
                    setRecordToDelete(null)
                    setBulkDeleteIds([])
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteConfirm(true)}
                  disabled={deleting || deletePassword !== "Admin@12345"}
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete {bulkDeleteIds.length} Records
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
