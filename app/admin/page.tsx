"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Download,
  RefreshCw,
  Key,
  Users,
  ShoppingCart,
  TrendingUp,
  Settings,
  Trash2,
  Send,
  MoreHorizontal,
  Eye,
  UserPlus,
} from "lucide-react"

interface OTTKey {
  _id: string
  keyValue: string
  status: "available" | "assigned" | "used"
  assignedTo?: string
  assignedAt?: string
  usedAt?: string
  createdAt: string
}

interface SalesRecord {
  _id: string
  customerName: string
  email: string
  phone: string
  orderDate: string
  amount: number
  status: "pending" | "completed" | "cancelled"
  ottKeyAssigned?: string
}

interface ClaimResponse {
  _id: string
  customerName: string
  email: string
  phone: string
  activationCode: string
  ottKey?: string
  status: "pending" | "processing" | "completed" | "failed"
  submittedAt: string
  processedAt?: string
  paymentStatus?: "pending" | "completed" | "failed"
  amount?: number
}

interface AutomationSettings {
  _id?: string
  enabled: boolean
  triggerThreshold: number
  emailTemplate: string
  lastTriggered?: string
  totalProcessed: number
}

interface Stats {
  totalKeys: number
  availableKeys: number
  assignedKeys: number
  usedKeys: number
  totalSales: number
  pendingSales: number
  completedSales: number
  totalClaims: number
  pendingClaims: number
  completedClaims: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalKeys: 0,
    availableKeys: 0,
    assignedKeys: 0,
    usedKeys: 0,
    totalSales: 0,
    pendingSales: 0,
    completedSales: 0,
    totalClaims: 0,
    pendingClaims: 0,
    completedClaims: 0,
    totalRevenue: 0,
  })

  const [ottKeys, setOttKeys] = useState<OTTKey[]>([])
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([])
  const [claimResponses, setClaimResponses] = useState<ClaimResponse[]>([])
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>({
    enabled: false,
    triggerThreshold: 10,
    emailTemplate: "",
    totalProcessed: 0,
  })

  const [loading, setLoading] = useState(false)
  const [uploadingKeys, setUploadingKeys] = useState(false)
  const [uploadingSales, setUploadingSales] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const [manualAssignEmail, setManualAssignEmail] = useState("")
  const [manualAssignKey, setManualAssignKey] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch OTT Keys
      const keysRes = await fetch("/api/admin/keys")
      const keysData = await keysRes.json()
      if (keysData.success) {
        setOttKeys(keysData.keys)
      }

      // Fetch Sales Records
      const salesRes = await fetch("/api/admin/sales")
      const salesData = await salesRes.json()
      if (salesData.success) {
        setSalesRecords(salesData.sales)
      }

      // Fetch Claims
      const claimsRes = await fetch("/api/admin/claims")
      const claimsData = await claimsRes.json()
      if (claimsData.success) {
        setClaimResponses(claimsData.claims)
      }

      // Fetch Automation Settings
      const automationRes = await fetch("/api/admin/automation-settings")
      const automationData = await automationRes.json()
      if (automationData.success) {
        setAutomationSettings(automationData.settings)
      }

      // Calculate stats
      const totalKeys = keysData.success ? keysData.keys.length : 0
      const availableKeys = keysData.success
        ? keysData.keys.filter((key: OTTKey) => key.status === "available").length
        : 0
      const assignedKeys = keysData.success
        ? keysData.keys.filter((key: OTTKey) => key.status === "assigned").length
        : 0
      const usedKeys = keysData.success ? keysData.keys.filter((key: OTTKey) => key.status === "used").length : 0

      const totalSales = salesData.success ? salesData.sales.length : 0
      const pendingSales = salesData.success
        ? salesData.sales.filter((sale: SalesRecord) => sale.status === "pending").length
        : 0
      const completedSales = salesData.success
        ? salesData.sales.filter((sale: SalesRecord) => sale.status === "completed").length
        : 0

      const totalClaims = claimsData.success ? claimsData.claims.length : 0
      const pendingClaims = claimsData.success
        ? claimsData.claims.filter((claim: ClaimResponse) => claim.status === "pending").length
        : 0
      const completedClaims = claimsData.success
        ? claimsData.claims.filter((claim: ClaimResponse) => claim.status === "completed").length
        : 0

      const totalRevenue = salesData.success
        ? salesData.sales.reduce((sum: number, sale: SalesRecord) => sum + (sale.amount || 0), 0)
        : 0

      setStats({
        totalKeys,
        availableKeys,
        assignedKeys,
        usedKeys,
        totalSales,
        pendingSales,
        completedSales,
        totalClaims,
        pendingClaims,
        completedClaims,
        totalRevenue,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      setMessage({ type: "error", text: "Failed to fetch data" })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, type: "keys" | "sales") => {
    if (type === "keys") setUploadingKeys(true)
    if (type === "sales") setUploadingSales(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const endpoint = type === "keys" ? "/api/admin/upload-keys" : "/api/admin/upload-sales"
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ type: "success", text: data.message })
        fetchData()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Upload failed" })
    } finally {
      if (type === "keys") setUploadingKeys(false)
      if (type === "sales") setUploadingSales(false)
    }
  }

  const handleExport = async (type: "keys" | "sales" | "claims") => {
    try {
      const res = await fetch(`/api/admin/export?type=${type}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      setMessage({ type: "error", text: "Export failed" })
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedKeys.length === 0) return

    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyIds: selectedKeys }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ type: "success", text: `Deleted ${selectedKeys.length} keys` })
        setSelectedKeys([])
        fetchData()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Delete failed" })
    }
  }

  const handleManualAssign = async () => {
    if (!manualAssignEmail || !manualAssignKey) {
      setMessage({ type: "error", text: "Please provide both email and key" })
      return
    }

    try {
      const res = await fetch("/api/admin/manual-assign-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: manualAssignEmail,
          keyValue: manualAssignKey,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ type: "success", text: "Key assigned successfully" })
        setManualAssignEmail("")
        setManualAssignKey("")
        fetchData()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Assignment failed" })
    }
  }

  const handleAutomationToggle = async (enabled: boolean) => {
    try {
      const res = await fetch("/api/admin/automation-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...automationSettings,
          enabled,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setAutomationSettings((prev) => ({ ...prev, enabled }))
        setMessage({ type: "success", text: `Automation ${enabled ? "enabled" : "disabled"}` })
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update automation settings" })
    }
  }

  const triggerAutomation = async () => {
    try {
      const res = await fetch("/api/admin/trigger-auto-processing", {
        method: "POST",
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ type: "success", text: `Processed ${data.processed} claims` })
        fetchData()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to trigger automation" })
    }
  }

  const filteredKeys = ottKeys.filter((key) => {
    const matchesStatus = filterStatus === "all" || key.status === filterStatus
    const matchesSearch =
      key.keyValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (key.assignedTo && key.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage OTT keys, sales, and customer claims</p>
          </div>
          <Button onClick={fetchData} disabled={loading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OTT Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKeys}</div>
              <p className="text-xs text-muted-foreground">
                {stats.availableKeys} available • {stats.assignedKeys} assigned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Records</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingSales} pending • {stats.completedSales} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claims</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClaims}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingClaims} pending • {stats.completedClaims} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total sales revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="keys" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="keys">OTT Keys</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* OTT Keys Tab */}
          <TabsContent value="keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>OTT Keys Management</CardTitle>
                <CardDescription>Upload, manage, and assign OTT keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload and Actions */}
                <div className="flex flex-wrap gap-4">
                  <div>
                    <Label htmlFor="keys-upload">Upload Keys (Excel)</Label>
                    <Input
                      id="keys-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, "keys")
                      }}
                      disabled={uploadingKeys}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={() => handleExport("keys")} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Keys
                    </Button>
                    {selectedKeys.length > 0 && (
                      <Button onClick={handleDeleteSelected} variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedKeys.length})
                      </Button>
                    )}
                  </div>
                </div>

                {/* Manual Assignment */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="assign-email">Customer Email</Label>
                    <Input
                      id="assign-email"
                      type="email"
                      placeholder="customer@example.com"
                      value={manualAssignEmail}
                      onChange={(e) => setManualAssignEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assign-key">Key Value</Label>
                    <Input
                      id="assign-key"
                      placeholder="Enter key value"
                      value={manualAssignKey}
                      onChange={(e) => setManualAssignKey(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleManualAssign}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign Key
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  <div>
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search keys or emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Keys Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedKeys.length === filteredKeys.length && filteredKeys.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedKeys(filteredKeys.map((key) => key._id))
                              } else {
                                setSelectedKeys([])
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Key Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKeys.map((key) => (
                        <TableRow key={key._id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedKeys.includes(key._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedKeys([...selectedKeys, key._id])
                                } else {
                                  setSelectedKeys(selectedKeys.filter((id) => id !== key._id))
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{key.keyValue}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                key.status === "available"
                                  ? "default"
                                  : key.status === "assigned"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {key.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{key.assignedTo || "-"}</TableCell>
                          <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Records</CardTitle>
                <CardDescription>Manage customer sales and orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div>
                    <Label htmlFor="sales-upload">Upload Sales (Excel)</Label>
                    <Input
                      id="sales-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, "sales")
                      }}
                      disabled={uploadingSales}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={() => handleExport("sales")} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Sales
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>OTT Key</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesRecords.map((sale) => (
                        <TableRow key={sale._id}>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{sale.email}</TableCell>
                          <TableCell>{sale.phone}</TableCell>
                          <TableCell>{new Date(sale.orderDate).toLocaleDateString()}</TableCell>
                          <TableCell>₹{sale.amount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                sale.status === "completed"
                                  ? "default"
                                  : sale.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {sale.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{sale.ottKeyAssigned || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Claims</CardTitle>
                <CardDescription>Process customer redemption claims</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={() => handleExport("claims")} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Claims
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Activation Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimResponses.map((claim) => (
                        <TableRow key={claim._id}>
                          <TableCell>{claim.customerName}</TableCell>
                          <TableCell>{claim.email}</TableCell>
                          <TableCell>{claim.phone}</TableCell>
                          <TableCell className="font-mono text-sm">{claim.activationCode}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                claim.status === "completed"
                                  ? "default"
                                  : claim.status === "processing"
                                    ? "secondary"
                                    : claim.status === "failed"
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {claim.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {claim.paymentStatus && (
                              <Badge variant={claim.paymentStatus === "completed" ? "default" : "secondary"}>
                                {claim.paymentStatus}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(claim.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>Configure automated claim processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Auto Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically process claims when threshold is reached
                    </p>
                  </div>
                  <Switch checked={automationSettings.enabled} onCheckedChange={handleAutomationToggle} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="threshold">Trigger Threshold</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={automationSettings.triggerThreshold}
                      onChange={(e) =>
                        setAutomationSettings((prev) => ({
                          ...prev,
                          triggerThreshold: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">Process claims when this many are pending</p>
                  </div>
                  <div>
                    <Label>Total Processed</Label>
                    <div className="text-2xl font-bold">{automationSettings.totalProcessed}</div>
                    <p className="text-xs text-muted-foreground">Claims processed automatically</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email-template">Email Template</Label>
                  <Textarea
                    id="email-template"
                    rows={6}
                    value={automationSettings.emailTemplate}
                    onChange={(e) =>
                      setAutomationSettings((prev) => ({
                        ...prev,
                        emailTemplate: e.target.value,
                      }))
                    }
                    placeholder="Enter email template for automated responses..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button onClick={triggerAutomation}>
                    <Send className="mr-2 h-4 w-4" />
                    Trigger Manual Processing
                  </Button>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>

                {automationSettings.lastTriggered && (
                  <div className="text-sm text-muted-foreground">
                    Last triggered: {new Date(automationSettings.lastTriggered).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Key Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Available Keys</span>
                        <span>
                          {stats.availableKeys}/{stats.totalKeys}
                        </span>
                      </div>
                      <Progress value={(stats.availableKeys / stats.totalKeys) * 100} className="mt-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Assigned Keys</span>
                        <span>
                          {stats.assignedKeys}/{stats.totalKeys}
                        </span>
                      </div>
                      <Progress value={(stats.assignedKeys / stats.totalKeys) * 100} className="mt-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Used Keys</span>
                        <span>
                          {stats.usedKeys}/{stats.totalKeys}
                        </span>
                      </div>
                      <Progress value={(stats.usedKeys / stats.totalKeys) * 100} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-bold">₹{stats.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Sales</span>
                      <span>{stats.completedSales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Sales</span>
                      <span>{stats.pendingSales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion Rate</span>
                      <span>
                        {stats.totalSales > 0 ? ((stats.completedSales / stats.totalSales) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
