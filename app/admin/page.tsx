"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { Progress } from "@/components/ui/progress"
import { Upload, Download, Play, RefreshCw, Users, Key, CreditCard } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Force dynamic rendering
export const dynamic = "force-dynamic"

interface ClaimResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  activationCode: string
  purchaseType: string
  paymentStatus: string
  ottCodeStatus: string
  createdAt: string
}

interface SalesRecord {
  id: string
  customerName: string
  email: string
  activationCode: string
  status: string
  createdAt: string
}

interface OTTKey {
  id: string
  platform: string
  keyCode: string
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const [claims, setClaims] = useState<ClaimResponse[]>([])
  const [sales, setSales] = useState<SalesRecord[]>([])
  const [ottKeys, setOttKeys] = useState<OTTKey[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [automating, setAutomating] = useState(false)
  const [automationProgress, setAutomationProgress] = useState(0)
  const [automationResults, setAutomationResults] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

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
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, type: string) => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const endpoint = type === "sales" ? "/api/admin/upload-sales" : "/api/admin/upload-keys"
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `${type === "sales" ? "Sales records" : "OTT keys"} uploaded successfully`,
        })
        fetchData() // Refresh data
      } else {
        toast({
          title: "Error",
          description: result.error || "Upload failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Upload failed",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleAutomation = async () => {
    setAutomating(true)
    setAutomationProgress(0)
    setAutomationResults(null)

    try {
      const response = await fetch("/api/admin/process-automation", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setAutomationResults(result.results)
        toast({
          title: "Automation Complete",
          description: `Processed ${result.results.processed} claims successfully`,
        })
        fetchData() // Refresh data
      } else {
        toast({
          title: "Automation Failed",
          description: result.error || "Automation process failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Automation error:", error)
      toast({
        title: "Error",
        description: "Automation process failed",
        variant: "destructive",
      })
    } finally {
      setAutomating(false)
      setAutomationProgress(100)
    }
  }

  const handleExport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/export?type=${type}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${type}_export.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: `${type} data exported successfully`,
        })
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Error",
        description: "Export failed",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      completed: "default",
      failed: "destructive",
      success: "default",
      available: "secondary",
      assigned: "default",
      used: "destructive",
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <Button onClick={() => (window.location.href = "/")} variant="outline">
                Back to Home
              </Button>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Records</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OTT Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ottKeys.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Keys</CardTitle>
              <Key className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ottKeys.filter((k) => k.status === "available").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Automation Control</CardTitle>
            <CardDescription>Process paid claims and assign OTT keys automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={automating}>
                    <Play className="h-4 w-4 mr-2" />
                    {automating ? "Processing..." : "Run Automation"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Run Automation Process</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will process all paid claims, match them with sales records, and assign available OTT keys.
                      Email notifications will be sent to customers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAutomation}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {automating && (
                <div className="flex-1">
                  <Progress value={automationProgress} className="w-full" />
                </div>
              )}
            </div>

            {automationResults && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Automation Results</h4>
                <p className="text-green-700">
                  Processed: {automationResults.processed} | Success: {automationResults.success} | Failed:{" "}
                  {automationResults.failed}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management Tabs */}
        <Tabs defaultValue="claims" className="space-y-4">
          <TabsList>
            <TabsTrigger value="claims">OTT Claims</TabsTrigger>
            <TabsTrigger value="sales">Sales Records</TabsTrigger>
            <TabsTrigger value="keys">OTT Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>OTT Claim Responses</CardTitle>
                    <CardDescription>Manage customer OTT platform claims</CardDescription>
                  </div>
                  <Button onClick={() => handleExport("claims")} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
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
                        <TableHead>Purchase Type</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>OTT Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell>{`${claim.firstName} ${claim.lastName}`}</TableCell>
                          <TableCell>{claim.email}</TableCell>
                          <TableCell>{claim.phone}</TableCell>
                          <TableCell>{claim.activationCode}</TableCell>
                          <TableCell>{claim.purchaseType}</TableCell>
                          <TableCell>{getStatusBadge(claim.paymentStatus)}</TableCell>
                          <TableCell>{getStatusBadge(claim.ottCodeStatus)}</TableCell>
                          <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Sales Records</CardTitle>
                    <CardDescription>Upload and manage sales data</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, "sales")
                      }}
                      className="hidden"
                      id="sales-upload"
                    />
                    <Label htmlFor="sales-upload" className="cursor-pointer">
                      <Button variant="outline" disabled={uploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Excel
                      </Button>
                    </Label>
                    <Button onClick={() => handleExport("sales")} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
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
                        <TableHead>Activation Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{sale.email}</TableCell>
                          <TableCell>{sale.activationCode}</TableCell>
                          <TableCell>{getStatusBadge(sale.status)}</TableCell>
                          <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>OTT Keys</CardTitle>
                    <CardDescription>Manage available OTT platform keys</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, "keys")
                      }}
                      className="hidden"
                      id="keys-upload"
                    />
                    <Label htmlFor="keys-upload" className="cursor-pointer">
                      <Button variant="outline" disabled={uploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Excel
                      </Button>
                    </Label>
                    <Button onClick={() => handleExport("keys")} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Key Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ottKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell>{key.platform}</TableCell>
                          <TableCell>{key.keyCode}</TableCell>
                          <TableCell>{getStatusBadge(key.status)}</TableCell>
                          <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
