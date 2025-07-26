"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, RefreshCw, Upload, Play } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"

export default function AdminDashboard() {
  const [claimResponses, setClaimResponses] = useState<ClaimResponse[]>([])
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([])
  const [ottKeys, setOTTKeys] = useState<OTTKey[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingSales, setUploadingSales] = useState(false)
  const [uploadingKeys, setUploadingKeys] = useState(false)
  const salesFileInputRef = useRef<HTMLInputElement>(null)
  const keysFileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchAllData()
  }, [router])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      console.log("Fetching all data from MongoDB...")

      // Fetch claim responses with force refresh
      const claimsResponse = await fetch("/api/admin/claims", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      const claimsData = await claimsResponse.json()
      console.log("Claims data fetched:", claimsData)
      setClaimResponses(Array.isArray(claimsData) ? claimsData : [])

      // Fetch sales records with force refresh
      const salesResponse = await fetch("/api/admin/sales", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      const salesData = await salesResponse.json()
      console.log("Sales data fetched:", salesData)
      setSalesRecords(Array.isArray(salesData) ? salesData : [])

      // Fetch OTT keys with force refresh
      const keysResponse = await fetch("/api/admin/keys", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      const keysData = await keysResponse.json()
      console.log("Keys data fetched:", keysData)
      setOTTKeys(Array.isArray(keysData) ? keysData : [])

      console.log("All data refreshed successfully")
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
        await fetchAllData() // Refresh data after upload
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
        await fetchAllData() // Refresh data after upload
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

  const goToAutomation = () => {
    router.push("/automation")
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated")
    router.push("/login")
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
              <Button onClick={goToAutomation} disabled={loading} className="bg-green-600 hover:bg-green-700">
                <Play className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Start Automation
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-black bg-transparent"
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
                    <Button onClick={fetchAllData} variant="outline" disabled={loading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      {loading ? "Refreshing..." : "Refresh"}
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
                        <TableHead>Order ID</TableHead>
                        <TableHead>Razorpay Payment ID</TableHead>
                        <TableHead>Razorpay Order ID</TableHead>
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
                                claim.paymentStatus === "paid"
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
                          <TableCell className="font-mono text-xs">{claim.orderId || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{claim.razorpayPaymentId || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{claim.razorpayOrderId || "-"}</TableCell>
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
                    <Button onClick={fetchAllData} variant="outline" disabled={loading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      {loading ? "Refreshing..." : "Refresh"}
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
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesRecords.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.productSubCategory}</TableCell>
                          <TableCell>{sale.product}</TableCell>
                          <TableCell className="font-mono">{sale.activationCode}</TableCell>
                          <TableCell>
                            <Badge variant={sale.status === "claimed" ? "destructive" : "default"}>
                              {sale.status || "available"}
                            </Badge>
                          </TableCell>
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
                    <Button onClick={fetchAllData} variant="outline" disabled={loading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      {loading ? "Refreshing..." : "Refresh"}
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
