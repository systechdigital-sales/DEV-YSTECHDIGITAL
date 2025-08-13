"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  RefreshCw,
  Key,
  ShoppingCart,
  FileText,
} from "lucide-react"

export const dynamic = "force-dynamic"

interface ClaimResponse {
  _id: string
  name: string
  email: string
  phone: string
  activationCode: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  amount?: number
}

interface OTTKey {
  _id: string
  keyValue: string
  isUsed: boolean
  usedBy?: string
  usedAt?: string
  createdAt: string
}

interface SalesRecord {
  _id: string
  customerName: string
  email: string
  phone: string
  activationCode: string
  purchaseDate: string
  amount: number
  status: string
}

const ITEMS_PER_PAGE = 25

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("claims")
  const [claims, setClaims] = useState<ClaimResponse[]>([])
  const [keys, setKeys] = useState<OTTKey[]>([])
  const [sales, setSales] = useState<SalesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingClaim, setEditingClaim] = useState<ClaimResponse | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [claimsRes, keysRes, salesRes] = await Promise.all([
        fetch("/api/admin/claims"),
        fetch("/api/admin/keys"),
        fetch("/api/admin/sales"),
      ])

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json()
        setClaims(claimsData.claims || [])
      }

      if (keysRes.ok) {
        const keysData = await keysRes.json()
        setKeys(keysData.keys || [])
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json()
        setSales(salesData.sales || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

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

  const filteredKeys = useMemo(() => {
    if (!searchTerm) return keys
    return keys.filter(
      (key) =>
        key.keyValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (key.usedBy && key.usedBy.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [keys, searchTerm])

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales
    return sales.filter(
      (sale) =>
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.phone.includes(searchTerm) ||
        sale.activationCode.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [sales, searchTerm])

  // Pagination logic
  const getCurrentPageData = () => {
    let data: any[] = []
    switch (activeTab) {
      case "claims":
        data = filteredClaims
        break
      case "keys":
        data = filteredKeys
        break
      case "sales":
        data = filteredSales
        break
      default:
        data = []
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    let totalItems = 0
    switch (activeTab) {
      case "claims":
        totalItems = filteredClaims.length
        break
      case "keys":
        totalItems = filteredKeys.length
        break
      case "sales":
        totalItems = filteredSales.length
        break
    }
    return Math.ceil(totalItems / ITEMS_PER_PAGE)
  }

  const getTotalItems = () => {
    switch (activeTab) {
      case "claims":
        return filteredClaims.length
      case "keys":
        return filteredKeys.length
      case "sales":
        return filteredSales.length
      default:
        return 0
    }
  }

  // Reset pagination when changing tabs or search
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm, statusFilter])

  // Handle claim edit
  const handleEditClaim = async (updatedClaim: ClaimResponse) => {
    try {
      const response = await fetch("/api/admin/claims", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClaim),
      })

      if (response.ok) {
        setClaims((prev) => prev.map((claim) => (claim._id === updatedClaim._id ? updatedClaim : claim)))
        setIsEditDialogOpen(false)
        setEditingClaim(null)
        toast.success("Claim updated successfully")
      } else {
        toast.error("Failed to update claim")
      }
    } catch (error) {
      console.error("Error updating claim:", error)
      toast.error("Failed to update claim")
    }
  }

  // Handle claim delete
  const handleDeleteClaim = async (claimId: string) => {
    if (!confirm("Are you sure you want to delete this claim?")) return

    try {
      const response = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: claimId, type: "claim" }),
      })

      if (response.ok) {
        setClaims((prev) => prev.filter((claim) => claim._id !== claimId))
        toast.success("Claim deleted successfully")
      } else {
        toast.error("Failed to delete claim")
      }
    } catch (error) {
      console.error("Error deleting claim:", error)
      toast.error("Failed to delete claim")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  const currentPageData = getCurrentPageData()
  const totalPages = getTotalPages()
  const totalItems = getTotalItems()
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage claims, keys, and sales records</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" size="sm">
              Back to Home
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
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
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Claims ({filteredClaims.length})
            </TabsTrigger>
            <TabsTrigger value="keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Keys ({filteredKeys.length})
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Sales ({filteredSales.length})
            </TabsTrigger>
          </TabsList>

          {/* Claims Tab */}
          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>Claims Management</CardTitle>
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
                        <TableHead>Amount</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPageData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No claims found
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentPageData.map((claim: ClaimResponse) => (
                          <TableRow key={claim._id}>
                            <TableCell className="font-medium">{claim.name}</TableCell>
                            <TableCell>{claim.email}</TableCell>
                            <TableCell>{claim.phone}</TableCell>
                            <TableCell className="font-mono text-sm">{claim.activationCode}</TableCell>
                            <TableCell>{getStatusBadge(claim.status)}</TableCell>
                            <TableCell>{claim.amount ? formatCurrency(claim.amount) : "-"}</TableCell>
                            <TableCell>{formatDate(claim.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingClaim(claim)
                                    setIsEditDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDeleteClaim(claim._id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keys Tab */}
          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <CardTitle>OTT Keys Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead>Used At</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPageData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No keys found
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentPageData.map((key: OTTKey) => (
                          <TableRow key={key._id}>
                            <TableCell className="font-mono text-sm">{key.keyValue}</TableCell>
                            <TableCell>
                              <Badge variant={key.isUsed ? "destructive" : "default"}>
                                {key.isUsed ? "Used" : "Available"}
                              </Badge>
                            </TableCell>
                            <TableCell>{key.usedBy || "-"}</TableCell>
                            <TableCell>{key.usedAt ? formatDate(key.usedAt) : "-"}</TableCell>
                            <TableCell>{formatDate(key.createdAt)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Sales Records</CardTitle>
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
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPageData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No sales records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentPageData.map((sale: SalesRecord) => (
                          <TableRow key={sale._id}>
                            <TableCell className="font-medium">{sale.customerName}</TableCell>
                            <TableCell>{sale.email}</TableCell>
                            <TableCell>{sale.phone}</TableCell>
                            <TableCell className="font-mono text-sm">{sale.activationCode}</TableCell>
                            <TableCell>{formatCurrency(sale.amount)}</TableCell>
                            <TableCell>{formatDate(sale.purchaseDate)}</TableCell>
                            <TableCell>
                              <Badge variant="default">{sale.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {startItem} to {endItem} of {totalItems} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
            </CardContent>
          </Card>
        )}

        {/* Edit Claim Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Claim</DialogTitle>
            </DialogHeader>
            {editingClaim && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingClaim.name}
                    onChange={(e) => setEditingClaim({ ...editingClaim, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={editingClaim.email}
                    onChange={(e) => setEditingClaim({ ...editingClaim, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editingClaim.phone}
                    onChange={(e) => setEditingClaim({ ...editingClaim, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingClaim.status}
                    onValueChange={(value: "pending" | "approved" | "rejected") =>
                      setEditingClaim({ ...editingClaim, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleEditClaim(editingClaim)}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
