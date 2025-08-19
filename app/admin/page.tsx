"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Users,
  Key,
  DollarSign,
  FileSpreadsheet,
  RefreshCw,
  Trash2,
  Send,
  SearchIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  PlusIcon,
  CheckIcon,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { XIcon } from "lucide-react"
import { AdminExportPanel } from "@/components/admin-export-panel"

// Reduced page size for better performance
const ITEMS_PER_PAGE = 10

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

interface Stats {
  totalClaims: number
  paidClaims: number
  pendingClaims: number
  failedClaims: number
  deliveredClaims: number
  totalSales: number
  availableSales: number
  claimedSales: number
  availableKeys: number
  assignedKeys: number
  usedKeys: number
  totalKeys: number
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
}

interface SortConfig {
  key: string
  direction: "asc" | "desc"
}

interface FilterConfig {
  paymentStatus: string
  ottStatus: string
  salesStatus: string
  keysStatus: string
  transactionsStatus: string
}

export default function AdminPage() {
  // Basic state
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("claims")
  const router = useRouter()

  // Data state - only store current page data
  const [currentData, setCurrentData] = useState<{
    claims: ClaimResponse[]
    sales: SalesRecord[]
    keys: OTTKey[]
    transactions: any[]
  }>({
    claims: [],
    sales: [],
    keys: [],
    transactions: [],
  })

  // Pagination state
  const [pagination, setPagination] = useState({
    claims: { page: 1, total: 0, totalPages: 0 },
    sales: { page: 1, total: 0, totalPages: 0 },
    keys: { page: 1, total: 0, totalPages: 0 },
    transactions: { page: 1, total: 0, totalPages: 0 },
  })

  // Search state
  const [searchTerm, setSearchTerm] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<FilterConfig>({
    paymentStatus: "all",
    ottStatus: "all",
    salesStatus: "all",
    keysStatus: "all",
    transactionsStatus: "all",
  })

  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  })

  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc",
  })

  // Stats state
  const [stats, setStats] = useState<Stats>({
    totalClaims: 0,
    paidClaims: 0,
    pendingClaims: 0,
    failedClaims: 0,
    deliveredClaims: 0,
    totalSales: 0,
    availableSales: 0,
    claimedSales: 0,
    availableKeys: 0,
    assignedKeys: 0,
    usedKeys: 0,
    totalKeys: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
  })

  // Dialog states
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<{ type: string; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Manual assignment states
  const [manualAssignDialogOpen, setManualAssignDialogOpen] = useState(false)
  const [selectedClaimForManualAssign, setSelectedClaimForManualAssign] = useState<ClaimResponse | null>(null)
  const [selectedKeyForManualAssign, setSelectedKeyForManualAssign] = useState<string>("")
  const [manualAssignPassword, setManualAssignPassword] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [availableKeys, setAvailableKeys] = useState<OTTKey[]>([])

  const [syncingTransactions, setSyncingTransactions] = useState(false)

  const [activationCodeStatus, setActivationCodeStatus] = useState<{
    isValid: boolean | null
    message: string
    isChecking: boolean
  }>({
    isValid: null,
    message: "",
    isChecking: false,
  })

  // Check authentication on mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Load initial data
    loadStats()
    loadCurrentTabData()
  }, [router])

  // Load data when tab changes
  useEffect(() => {
    loadCurrentTabData()
  }, [activeTab, sortConfig, filters, dateFilter])

  // Load stats (lightweight operation)
  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.warn("Failed to load stats:", error)
    }
  }

  const loadCurrentTabData = useCallback(
    async (page = 1, search = "") => {
      try {
        setLoading(true)
        setError("")

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          search: search,
          sortBy: sortConfig.key,
          order: sortConfig.direction,
          paymentStatus: filters.paymentStatus,
          ottStatus: filters.ottStatus,
          status:
            activeTab === "sales"
              ? filters.salesStatus
              : activeTab === "keys"
                ? filters.keysStatus
                : filters.transactionsStatus,
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
        })

        const endpoint = activeTab === "transactions" ? "/api/admin/razorpay-transactions" : `/api/admin/${activeTab}`

        const response = await fetch(`${endpoint}?${params}`)
        const data = await response.json()

        if (response.ok) {
          if (activeTab === "transactions") {
            setCurrentData((prev) => ({
              ...prev,
              transactions: data.data || [],
            }))
            setPagination((prev) => ({
              ...prev,
              transactions: {
                page: data.page || 1,
                total: data.total || 0,
                totalPages: data.totalPages || 0,
              },
            }))
          } else {
            setCurrentData((prev) => ({
              ...prev,
              [activeTab]: data.data || [],
            }))
            setPagination((prev) => ({
              ...prev,
              [activeTab]: {
                page: data.page || 1,
                total: data.total || 0,
                totalPages: data.totalPages || 0,
              },
            }))
          }
        } else {
          throw new Error(data.error || `Failed to fetch ${activeTab}`)
        }
      } catch (err: any) {
        console.error(`Error loading ${activeTab}:`, err)
        setError(err.message || `Failed to load ${activeTab}`)
      } finally {
        setLoading(false)
      }
    },
    [
      activeTab,
      sortConfig.key,
      sortConfig.direction,
      filters.paymentStatus,
      filters.ottStatus,
      filters.salesStatus,
      filters.keysStatus,
      filters.transactionsStatus,
      dateFilter.startDate,
      dateFilter.endDate,
    ],
  )

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadCurrentTabData(1, searchTerm)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, loadCurrentTabData])

  // Handle page change
  const handlePageChange = (page: number) => {
    console.log("[v0] Page change to:", page)
    setPagination((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab as keyof typeof prev], page },
    }))
    loadCurrentTabData(page, searchTerm)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchTerm("")
    // Reset sort to default
    setSortConfig({ key: "createdAt", direction: "desc" })
  }

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  // Handle filter change
  const handleFilterChange = (filterType: keyof FilterConfig, value: string) => {
    console.log("[v0] Filter change:", filterType, "=", value)
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
    setPagination((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab as keyof typeof prev], page: 1 },
    }))
    setTimeout(() => {
      loadCurrentTabData(1, searchTerm)
    }, 0)
  }

  const handleDateFilterChange = (field: "startDate" | "endDate", value: string) => {
    setDateFilter((prev) => {
      const newFilter = {
        ...prev,
        [field]: value,
      }

      // Trigger data reload when both dates are set or when clearing dates
      if ((newFilter.startDate && newFilter.endDate) || (!newFilter.startDate && !newFilter.endDate)) {
        setTimeout(() => {
          loadCurrentTabData(1, searchTerm)
        }, 100)
      }

      return newFilter
    })
  }

  const clearDateFilter = () => {
    setDateFilter({
      startDate: "",
      endDate: "",
    })
    setTimeout(() => {
      loadCurrentTabData(1, searchTerm)
    }, 100)
  }

  // Handle sort change
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-blue-600" />
    )
  }

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "sales" | "keys") => {
    const file = event.target.files?.[0]
    if (!file) return

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

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`/api/admin/upload-${type}`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage(result.message || `${type} data uploaded successfully`)
        toast({
          title: "Upload Successful",
          description: result.message || `${type} data uploaded successfully.`,
        })
        // Refresh current data and stats
        loadStats()
        loadCurrentTabData()
      } else {
        const errorMessage = result.error || "Upload failed"
        setError(errorMessage)
        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = "Network error occurred during upload"
      setError(errorMessage)
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const [exporting, setExporting] = useState(false)
  const [exportingTable, setExportingTable] = useState<string | null>(null)

  const exportData = async (tableType?: string) => {
    try {
      const exportType = tableType || activeTab
      setExporting(true)
      if (tableType) {
        setExportingTable(tableType)
      }
      setMessage("")
      setError("")

      let endpoint = ""
      let filename = ""
      let headers: string[] = []

      if (exportType === "claims") {
        endpoint = "/api/admin/claims"
        filename = "claims_export"
        headers = [
          "Claim ID",
          "First Name",
          "Last Name",
          "Email",
          "Phone Number",
          "Street Address",
          "Address Line 2",
          "State",
          "City",
          "Pincode",
          "Activation Code",
          "Payment Status",
          "OTT Status",
          "OTT Code",
          "Payment ID",
          "Razorpay Order ID",
          "Amount",
          "Created At",
          "Updated At",
        ]
      } else if (exportType === "sales") {
        endpoint = "/api/admin/sales"
        filename = "sales_records_export"
        headers = [
          "ID",
          "Activation Code",
          "Product",
          "Product Sub Category",
          "Status",
          "Claimed By",
          "Claimed Date",
          "Created At",
          "Updated At",
        ]
      } else if (exportType === "keys") {
        endpoint = "/api/admin/keys"
        filename = "ott_keys_export"
        headers = [
          "ID",
          "Activation Code",
          "Product",
          "Product Sub Category",
          "Status",
          "Assigned Email",
          "Assigned Date",
          "Expiry Date",
          "Duration",
          "Created At",
          "Updated At",
        ]
      } else if (exportType === "transactions") {
        endpoint = "/api/admin/razorpay-transactions"
        filename = "razorpay_transactions_export"
        headers = [
          "Payment ID",
          "Order ID",
          "Amount",
          "Currency",
          "Status",
          "Method",
          "Email",
          "Contact",
          "Description",
          "Created At",
          "Captured At",
          "Fee",
          "Tax",
          "Error Code",
          "Error Description",
        ]
      }

      const params = new URLSearchParams({
        limit: "10000", // Large limit to get all records
        search: searchTerm,
        sortBy: sortConfig.key,
        order: sortConfig.direction,
        paymentStatus: filters.paymentStatus,
        ottStatus: filters.ottStatus,
        status:
          exportType === "sales"
            ? filters.salesStatus
            : exportType === "keys"
              ? filters.keysStatus
              : filters.transactionsStatus,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
      })

      const response = await fetch(`${endpoint}?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data for export")
      }

      const exportData = data.data || []

      if (exportData.length === 0) {
        setMessage("No data available to export")
        return
      }

      let csvData: string[][] = []

      if (exportType === "claims") {
        csvData = exportData.map((item: any) => [
          item.claimId || "",
          item.firstName || "",
          item.lastName || "",
          item.email || "",
          item.phoneNumber || "",
          item.streetAddress || "",
          item.addressLine2 || "",
          item.state || "",
          item.city || "",
          item.pincode || "",
          item.activationCode || "",
          item.paymentStatus || "",
          item.ottStatus || "",
          item.ottCode || "",
          item.paymentId || "",
          item.razorpayOrderId || "",
          item.amount?.toString() || "",
          item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "",
          item.updatedAt ? new Date(item.updatedAt).toLocaleString("en-IN") : "",
        ])
      } else if (exportType === "sales") {
        csvData = exportData.map((item: any) => [
          item.id || item._id || "",
          item.activationCode || "",
          item.product || "",
          item.productSubCategory || "",
          item.status || "",
          item.claimedBy || "",
          item.claimedDate ? new Date(item.claimedDate).toLocaleString("en-IN") : "",
          item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "",
          item.updatedAt ? new Date(item.updatedAt).toLocaleString("en-IN") : "",
        ])
      } else if (exportType === "keys") {
        csvData = exportData.map((item: any) => [
          item.id || item._id || "",
          item.activationCode || "",
          item.product || "",
          item.productSubCategory || "",
          item.status || "",
          item.assignedEmail || "",
          item.assignedDate ? new Date(item.assignedDate).toLocaleString("en-IN") : "",
          item.expiryDate ? new Date(item.expiryDate).toLocaleString("en-IN") : "",
          item.duration || "",
          item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "",
          item.updatedAt ? new Date(item.updatedAt).toLocaleString("en-IN") : "",
        ])
      } else if (exportType === "transactions") {
        csvData = exportData.map((item: any) => [
          item.id || "",
          item.order_id || "",
          (item.amount / 100).toString() || "", // Convert paise to rupees
          item.currency || "",
          item.status || "",
          item.method || "",
          item.email || "",
          item.contact || "",
          item.description || "",
          item.created_at ? new Date(item.created_at * 1000).toLocaleString("en-IN") : "",
          item.captured_at ? new Date(item.captured_at * 1000).toLocaleString("en-IN") : "",
          item.fee ? (item.fee / 100).toString() : "",
          item.tax ? (item.tax / 100).toString() : "",
          item.error_code || "",
          item.error_description || "",
        ])
      }

      // Create CSV content
      const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

      // Download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setMessage(`Successfully exported ${exportData.length} ${exportType} records`)
    } catch (err: any) {
      console.error("Export error:", err)
      setError(err.message || "Failed to export data")
    } finally {
      setExporting(false)
      setExportingTable(null)
    }
  }

  const exportAllData = async () => {
    try {
      setExporting(true)
      setMessage("")
      setError("")

      const tables = ["claims", "sales", "keys", "transactions"]
      const allData: any[] = []
      let totalRecords = 0

      for (const table of tables) {
        let endpoint = ""
        let headers: string[] = []

        if (table === "claims") {
          endpoint = "/api/admin/claims"
          headers = [
            "Table",
            "Claim ID",
            "First Name",
            "Last Name",
            "Email",
            "Phone Number",
            "Street Address",
            "Address Line 2",
            "State",
            "City",
            "Pincode",
            "Activation Code",
            "Payment Status",
            "OTT Status",
            "OTT Code",
            "Payment ID",
            "Razorpay Order ID",
            "Amount",
            "Created At",
            "Updated At",
          ]
        } else if (table === "sales") {
          endpoint = "/api/admin/sales"
          headers = [
            "Table",
            "ID",
            "Activation Code",
            "Product",
            "Product Sub Category",
            "Status",
            "Claimed By",
            "Claimed Date",
            "Created At",
            "Updated At",
          ]
        } else if (table === "keys") {
          endpoint = "/api/admin/keys"
          headers = [
            "Table",
            "ID",
            "Activation Code",
            "Product",
            "Product Sub Category",
            "Status",
            "Assigned Email",
            "Assigned Date",
            "Expiry Date",
            "Duration",
            "Created At",
            "Updated At",
          ]
        } else if (table === "transactions") {
          endpoint = "/api/admin/razorpay-transactions"
          headers = [
            "Table",
            "Payment ID",
            "Order ID",
            "Amount",
            "Currency",
            "Status",
            "Method",
            "Email",
            "Contact",
            "Description",
            "Created At",
            "Captured At",
            "Fee",
            "Tax",
            "Error Code",
            "Error Description",
          ]
        }

        const params = new URLSearchParams({
          limit: "10000",
          search: "",
          sortBy: "createdAt",
          order: "desc",
        })

        const response = await fetch(`${endpoint}?${params}`)
        const data = await response.json()

        if (response.ok && data.data) {
          const tableData = data.data.map((item: any) => {
            if (table === "claims") {
              return [
                "Claims",
                item.claimId || "",
                item.firstName || "",
                item.lastName || "",
                item.email || "",
                item.phoneNumber || "",
                item.streetAddress || "",
                item.addressLine2 || "",
                item.state || "",
                item.city || "",
                item.pincode || "",
                item.activationCode || "",
                item.paymentStatus || "",
                item.ottStatus || "",
                item.ottCode || "",
                item.paymentId || "",
                item.razorpayOrderId || "",
                item.amount?.toString() || "",
                item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "",
                item.updatedAt ? new Date(item.updatedAt).toLocaleString("en-IN") : "",
              ]
            } else if (table === "sales") {
              return [
                "Sales Records",
                item.id || item._id || "",
                item.activationCode || "",
                item.product || "",
                item.productSubCategory || "",
                item.status || "",
                item.claimedBy || "",
                item.claimedDate ? new Date(item.claimedDate).toLocaleString("en-IN") : "",
                item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "",
                item.updatedAt ? new Date(item.updatedAt).toLocaleString("en-IN") : "",
              ]
            } else if (table === "keys") {
              return [
                "OTT Keys",
                item.id || item._id || "",
                item.activationCode || "",
                item.product || "",
                item.productSubCategory || "",
                item.status || "",
                item.assignedEmail || "",
                item.assignedDate ? new Date(item.assignedDate).toLocaleString("en-IN") : "",
                item.expiryDate ? new Date(item.expiryDate).toLocaleString("en-IN") : "",
                item.duration || "",
                item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "",
                item.updatedAt ? new Date(item.updatedAt).toLocaleString("en-IN") : "",
              ]
            } else if (table === "transactions") {
              return [
                "Transactions",
                item.id || "",
                item.order_id || "",
                (item.amount / 100).toString() || "",
                item.currency || "",
                item.status || "",
                item.method || "",
                item.email || "",
                item.contact || "",
                item.description || "",
                item.created_at ? new Date(item.created_at * 1000).toLocaleString("en-IN") : "",
                item.captured_at ? new Date(item.captured_at * 1000).toLocaleString("en-IN") : "",
                item.fee ? (item.fee / 100).toString() : "",
                item.tax ? (item.tax / 100).toString() : "",
                item.error_code || "",
                item.error_description || "",
              ]
            }
            return []
          })

          if (allData.length === 0) {
            // Add headers for the first table
            allData.push([
              "Table",
              "ID/Claim ID",
              "Code/Name",
              "Product/Last Name",
              "Category/Email",
              "Status/Phone",
              "Email/Address",
              "Date/Address2",
              "Expiry/State",
              "Duration/City",
              "Created/Pincode",
              "Updated/Activation",
              "Payment Status",
              "OTT Status",
              "OTT Code",
              "Payment ID",
              "Order ID",
              "Amount",
              "Created At",
              "Updated At",
            ])
          }

          allData.push(...tableData)
          totalRecords += tableData.length
        }
      }

      if (allData.length <= 1) {
        setMessage("No data available to export")
        return
      }

      // Create CSV content
      const csvContent = allData.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

      // Download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `all_tables_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setMessage(`Successfully exported ${totalRecords} records from all tables`)
    } catch (err: any) {
      console.error("Export all error:", err)
      setError(err.message || "Failed to export all data")
    } finally {
      setExporting(false)
    }
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [claims, setClaims] = useState<ClaimResponse[]>([])
  const [totalPages, setTotalPages] = useState(1)

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        paymentStatus: filters.paymentStatus,
        ottStatus: filters.ottStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      })

      // Add date filters if they exist
      if (dateFilter.startDate) {
        params.append("startDate", dateFilter.startDate)
      }
      if (dateFilter.endDate) {
        params.append("endDate", dateFilter.endDate)
      }

      const response = await fetch(`/api/admin/claims?${params}`)
      const data = await response.json()

      if (data.data) {
        setClaims(data.data)
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error("Error fetching claims:", error)
      setClaims([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, filters.paymentStatus, filters.ottStatus, dateFilter.startDate, dateFilter.endDate])

  useEffect(() => {
    fetchClaims()
  }, [fetchClaims, dateFilter.startDate, dateFilter.endDate])

  const [manualClaimDialogOpen, setManualClaimDialogOpen] = useState(false)
  const [manualClaimData, setManualClaimData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
    activationCode: "",
    paymentStatus: "",
    paymentId: "",
    razorpayId: "",
    adminPassword: "",
  })
  const [manualClaimLoading, setManualClaimLoading] = useState(false)

  const validateActivationCode = async (code: string) => {
    if (!code.trim()) {
      setActivationCodeStatus({
        isValid: null,
        message: "",
        isChecking: false,
      })
      return
    }

    setActivationCodeStatus((prev) => ({ ...prev, isChecking: true }))

    try {
      const response = await fetch("/api/admin/validate-activation-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activationCode: code }),
      })

      const result = await response.json()

      setActivationCodeStatus({
        isValid: result.isValid,
        message: result.message,
        isChecking: false,
      })
    } catch (error) {
      setActivationCodeStatus({
        isValid: false,
        message: "Error validating activation code",
        isChecking: false,
      })
    }
  }

  const handleManualClaimSubmit = async () => {
    if (
      !manualClaimData.firstName ||
      !manualClaimData.email ||
      !manualClaimData.activationCode ||
      !manualClaimData.adminPassword ||
      !manualClaimData.paymentStatus
    ) {
      setError("Please fill in all required fields (Name, Email, Activation Code, Payment Status, Admin Password)")
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (activationCodeStatus.isValid !== true) {
      setError("Please enter a valid and available activation code")
      toast({
        title: "Invalid Activation Code",
        description: "The activation code is not valid or already claimed",
        variant: "destructive",
      })
      return
    }

    setManualClaimLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/admin/manual-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: `${manualClaimData.firstName} ${manualClaimData.lastName}`.trim(),
          email: manualClaimData.email,
          phone: manualClaimData.phoneNumber,
          activationCode: manualClaimData.activationCode,
          paymentStatus: manualClaimData.paymentStatus,
          paymentId: manualClaimData.paymentId,
          razorpayId: manualClaimData.razorpayId,
          adminPassword: manualClaimData.adminPassword,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || "Manual claim processed successfully!")
        toast({
          title: "Manual Claim Successful",
          description: result.message || "Manual claim processed successfully!",
        })
        setManualClaimDialogOpen(false)
        setManualClaimData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          streetAddress: "",
          city: "",
          state: "",
          pincode: "",
          activationCode: "",
          paymentStatus: "",
          paymentId: "",
          razorpayId: "",
          adminPassword: "",
        })
        // Refresh data
        loadStats()
        loadCurrentTabData()
      } else {
        setError(result.error || "Manual claim failed.")
        toast({
          title: "Manual Claim Failed",
          description: result.error || "Manual claim failed.",
        })
      }
    } catch (error) {
      console.error("Manual claim error:", error)
      const errorMessage = "Network error occurred during manual claim"
      setError(errorMessage)
      toast({
        title: "Manual Claim Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setManualClaimLoading(false)
    }
  }

  const SortableHeader = ({ sortKey, children }: { sortKey: string; children: React.ReactNode }) => {
    const handleSortClick = () => {
      handleSort(sortKey)
    }

    return (
      <TableHead className="font-bold text-gray-800 cursor-pointer select-none" onClick={handleSortClick}>
        <div className="flex items-center">
          {children}
          {getSortIcon(sortKey)}
        </div>
      </TableHead>
    )
  }

  const getStatusBadge = (status: string) => {
    let color = "gray"
    if (status === "paid" || status === "captured" || status === "available") color = "green"
    if (status === "pending" || status === "authorized") color = "yellow"
    if (status === "failed" || status === "refunded") color = "red"

    return (
      <Badge className={`bg-${color}-100 text-${color}-800 border border-${color}-400`}>{status.toUpperCase()}</Badge>
    )
  }

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "-"
    }
  }

  const handleDeleteClick = (type: string, id: string, name: string) => {
    setRecordToDelete({ type, id, name })
    setDeleteDialogOpen(true)
  }

  const handleManualAssignClick = (claim: ClaimResponse) => {
    setSelectedClaimForManualAssign(claim)
    setManualAssignDialogOpen(true)
    loadAvailableKeys()
  }

  const loadAvailableKeys = async () => {
    try {
      const response = await fetch("/api/admin/keys?limit=1000&status=available")
      const data = await response.json()
      if (response.ok) {
        setAvailableKeys(data.data)
      } else {
        console.error("Failed to load available keys:", data.error)
        toast({
          title: "Error Loading Keys",
          description: data.error || "Failed to load available keys.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading available keys:", error)
      toast({
        title: "Error Loading Keys",
        description: "Failed to load available keys due to a network error.",
        variant: "destructive",
      })
    }
  }

  const handleManualAssignSubmit = async () => {
    if (!selectedClaimForManualAssign || !selectedKeyForManualAssign || !manualAssignPassword) {
      setError("Please select a claim, a key, and enter the admin password.")
      toast({
        title: "Missing Information",
        description: "Please select a claim, a key, and enter the admin password.",
        variant: "destructive",
      })
      return
    }

    setAssigning(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/admin/manual-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: selectedClaimForManualAssign._id || selectedClaimForManualAssign.id,
          ottKeyId: selectedKeyForManualAssign,
          adminPassword: manualAssignPassword,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || "Key assigned successfully!")
        toast({
          title: "Key Assigned",
          description: result.message || "Key assigned successfully!",
        })
        setManualAssignDialogOpen(false)
        setSelectedClaimForManualAssign(null)
        setSelectedKeyForManualAssign("")
        setManualAssignPassword("")
        // Refresh data
        loadStats()
        loadCurrentTabData()
      } else {
        setError(result.error || "Key assignment failed.")
        toast({
          title: "Assignment Failed",
          description: result.error || "Key assignment failed.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Key assignment error:", error)
      setError("Network error occurred during key assignment")
      toast({
        title: "Assignment Error",
        description: "Network error occurred during key assignment",
        variant: "destructive",
      })
    } finally {
      setAssigning(false)
    }
  }

  const syncTransactions = async () => {
    setSyncingTransactions(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/admin/sync-razorpay-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || "Transactions synced successfully!")
        toast({
          title: "Transactions Synced",
          description: result.message || "Transactions synced successfully!",
        })
        // Refresh data
        loadStats()
        loadCurrentTabData()
      } else {
        setError(result.error || "Transaction sync failed.")
        toast({
          title: "Sync Failed",
          description: result.error || "Transaction sync failed.",
        })
      }
    } catch (error) {
      console.error("Transaction sync error:", error)
      setError("Network error occurred during transaction sync")
      toast({
        title: "Sync Error",
        description: "Network error occurred during transaction sync",
        variant: "destructive",
      })
    } finally {
      setSyncingTransactions(false)
    }
  }

  const formatAmount = (amount: number) => {
    return (amount / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    })
  }

  const formatDateTimeIST = (timestamp: number | undefined) => {
    if (!timestamp) return "-"

    const date = new Date(timestamp * 1000) // Convert seconds to milliseconds
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  
  const PaginationControls = () => {
    const currentPage = pagination[activeTab as keyof typeof pagination].page
    const totalPages = pagination[activeTab as keyof typeof pagination].totalPages
    const total = pagination[activeTab as keyof typeof pagination].total

    const handlePreviousPage = () => {
      if (currentPage > 1) {
        handlePageChange(currentPage - 1)
      }
    }

    const handleNextPage = () => {
      if (currentPage < totalPages) {
        handlePageChange(currentPage + 1)
      }
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || totalPages <= 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages <= 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.max(1, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, total)}</span> of{" "}
              <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || totalPages <= 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                disabled
              >
                Page {currentPage} of {Math.max(1, totalPages)}
              </Button>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages <= 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    )
  }
  return (
    <SidebarProvider>
      <div className="h-screen w-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl border-b border-purple-200 flex-shrink-0">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <SidebarTrigger className="text-white hover:bg-white/20 p-2 rounded-lg" />
                  <div className="flex items-center space-x-2 sm:space-x-3">
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
                      <h1 className="text-xl sm:text-3xl font-bold text-white">Admin Panel</h1>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Button
                    onClick={() => {
                      loadStats()
                      loadCurrentTabData()
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Refresh Data</span>
                    <span className="sm:hidden">Refresh</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">


              {/* Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <Card className="shadow-lg border-l-4 border-l-blue-500">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Total Claims</p>
                        <p className="text-lg sm:text-3xl font-bold text-gray-900">{stats.totalClaims}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {stats.paidClaims} paid • {stats.pendingClaims} pending
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                        <Users className="w-4 h-4 sm:w-8 sm:h-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-l-4 border-l-green-500">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Redemption Records</p>
                        <p className="text-lg sm:text-3xl font-bold text-gray-900">{stats.totalSales}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {stats.availableSales} available • {stats.claimedSales} claimed
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                        <DollarSign className="w-4 h-4 sm:w-8 sm:h-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-l-4 border-l-purple-500">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">OTT Keys</p>
                        <p className="text-lg sm:text-3xl font-bold">{stats.totalKeys}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {Number(stats?.totalKeys || 0) - Number(stats?.assignedKeys || 0)} available •{" "}
                          {stats?.assignedKeys || 0} assigned
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                        <Key className="w-4 h-4 sm:w-8 sm:h-8 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-l-4 border-l-orange-500">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-lg sm:text-3xl font-bold text-gray-900">
                          {stats.totalClaims > 0 ? Math.round((stats.paidClaims / stats.totalClaims) * 100) : 0}%
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Payment success</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
                        <CheckCircle className="w-4 h-4 sm:w-8 sm:h-8 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Messages */}
              {message && (
                <Alert className="mb-3 sm:mb-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-3 sm:mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* File Upload Section */}
              <Card className="mb-4 sm:mb-8 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg border-b">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                    Data Management
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-lg text-gray-600">
                    Upload Excel files (.xlsx, .xls) or CSV files and export data from systech_ott_platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                    {/* Sales Upload */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                        <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center">
                          <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Activation Code Upload
                        </h3>
                        <p className="text-blue-800 mb-3 sm:mb-4 text-sm">Upload Excel/CSV file to collection</p>
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="sales-file" className="text-blue-900 font-medium text-xs sm:text-sm">
                            Select Sales File (.xlsx, .xls, .csv)
                          </Label>
                          <Input
                            id="sales-file"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => handleFileUpload(e, "sales")}
                            disabled={uploading}
                            className="border-blue-300 focus:border-blue-500 text-xs"
                          />
                          <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                            <p className="font-medium mb-2">📋 Required columns:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Product Sub Category</li>
                              <li>Product</li>
                              <li>Activation Code</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keys Upload */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-green-50 p-4 sm:p-6 rounded-xl border border-green-200">
                        <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-3 sm:mb-4 flex items-center">
                          <Key className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> OTT Keys Upload
                        </h3>
                        <p className="text-green-800 mb-3 sm:mb-4 text-sm">
                          Upload Excel/CSV file to ottkeys collection
                        </p>
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="keys-file" className="text-green-900 font-medium text-xs sm:text-sm">
                            Select Keys File (.xlsx, .xls, .csv)
                          </Label>
                          <Input
                            id="keys-file"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => handleFileUpload(e, "keys")}
                            disabled={uploading}
                            className="border-green-300 focus:border-green-500 text-xs"
                          />
                          <div className="text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                            <p className="font-medium mb-2">📋 Required columns:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Product Sub Category</li>
                              <li>Product</li>
                              <li>Activation Code</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Status */}
                  {uploading && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-yellow-600 mr-2 sm:mr-3"></div>
                        <span className="text-yellow-800 font-medium text-sm">Uploading file... Please wait.</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <AdminExportPanel
                onExport={exportData}
                onExportAll={exportAllData}
                exporting={exporting}
                exportingTable={exportingTable}
              />

              {/* Data Tables */}
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-4 mb-4 sm:mb-6 bg-white shadow-lg rounded-xl p-1 h-12 sm:h-14">
                  <TabsTrigger
                    value="claims"
                    className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-lg font-semibold"
                  >
                    <span className="hidden sm:inline">Claims ({stats.totalClaims})</span>
                    <span className="sm:hidden">Claims</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="sales"
                    className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-lg font-semibold"
                  >
                    <span className="hidden sm:inline">Redemption ({stats.totalSales})</span>
                    <span className="sm:hidden">Sales</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="keys"
                    className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-lg font-semibold"
                  >
                    <span className="hidden sm:inline">OTT Keys ({stats.totalKeys})</span>
                    <span className="sm:hidden">Keys</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="transactions"
                    className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm sm:text-lg font-semibold"
                  >
                    <span className="hidden sm:inline">Transactions </span>
                    <span className="sm:hidden">Transactions</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="claims">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                            Claims Management
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-lg text-gray-600">
                            Customer claims from systech_ott_platform.claims collection
                          </CardDescription>
                        </div>
                      </div>

                      {/* Search and Filters */}
                      <div className="mt-4 sm:mt-6 space-y-4">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="flex-1 relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Search by name, email, phone, activation code..."
                              value={searchTerm}
                              onChange={(e) => handleSearchChange(e.target.value)}
                              className="pl-10 text-sm"
                            />
                          </div>
                          {searchLoading && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                            <Input
                              type="date"
                              value={dateFilter.startDate}
                              onChange={(e) => handleDateFilterChange("startDate", e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">End Date</Label>
                            <Input
                              type="date"
                              value={dateFilter.endDate}
                              onChange={(e) => handleDateFilterChange("endDate", e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                            <Select
                              value={filters.paymentStatus}
                              onValueChange={(value) => handleFilterChange("paymentStatus", value)}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="All Payment Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Payment Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <Button
                              onClick={clearDateFilter}
                              variant="outline"
                              className="w-full text-sm bg-transparent"
                              disabled={!dateFilter.startDate && !dateFilter.endDate}
                            >
                              Clear Dates
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <SortableHeader sortKey="claimId">Claim ID</SortableHeader>
                              <SortableHeader sortKey="firstName">First Name</SortableHeader>
                              <SortableHeader sortKey="lastName">Last Name</SortableHeader>
                              <SortableHeader sortKey="email">Email</SortableHeader>
                              <SortableHeader sortKey="phoneNumber">Phone Number</SortableHeader>
                              <SortableHeader sortKey="streetAddress">Street Address</SortableHeader>
                              <SortableHeader sortKey="addressLine2">Address Line 2</SortableHeader>
                              <SortableHeader sortKey="state">State</SortableHeader>
                              <SortableHeader sortKey="city">City</SortableHeader>
                              <SortableHeader sortKey="pincode">Pincode</SortableHeader>
                              <SortableHeader sortKey="activationCode">Activation Code</SortableHeader>
                              <SortableHeader sortKey="paymentStatus">Payment Status</SortableHeader>
                              <SortableHeader sortKey="ottStatus">OTT Status</SortableHeader>
                              <SortableHeader sortKey="ottCode">OTT Code</SortableHeader>
                              <SortableHeader sortKey="paymentId">Payment ID</SortableHeader>
                              <SortableHeader sortKey="razorpayOrderId">Razorpay Order ID</SortableHeader>
                              <SortableHeader sortKey="amount">Amount</SortableHeader>
                              <SortableHeader sortKey="createdAt">Created</SortableHeader>
                              <SortableHeader sortKey="updatedAt">Updated</SortableHeader>
                              <TableHead className="font-bold text-gray-800">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentData.claims.length > 0 ? (
                              currentData.claims.map((claim, index) => (
                                <TableRow
                                  key={claim._id || claim.id}
                                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                >
                                  <TableCell className="font-mono text-sm">{claim.claimId || "N/A"}</TableCell>
                                  <TableCell className="font-medium">{claim.firstName || "N/A"}</TableCell>
                                  <TableCell className="font-medium">{claim.lastName || "N/A"}</TableCell>
                                  <TableCell>{claim.email || "N/A"}</TableCell>
                                  <TableCell>{claim.phoneNumber || "N/A"}</TableCell>
                                  <TableCell className="max-w-xs truncate" title={claim.streetAddress || "N/A"}>
                                    {claim.streetAddress || "N/A"}
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate" title={claim.addressLine2 || "N/A"}>
                                    {claim.addressLine2 || "N/A"}
                                  </TableCell>
                                  <TableCell>{claim.state || "N/A"}</TableCell>
                                  <TableCell>{claim.city || "N/A"}</TableCell>
                                  <TableCell>{claim.pincode || "N/A"}</TableCell>
                                  <TableCell className="font-mono text-sm">{claim.activationCode || "N/A"}</TableCell>
                                  <TableCell>{getStatusBadge(claim.paymentStatus)}</TableCell>
                                  <TableCell>{getStatusBadge(claim.ottStatus)}</TableCell>
                                  <TableCell className="font-mono text-sm">
                                    {claim.ottCode || <span className="text-gray-400">-</span>}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">{claim.paymentId || "N/A"}</TableCell>
                                  <TableCell className="font-mono text-xs">{claim.razorpayOrderId || "N/A"}</TableCell>
                                  <TableCell className="font-semibold">₹{claim.amount || 99}</TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTime(claim.createdAt)}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTime(claim.updatedAt)}
                                  </TableCell>
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
                                      disabled={claim.ottStatus === "delivered" || claim.paymentStatus !== "paid"}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={20} className="text-center py-8 text-gray-500">
                                  {searchLoading ? "Searching..." : "No claims data available"}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <PaginationControls />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sales">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                            Redemption Records
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-lg text-gray-600">
                            Sales data from systech_ott_platform.salesrecords collection
                          </CardDescription>
                        </div>
                      </div>

                      {/* Search and Filters */}
                      <div className="mt-4 sm:mt-6 space-y-4">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="flex-1 relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Search by activation code, product, category..."
                              value={searchTerm}
                              onChange={(e) => handleSearchChange(e.target.value)}
                              className="pl-10 text-sm"
                            />
                          </div>
                          {searchLoading && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Status</Label>
                            <Select
                              value={filters.salesStatus}
                              onValueChange={(value) => handleFilterChange("salesStatus", value)}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="All Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="claimed">Claimed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <SortableHeader sortKey="activationCode">Activation Code</SortableHeader>
                              <SortableHeader sortKey="product">Product</SortableHeader>
                              <SortableHeader sortKey="productSubCategory">Category</SortableHeader>
                              <SortableHeader sortKey="status">Status</SortableHeader>
                              <SortableHeader sortKey="assignedEmail">Assigned To</SortableHeader>
                              <SortableHeader sortKey="assignedDate">Assigned Date</SortableHeader>
                              <SortableHeader sortKey="createdAt">Created</SortableHeader>
                              <SortableHeader sortKey="updatedAt">Updated</SortableHeader>
                              <TableHead className="font-bold text-gray-800">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentData.keys.length > 0 ? (
                              currentData.keys.map((key, index) => (
                                <TableRow
                                  key={key._id || key.id}
                                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                >
                                  <TableCell className="font-mono text-sm">{key.activationCode || "N/A"}</TableCell>
                                  <TableCell>{key.product || "N/A"}</TableCell>
                                  <TableCell>{key.productSubCategory || "N/A"}</TableCell>
                                  <TableCell>{getStatusBadge(key.status)}</TableCell>
                                  <TableCell>{key.assignedEmail || <span className="text-gray-400">-</span>}</TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTime(key.assignedDate)}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTime(key.createdAt)}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTime(key.updatedAt)}
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
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                  {searchLoading ? "Searching..." : "No keys data available"}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <PaginationControls />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                            Razorpay Transactions
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-lg text-gray-600">
                            Payment transactions from Razorpay API
                          </CardDescription>
                        </div>
                        <Button
                          onClick={syncTransactions}
                          disabled={syncingTransactions}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {syncingTransactions ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Sync from Razorpay
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Search and Filters */}
                      <div className="mt-4 sm:mt-6 space-y-4">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="flex-1 relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Search by payment ID, order ID, email..."
                              value={searchTerm}
                              onChange={(e) => handleSearchChange(e.target.value)}
                              className="pl-10 text-sm"
                            />
                          </div>
                          {searchLoading && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Transaction Status</Label>
                            <Select
                              value={filters.transactionsStatus}
                              onValueChange={(value) => handleFilterChange("transactionsStatus", value)}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="All Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="captured">Captured</SelectItem>
                                <SelectItem value="authorized">Authorized</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="font-bold text-gray-800">Payment ID</TableHead>
                              <TableHead className="font-bold text-gray-800">Order ID</TableHead>
                              <TableHead className="font-bold text-gray-800">Amount</TableHead>
                              <TableHead className="font-bold text-gray-800">Status</TableHead>
                              <TableHead className="font-bold text-gray-800">Method</TableHead>
                              <TableHead className="font-bold text-gray-800">Email</TableHead>
                              <TableHead className="font-bold text-gray-800">Contact</TableHead>
                              <TableHead className="font-bold text-gray-800">Claim ID</TableHead>
                              <TableHead className="font-bold text-gray-800">Created Date</TableHead>
                              <TableHead className="font-bold text-gray-800">Created Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentData.transactions.length > 0 ? (
                              currentData.transactions.map((transaction, index) => (
                                <TableRow
                                  key={transaction._id || transaction.id}
                                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                >
                                  <TableCell className="font-mono text-sm">
                                    {transaction.razorpay_payment_id || "N/A"}
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">
                                    {transaction.razorpay_order_id || "N/A"}
                                  </TableCell>
                                  <TableCell className="font-semibold">
                                    {formatAmount(transaction.amount || 0)}
                                  </TableCell>
                                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                  <TableCell>{transaction.method || "N/A"}</TableCell>
                                  <TableCell>{transaction.email || "N/A"}</TableCell>
                                  <TableCell>{transaction.contact || "N/A"}</TableCell>
                                  <TableCell className="font-mono text-sm">
                                    {transaction.claimId || <span className="text-gray-400">-</span>}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTimeIST(transaction.created_at)?.split(" ")[0] || "-"}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTimeIST(transaction.created_at)?.split(" ")[1] || "-"}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                                  {searchLoading
                                    ? "Searching..."
                                    : "No transactions data available. Click 'Sync from Razorpay' to fetch transactions."}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <PaginationControls />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>

      <Dialog open={manualClaimDialogOpen} onOpenChange={setManualClaimDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Manual Claim Processing
            </DialogTitle>
            <DialogDescription>
              Process a manual claim by filling in customer details and activation code. The activation code will be
              validated against available sales records.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={manualClaimData.firstName}
                onChange={(e) => setManualClaimData((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={manualClaimData.lastName}
                onChange={(e) => setManualClaimData((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={manualClaimData.email}
                onChange={(e) => setManualClaimData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={manualClaimData.phoneNumber}
                onChange={(e) => setManualClaimData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                value={manualClaimData.streetAddress}
                onChange={(e) => setManualClaimData((prev) => ({ ...prev, streetAddress: e.target.value }))}
                placeholder="Enter street address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={manualClaimData.city}
                onChange={(e) => setManualClaimData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={manualClaimData.state}
                onChange={(e) => setManualClaimData((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="Enter state"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={manualClaimData.pincode}
                onChange={(e) => setManualClaimData((prev) => ({ ...prev, pincode: e.target.value }))}
                placeholder="Enter pincode"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="activationCode">Activation Code *</Label>
              <div className="space-y-2">
                <Input
                  id="activationCode"
                  value={manualClaimData.activationCode}
                  onChange={(e) => {
                    const value = e.target.value
                    setManualClaimData((prev) => ({ ...prev, activationCode: value }))
                    clearTimeout(window.activationCodeTimeout)
                    window.activationCodeTimeout = setTimeout(() => {
                      validateActivationCode(value)
                    }, 500)
                  }}
                  placeholder="Enter activation code (will be validated)"
                  className={
                    activationCodeStatus.isValid === true
                      ? "border-green-500 focus:border-green-500"
                      : activationCodeStatus.isValid === false
                        ? "border-red-500 focus:border-red-500"
                        : ""
                  }
                />
                {activationCodeStatus.isChecking && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating activation code...
                  </div>
                )}
                {activationCodeStatus.isValid === true && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckIcon className="w-4 h-4" />
                    {activationCodeStatus.message}
                  </div>
                )}
                {activationCodeStatus.isValid === false && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <XIcon className="w-4 h-4" />
                    {activationCodeStatus.message}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="paymentStatus">Payment Status *</Label>
              <Select
                value={manualClaimData.paymentStatus}
                onValueChange={(value) => setManualClaimData((prev) => ({ ...prev, paymentStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">PAID</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {manualClaimData.paymentStatus === "PAID" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="paymentId">Payment ID *</Label>
                  <Input
                    id="paymentId"
                    value={manualClaimData.paymentId}
                    onChange={(e) => setManualClaimData((prev) => ({ ...prev, paymentId: e.target.value }))}
                    placeholder="Enter payment ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razorpayId">Razorpay ID *</Label>
                  <Input
                    id="razorpayId"
                    value={manualClaimData.razorpayId}
                    onChange={(e) => setManualClaimData((prev) => ({ ...prev, razorpayId: e.target.value }))}
                    placeholder="Enter Razorpay ID"
                  />
                </div>
              </>
            )}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="adminPassword">Admin Password *</Label>
              <Input
                id="adminPassword"
                type="password"
                value={manualClaimData.adminPassword}
                onChange={(e) => setManualClaimData((prev) => ({ ...prev, adminPassword: e.target.value }))}
                placeholder="Enter admin password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualClaimDialogOpen(false)} disabled={manualClaimLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleManualClaimSubmit}
              disabled={manualClaimLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {manualClaimLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Process Manual Claim
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
