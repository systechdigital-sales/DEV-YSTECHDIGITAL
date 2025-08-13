"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Search,
  Upload,
  Download,
  Trash2,
  UserPlus,
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
  address: string
  city: string
  state: string
  pincode: string
  status: "pending" | "approved" | "rejected" | "processing"
  createdAt: string
  ottPlatform?: string
  paymentStatus?: "pending" | "completed" | "failed"
}

interface SalesData {
  _id: string
  name: string
  email: string
  phone: string
  activationCode: string
  address: string
  city: string
  state: string
  pincode: string
  createdAt: string
  ottPlatform?: string
}

interface KeyData {
  _id: string
  ottPlatform: string
  ottKey: string
  isUsed: boolean
  createdAt: string
  assignedTo?: string
}

const ITEMS_PER_PAGE = 25

export default function AdminPage() {
  const [claims, setClaims] = useState<ClaimData[]>([])
  const [sales, setSales] = useState<SalesData[]>([])
  const [keys, setKeys] = useState<KeyData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaims, setSelectedClaims] = useState<string[]>([])
  const [selectedSales, setSelectedSales] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("claims")

  // Search states
  const [claimsSearch, setClaimsSearch] = useState("")
  const [salesSearch, setSalesSearch] = useState("")
  const [keysSearch, setKeysSearch] = useState("")

  // Pagination states
  const [claimsPage, setClaimsPage] = useState(1)
  const [salesPage, setSalesPage] = useState(1)
  const [keysPage, setKeysPage] = useState(1)

  // Manual assignment states
  const [manualAssignDialog, setManualAssignDialog] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")

  // File upload states
  const [uploadingKeys, setUploadingKeys] = useState(false)
  const [uploadingSales, setUploadingSales] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [claimsRes, salesRes, keysRes] = await Promise.all([
        fetch("/api/admin/claims"),
        fetch("/api/admin/sales"),
        fetch("/api/admin/keys"),
      ])

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json()
        setClaims(claimsData)
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json()
        setSales(salesData)
      }

      if (keysRes.ok) {
        const keysData = await keysRes.json()
        setKeys(keysData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  // Filter functions
  const filteredClaims = useMemo(() => {
    if (!claimsSearch) return claims
    return claims.filter(
      (claim) =>
        claim.name.toLowerCase().includes(claimsSearch.toLowerCase()) ||
        claim.email.toLowerCase().includes(claimsSearch.toLowerCase()) ||
        claim.phone.includes(claimsSearch) ||
        claim.activationCode.toLowerCase().includes(claimsSearch.toLowerCase()) ||
        claim.address.toLowerCase().includes(claimsSearch.toLowerCase()) ||
        claim.city.toLowerCase().includes(claimsSearch.toLowerCase()) ||
        claim.state.toLowerCase().includes(claimsSearch.toLowerCase()) ||
        claim.pincode.includes(claimsSearch) ||
        claim.status.toLowerCase().includes(claimsSearch.toLowerCase()) ||
        (claim.ottPlatform && claim.ottPlatform.toLowerCase().includes(claimsSearch.toLowerCase())),
    )
  }, [claims, claimsSearch])

  const filteredSales = useMemo(() => {
    if (!salesSearch) return sales
    return sales.filter(
      (sale) =>
        sale.name.toLowerCase().includes(salesSearch.toLowerCase()) ||
        sale.email.toLowerCase().includes(salesSearch.toLowerCase()) ||
        sale.phone.includes(salesSearch) ||
        sale.activationCode.toLowerCase().includes(salesSearch.toLowerCase()) ||
        sale.address.toLowerCase().includes(salesSearch.toLowerCase()) ||
        sale.city.toLowerCase().includes(salesSearch.toLowerCase()) ||
        sale.state.toLowerCase().includes(salesSearch.toLowerCase()) ||
        sale.pincode.includes(salesSearch) ||
        (sale.ottPlatform && sale.ottPlatform.toLowerCase().includes(salesSearch.toLowerCase())),
    )
  }, [sales, salesSearch])

  const filteredKeys = useMemo(() => {
    if (!keysSearch) return keys
    return keys.filter(
      (key) =>
        key.ottPlatform.toLowerCase().includes(keysSearch.toLowerCase()) ||
        key.ottKey.toLowerCase().includes(keysSearch.toLowerCase()) ||
        (key.assignedTo && key.assignedTo.toLowerCase().includes(keysSearch.toLowerCase())),
    )
  }, [keys, keysSearch])

  // Pagination functions
  const getPaginatedData = (data: any[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (dataLength: number) => {
    return Math.ceil(dataLength / ITEMS_PER_PAGE)
  }

  const paginatedClaims = getPaginatedData(filteredClaims, claimsPage)
  const paginatedSales = getPaginatedData(filteredSales, salesPage)
  const paginatedKeys = getPaginatedData(filteredKeys, keysPage)

  // Reset pagination when search changes
  useEffect(() => {
    setClaimsPage(1)
  }, [claimsSearch])

  useEffect(() => {
    setSalesPage(1)
  }, [salesSearch])

  useEffect(() => {
    setKeysPage(1)
  }, [keysSearch])

  const handleBulkDelete = async (type: "claims" | "sales" | "keys") => {
    const selectedIds = type === "claims" ? selectedClaims : type === "sales" ? selectedSales : selectedKeys

    if (selectedIds.length === 0) {
      toast.error("Please select items to delete")
      return
    }

    try {
      const response = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          ids: selectedIds,
        }),
      })

      if (response.ok) {
        toast.success(`Successfully deleted ${selectedIds.length} ${type}`)
        fetchData()

        // Clear selections
        if (type === "claims") setSelectedClaims([])
        else if (type === "sales") setSelectedSales([])
        else setSelectedKeys([])
      } else {
        toast.error("Failed to delete items")
      }
    } catch (error) {
      console.error("Error deleting items:", error)
      toast.error("Failed to delete items")
    }
  }

  const handleManualAssign = async () => {
    if (!selectedPlatform || !customerEmail) {
      toast.error("Please select platform and enter customer email")
      return
    }

    try {
      const response = await fetch("/api/admin/manual-assign-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ottPlatform: selectedPlatform,
          customerEmail,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success("Key assigned successfully")
        setManualAssignDialog(false)
        setSelectedPlatform("")
        setCustomerEmail("")
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to assign key")
      }
    } catch (error) {
      console.error("Error assigning key:", error)
      toast.error("Failed to assign key")
    }
  }

  const handleFileUpload = async (file: File, type: "keys" | "sales") => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      if (type === "keys") setUploadingKeys(true)
      else setUploadingSales(true)

      const response = await fetch(`/api/admin/upload-${type}`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Successfully uploaded ${result.count} ${type}`)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || `Failed to upload ${type}`)
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      toast.error(`Failed to upload ${type}`)
    } finally {
      if (type === "keys") setUploadingKeys(false)
      else setUploadingSales(false)
    }
  }

  const handleExport = async (type: "claims" | "sales" | "keys") => {
    try {
      const response = await fetch(`/api/admin/export?type=${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${type}-export.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`${type} exported successfully`)
      } else {
        toast.error("Failed to export data")
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data")
    }
  }

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemName,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    totalItems: number
    itemName: string
  }) => {
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems)

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalItems} {itemName}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Dialog open={manualAssignDialog} onOpenChange={setManualAssignDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Manual Assign Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manually Assign OTT Key</DialogTitle>
                <DialogDescription>Assign an available OTT key to a customer manually</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">OTT Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(keys.map((k) => k.ottPlatform))).map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email">Customer Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setManualAssignDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleManualAssign}>Assign Key</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="claims">Claims ({filteredClaims.length})</TabsTrigger>
          <TabsTrigger value="sales">Sales ({filteredSales.length})</TabsTrigger>
          <TabsTrigger value="keys">Keys ({filteredKeys.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Claims Management</CardTitle>
                  <CardDescription>Manage customer claims and redemption requests</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleExport("claims")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={selectedClaims.length === 0}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedClaims.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {selectedClaims.length} selected claims. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleBulkDelete("claims")}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search claims..."
                  value={claimsSearch}
                  onChange={(e) => setClaimsSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedClaims.length === paginatedClaims.length && paginatedClaims.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedClaims(paginatedClaims.map((c) => c._id))
                          } else {
                            setSelectedClaims([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Activation Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClaims.map((claim) => (
                    <TableRow key={claim._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedClaims.includes(claim._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedClaims([...selectedClaims, claim._id])
                            } else {
                              setSelectedClaims(selectedClaims.filter((id) => id !== claim._id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{claim.name}</TableCell>
                      <TableCell>{claim.email}</TableCell>
                      <TableCell>{claim.phone}</TableCell>
                      <TableCell className="font-mono text-sm">{claim.activationCode}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            claim.status === "approved"
                              ? "default"
                              : claim.status === "pending"
                                ? "secondary"
                                : claim.status === "processing"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {claim.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{claim.ottPlatform || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            claim.paymentStatus === "completed"
                              ? "default"
                              : claim.paymentStatus === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {claim.paymentStatus || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls
                currentPage={claimsPage}
                totalPages={getTotalPages(filteredClaims.length)}
                onPageChange={setClaimsPage}
                totalItems={filteredClaims.length}
                itemName="claims"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Management</CardTitle>
                  <CardDescription>Manage sales records and customer data</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, "sales")
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingSales}
                    />
                    <Button disabled={uploadingSales}>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingSales ? "Uploading..." : "Upload Sales"}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => handleExport("sales")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={selectedSales.length === 0}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedSales.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {selectedSales.length} selected sales records. This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleBulkDelete("sales")}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sales..."
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedSales.length === paginatedSales.length && paginatedSales.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSales(paginatedSales.map((s) => s._id))
                          } else {
                            setSelectedSales([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Activation Code</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Pincode</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSales.includes(sale._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSales([...selectedSales, sale._id])
                            } else {
                              setSelectedSales(selectedSales.filter((id) => id !== sale._id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{sale.name}</TableCell>
                      <TableCell>{sale.email}</TableCell>
                      <TableCell>{sale.phone}</TableCell>
                      <TableCell className="font-mono text-sm">{sale.activationCode}</TableCell>
                      <TableCell>{sale.address}</TableCell>
                      <TableCell>{sale.city}</TableCell>
                      <TableCell>{sale.state}</TableCell>
                      <TableCell>{sale.pincode}</TableCell>
                      <TableCell>{sale.ottPlatform || "N/A"}</TableCell>
                      <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls
                currentPage={salesPage}
                totalPages={getTotalPages(filteredSales.length)}
                onPageChange={setSalesPage}
                totalItems={filteredSales.length}
                itemName="sales"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Keys Management</CardTitle>
                  <CardDescription>Manage OTT platform keys and assignments</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, "keys")
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingKeys}
                    />
                    <Button disabled={uploadingKeys}>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingKeys ? "Uploading..." : "Upload Keys"}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => handleExport("keys")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={selectedKeys.length === 0}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedKeys.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {selectedKeys.length} selected keys. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleBulkDelete("keys")}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search keys..."
                  value={keysSearch}
                  onChange={(e) => setKeysSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedKeys.length === paginatedKeys.length && paginatedKeys.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedKeys(paginatedKeys.map((k) => k._id))
                          } else {
                            setSelectedKeys([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Date Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedKeys.map((key) => (
                    <TableRow key={key._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedKeys.includes(key._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedKeys([...selectedKeys, key._id])
                            } else {
                              setSelectedKeys(selectedKeys.filter((id) => id !== key._id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{key.ottPlatform}</TableCell>
                      <TableCell className="font-mono text-sm">{key.ottKey}</TableCell>
                      <TableCell>
                        <Badge variant={key.isUsed ? "destructive" : "default"}>
                          {key.isUsed ? "Used" : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell>{key.assignedTo || "Unassigned"}</TableCell>
                      <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls
                currentPage={keysPage}
                totalPages={getTotalPages(filteredKeys.length)}
                onPageChange={setKeysPage}
                totalItems={filteredKeys.length}
                itemName="keys"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
// ready