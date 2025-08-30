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
  DownloadIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  UsersIcon,
  KeyIcon,
  DollarSignIcon,
  FileSpreadsheet,
  RefreshCwIcon,
  Trash2Icon,
  SendIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  PlusIcon,
  CheckIcon,
  SearchIcon,
  Edit2,
  XIcon,
  Check,
  MessageCircleIcon,
  Download,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

  const [initialLoading, setInitialLoading] = useState(true)

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
  const [searchInput, setSearchInput] = useState("") // Added separate input state for typing
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

    const initializeData = async () => {
      await loadStats()
      await loadCurrentTabData()
      setInitialLoading(false)
    }

    initializeData()
  }, [router])

  useEffect(() => {
    if (!initialLoading) {
      loadCurrentTabData()
    }
  }, [activeTab, sortConfig, filters, dateFilter, initialLoading])

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
      setSearchLoading(true)

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          search: search,
          ...(activeTab === "transactions"
            ? {}
            : {
                sort: sortConfig.key,
                order: sortConfig.direction,
                paymentStatus: filters.paymentStatus,
                ottStatus: filters.ottStatus,
                salesStatus: filters.salesStatus,
                keysStatus: filters.keysStatus,
                transactionsStatus: filters.transactionsStatus,
                startDate: dateFilter.startDate,
                endDate: dateFilter.endDate,
              }),
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
                page: data.page || page,
                total: data.total || 0,
                totalPages: data.totalPages || Math.ceil((data.total || 0) / ITEMS_PER_PAGE),
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
                totalPages: data.totalPages || 1,
              },
            }))
          }
        } else {
          throw new Error(data.error || "Failed to load data")
        }
      } catch (error) {
        console.error(`Error loading ${activeTab} data:`, error)
        setError(`Failed to load ${activeTab} data`)
      } finally {
        setSearchLoading(false)
        if (initialLoading) {
          setLoading(false)
        }
      }
    },
    [activeTab, sortConfig, filters, dateFilter, initialLoading],
  )

  const handleSearch = () => {
    setSearchTerm(searchInput)
    setPagination((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab as keyof typeof prev], page: 1 },
    }))
    loadCurrentTabData(1, searchInput)
  }

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    console.log("Bytewise Page change to:", page)
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

  // Handle search change - prevent immediate refresh
  const handleSearchChange = (value: string) => {
    if (value !== searchTerm) {
      setSearchLoading(true)
    }
    setSearchTerm(value)
  }

  const handleFilterChange = (filterType: keyof FilterConfig, value: string) => {
    console.log("Bytewise Filter change:", filterType, "=", value)
    if (filterType === "paymentStatus" && value === "returned") {
      console.log("Bytewise Filtering for returned payments only")
    }

    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
    setPagination((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab as keyof typeof prev], page: 1 },
    }))

    loadCurrentTabData(1, searchTerm)
  }

  const handleDateFilterChange = (field: "startDate" | "endDate", value: string) => {
    console.log("Bytewise Date filter change:", field, value)

    setDateFilter((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateFilterSearch = () => {
    console.log("Bytewise Date filter search triggered")
    setPagination((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab as keyof typeof prev], page: 1 },
    }))
    loadCurrentTabData(1, searchTerm)
  }

  const clearDateFilter = () => {
    console.log("Bytewise Clearing date filter")
    setDateFilter({
      startDate: "",
      endDate: "",
    })

    setPagination((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab as keyof typeof prev], page: 1 },
    }))
    loadCurrentTabData(1, searchTerm)
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

  const exportData = async (type?: "claims" | "sales" | "keys") => {
    try {
      setMessage("")
      setError("")

      let url = "/api/admin/export"
      if (type) {
        url += `?type=${type}`
      }

      const response = await fetch(url)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url

        const fileName = type
          ? `systech_ott_${type}_export_${new Date().toISOString().split("T")[0]}.xlsx`
          : `systech_ott_platform_export_${new Date().toISOString().split("T")[0]}.xlsx`

        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        const successMessage = `${type ? type.charAt(0).toUpperCase() + type.slice(1) : "All"} data exported successfully with all columns`
        setMessage(successMessage)
        toast({
          title: "Export Successful",
          description: successMessage,
        })
      } else {
        const errorResult = await response.json()
        const errorMessage = errorResult.error || "Failed to export data"
        setError(errorMessage)
        toast({
          title: "Export Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      const errorMessage = "Network error occurred during export"
      setError(errorMessage)
      toast({
        title: "Export Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Delete handlers
  const handleDeleteClick = (type: string, id: string, name: string) => {
    setRecordToDelete({ type, id, name })
    setDeletePassword("")
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
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

    try {
      const url = `/api/admin/delete?type=${recordToDelete.type}&id=${encodeURIComponent(recordToDelete.id)}&password=${encodeURIComponent(deletePassword)}`

      const response = await fetch(url, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || "Record deleted successfully")
        toast({
          title: "Deletion Successful",
          description: result.message || "Record deleted successfully.",
        })
        setDeleteDialogOpen(false)
        setRecordToDelete(null)
        setDeletePassword("")
        // Refresh data
        loadStats()
        loadCurrentTabData()
      } else {
        setError(result.error || "Delete failed")
        toast({
          title: "Deletion Failed",
          description: result.error || "Failed to delete record.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Delete error:", error)
      setError("Delete operation failed")
      toast({
        title: "Deletion Error",
        description: "An unexpected error occurred during deletion.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  // Manual assignment handlers
  const handleManualAssignClick = async (claim: ClaimResponse) => {
    setSelectedClaimForManualAssign(claim)
    setSelectedKeyForManualAssign("")
    setManualAssignPassword("")

    // Load available keys
    try {
      const response = await fetch("/api/admin/keys?status=available&limit=100")
      if (response.ok) {
        const result = await response.json()
        setAvailableKeys(result.data || [])
      }
    } catch (error) {
      console.error("Failed to load available keys:", error)
      setAvailableKeys([])
    }

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

    try {
      const response = await fetch("/api/admin/manual-assign-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId: selectedClaimForManualAssign._id || selectedClaimForManualAssign.id,
          ottKeyId: selectedKeyForManualAssign,
          adminPassword: manualAssignPassword,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || "OTT Key manually assigned successfully!")
        toast({
          title: "Assignment Successful",
          description: result.message || "OTT Key manually assigned successfully!",
        })
        setManualAssignDialogOpen(false)
        setSelectedClaimForManualAssign(null)
        setSelectedKeyForManualAssign("")
        setManualAssignPassword("")
        // Refresh data
        loadStats()
        loadCurrentTabData()
      } else {
        setError(result.error || "Manual assignment failed.")
        toast({
          title: "Assignment Failed",
          description: result.error || "Manual assignment failed.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Manual assignment error:", error)
      setError("An unexpected error occurred during manual assignment.")
      toast({
        title: "Assignment Error",
        description: "An unexpected error occurred during manual assignment.",
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
      const response = await fetch("/api/admin/razorpay-transactions?action=sync", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          `Successfully synced ${data.syncedCount} new transactions and updated ${data.updatedCount} existing transactions`,
        )
        loadCurrentTabData()
        loadStats()
      } else {
        throw new Error(data.error || "Failed to sync transactions")
      }
    } catch (error) {
      console.error("Error syncing transactions:", error)
      setError(error instanceof Error ? error.message : "Failed to sync transactions")
    } finally {
      setSyncingTransactions(false)
    }
  }

  const formatAmount = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`
  }

  const formatDateTimeIST = (dateString: string | undefined) => {
    if (!dateString) return "-"

    try {
      const date = new Date(dateString)
      // Convert to IST (UTC + 5:30)
      const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000)

      const dateStr = istDate.toISOString().split("T")[0] // YYYY-MM-DD
      const timeStr = istDate.toISOString().split("T")[1].split(".")[0] // HH:MM:SS

      return `${dateStr} ${timeStr}`
    } catch (error) {
      return "-"
    }
  }

  // Utility functions
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
      case "returned": // Enhanced returned status styling
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300 font-medium">{status.toUpperCase()}</Badge>
        )
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
        hour12: true,
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Sortable table header component
  const SortableHeader = ({ children, sortKey }: { children: React.ReactNode; sortKey: string }) => (
    <TableHead
      className="font-bold text-gray-800 cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center">
        {children}
        {getSortIcon(sortKey)}
      </div>
    </TableHead>
  )

  // Pagination component
  const PaginationControls = () => {
    const currentPagination = pagination[activeTab as keyof typeof pagination]
    const { page, totalPages, total } = currentPagination

    if (totalPages <= 1) return null

    const startItem = (page - 1) * ITEMS_PER_PAGE + 1
    const endItem = Math.min(page * ITEMS_PER_PAGE, total)

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {total} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
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
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="flex items-center"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className="flex items-center ml-2"
          >
            Last Record
            <ChevronsRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    )
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

      console.log("Bytewise Fetching claims with payment status:", filters.paymentStatus)

      const response = await fetch(`/api/admin/claims?${params}`)
      const data = await response.json()

      console.log("Bytewise Claims API response:", data)

      if (data.data) {
        setClaims(data.data)
        setTotalPages(data.totalPages || 1)
        console.log("Bytewise Claims loaded:", data.data.length, "items")
        if (filters.paymentStatus === "returned") {
          console.log(
            "Bytewise Returned payments:",
            data.data.filter((claim) => claim.paymentStatus?.toLowerCase() === "returned"),
          )
        }
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
          variant: "destructive",
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

  const [updatingTransaction, setUpdatingTransaction] = useState<string | null>(null)

  const updateClaimFromTransaction = async (transaction: any) => {
    setUpdatingTransaction(transaction._id)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/admin/update-claim-from-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: transaction._id,
          razorpay_payment_id: transaction.razorpay_payment_id,
          razorpay_order_id: transaction.razorpay_order_id,
          email: transaction.email,
          claimId: transaction.claimId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          `Successfully updated claim ${data.claimId} from transaction data. Match strategy: ${data.matchStrategy}`,
        )
        loadCurrentTabData()
      } else {
        throw new Error(data.error || "Failed to update claim from transaction")
      }
    } catch (error) {
      console.error("Error updating claim from transaction:", error)
      setError(error instanceof Error ? error.message : "Failed to update claim from transaction")
    } finally {
      setUpdatingTransaction(null)
    }
  }

  const [editingClaimId, setEditingClaimId] = useState<string | null>(null)
  const [editClaimIdValue, setEditClaimIdValue] = useState<string>("")
  const [updatingClaimId, setUpdatingClaimId] = useState<string | null>(null)

  const updateTransactionClaimId = async (transactionId: string, newClaimId: string) => {
    console.log("Bytewise Starting updateTransactionClaimId with:", { transactionId, newClaimId })
    setUpdatingClaimId(transactionId)
    try {
      console.log("Bytewise Making API call to update-transaction-claim-id")
      const response = await fetch("/api/admin/update-transaction-claim-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          claimId: newClaimId.trim() || null,
        }),
      })

      console.log("Bytewise API response status:", response.status)
      const result = await response.json()
      console.log("Bytewise API response data:", result)

      if (response.ok) {
        console.log("Bytewise Update successful, showing success toast")
        toast({
          title: "Success",
          description: "Claim ID updated successfully",
        })
        setEditingClaimId(null)
        setEditClaimIdValue("")
        loadCurrentTabData()
      } else {
        throw new Error(result.error || "Failed to update claim ID")
      }
    } catch (error) {
      console.error("Bytewise Error updating claim ID:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update claim ID",
        variant: "destructive",
      })
    } finally {
      setUpdatingClaimId(null)
    }
  }

  const startEditingClaimId = (transactionId: string, currentClaimId: string) => {
    console.log("Bytewise Starting to edit claim ID for transaction:", transactionId)
    setEditingClaimId(transactionId)
    setEditClaimIdValue(currentClaimId || "")
  }

  const cancelEditingClaimId = () => {
    setEditingClaimId(null)
    setEditClaimIdValue("")
  }

  const handleWhatsAppClick = (claim: ClaimResponse) => {
    const phoneNumber = claim.phoneNumber?.replace(/\D/g, "") // Remove non-digits
    if (!phoneNumber) {
      toast({
        title: "No Phone Number",
        description: "This claim doesn't have a valid phone number for WhatsApp.",
        variant: "destructive",
      })
      return
    }

    // Format phone number for WhatsApp (add country code if not present)
    const formattedPhone = phoneNumber.startsWith("91") ? phoneNumber : `91${phoneNumber}`

    const message = `Dear Customer, 👋

We're happy to share an update regarding your OTT claim:

🆔 Claim ID: ${claim.claimId}
📌 Current Status: ${claim.ottStatus || "Processing"}
${claim.ottCode ? `🎟️ **OTT Code:** ${claim.ottCode}` : ""}

How to Redeem:
1) Open the OTT Play app from your web browser
2) Click on the link, enter code & get 100% off 👉 https://www.ottplay.com/partner/systech-it-solution/ott_sustech_annualtest
3) Tap ‘Subscribe Yearly”
4) Enter your mobile number, verify OTP & start streaming OTTs +500 Live channels for 12 months!
5) Enter the Coupon code: ${claim.ottCode ? `🎟️ **OTT Code:** ${claim.ottCode}` : ""}
6) Enjoy your premium subscription!

🙏 Thank you for trusting SYSTECH DIGITAL — we truly value your association with us.

If you need any help, our support team is just a message away 💬.

Warm regards,
Team SYSTECH DIGITAL`

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (initialLoading) {
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
                    <RefreshCwIcon className="w-4 h-4 mr-1 sm:mr-2" />
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
                        <UsersIcon className="w-4 h-4 sm:w-8 sm:h-8 text-blue-600" />
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
                        <DollarSignIcon className="w-4 h-4 sm:w-8 sm:h-8 text-green-600" />
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
                        <KeyIcon className="w-4 h-4 sm:w-8 sm:h-8 text-purple-600" />
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
                        <CheckCircleIcon className="w-4 h-4 sm:w-8 sm:h-8 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Messages */}
              {message && (
                <Alert className="mb-3 sm:mb-6 border-green-200 bg-green-50">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-3 sm:mb-6">
                  <AlertCircleIcon className="h-4 w-4" />
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

                        <div className="mb-4">
                          <Button
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = "/templates/activation-code-template.xlsx"
                              link.download = "activation-code-template.xlsx"
                              link.click()
                            }}
                            variant="outline"
                            size="sm"
                            className="text-blue-700 border-blue-300 hover:bg-blue-100"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Template
                          </Button>
                        </div>

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
                              <li>Activation Code/ Serial No / IMEI Number</li>
                              <li>Status</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keys Upload */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-green-50 p-4 sm:p-6 rounded-xl border border-green-200">
                        <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-3 sm:mb-4 flex items-center">
                          <KeyIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> OTT Keys Upload
                        </h3>
                        <p className="text-green-800 mb-3 sm:mb-4 text-sm">
                          Upload Excel/CSV file to ottkeys collection
                        </p>

                        <div className="mb-4">
                          <Button
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = "/templates/ott-keys-template.xlsx"
                              link.download = "ott-keys-template.xlsx"
                              link.click()
                            }}
                            variant="outline"
                            size="sm"
                            className="text-green-700 border-green-300 hover:bg-green-100"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Template
                          </Button>
                        </div>

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
                              <li>Status</li>
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

                  <div className="mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">
                          📤 Export Data & Manual Actions
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Download data from systech_ott_platform database and perform manual operations
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 sm:gap-4">
                      <Button
                        onClick={() => exportData()}
                        className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                      >
                        <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Export All Data
                      </Button>
                      <Button
                        onClick={() => exportData("claims")}
                        className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                      >
                        <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Export Claims
                      </Button>
                      <Button
                        onClick={() => exportData("sales")}
                        className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                      >
                        <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Export Sales
                      </Button>
                      <Button
                        onClick={() => exportData("keys")}
                        className="bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm"
                      >
                        <DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Export Keys
                      </Button>
                      <Button
                        onClick={() => setManualClaimDialogOpen(true)}
                        className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                      >
                        <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Manual Claim
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                          <div className="flex items-center space-x-2 flex-1">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                placeholder={`Search ${activeTab}...`}
                                value={searchInput} // Use searchInput instead of searchTerm
                                onChange={(e) => handleSearchInputChange(e.target.value)} // Use new handler
                                onKeyPress={handleSearchKeyPress} // Added Enter key handler
                                className="pl-10 text-sm"
                              />
                            </div>
                            <Button
                              onClick={handleSearch}
                              disabled={searchLoading}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              {searchLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <SearchIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {searchLoading && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                              <SortableHeader sortKey="phoneNumber">Phone</SortableHeader>
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
                                      onClick={() => handleWhatsAppClick(claim)}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                      title="Send WhatsApp message"
                                    >
                                      <MessageCircleIcon className="w-4 h-4" />
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
                          <div className="flex items-center space-x-2 flex-1">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                placeholder="Search by activation code, product, category..."
                                value={searchInput}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                                className="pl-10 text-sm"
                              />
                            </div>
                            <Button
                              onClick={handleSearch}
                              disabled={searchLoading}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              {searchLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <SearchIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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
                              <SortableHeader sortKey="claimedBy">Claimed By</SortableHeader>
                              <SortableHeader sortKey="claimedDate">Claimed Date</SortableHeader>
                              <SortableHeader sortKey="createdAt">Created</SortableHeader>
                              <SortableHeader sortKey="updatedAt">Updated</SortableHeader>
                              <TableHead className="font-bold text-gray-800">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentData.sales.length > 0 ? (
                              currentData.sales.map((sale, index) => (
                                <TableRow
                                  key={sale._id || sale.id}
                                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                >
                                  <TableCell className="font-mono text-sm">{sale.activationCode || "N/A"}</TableCell>
                                  <TableCell>{sale.product || "N/A"}</TableCell>
                                  <TableCell>{sale.productSubCategory || "N/A"}</TableCell>
                                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                                  <TableCell>{sale.claimedBy || <span className="text-gray-400">-</span>}</TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTime(sale.claimedDate)}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTime(sale.createdAt)}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTime(sale.updatedAt)}
                                  </TableCell>
                                  <TableCell>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                  {searchLoading ? "Searching..." : "No sales data available"}
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

                <TabsContent value="keys">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                            OTT Keys Inventory
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-lg text-gray-600">
                            OTT keys from systech_ott_platform.ottkeys collection
                          </CardDescription>
                        </div>
                      </div>

                      {/* Search and Filters */}
                      <div className="mt-4 sm:mt-6 space-y-4">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="flex items-center space-x-2 flex-1">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                placeholder="Search by activation code, product, category..."
                                value={searchInput}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                                className="pl-10 text-sm"
                              />
                            </div>
                            <Button
                              onClick={handleSearch}
                              disabled={searchLoading}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              {searchLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <SearchIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Status</Label>
                            <Select
                              value={filters.keysStatus}
                              onValueChange={(value) => handleFilterChange("keysStatus", value)}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="All Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="used">Used</SelectItem>
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
                              <RefreshCwIcon className="w-4 h-4 mr-2" />
                              Sync from Razorpay
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Search and Filters */}
                      <div className="mt-4 sm:mt-6 space-y-4">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="flex items-center space-x-2 flex-1">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                placeholder="Search by payment ID, order ID, email..."
                                value={searchInput}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                                className="pl-10 text-sm"
                              />
                            </div>
                            <Button
                              onClick={handleSearch}
                              disabled={searchLoading}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              {searchLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <SearchIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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
                                <SelectItem value="created">Created</SelectItem>
                                <SelectItem value="authorized">Authorized</SelectItem>
                                <SelectItem value="captured">Captured</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
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
                              <TableHead className="font-bold text-gray-800">Actions</TableHead>
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
                                    {editingClaimId === transaction._id ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={editClaimIdValue}
                                          onChange={(e) => setEditClaimIdValue(e.target.value)}
                                          className="h-8 text-sm font-mono"
                                          placeholder="Enter claim ID"
                                          disabled={updatingClaimId === transaction._id}
                                        />
                                        <Button
                                          onClick={() => updateTransactionClaimId(transaction._id, editClaimIdValue)}
                                          disabled={updatingClaimId === transaction._id}
                                          size="sm"
                                          className="h-8 px-2 bg-green-600 hover:bg-green-700"
                                        >
                                          {updatingClaimId === transaction._id ? (
                                            <>
                                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                              Updating...
                                            </>
                                          ) : (
                                            <>
                                              <Check className="w-3 h-3" />
                                            </>
                                          )}
                                        </Button>
                                        <Button
                                          onClick={cancelEditingClaimId}
                                          disabled={updatingClaimId === transaction._id}
                                          size="sm"
                                          variant="outline"
                                          className="h-8 px-2 bg-transparent"
                                        >
                                          <XIcon className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span className={transaction.claimId ? "" : "text-gray-400"}>
                                          {transaction.claimId || "-"}
                                        </span>
                                        <Button
                                          onClick={() =>
                                            startEditingClaimId(transaction._id, transaction.claimId || "")
                                          }
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0 hover:bg-gray-100"
                                        >
                                          <Edit2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTimeIST(transaction.created_at)?.split(" ")[0] || "-"}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {formatDateTimeIST(transaction.created_at)?.split(" ")[1] || "-"}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      onClick={() => updateClaimFromTransaction(transaction)}
                                      disabled={updatingTransaction === transaction._id}
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                                    >
                                      {updatingTransaction === transaction._id ? (
                                        <>
                                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                          Updating...
                                        </>
                                      ) : (
                                        <>
                                          <RefreshCwIcon className="w-3 h-3 mr-1" />
                                          Update
                                        </>
                                      )}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={11} className="text-center py-8 text-gray-500">
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
