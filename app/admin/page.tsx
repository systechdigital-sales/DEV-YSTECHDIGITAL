"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Search,
  Download,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react"

interface ClaimResponse {
  _id: string
  name: string
  email: string
  phone: string
  activationCode: string
  ottPlatform: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  paymentStatus?: "pending" | "completed" | "failed"
}

interface OTTKey {
  _id: string
  platform: string
  keyValue: string
  isUsed: boolean
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

interface SalesRecord {
  _id: string
  customerName: string
  email: string
  phone: string
  ottPlatform: string
  activationCode: string
  purchaseDate: string
  amount: number
  status: "active" | "expired" | "pending"
  createdAt: string
}

const ITEMS_PER_PAGE = 25

export default function AdminDashboard() {
  const [claims, setClaims] = useState<ClaimResponse[]>([])
  const [keys, setKeys] = useState<OTTKey[]>([])
  const [sales, setSales] = useState<SalesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("claims")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Dialog states
  const [selectedClaim, setSelectedClaim] = useState<ClaimResponse | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ status: "", notes: "" })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when changing tabs or search
  }, [activeTab, searchTerm, statusFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [claimsRes, keysRes, salesRes] = await Promise.all([
        fetch("/api/admin/claims"),
        fetch("/api/admin/keys"),
        fetch("/api/admin/sales"),
      ])

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json()
        setClaims(claimsData)
      }

      if (keysRes.ok) {
        const keysData = await keysRes.json()
        setKeys(keysData)
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json()
        setSales(salesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  // Filter and search functions
  const getFilteredClaims = () => {
    let filtered = claims

    if (searchTerm) {
      filtered = filtered.filter(
        (claim) =>
          claim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.phone.includes(searchTerm) ||
          claim.activationCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((claim) => claim.status === statusFilter)
    }

    return filtered
  }

  const getFilteredKeys = () => {
    let filtered = keys

    if (searchTerm) {
      filtered = filtered.filter(
        (key) =>
          key.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
          key.keyValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (key.assignedTo && key.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    return filtered
  }

  const getFilteredSales = () => {
    let filtered = sales

    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.phone.includes(searchTerm) ||
          sale.activationCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }

  // Pagination logic
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (dataLength: number) => {
    return Math.ceil(dataLength / ITEMS_PER_PAGE)
  }

  const handleUpdateClaimStatus = async (claimId: string, status: string) => {
    try {
      const response = await fetch("/api/admin/claims", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, status }),
      })

      if (response.ok) {
        toast.success("Claim status updated successfully")
        fetchData()
      } else {
        toast.error("Failed to update claim status")
      }
    } catch (error) {
      console.error("Error updating claim:", error)
      toast.error("Failed to update claim status")
    }
  }

  const handleDeleteClaim = async (claimId: string) => {
    try {
      const response = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: claimId, type: "claim" }),
      })

      if (response.ok) {
        toast.success("Claim deleted successfully")
        fetchData()
      } else {
        toast.error("Failed to delete claim")
      }
    } catch (error) {
      console.error("Error deleting claim:", error)
      toast.error("Failed to delete claim")
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/admin/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `admin-data-${new Date().toISOString().split("T")[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Data exported successfully")
      } else {
        toast.error("Failed to export data")
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data")
    }
  }

  const PaginationControls = ({ totalItems, dataType }: { totalItems: number; dataType: string }) => {
    const totalPages = getTotalPages(totalItems)
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems)

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalItems} {dataType}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
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
  }

  const filteredClaims = getFilteredClaims()
  const filteredKeys = getFilteredKeys()
  const filteredSales = getFilteredSales()

  const paginatedClaims = getPaginatedData(filteredClaims)
  const paginatedKeys = getPaginatedData(filteredKeys)
  const paginatedSales = getPaginatedData(filteredSales)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleExportData} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, phone, or activation code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeTab === "claims" && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="claims">Claims ({filteredClaims.length})</TabsTrigger>
          <TabsTrigger value="keys">OTT Keys ({filteredKeys.length})</TabsTrigger>
          <TabsTrigger value="sales">Sales ({filteredSales.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OTT Claims Management</CardTitle>
              <CardDescription>Manage and review OTT platform claims from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Activation Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          No claims found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedClaims.map((claim) => (
                        <TableRow key={claim._id}>
                          <TableCell className="font-medium">{claim.name}</TableCell>
                          <TableCell>{claim.email}</TableCell>
                          <TableCell>{claim.phone}</TableCell>
                          <TableCell>{claim.ottPlatform}</TableCell>
                          <TableCell className="font-mono text-sm">{claim.activationCode}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                claim.status === "approved"
                                  ? "default"
                                  : claim.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {claim.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {claim.paymentStatus && (
                              <Badge
                                variant={
                                  claim.paymentStatus === "completed"
                                    ? "default"
                                    : claim.paymentStatus === "failed"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {claim.paymentStatus}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedClaim(claim)
                                      setEditForm({ status: claim.status, notes: "" })
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Update Claim Status</DialogTitle>
                                    <DialogDescription>Update the status of this OTT claim</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="status">Status</Label>
                                      <Select
                                        value={editForm.status}
                                        onValueChange={(value) => setEditForm({ ...editForm, status: value })}
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
                                    <div>
                                      <Label htmlFor="notes">Notes (Optional)</Label>
                                      <Textarea
                                        id="notes"
                                        value={editForm.notes}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        placeholder="Add any notes about this status change..."
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        if (selectedClaim) {
                                          handleUpdateClaimStatus(selectedClaim._id, editForm.status)
                                          setIsEditDialogOpen(false)
                                        }
                                      }}
                                    >
                                      Update Status
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Claim</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this claim? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteClaim(claim._id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls totalItems={filteredClaims.length} dataType="claims" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OTT Keys Management</CardTitle>
              <CardDescription>Manage OTT platform keys and their assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Key Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedKeys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No keys found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedKeys.map((key) => (
                        <TableRow key={key._id}>
                          <TableCell className="font-medium">{key.platform}</TableCell>
                          <TableCell className="font-mono text-sm">{key.keyValue}</TableCell>
                          <TableCell>
                            <Badge variant={key.isUsed ? "secondary" : "default"}>
                              {key.isUsed ? "Used" : "Available"}
                            </Badge>
                          </TableCell>
                          <TableCell>{key.assignedTo || "Unassigned"}</TableCell>
                          <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls totalItems={filteredKeys.length} dataType="keys" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Records</CardTitle>
              <CardDescription>View and manage sales records and customer purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Activation Code</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Purchase Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No sales records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSales.map((sale) => (
                        <TableRow key={sale._id}>
                          <TableCell className="font-medium">{sale.customerName}</TableCell>
                          <TableCell>{sale.email}</TableCell>
                          <TableCell>{sale.phone}</TableCell>
                          <TableCell>{sale.ottPlatform}</TableCell>
                          <TableCell className="font-mono text-sm">{sale.activationCode}</TableCell>
                          <TableCell>₹{sale.amount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                sale.status === "active"
                                  ? "default"
                                  : sale.status === "expired"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {sale.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(sale.purchaseDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls totalItems={filteredSales.length} dataType="sales" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
