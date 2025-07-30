"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Mail,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

interface EmailRecord {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  activationCode: string
  paymentStatus: "pending" | "paid" | "failed"
  ottCode: string
  ottCodeStatus: "pending" | "delivered" | "failed" | "already_claimed" | "activation_code_not_found"
  ottAssignedAt?: string
  createdAt: string
  amount?: number
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailRecord[]>([])
  const [filteredEmails, setFilteredEmails] = useState<EmailRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchEmails()
  }, [router])

  useEffect(() => {
    filterEmails()
  }, [emails, searchTerm, statusFilter, paymentFilter])

  const fetchEmails = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/claims")
      if (response.ok) {
        const data = await response.json()
        setEmails(data)
      }
    } catch (error) {
      console.error("Error fetching emails:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterEmails = () => {
    let filtered = emails

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (email) =>
          email.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.activationCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((email) => email.ottCodeStatus === statusFilter)
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((email) => email.paymentStatus === paymentFilter)
    }

    setFilteredEmails(filtered)
  }

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Activation Code",
      "Payment Status",
      "OTT Status",
      "OTT Code",
      "Date Created",
      "OTT Assigned Date",
    ]

    const csvData = filteredEmails.map((email) => [
      `${email.firstName} ${email.lastName}`,
      email.email,
      email.phoneNumber,
      email.activationCode,
      email.paymentStatus,
      email.ottCodeStatus,
      email.ottCode || "Not assigned",
      new Date(email.createdAt).toLocaleDateString(),
      email.ottAssignedAt ? new Date(email.ottAssignedAt).toLocaleDateString() : "Not assigned",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `email-history-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string, type: "payment" | "ott") => {
    const statusConfig = {
      payment: {
        pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
        paid: { color: "bg-green-100 text-green-800", icon: CheckCircle },
        failed: { color: "bg-red-100 text-red-800", icon: XCircle },
      },
      ott: {
        pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
        delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle },
        failed: { color: "bg-red-100 text-red-800", icon: XCircle },
        already_claimed: { color: "bg-orange-100 text-orange-800", icon: AlertCircle },
        activation_code_not_found: { color: "bg-gray-100 text-gray-800", icon: XCircle },
      },
    }

    const config = statusConfig[type][status as keyof (typeof statusConfig)[typeof type]]
    const Icon = config?.icon || AlertCircle

    return (
      <Badge className={`${config?.color} font-semibold flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{status.toUpperCase().replace("_", " ")}</span>
      </Badge>
    )
  }

  const stats = {
    total: emails.length,
    delivered: emails.filter((e) => e.ottCodeStatus === "delivered").length,
    pending: emails.filter((e) => e.ottCodeStatus === "pending").length,
    failed: emails.filter((e) => e.ottCodeStatus === "failed").length,
    paid: emails.filter((e) => e.paymentStatus === "paid").length,
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex">
          <DashboardSidebar />
          <SidebarInset className="flex-1 overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading email history...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          {/* Header */}
          <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 shadow-xl border-b border-teal-200 sticky top-0 z-10">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-white hover:bg-white/20 p-2 rounded-lg" />
                  <div className="flex items-center space-x-3">
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
                      <h1 className="text-2xl font-bold text-white flex items-center">
                        <Mail className="w-6 h-6 mr-2" />
                        Email History & Tracking
                      </h1>
                      <p className="text-sm text-teal-200 mt-1">Complete email communication tracking system</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={fetchEmails}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto">
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Emails</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                      </div>
                      <Mail className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Delivered</p>
                        <p className="text-3xl font-bold">{stats.delivered}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">Pending</p>
                        <p className="text-3xl font-bold">{stats.pending}</p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">Failed</p>
                        <p className="text-3xl font-bold">{stats.failed}</p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Paid Claims</p>
                        <p className="text-3xl font-bold">{stats.paid}</p>
                      </div>
                      <User className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Search */}
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg border-b">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-gray-600" />
                    Advanced Filtering & Search
                  </CardTitle>
                  <CardDescription>Filter and search through email records with advanced options</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search by email, name, or code..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">OTT Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="already_claimed">Already Claimed</SelectItem>
                          <SelectItem value="activation_code_not_found">Code Not Found</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Payment Status</label>
                      <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All payments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payments</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Actions</label>
                      <Button onClick={exportToCSV} className="w-full bg-teal-600 hover:bg-teal-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Records Table */}
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-800">Email Communication Records</CardTitle>
                      <CardDescription className="text-lg text-gray-600">
                        Complete tracking of all email communications from Claims table ({filteredEmails.length} of{" "}
                        {emails.length} records)
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                      <Calendar className="w-4 h-4 mr-1" />
                      Live Data
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Customer</TableHead>
                          <TableHead className="font-semibold">Email Address</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="font-semibold">Activation Code</TableHead>
                          <TableHead className="font-semibold">Payment Status</TableHead>
                          <TableHead className="font-semibold">OTT Status</TableHead>
                          <TableHead className="font-semibold">OTT Code</TableHead>
                          <TableHead className="font-semibold">Created Date</TableHead>
                          <TableHead className="font-semibold">OTT Assigned</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmails.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12">
                              <div className="flex flex-col items-center space-y-4">
                                <Mail className="w-16 h-16 text-gray-300" />
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-600">No Email Records Found</h3>
                                  <p className="text-gray-500">
                                    {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                                      ? "Try adjusting your filters or search terms"
                                      : "No email records available in the system"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredEmails.map((email) => (
                            <TableRow key={email._id} className="hover:bg-gray-50 transition-colors">
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-teal-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">
                                      {email.firstName} {email.lastName}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                                    {email.email}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{email.phoneNumber}</TableCell>
                              <TableCell className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                                {email.activationCode}
                              </TableCell>
                              <TableCell>{getStatusBadge(email.paymentStatus, "payment")}</TableCell>
                              <TableCell>{getStatusBadge(email.ottCodeStatus, "ott")}</TableCell>
                              <TableCell>
                                {email.ottCode ? (
                                  <div className="font-mono text-sm bg-green-50 px-2 py-1 rounded border border-green-200">
                                    {email.ottCode}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Not assigned</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>{new Date(email.createdAt).toLocaleDateString()}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {email.ottAssignedAt ? (
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>{new Date(email.ottAssignedAt).toLocaleDateString()}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Not assigned</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Information */}
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg border-b">
                  <CardTitle className="text-xl font-bold text-gray-800">Email Tracking Summary</CardTitle>
                  <CardDescription>Overview of email communication status and system performance</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-green-800">Email Delivery Rate</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}%
                      </p>
                      <p className="text-sm text-green-600">
                        {stats.delivered} of {stats.total} emails delivered
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-blue-800">Payment Success Rate</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
                      </p>
                      <p className="text-sm text-blue-600">
                        {stats.paid} of {stats.total} payments successful
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-purple-800">System Status</h3>
                      <p className="text-lg font-bold text-purple-600">Operational</p>
                      <p className="text-sm text-purple-600">Email tracking active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
