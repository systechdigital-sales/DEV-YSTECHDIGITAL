"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"

interface OTTKey {
  _id: string
  ottCode: string
  platform: string
  status: string
  assignedTo?: string
  createdAt: string
  expiryDate?: string
}

interface OTTKeysTableProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filters: {
    keysStatus: string
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

export default function OTTKeysTable({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  dateFilter,
  sortConfig,
  onSort,
}: OTTKeysTableProps) {
  const [keys, setKeys] = useState<OTTKey[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  })

  const loadKeys = async (page = 1) => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: searchTerm,
        sortBy: sortConfig.key,
        order: sortConfig.direction,
        status: filters.keysStatus,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
      })

      const response = await fetch(`/api/admin/keys?${params}`)
      const data = await response.json()

      if (response.ok) {
        setKeys(data.data || [])
        setPagination({
          page: data.page || 1,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        })
      } else {
        throw new Error(data.error || "Failed to fetch OTT keys")
      }
    } catch (err: any) {
      console.error("Error loading OTT keys:", err)
      setError(err.message || "Failed to load OTT keys")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKeys(1)
  }, [searchTerm, filters, dateFilter, sortConfig])

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/export?type=keys")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ott-keys-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      assigned: "bg-blue-100 text-blue-800",
      used: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>OTT Keys Inventory</CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Keys
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search OTT keys..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />

          <Select value={filters.keysStatus} onValueChange={(value) => onFilterChange("keysStatus", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Key Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading && <div className="text-center py-4">Loading OTT keys...</div>}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 cursor-pointer" onClick={() => onSort("ottCode")}>
                      OTT Code {sortConfig.key === "ottCode" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => onSort("platform")}>
                      Platform {sortConfig.key === "platform" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => onSort("status")}>
                      Status {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="text-left p-2">Assigned To</th>
                    <th className="text-left p-2">Expiry Date</th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => onSort("createdAt")}>
                      Created {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-sm">{key.ottCode}</td>
                      <td className="p-2">{key.platform}</td>
                      <td className="p-2">
                        <Badge className={getStatusBadge(key.status)}>{key.status}</Badge>
                      </td>
                      <td className="p-2">{key.assignedTo || "N/A"}</td>
                      <td className="p-2 text-sm">
                        {key.expiryDate ? new Date(key.expiryDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-2 text-sm">{new Date(key.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {keys.length === 0 && <div className="text-center py-8 text-gray-500">No OTT keys found</div>}

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
                  onClick={() => loadKeys(pagination.page - 1)}
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
                  onClick={() => loadKeys(pagination.page + 1)}
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
