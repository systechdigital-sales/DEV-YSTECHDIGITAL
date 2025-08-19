"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"

interface Claim {
  _id: string
  claimId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  activationCode: string
  paymentStatus: string
  ottStatus: string
  ottCode: string
  createdAt: string
  amount: number
}

interface ClaimsTableProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filters: {
    paymentStatus: string
    ottStatus: string
  }
  onFilterChange: (key: string, value: string) => void
  dateFilter: {
    startDate: string
    endDate: string
  }
  sortConfig: {
    key: string
    direction: string
  }
  onSort: (key: string) => void
}

export default function ClaimsTable({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  dateFilter,
  sortConfig,
  onSort,
}: ClaimsTableProps) {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  })

  const loadClaims = async (page = 1) => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: searchTerm,
        sortBy: sortConfig.key,
        order: sortConfig.direction,
        paymentStatus: filters.paymentStatus,
        ottStatus: filters.ottStatus,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
      })

      const response = await fetch(`/api/admin/claims?${params}`)
      const data = await response.json()

      if (response.ok) {
        setClaims(data.data || [])
        setPagination({
          page: data.page || 1,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        })
      } else {
        throw new Error(data.error || "Failed to fetch claims")
      }
    } catch (err: any) {
      console.error("Error loading claims:", err)
      setError(err.message || "Failed to load claims")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClaims(1)
  }, [searchTerm, filters, dateFilter, sortConfig])

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/export?type=claims")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `claims-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const getStatusBadge = (status: string, type: "payment" | "ott") => {
    const colors = {
      payment: {
        paid: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        failed: "bg-red-100 text-red-800",
      },
      ott: {
        delivered: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        failed: "bg-red-100 text-red-800",
      },
    }
    return colors[type][status as keyof (typeof colors)[typeof type]] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Redemption Records</CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Claims
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />

          <Select value={filters.paymentStatus} onValueChange={(value) => onFilterChange("paymentStatus", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.ottStatus} onValueChange={(value) => onFilterChange("ottStatus", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="OTT Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All OTT Status</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading && <div className="text-center py-4">Loading claims...</div>}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 cursor-pointer" onClick={() => onSort("claimId")}>
                      Claim ID {sortConfig.key === "claimId" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => onSort("firstName")}>
                      Name {sortConfig.key === "firstName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Activation Code</th>
                    <th className="text-left p-2">Payment Status</th>
                    <th className="text-left p-2">OTT Status</th>
                    <th className="text-left p-2">OTT Code</th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => onSort("createdAt")}>
                      Created {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-sm">{claim.claimId}</td>
                      <td className="p-2">
                        {claim.firstName} {claim.lastName}
                      </td>
                      <td className="p-2">{claim.email}</td>
                      <td className="p-2">{claim.phoneNumber}</td>
                      <td className="p-2 font-mono text-sm">{claim.activationCode}</td>
                      <td className="p-2">
                        <Badge className={getStatusBadge(claim.paymentStatus, "payment")}>{claim.paymentStatus}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusBadge(claim.ottStatus, "ott")}>{claim.ottStatus}</Badge>
                      </td>
                      <td className="p-2 font-mono text-sm">{claim.ottCode || "N/A"}</td>
                      <td className="p-2 text-sm">{new Date(claim.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {claims.length === 0 && <div className="text-center py-8 text-gray-500">No claims found</div>}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * 10 + 1} to {Math.min(pagination.page * 10, pagination.total)} of{" "}
                {pagination.total} entries
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadClaims(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadClaims(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
