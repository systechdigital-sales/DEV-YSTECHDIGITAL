"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Key,
  DollarSign,
  FileSpreadsheet,
  RefreshCw,
  Trash2,
  Send,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Input } from "@/components/ui/input"

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

  // Manual assignment states
  const [showManualAssign, setShowManualAssign] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<ClaimResponse | null>(null)
  const [manualAssignForm, setManualAssignForm] = useState({
    ottKey: "",
    ottCode: "",
  })
  const [isAssigning, setIsAssigning] = useState(false)

  const [showManualEntry, setShowManualEntry] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [manualEntryForm, setManualEntryForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    purchaseType: "online",
    activationCode: "",
    purchaseDate: "",
    invoiceNumber: "",
    sellerName: "",
    paymentStatus: "pending",
    paymentId: "",
    billFileName: "",
    razorpayOrderId: "",
  })

  const [transactionStatusCounts, setTransactionStatusCounts] = useState({
    total: 0,
    captured: 0,
    failed: 0,
    pending: 0,
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

  // Load current tab data with pagination
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
              transactions: data.transactions || [],
            }))
            setPagination((prev) => ({
              ...prev,
              transactions: {
                page: page,
                total: data.count || 0,
                totalPages: Math.ceil((data.count || 0) / ITEMS_PER_PAGE),
              },
            }))
            setTransactionStatusCounts({
              captured: data.statusCounts?.captured || 0,
              failed: data.statusCounts?.failed || 0,
              pending: data.statusCounts?.pending || 0,
              total: data.count || 0,
            })
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
        setLoading(false)
      }
    },
    [activeTab, sortConfig, filters, dateFilter],
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
      [activeTab as keyof typeof prev]: { ...prev[activeTab as keyof typeof prev], page },
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
    setDateFilter((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const clearDateFilter = () => {
    setDateFilter({
      startDate: "",
      endDate: "",
    })
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

  // Export data handler
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

        const successMessage = `${type ? type.charAt(0).toUpperCase() + type.slice(1) : "All"} data exported successfully`
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

  const handleManualEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/manual-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(manualEntryForm),
      })

      const data = await response.json()

      if (response.ok) {
        await fetch("/api/admin/send-claim-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: manualEntryForm.email,
            name: `${manualEntryForm.firstName} ${manualEntryForm.lastName}`,
            activationCode: manualEntryForm.activationCode,
            ottCode: data.ottCode || "Will be assigned soon",
          }),
        })

        toast({
          title: "Success",
          description: "Claim created successfully and email sent",
        })
        setShowManualEntry(false)
        setManualEntryForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          streetAddress: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
          purchaseType: "online",
          activationCode: "",
          purchaseDate: "",
          invoiceNumber: "",
          sellerName: "",
          paymentStatus: "pending",
          paymentId: "",
          billFileName: "",
          razorpayOrderId: "",
        })
        // Refresh claims data
        if (activeTab === "claims") {
          loadCurrentTabData()
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create claim",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating manual claim:", error)
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
                        <p className="text-lg sm:text-3xl font-bold text-gray-900">{stats.totalKeys}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {stats.availableKeys} available • {stats.assignedKeys} assigned • {stats.usedKeys} used
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                        <Key className="w-4 h-4 sm:w-8 sm:h-8 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-l-4 border-l-red-500">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Transactions</p>
                        <p className="text-lg sm:text-3xl font-bold text-gray-900">{stats.totalTransactions}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {stats.successfulTransactions} successful • {stats.failedTransactions} failed
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                        <FileSpreadsheet className="w-4 h-4 sm:w-8 sm:h-8 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                  <TabsTrigger value="claims">Claims</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="keys">Keys</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions ({transactionStatusCounts.total})</TabsTrigger>
                  <TabsTrigger value="manual-entry">Manual Entry</TabsTrigger>
                </TabsList>
                <TabsContent value="claims">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Claims Management</h3>
                      <Button
                        onClick={() => setShowManualEntry(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Manual Claim
                      </Button>
                    </div>

                    {/* Claims Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <SortableHeader sortKey="name">Name</SortableHeader>
                          <SortableHeader sortKey="email">Email</SortableHeader>
                          <SortableHeader sortKey="paymentStatus">Payment Status</SortableHeader>
                          <SortableHeader sortKey="ottStatus">OTT Status</SortableHeader>
                          <SortableHeader sortKey="createdAt">Created At</SortableHeader>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentData.claims.map((claim) => (
                          <TableRow key={claim._id}>
                            <TableCell>{claim.name}</TableCell>
                            <TableCell>{claim.email}</TableCell>
                            <TableCell>{getStatusBadge(claim.paymentStatus)}</TableCell>
                            <TableCell>{getStatusBadge(claim.ottStatus)}</TableCell>
                            <TableCell>{formatDateTimeIST(claim.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick("claims", claim._id, claim.name)}
                                className="flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleManualAssignClick(claim)}
                                className="flex items-center ml-2"
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Assign Key
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <PaginationControls />
                  </div>
                </TabsContent>
                <TabsContent value="sales">
                  {/* Sales Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader sortKey="name">Name</SortableHeader>
                        <SortableHeader sortKey="email">Email</SortableHeader>
                        <SortableHeader sortKey="amount">Amount</SortableHeader>
                        <SortableHeader sortKey="salesStatus">Sales Status</SortableHeader>
                        <SortableHeader sortKey="createdAt">Created At</SortableHeader>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.sales.map((sale) => (
                        <TableRow key={sale._id}>
                          <TableCell>{sale.name}</TableCell>
                          <TableCell>{sale.email}</TableCell>
                          <TableCell>{formatAmount(sale.amount)}</TableCell>
                          <TableCell>{getStatusBadge(sale.salesStatus)}</TableCell>
                          <TableCell>{formatDateTimeIST(sale.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick("sales", sale._id, sale.name)}
                              className="flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls />
                </TabsContent>
                <TabsContent value="keys">
                  {/* Keys Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader sortKey="key">Key</SortableHeader>
                        <SortableHeader sortKey="status">Status</SortableHeader>
                        <SortableHeader sortKey="createdAt">Created At</SortableHeader>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.keys.map((key) => (
                        <TableRow key={key._id}>
                          <TableCell>{key.key}</TableCell>
                          <TableCell>{getStatusBadge(key.status)}</TableCell>
                          <TableCell>{formatDateTimeIST(key.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick("keys", key._id, key.key)}
                              className="flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls />
                </TabsContent>
                <TabsContent value="transactions">
                  {/* Status Counts Display */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      CAPTURED: {transactionStatusCounts.captured}
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-300">
                      FAILED: {transactionStatusCounts.failed}
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      PENDING: {transactionStatusCounts.pending}
                    </Badge>
                  </div>
                  {/* Transactions Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader sortKey="orderId">Order ID</SortableHeader>
                        <SortableHeader sortKey="amount">Amount</SortableHeader>
                        <SortableHeader sortKey="status">Status</SortableHeader>
                        <SortableHeader sortKey="createdAt">Created At</SortableHeader>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{formatAmount(transaction.amount)}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>{formatDateTimeIST(transaction.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick("transactions", transaction.id, transaction.id)}
                              className="flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls />
                </TabsContent>

                <TabsContent value="manual-entry">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Create New Claim Record</h3>
                    </div>

                    <form onSubmit={handleManualEntrySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-gray-700">Personal Information</h4>
                          <div>
                            <label className="block text-sm font-medium mb-1">First Name *</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.firstName}
                              onChange={(e) => setManualEntryForm({ ...manualEntryForm, firstName: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Last Name *</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.lastName}
                              onChange={(e) => setManualEntryForm({ ...manualEntryForm, lastName: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Email *</label>
                            <input
                              type="email"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.email}
                              onChange={(e) => setManualEntryForm({ ...manualEntryForm, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Phone *</label>
                            <input
                              type="tel"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.phone}
                              onChange={(e) => setManualEntryForm({ ...manualEntryForm, phone: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-gray-700">Address Information</h4>
                          <div>
                            <label className="block text-sm font-medium mb-1">Street Address *</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.streetAddress}
                              onChange={(e) =>
                                setManualEntryForm({ ...manualEntryForm, streetAddress: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Address Line 2</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.addressLine2}
                              onChange={(e) => setManualEntryForm({ ...manualEntryForm, addressLine2: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium mb-1">City *</label>
                              <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={manualEntryForm.city}
                                onChange={(e) => setManualEntryForm({ ...manualEntryForm, city: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">State *</label>
                              <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={manualEntryForm.state}
                                onChange={(e) => setManualEntryForm({ ...manualEntryForm, state: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium mb-1">Postal Code *</label>
                              <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={manualEntryForm.postalCode}
                                onChange={(e) => setManualEntryForm({ ...manualEntryForm, postalCode: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Country *</label>
                              <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={manualEntryForm.country}
                                onChange={(e) => setManualEntryForm({ ...manualEntryForm, country: e.target.value })}
                              >
                                <option value="India">India</option>
                                <option value="USA">USA</option>
                                <option value="UK">UK</option>
                                <option value="Canada">Canada</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Purchase Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-gray-700">Purchase Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Purchase Type *</label>
                            <select
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.purchaseType}
                              onChange={(e) => setManualEntryForm({ ...manualEntryForm, purchaseType: e.target.value })}
                            >
                              <option value="online">Online</option>
                              <option value="offline">Offline</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Activation Code *</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.activationCode}
                              onChange={(e) =>
                                setManualEntryForm({ ...manualEntryForm, activationCode: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Purchase Date *</label>
                            <input
                              type="date"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.purchaseDate}
                              onChange={(e) => setManualEntryForm({ ...manualEntryForm, purchaseDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Invoice Number</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.invoiceNumber}
                              onChange={(e) =>
                                setManualEntryForm({ ...manualEntryForm, invoiceNumber: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Seller Name</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.sellerName}
                              onChange={(e) => setManualEntryForm({ ...manualEntryForm, sellerName: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-gray-700">Payment Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Payment Status</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.paymentStatus}
                              onChange={(e) =>
                                setManualEntryForm({ ...manualEntryForm, paymentStatus: e.target.value })
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="success">Success</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Payment ID</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.paymentId}
                              onChange={(e) => setManualEntryForm({ ...manualEntryForm, paymentId: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Razorpay Order ID</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={manualEntryForm.razorpayOrderId}
                              onChange={(e) =>
                                setManualEntryForm({ ...manualEntryForm, razorpayOrderId: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Bill File Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={manualEntryForm.billFileName}
                            onChange={(e) => setManualEntryForm({ ...manualEntryForm, billFileName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Creating..." : "Create Claim"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setManualEntryForm({
                              firstName: "",
                              lastName: "",
                              email: "",
                              phone: "",
                              streetAddress: "",
                              addressLine2: "",
                              city: "",
                              state: "",
                              postalCode: "",
                              country: "India",
                              purchaseType: "online",
                              activationCode: "",
                              purchaseDate: "",
                              invoiceNumber: "",
                              sellerName: "",
                              paymentStatus: "pending",
                              paymentId: "",
                              billFileName: "",
                              razorpayOrderId: "",
                            })
                          }
                        >
                          Reset Form
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>

        <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Manual Claim</DialogTitle>
              <DialogDescription>
                Fill in all the required information to create a new claim record manually.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleManualEntrySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name *</label>
                      <Input
                        type="text"
                        required
                        value={manualEntryForm.firstName}
                        onChange={(e) => setManualEntryForm({ ...manualEntryForm, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name *</label>
                      <Input
                        type="text"
                        required
                        value={manualEntryForm.lastName}
                        onChange={(e) => setManualEntryForm({ ...manualEntryForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input
                      type="email"
                      required
                      value={manualEntryForm.email}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <Input
                      type="tel"
                      required
                      value={manualEntryForm.phone}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Address Information</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Street Address *</label>
                    <Input
                      type="text"
                      required
                      value={manualEntryForm.streetAddress}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, streetAddress: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address Line 2</label>
                    <Input
                      type="text"
                      value={manualEntryForm.addressLine2}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, addressLine2: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City *</label>
                      <Input
                        type="text"
                        required
                        value={manualEntryForm.city}
                        onChange={(e) => setManualEntryForm({ ...manualEntryForm, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State *</label>
                      <Input
                        type="text"
                        required
                        value={manualEntryForm.state}
                        onChange={(e) => setManualEntryForm({ ...manualEntryForm, state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Postal Code *</label>
                      <Input
                        type="text"
                        required
                        value={manualEntryForm.postalCode}
                        onChange={(e) => setManualEntryForm({ ...manualEntryForm, postalCode: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Country *</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={manualEntryForm.country}
                        onChange={(e) => setManualEntryForm({ ...manualEntryForm, country: e.target.value })}
                      >
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Purchase Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Purchase Type *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={manualEntryForm.purchaseType}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, purchaseType: e.target.value })}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Activation Code *</label>
                    <Input
                      type="text"
                      required
                      value={manualEntryForm.activationCode}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, activationCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Purchase Date *</label>
                    <Input
                      type="date"
                      required
                      value={manualEntryForm.purchaseDate}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, purchaseDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Invoice Number</label>
                    <Input
                      type="text"
                      value={manualEntryForm.invoiceNumber}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, invoiceNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Seller Name</label>
                    <Input
                      type="text"
                      value={manualEntryForm.sellerName}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, sellerName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={manualEntryForm.paymentStatus}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, paymentStatus: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment ID</label>
                    <Input
                      type="text"
                      value={manualEntryForm.paymentId}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, paymentId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Razorpay Order ID</label>
                    <Input
                      type="text"
                      value={manualEntryForm.razorpayOrderId}
                      onChange={(e) => setManualEntryForm({ ...manualEntryForm, razorpayOrderId: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bill File Name</label>
                  <Input
                    type="text"
                    value={manualEntryForm.billFileName}
                    onChange={(e) => setManualEntryForm({ ...manualEntryForm, billFileName: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowManualEntry(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Claim"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  )
}
