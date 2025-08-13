"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  Search,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Users,
  Key,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

interface ClaimData {
  _id: string
  name: string
  email: string
  phone: string
  activationCode: string
  ottKey?: string
  status: "pending" | "processing" | "completed" | "failed"
  paymentStatus: "pending" | "paid" | "failed"
  amount: number
  createdAt: string
  updatedAt: string
}

interface SalesData {
  _id: string
  activationCode: string
  customerName: string
  customerEmail: string
  customerPhone: string
  saleDate: string
  amount: number
  status: string
}

interface OTTKeyData {
  _id: string
  keyValue: string
  platform: string
  isUsed: boolean
  assignedTo?: string
  createdAt: string
  usedAt?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("claims")
  const [claims, setClaims] = useState<ClaimData[]>([])
  const [sales, setSales] = useState<SalesData[]>([])
  const [ottKeys, setOttKeys] = useState<OTTKeyData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)
  const [statusFilter, setStatusFilter] = useState("all")

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [claimsRes, salesRes, keysRes] = await Promise.all([
        fetch("/api/admin/claims"),
        fetch("/api/admin/sales"),
        fetch("/api/admin/keys"),
      ])

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json()
        setClaims(claimsData.claims || [])
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json()
        setSales(salesData.sales || [])
      }

      if (keysRes.ok) {
        const keysData = await keysRes.json()
        setOttKeys(keysData.keys || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter and search logic
  const filteredClaims = useMemo(() => {
    let filtered = claims

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (claim) =>
          claim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.phone.includes(searchTerm) ||
          claim.activationCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((claim) => claim.status === statusFilter)
    }

    return filtered
  }, [claims, searchTerm, statusFilter])

  const filteredSales = useMemo(() => {
    let filtered = sales

    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerPhone.includes(searchTerm) ||
          sale.activationCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }, [sales, searchTerm])

  const filteredKeys = useMemo(() => {
    let filtered = ottKeys

    if (searchTerm) {
      filtered = filtered.filter(
        (key) =>
          key.keyValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
          key.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (key.assignedTo && key.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    return filtered
  }, [ottKeys, searchTerm])

  // Pagination logic
  const getCurrentPageData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (data: any[]) => {
    return Math.ceil(data.length / itemsPerPage)
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case "claims":
        return filteredClaims
      case "sales":
        return filteredSales
      case "keys":
        return filteredKeys
      default:
        return []
    }
  }

  const currentData = getCurrentData()
  const paginatedData = getCurrentPageData(currentData)
  const totalPages = getTotalPages(currentData)

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm, statusFilter])

  // Pagination controls
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-gray-700">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, currentData.length)} to{" "}
        {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Export functions
  const exportData = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/export?type=${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${type}-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`${type} data exported successfully`)
      } else {
        toast.error("Failed to export data")
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data")
    }
  }

  // Delete functions
  const deleteAllData = async (type: string) => {
    try {
      const response = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        toast.success(`All ${type} deleted successfully`)
        fetchData()
      } else {
        toast.error(`Failed to delete ${type}`)
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(`Failed to delete ${type}`)
    }
  }

  // File upload handlers
  const handleFileUpload = async (file: File, type: string) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const endpoint = type === "sales" ? "/api/admin/upload-sales" : "/api/admin/upload-keys"
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`${type} uploaded successfully: ${result.message}`)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(`Upload failed: ${error.message}`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      processing: "secondary",
      completed: "default",
      failed: "destructive",
      paid: "default",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage claims, sales, and OTT keys</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => router.push("/automation")}>
                <Settings className="h-4 w-4 mr-2" />
                Automation
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.length}</div>
              <p className="text-xs text-muted-foreground">
                {claims.filter((c) => c.status === "completed").length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Records</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
              <p className="text-xs text-muted-foreground">Total sales entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OTT Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ottKeys.length}</div>
              <p className="text-xs text-muted-foreground">{ottKeys.filter((k) => !k.isUsed).length} available</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, phone, or activation code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {activeTab === "claims" && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="claims">Claims ({filteredClaims.length})</TabsTrigger>
            <TabsTrigger value="sales">Sales ({filteredSales.length})</TabsTrigger>
            <TabsTrigger value="keys">OTT Keys ({filteredKeys.length})</TabsTrigger>
          </TabsList>

          {/* Claims Tab */}
          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Claims Management</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => exportData("claims")}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete All Claims</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all claims data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAllData("claims")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Activation Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No claims found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((claim: ClaimData) => (
                          <TableRow key={claim._id}>
                            <TableCell className="font-medium">{claim.name}</TableCell>
                            <TableCell>{claim.email}</TableCell>
                            <TableCell>{claim.phone}</TableCell>
                            <TableCell className="font-mono text-sm">{claim.activationCode}</TableCell>
                            <TableCell>{getStatusBadge(claim.status)}</TableCell>
                            <TableCell>{getStatusBadge(claim.paymentStatus)}</TableCell>
                            <TableCell>₹{claim.amount}</TableCell>
                            <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sales Management</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = ".xlsx,.xls,.csv"
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleFileUpload(file, "sales")
                        }
                        input.click()
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportData("sales")}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete All Sales</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all sales data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAllData("sales")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Activation Code</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Sale Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No sales records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((sale: SalesData) => (
                          <TableRow key={sale._id}>
                            <TableCell className="font-medium">{sale.customerName}</TableCell>
                            <TableCell>{sale.customerEmail}</TableCell>
                            <TableCell>{sale.customerPhone}</TableCell>
                            <TableCell className="font-mono text-sm">{sale.activationCode}</TableCell>
                            <TableCell>₹{sale.amount}</TableCell>
                            <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(sale.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls />
              </CardContent>
            </Card>
          </TabsContent>

          {/* OTT Keys Tab */}
          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>OTT Keys Management</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = ".xlsx,.xls,.csv"
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleFileUpload(file, "keys")
                        }
                        input.click()
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportData("keys")}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete All Keys</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all OTT keys.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAllData("keys")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key Value</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Used At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No OTT keys found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((key: OTTKeyData) => (
                          <TableRow key={key._id}>
                            <TableCell className="font-mono text-sm">{key.keyValue}</TableCell>
                            <TableCell>{key.platform}</TableCell>
                            <TableCell>
                              <Badge variant={key.isUsed ? "secondary" : "default"}>
                                {key.isUsed ? "Used" : "Available"}
                              </Badge>
                            </TableCell>
                            <TableCell>{key.assignedTo || "-"}</TableCell>
                            <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{key.usedAt ? new Date(key.usedAt).toLocaleDateString() : "-"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
