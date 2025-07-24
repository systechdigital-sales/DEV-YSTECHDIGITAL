"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, RefreshCw, Upload, Play } from "lucide-react"
import Image from "next/image"

interface ClaimResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  streetAddress: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  purchaseType: string
  activationCode: string
  purchaseDate: string
  claimSubmissionDate: string
  invoiceNumber?: string
  sellerName?: string
  paymentStatus: string
  paymentId?: string
  ottCodeStatus: string
  ottCode?: string
  createdAt: string
  billFileName?: string
}

interface SalesRecord {
  id: string
  productSubCategory: string
  product: string
  activationCode: string
}

interface OTTKey {
  id: string
  productSubCategory: string
  product: string
  activationCode: string
  status: string
  assignedEmail?: string
  assignedDate?: string
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [claimResponses, setClaimResponses] = useState<ClaimResponse[]>([])
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([])
  const [ottKeys, setOTTKeys] = useState<OTTKey[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingSales, setUploadingSales] = useState(false)
  const [uploadingKeys, setUploadingKeys] = useState(false)
  const salesFileInputRef = useRef<HTMLInputElement>(null)
  const keysFileInputRef = useRef<HTMLInputElement>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginData.email === "sales.systechdigital@gmail.com" && loginData.password === "Admin@12345") {
      setIsAuthenticated(true)
      fetchAllData()
    } else {
      alert("Invalid credentials")
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch claim responses
      const claimsResponse = await fetch("/api/admin/claims")
      const claimsData = await claimsResponse.json()
      setClaimResponses(Array.isArray(claimsData) ? claimsData : [])

      // Fetch sales records
      const salesResponse = await fetch("/api/admin/sales")
      const salesData = await salesResponse.json()
      setSalesRecords(Array.isArray(salesData) ? salesData : [])

      // Fetch OTT keys
      const keysResponse = await fetch("/api/admin/keys")
      const keysData = await keysResponse.json()
      setOTTKeys(Array.isArray(keysData) ? keysData : [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSalesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingSales(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/admin/upload-sales", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        alert(`Successfully uploaded ${result.count} sales records`)
        fetchAllData()
      } else {
        alert("Error uploading sales data: " + result.error)
      }
    } catch (error) {
      console.error("Error uploading sales:", error)
      alert("Error uploading sales data")
    } finally {
      setUploadingSales(false)
      if (salesFileInputRef.current) {
        salesFileInputRef.current.value = ""
      }
    }
  }

  const handleKeysUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingKeys(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/admin/upload-keys", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        alert(`Successfully uploaded ${result.count} OTT keys`)
        fetchAllData()
      } else {
        alert("Error uploading OTT keys: " + result.error)
      }
    } catch (error) {
      console.error("Error uploading keys:", error)
      alert("Error uploading OTT keys")
    } finally {
      setUploadingKeys(false)
      if (keysFileInputRef.current) {
        keysFileInputRef.current.value = ""
      }
    }
  }

  const exportToExcel = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/export?type=${type}`)

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}_export_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Error exporting data")
    }
  }

  const processAutomation = async () => {
    if (
      !confirm(
        "Are you sure you want to start the automation process? This will check all pending claims and send OTT codes where applicable.",
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/process-automation", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        alert(
          `Automation completed successfully!\n\nProcessed: ${result.processed} claims\nOTT Codes Sent: ${result.ottCodesSent}\nWait Emails Sent: ${result.waitEmails}\nAlready Claimed: ${result.alreadyClaimed}`,
        )
        fetchAllData()
      } else {
        alert("Error processing automation: " + result.message)
      }
    } catch (error) {
      console.error("Error processing automation:", error)
      alert("Error processing automation")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={60} height={60} className="rounded-full" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-gray-600">SYSTECH DIGITAL Admin Dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="sales.systechdigital@gmail.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Admin@12345"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-red-200 mt-1">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={processAutomation} disabled={loading} className="bg-green-600 hover:bg-green-700">
                <Play className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Start Automation
              </Button>
              <Button
                onClick={() => setIsAuthenticated(false)}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-black"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="claims" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="claims">OTT Claim Responses ({claimResponses.length})</TabsTrigger>
            <TabsTrigger value="sales">All Sales ({salesRecords.length})</TabsTrigger>
            <TabsTrigger value="keys">OTT Keys ({ottKeys.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>OTT Claim Responses</CardTitle>
                  <div className="flex space-x-2">
                    <Button onClick={() => exportToExcel("claims")} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button onClick={fetchAllData} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
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
                        <TableHead>Address</TableHead>
                        <TableHead>Purchase Type</TableHead>
                        <TableHead>Activation Code</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>OTT Status</TableHead>
                        <TableHead>OTT Code</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimResponses.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell>
                            {claim.firstName} {claim.lastName}
                          </TableCell>
                          <TableCell>{claim.email}</TableCell>
                          <TableCell>{claim.phone}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{claim.streetAddress}</div>
                              <div>
                                {claim.city}, {claim.state}
                              </div>
                              <div>
                                {claim.country} - {claim.postalCode}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={claim.purchaseType === "hardware" ? "default" : "secondary"}>
                              {claim.purchaseType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{claim.activationCode}</TableCell>
                          <TableCell>{claim.purchaseDate}</TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell className="font-mono text-xs">{claim.paymentId || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={claim.ottCodeStatus === "sent" ? "default" : "secondary"}>
                              {claim.ottCodeStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{claim.ottCode || "-"}</TableCell>
                          <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
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

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Sales Records</CardTitle>
                  <div className="flex space-x-2">
                    <input
                      ref={salesFileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleSalesUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => salesFileInputRef.current?.click()}
                      disabled={uploadingSales}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingSales ? "Uploading..." : "Upload Sales Data"}
                    </Button>
                    <Button onClick={() => exportToExcel("sales")} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button onClick={fetchAllData} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Upload Instructions:</h4>
                  <p className="text-sm text-blue-800">
                    Upload an Excel file (.xlsx, .xls) or CSV file with the following columns:
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc">
                    <li>
                      <strong>Product Sub Category</strong> - Category of the product
                    </li>
                    <li>
                      <strong>Product</strong> - Product name
                    </li>
                    <li>
                      <strong>Activation Code/ Serial No / IMEI Number</strong> - Unique identifier
                    </li>
                  </ul>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Sub Category</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Activation Code/ Serial No / IMEI Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesRecords.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.productSubCategory}</TableCell>
                          <TableCell>{sale.product}</TableCell>
                          <TableCell className="font-mono">{sale.activationCode}</TableCell>
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
                <div className="flex justify-between items-center">
                  <CardTitle>OTT Keys Management</CardTitle>
                  <div className="flex space-x-2">
                    <input
                      ref={keysFileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleKeysUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => keysFileInputRef.current?.click()}
                      disabled={uploadingKeys}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingKeys ? "Uploading..." : "Upload OTT Keys"}
                    </Button>
                    <Button onClick={() => exportToExcel("keys")} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button onClick={fetchAllData} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Upload Instructions:</h4>
                  <p className="text-sm text-purple-800">
                    Upload an Excel file (.xlsx, .xls) or CSV file with the following columns:
                  </p>
                  <ul className="text-sm text-purple-800 mt-2 ml-4 list-disc">
                    <li>
                      <strong>Product Sub Category</strong> - Category of the OTT service
                    </li>
                    <li>
                      <strong>Product</strong> - OTT service name (Netflix, Prime, etc.)
                    </li>
                    <li>
                      <strong>Activation Code</strong> - OTT subscription code
                    </li>
                  </ul>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Sub Category</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Activation Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned Email</TableHead>
                        <TableHead>Assigned Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ottKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell>{key.productSubCategory}</TableCell>
                          <TableCell>{key.product}</TableCell>
                          <TableCell className="font-mono text-sm">{key.activationCode}</TableCell>
                          <TableCell>
                            <Badge variant={key.status === "available" ? "default" : "destructive"}>{key.status}</Badge>
                          </TableCell>
                          <TableCell>{key.assignedEmail || "-"}</TableCell>
                          <TableCell>
                            {key.assignedDate ? new Date(key.assignedDate).toLocaleDateString() : "-"}
                          </TableCell>
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