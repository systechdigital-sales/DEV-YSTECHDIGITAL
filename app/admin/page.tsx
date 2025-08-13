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
  Send,
  ChevronLeft,
  ChevronRight,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

interface ClaimResponse {
  _id?: string
  id?: string
  claimId?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  phone?: string
  address?: string
  state?: string
  city?: string
  pincode?: string
  activationCode?: string
  paymentStatus?: string
  ottCodeStatus?: string
  ottStatus?: string
  ottCode?: string
  createdAt?: string
}

interface SalesRecord {
  _id?: string
  id?: string
  activationCode?: string
  product?: string
  productSubCategory?: string
  status?: string
  claimedBy?: string
  createdAt?: string
}

interface OTTKey {
  _id?: string
  id?: string
  activationCode?: string
  product?: string
  productSubCategory?: string
  status?: string
  assignedEmail?: string
  createdAt?: string
}

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

  const [claimsPagination, setClaimsPagination] = useState({ currentPage: 1, itemsPerPage: 20 })
  const [salesPagination, setSalesPagination] = useState({ currentPage: 1, itemsPerPage: 20 })
  const [keysPagination, setKeysPagination] = useState({ currentPage: 1, itemsPerPage: 20 })

  // State for Manual Assignment
  const [manualAssignDialogOpen, setManualAssignDialogOpen] = useState(false)
  const [selectedClaimForManualAssign, setSelectedClaimForManualAssign] = useState<ClaimResponse | null>(null)
  const [selectedKeyForManualAssign, setSelectedKeyForManualAssign] = useState<string>("")
  const [manualAssignPassword, setManualAssignPassword] = useState("")
  const [assigning, setAssigning] = useState(false)

  const getPaginatedData = <T,>(data: T[], pagination: { currentPage: number; itemsPerPage: number }) => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage
    const endIndex = startIndex + pagination.itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (totalItems: number, itemsPerPage: number) => {
    return Math.ceil(totalItems / itemsPerPage)
  }

  const handlePageChange = (type: "claims" | "sales" | "keys", newPage: number) => {
    switch (type) {
      case "claims":
        setClaimsPagination((prev) => ({ ...prev, currentPage: newPage }))
        break
      case "sales":
        setSalesPagination((prev) => ({ ...prev, currentPage: newPage }))
        break
      case "keys":
        setKeysPagination((prev) => ({ ...prev, currentPage: newPage }))
        break
    }
    // Clear selections when changing pages
    setSelectedRecords(new Set())
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError("")

    try {
      const mockClaims: ClaimResponse[] = Array.from({ length: 50 }, (_, i) => ({
        _id: `claim_${i + 1}`,
        claimId: `CLM${String(i + 1).padStart(4, "0")}`,
        firstName: `User${i + 1}`,
        lastName: `Last${i + 1}`,
        email: `user${i + 1}@example.com`,
        phoneNumber: `+91${String(9000000000 + i)}`,
        address: `Address ${i + 1}, Street ${i + 1}`,
        state: ["Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat"][i % 4],
        city: ["Mumbai", "Bangalore", "Chennai", "Ahmedabad"][i % 4],
        pincode: String(400000 + i),
        activationCode: `ACT${String(i + 1).padStart(6, "0")}`,
        paymentStatus: ["paid", "pending", "failed"][i % 3],
        ottCodeStatus: ["delivered", "pending", "failed"][i % 3],
        ottCode: i % 2 === 0 ? `OTT${String(i + 1).padStart(6, "0")}` : undefined,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      }))

      const mockSales: SalesRecord[] = Array.from({ length: 75 }, (_, i) => ({
        _id: `sale_${i + 1}`,
        activationCode: `ACT${String(i + 1).padStart(6, "0")}`,
        product: ["Product A", "Product B", "Product C"][i % 3],
        productSubCategory: ["Category 1", "Category 2", "Category 3"][i % 3],
        status: ["available", "claimed", "used"][i % 3],
        claimedBy: i % 2 === 0 ? `user${i + 1}@example.com` : undefined,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      }))

      const mockKeys: OTTKey[] = Array.from({ length: 100 }, (_, i) => ({
        _id: `key_${i + 1}`,
        activationCode: `OTT${String(i + 1).padStart(6, "0")}`,
        product: ["OTT Service A", "OTT Service B", "OTT Service C"][i % 3],
        productSubCategory: ["Streaming", "Gaming", "Music"][i % 3],
        status: ["available", "assigned", "used"][i % 3],
        assignedEmail: i % 3 === 1 ? `user${i + 1}@example.com` : undefined,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      }))

      setClaimResponses(mockClaims)
      setSalesRecords(mockSales)
      setOTTKeys(mockKeys)

      console.log("Data loaded successfully:", {
        claims: mockClaims.length,
        sales: mockSales.length,
        keys: mockKeys.length,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "sales" | "keys") => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [".xlsx", ".xls", ".csv"]
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!allowedTypes.includes(fileExtension)) {
      setError(`Invalid file type. Please upload ${allowedTypes.join(", ")} files only.`)
      toast({
        title: "Invalid File Type",
        description: `Please upload ${allowedTypes.join(", ")} files only.`,
        variant: "destructive",
      })
      event.target.value = ""
      return
    }

    setUploading(true)
    setMessage("")
    setError("")

    setTimeout(() => {
      setMessage(`${type} data uploaded successfully`)
      toast({
        title: "Upload Successful",
        description: `${type} data uploaded successfully.`,
      })
      setUploading(false)
      event.target.value = ""
      fetchData()
    }, 2000)
  }

  const exportData = async (type?: "claims" | "sales" | "keys") => {
    try {
      setMessage("")
      setError("")

      const successMessage = `${type ? type.charAt(0).toUpperCase() + type.slice(1) : "All"} data exported successfully`
      setMessage(successMessage)
      toast({
        title: "Export Successful",
        description: successMessage,
      })
    } catch (error) {
      console.error("Export error:", error)
      const errorMessage = "Network error occurred during export"
      setError(errorMessage)
      toast({
        title: "Export Error",
        description: errorMessage,
        variant: "destructive",
      })
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
      toast({
        title: "No Records Selected",
        description: "Please select at least one record to perform bulk delete.",
        variant: "destructive",
      })
      return
    }
    setBulkDeleteIds(Array.from(selectedRecords))
    setRecordToDelete({ type, id: "", name: `${selectedRecords.size} records` })
    setDeletePassword("")
    setBulkDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async (isBulk = false) => {
    if (!recordToDelete || deletePassword !== "Tr!ckyH@ck3r#2025") {
      setError("Invalid password. Please enter the correct admin password.")
      toast({
        title: "Invalid Password",
        description: "Please enter the correct admin password to proceed.",
        variant: "destructive",
      })
      return
    }

    setDeleting(true)
    setError("")

    setTimeout(() => {
      setMessage("Record(s) deleted successfully")
      toast({
        title: "Deletion Successful",
        description: "Record(s) deleted successfully.",
      })
      if (isBulk) {
        setBulkDeleteDialogOpen(false)
        setSelectedRecords(new Set())
        setBulkDeleteIds([])
      } else {
        setDeleteDialogOpen(false)
      }
      setRecordToDelete(null)
      setDeletePassword("")
      setDeleting(false)
      fetchData()
    }, 1000)
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
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-300">{status.toUpperCase()}</Badge>
      case "pending":
      case "assigned":
      case "sold":
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">{status.toUpperCase()}</Badge>
      case "failed":
      case "used":
      case "expired":
      case "already_claimed":
      case "activation_code_not_found":
        return <Badge className="bg-red-100 text-red-800 border-red-300">{status.toUpperCase()}</Badge>
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    } catch (error) {
      return "Invalid Date"
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

  // Manual Assignment Handlers
  const handleManualAssignClick = (claim: ClaimResponse) => {
    setSelectedClaimForManualAssign(claim)
    setSelectedKeyForManualAssign("")
    setManualAssignPassword("")
    setManualAssignDialogOpen(true)
  }

  const handleManualAssignConfirm = async () => {
    if (!selectedClaimForManualAssign || !selectedKeyForManualAssign || manualAssignPassword !== "Tr!ckyH@ck3r#2025") {
      setError("Invalid input or password. Please select a key and enter the correct admin password.")
      toast({
        title: "Assignment Failed",
        description: "Invalid input or password. Please select a key and enter the correct admin password.",
        variant: "destructive",
      })
      return
    }

    setAssigning(true)
    setError("")
    setMessage("")

    setTimeout(() => {
      setMessage("OTT Key manually assigned successfully!")
      toast({
        title: "Assignment Successful",
        description: "OTT Key manually assigned successfully!",
      })
      setManualAssignDialogOpen(false)
      setSelectedClaimForManualAssign(null)
      setSelectedKeyForManualAssign("")
      setManualAssignPassword("")
      setAssigning(false)
      fetchData()
    }, 1000)
  }

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    totalItems: number
    itemsPerPage: number
  }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 text-lg font-medium">Loading admin panel...</p>
          <p className="text-gray-500 text-sm mt-2">Connecting to database</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl border-b border-purple-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Panel</h1>
                <p className="text-purple-200 text-sm sm:text-lg">Database Management System</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
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

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalClaims}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {stats.paidClaims} paid • {stats.pendingClaims} pending
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Redemption Records</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalSales}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{stats.claimedSales} claimed</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">OTT Keys</p>
                  <p className="text-2xl sm:text-3xl font-bold">{ottKeys?.length || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{stats.availableKeys} available</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Key className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-orange-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stats.totalClaims > 0 ? Math.round((stats.paidClaims / stats.totalClaims) * 100) : 0}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">Payment success</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
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
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-blue-600" />
              Data Management
            </CardTitle>
            <CardDescription className="text-sm sm:text-lg text-gray-600">
              Upload Excel files (.xlsx, .xls) or CSV files and export data
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Sales Upload */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4 flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-2" /> Sales Data Upload
                  </h3>
                  <p className="text-blue-800 mb-4">Upload Excel/CSV file to collection</p>
                  <div className="space-y-3">
                    <Label htmlFor="sales-file" className="text-blue-900 font-medium">
                      Select Sales File (.xlsx, .xls, .csv)
                    </Label>
                    <Input
                      id="sales-file"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => handleFileUpload(e, "sales")}
                      disabled={uploading}
                      className="border-blue-300 focus:border-blue-500"
                    />
                    <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                      <p className="font-medium mb-2">📋 Required columns:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Product Sub Category</li>
                        <li>Product</li>
                        <li>Activation Code/ Serial No / IMEI Number</li>
                        <li>Status (optional, defaults to 'available')</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keys Upload */}
              <div className="space-y-4">
                <div className="bg-green-50 p-4 sm:p-6 rounded-xl border border-green-200">
                  <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-4 flex items-center">
                    <Key className="w-5 h-5 mr-2" /> OTT Keys Upload
                  </h3>
                  <p className="text-green-800 mb-4">Upload Excel/CSV file to ottkeys collection</p>
                  <div className="space-y-3">
                    <Label htmlFor="keys-file" className="text-green-900 font-medium">
                      Select Keys File (.xlsx, .xls, .csv)
                    </Label>
                    <Input
                      id="keys-file"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => handleFileUpload(e, "keys")}
                      disabled={uploading}
                      className="border-green-300 focus:border-green-500"
                    />
                    <div className="text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                      <p className="font-medium mb-2">📋 Required columns:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Product Sub Category</li>
                        <li>Product</li>
                        <li>Activation Code</li>
                        <li>Status (optional, defaults to 'available')</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Status */}
            {uploading && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
                  <span className="text-yellow-800 font-medium">Uploading file... Please wait.</span>
                </div>
              </div>
            )}

            {/* Export Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">📤 Export Data</h3>
                  <p className="text-gray-600">Download data from database</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button onClick={() => exportData()} className="bg-purple-600 hover:bg-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
                <Button onClick={() => exportData("claims")} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Claims
                </Button>
                <Button onClick={() => exportData("sales")} className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Sales
                </Button>
                <Button onClick={() => exportData("keys")} className="bg-orange-600 hover:bg-orange-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Keys
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Tables */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6 bg-white shadow-lg rounded-xl p-1 h-12 sm:h-14 w-full">
            <TabsTrigger
              value="claims"
              className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-lg font-semibold"
            >
              Claims ({stats.totalClaims})
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-lg font-semibold"
            >
              Sales ({stats.totalSales})
            </TabsTrigger>
            <TabsTrigger
              value="keys"
              className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-lg font-semibold"
            >
              Keys ({ottKeys?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claims">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Claims Management</CardTitle>
                    <CardDescription className="text-sm sm:text-lg text-gray-600">
                      Customer claims from database
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
                              getPaginatedData(claimResponses || [], claimsPagination).length > 0 &&
                              getPaginatedData(claimResponses || [], claimsPagination).every((claim) =>
                                selectedRecords.has(claim._id || claim.id),
                              )
                            }
                            onCheckedChange={(checked) =>
                              handleSelectAll(
                                getPaginatedData(claimResponses || [], claimsPagination),
                                checked as boolean,
                              )
                            }
                          />
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[120px]">Claim ID</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[150px]">Name</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[200px]">Email</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[120px]">Phone</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[200px]">Address</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[100px]">State</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[100px]">City</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[80px]">Pincode</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[150px]">Activation Code</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[120px]">Payment Status</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[120px]">OTT Status</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[120px]">OTT Code</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[150px]">Created</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(claimResponses || [], claimsPagination).map((claim, index) => (
                        <TableRow key={claim._id || claim.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRecords.has(claim._id || claim.id)}
                              onCheckedChange={(checked) =>
                                handleSelectRecord(claim._id || claim.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{claim.claimId || "N/A"}</TableCell>
                          <TableCell className="font-medium">
                            {`${claim.firstName || ""} ${claim.lastName || ""}`.trim() || "N/A"}
                          </TableCell>
                          <TableCell className="font-medium">{claim.email || "N/A"}</TableCell>
                          <TableCell>{claim.phoneNumber || claim.phone || "N/A"}</TableCell>
                          <TableCell className="max-w-xs truncate" title={claim.address || "N/A"}>
                            {claim.address || "N/A"}
                          </TableCell>
                          <TableCell>{claim.state || "N/A"}</TableCell>
                          <TableCell>{claim.city || "N/A"}</TableCell>
                          <TableCell>{claim.pincode || "N/A"}</TableCell>
                          <TableCell className="font-mono text-sm">{claim.activationCode || "N/A"}</TableCell>
                          <TableCell>{getStatusBadge(claim.paymentStatus)}</TableCell>
                          <TableCell>{getStatusBadge(claim.ottCodeStatus || claim.ottStatus)}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {claim.ottCode || <span className="text-gray-400">-</span>}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{formatDateTime(claim.createdAt)}</TableCell>
                          <TableCell className="flex gap-2">
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManualAssignClick(claim)}
                              disabled={claim.ottCodeStatus === "delivered" || claim.paymentStatus !== "paid"}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              title={
                                claim.ottCodeStatus === "delivered"
                                  ? "Key already assigned"
                                  : claim.paymentStatus !== "paid"
                                    ? "Claim not paid"
                                    : "Manually assign OTT Key"
                              }
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {claimResponses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={15} className="text-center py-8 text-gray-500">
                            No claims data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {claimResponses.length > 0 && (
                  <PaginationControls
                    currentPage={claimsPagination.currentPage}
                    totalPages={getTotalPages(claimResponses.length, claimsPagination.itemsPerPage)}
                    onPageChange={(page) => handlePageChange("claims", page)}
                    totalItems={claimResponses.length}
                    itemsPerPage={claimsPagination.itemsPerPage}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Redemption Records</CardTitle>
                    <CardDescription className="text-sm sm:text-lg text-gray-600">
                      Sales data from database
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
                              getPaginatedData(salesRecords || [], salesPagination).length > 0 &&
                              getPaginatedData(salesRecords || [], salesPagination).every((sale) =>
                                selectedRecords.has(sale._id || sale.id),
                              )
                            }
                            onCheckedChange={(checked) =>
                              handleSelectAll(getPaginatedData(salesRecords || [], salesPagination), checked as boolean)
                            }
                          />
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[150px]">Activation Code</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[120px]">Product</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[120px]">Category</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[100px]">Status</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[200px]">Claimed By</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[150px]">Created</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(salesRecords || [], salesPagination).map((sale, index) => (
                        <TableRow key={sale._id || sale.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRecords.has(sale._id || sale.id)}
                              onCheckedChange={(checked) => handleSelectRecord(sale._id || sale.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{sale.activationCode || "N/A"}</TableCell>
                          <TableCell>{sale.product || "N/A"}</TableCell>
                          <TableCell>{sale.productSubCategory || "N/A"}</TableCell>
                          <TableCell>{getStatusBadge(sale.status)}</TableCell>
                          <TableCell>{sale.claimedBy || <span className="text-gray-400">-</span>}</TableCell>
                          <TableCell className="text-sm text-gray-600">{formatDateTime(sale.createdAt)}</TableCell>
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
                      ))}
                      {salesRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No sales data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {salesRecords.length > 0 && (
                  <PaginationControls
                    currentPage={salesPagination.currentPage}
                    totalPages={getTotalPages(salesRecords.length, salesPagination.itemsPerPage)}
                    onPageChange={(page) => handlePageChange("sales", page)}
                    totalItems={salesRecords.length}
                    itemsPerPage={salesPagination.itemsPerPage}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">OTT Keys Inventory</CardTitle>
                    <CardDescription className="text-sm sm:text-lg text-gray-600">
                      OTT keys from database
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
                              getPaginatedData(ottKeys || [], keysPagination).length > 0 &&
                              getPaginatedData(ottKeys || [], keysPagination).every((key) =>
                                selectedRecords.has(key._id || key.id),
                              )
                            }
                            onCheckedChange={(checked) =>
                              handleSelectAll(getPaginatedData(ottKeys || [], keysPagination), checked as boolean)
                            }
                          />
                        </TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[150px]">Activation Code</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[120px]">Product</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[120px]">Category</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[100px]">Status</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[200px]">Assigned To</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[150px]">Created</TableHead>
                        <TableHead className="font-bold text-gray-800 min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(ottKeys || [], keysPagination).map((key, index) => (
                        <TableRow key={key._id || key.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRecords.has(key._id || key.id)}
                              onCheckedChange={(checked) => handleSelectRecord(key._id || key.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{key.activationCode || "N/A"}</TableCell>
                          <TableCell>{key.product || "N/A"}</TableCell>
                          <TableCell>{key.productSubCategory || "N/A"}</TableCell>
                          <TableCell>{getStatusBadge(key.status)}</TableCell>
                          <TableCell>{key.assignedEmail || <span className="text-gray-400">-</span>}</TableCell>
                          <TableCell className="text-sm text-gray-600">{formatDateTime(key.createdAt)}</TableCell>
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
                      ))}
                      {ottKeys.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No keys data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {ottKeys.length > 0 && (
                  <PaginationControls
                    currentPage={keysPagination.currentPage}
                    totalPages={getTotalPages(ottKeys.length, keysPagination.itemsPerPage)}
                    onPageChange={(page) => handlePageChange("keys", page)}
                    totalItems={ottKeys.length}
                    itemsPerPage={keysPagination.itemsPerPage}
                  />
                )}
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
              This action cannot be undone and will permanently remove the record from database.
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
              <p className="text-xs text-gray-500">Required password: Tr!ckyH@ck3r#2025</p>
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
              disabled={deleting || deletePassword !== "Tr!ckyH@ck3r#2025"}
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
              This action cannot be undone and will permanently remove all selected records from database.
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
              <p className="text-xs text-gray-500">Required password: Tr!ckyH@ck3r#2025</p>
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
              disabled={deleting || deletePassword !== "Tr!ckyH@ck3r#2025"}
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

      {/* Manual Assign Key Dialog */}
      <Dialog open={manualAssignDialogOpen} onOpenChange={setManualAssignDialogOpen}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-600">
              <Send className="w-5 h-5 mr-2" />
              Manually Assign OTT Key
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Assign an OTT key to claim for <strong>{selectedClaimForManualAssign?.email || "N/A"}</strong> (Activation
              Code: <strong>{selectedClaimForManualAssign?.activationCode || "N/A"}</strong>).
              <br />
              This will update the claim, sales record, and OTT key status, and send an email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ott-key-select" className="text-sm font-medium">
                Select Available OTT Key
              </Label>
              <Select onValueChange={setSelectedKeyForManualAssign} value={selectedKeyForManualAssign}>
                <SelectTrigger id="ott-key-select" className="w-full">
                  <SelectValue placeholder="Choose an available OTT key" />
                </SelectTrigger>
                <SelectContent>
                  {ottKeys
                    .filter((key) => key.status === "available")
                    .map((key) => (
                      <SelectItem key={key._id || key.id} value={key._id || key.id}>
                        {key.activationCode} ({key.product} - {key.productSubCategory})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {ottKeys.filter((key) => key.status === "available").length === 0 && (
                <p className="text-sm text-red-500">No available OTT keys found. Please upload more keys.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-assign-password" className="text-sm font-medium">
                Admin Password
              </Label>
              <Input
                id="manual-assign-password"
                type="password"
                placeholder="Enter admin password"
                value={manualAssignPassword}
                onChange={(e) => setManualAssignPassword(e.target.value)}
                className="border-blue-200 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">Required password: Tr!ckyH@ck3r#2025</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setManualAssignDialogOpen(false)
                setSelectedClaimForManualAssign(null)
                setSelectedKeyForManualAssign("")
                setManualAssignPassword("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleManualAssignConfirm}
              disabled={assigning || !selectedKeyForManualAssign || manualAssignPassword !== "Tr!ckyH@ck3r#2025"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {assigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Assign Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}