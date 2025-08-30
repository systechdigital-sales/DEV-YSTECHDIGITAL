"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Search, Play, RefreshCw, Edit2, Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ClaimData {
  _id: string
  claimId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  phoneNumber: string
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
  invoiceNumber: string
  sellerName: string
  paymentStatus: string
  paymentId: string
  razorpayOrderId: string
  amount: number
  ottStatus: string
  ottCode: string
  platform: string
  automationProcessed: boolean
  emailSent: string
  failureReason: string
  billFileName: string
  createdAt: string
  updatedAt: string
}

export default function ManualPage() {
  const [claimId, setClaimId] = useState("")
  const [claimData, setClaimData] = useState<ClaimData | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingUpdate, setPendingUpdate] = useState<{ field: string; value: any } | null>(null)
  const [noRecordFound, setNoRecordFound] = useState(false)

  const fetchClaimData = async () => {
    if (!claimId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a claim ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setNoRecordFound(false)
    try {
      console.log("[v0] Fetching claim data for ID:", claimId)
      const response = await fetch(`/api/admin/manual-claim?claimId=${encodeURIComponent(claimId)}`)
      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] API response data:", data)

      if (data.claim) {
        setClaimData(data.claim)
        setNoRecordFound(false)
        console.log("[v0] Claim data set successfully:", data.claim)
        toast({
          title: "Success",
          description: "Claim data loaded successfully",
        })
      } else {
        console.log("[v0] No claim data in response")
        setClaimData(null)
        setNoRecordFound(true)
        toast({
          title: "Not Found",
          description: "No claim found with this ID",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[v0] Error fetching claim:", error)
      setClaimData(null)
      setNoRecordFound(true)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch claim data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (field: string, currentValue: any) => {
    setEditingField(field)
    setEditValue(String(currentValue || ""))
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValue("")
  }

  const confirmEdit = (field: string, value: any) => {
    setPendingUpdate({ field, value })
    setShowConfirmDialog(true)
  }

  const handleConfirmUpdate = async () => {
    if (!pendingUpdate || !claimData) return

    try {
      const updatedData = {
        ...claimData,
        [pendingUpdate.field]: pendingUpdate.value,
      }

      const response = await fetch("/api/admin/manual-claim", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      const data = await response.json()

      if (response.ok) {
        setClaimData(updatedData)
        toast({
          title: "Success",
          description: `${pendingUpdate.field} updated successfully`,
        })
      } else {
        throw new Error(data.error || "Failed to update claim data")
      }
    } catch (error: any) {
      console.error("Error updating claim:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update claim data",
        variant: "destructive",
      })
    } finally {
      setShowConfirmDialog(false)
      setPendingUpdate(null)
      setEditingField(null)
      setEditValue("")
    }
  }

  const runAutomationProcess = async () => {
    if (!claimData) return

    setProcessing(true)
    try {
      const response = await fetch("/api/admin/manual-automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimId: claimData.claimId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Automation completed: ${data.result.message}`,
        })
        // Refresh the data to see updates
        await fetchClaimData()
      } else {
        throw new Error(data.error || "Failed to run automation process")
      }
    } catch (error: any) {
      console.error("Error running automation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to run automation process",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const renderEditableCell = (
    field: string,
    value: any,
    type: "text" | "number" | "date" | "select" | "textarea" = "text",
    options?: string[],
  ) => {
    const isEditing = editingField === field

    if (isEditing) {
      if (type === "select" && options) {
        return (
          <div className="flex items-center gap-2">
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => confirmEdit(field, editValue)}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEditing}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      }

      if (type === "textarea") {
        return (
          <div className="flex items-center gap-2">
            <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="min-h-[60px]" />
            <div className="flex flex-col gap-1">
              <Button size="sm" onClick={() => confirmEdit(field, editValue)}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEditing}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-2">
          <Input type={type} value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1" />
          <Button size="sm" onClick={() => confirmEdit(field, type === "number" ? Number(editValue) : editValue)}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={cancelEditing}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-between group">
        <span className="flex-1">{value || "N/A"}</span>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => startEditing(field, value)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manual Claim Management</h1>
        <p className="text-gray-600">Search and manually edit claim records with full database access</p>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Claim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="claimId">Claim ID</Label>
              <Input
                id="claimId"
                value={claimId}
                onChange={(e) => setClaimId(e.target.value)}
                placeholder="Enter claim ID to search..."
                onKeyPress={(e) => e.key === "Enter" && fetchClaimData()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchClaimData} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Record Found Message */}
      {noRecordFound && !claimData && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg text-gray-500">No record found for the entered Claim ID</p>
          </CardContent>
        </Card>
      )}

      {/* Claim Data Table */}
      {claimData && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button onClick={runAutomationProcess} disabled={processing} variant="default">
              {processing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Run Manual Automation
            </Button>
          </div>

          {/* Claim Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Record Details</CardTitle>
              <p className="text-sm text-gray-600">Click the edit icon next to any field to modify it</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Field</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Claim ID</TableCell>
                    <TableCell>{renderEditableCell("claimId", claimData.claimId)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">First Name</TableCell>
                    <TableCell>{renderEditableCell("firstName", claimData.firstName)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Last Name</TableCell>
                    <TableCell>{renderEditableCell("lastName", claimData.lastName)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Email</TableCell>
                    <TableCell>{renderEditableCell("email", claimData.email)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Phone</TableCell>
                    <TableCell>{renderEditableCell("phone", claimData.phone || claimData.phoneNumber)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Street Address</TableCell>
                    <TableCell>{renderEditableCell("streetAddress", claimData.streetAddress)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Address Line 2</TableCell>
                    <TableCell>{renderEditableCell("addressLine2", claimData.addressLine2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">City</TableCell>
                    <TableCell>{renderEditableCell("city", claimData.city)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">State</TableCell>
                    <TableCell>{renderEditableCell("state", claimData.state)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Postal Code</TableCell>
                    <TableCell>{renderEditableCell("postalCode", claimData.postalCode)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Country</TableCell>
                    <TableCell>{renderEditableCell("country", claimData.country)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Purchase Type</TableCell>
                    <TableCell>{renderEditableCell("purchaseType", claimData.purchaseType)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Activation Code</TableCell>
                    <TableCell>{renderEditableCell("activationCode", claimData.activationCode)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Purchase Date</TableCell>
                    <TableCell>{renderEditableCell("purchaseDate", claimData.purchaseDate, "date")}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Invoice Number</TableCell>
                    <TableCell>{renderEditableCell("invoiceNumber", claimData.invoiceNumber)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Seller Name</TableCell>
                    <TableCell>{renderEditableCell("sellerName", claimData.sellerName)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Payment Status</TableCell>
                    <TableCell>
                      {renderEditableCell("paymentStatus", claimData.paymentStatus, "select", [
                        "pending",
                        "paid",
                        "failed",
                      ])}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Payment ID</TableCell>
                    <TableCell>{renderEditableCell("paymentId", claimData.paymentId)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Razorpay Order ID</TableCell>
                    <TableCell>{renderEditableCell("razorpayOrderId", claimData.razorpayOrderId)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Amount</TableCell>
                    <TableCell>{renderEditableCell("amount", claimData.amount, "number")}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">OTT Status</TableCell>
                    <TableCell>
                      {renderEditableCell("ottStatus", claimData.ottStatus, "select", [
                        "pending",
                        "delivered",
                        "failed",
                      ])}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">OTT Code</TableCell>
                    <TableCell>{renderEditableCell("ottCode", claimData.ottCode)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Platform</TableCell>
                    <TableCell>{renderEditableCell("platform", claimData.platform)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Email Status</TableCell>
                    <TableCell>
                      {renderEditableCell("emailSent", claimData.emailSent, "select", [
                        "notSent",
                        "success_delivered",
                        "invalid_code_failed",
                        "duplicate_failed",
                        "no_keys_failed",
                        "transaction_failed",
                        "processing_failed",
                        "expired",
                      ])}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Automation Processed</TableCell>
                    <TableCell>
                      {renderEditableCell(
                        "automationProcessed",
                        claimData.automationProcessed ? "true" : "false",
                        "select",
                        ["false", "true"],
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Failure Reason</TableCell>
                    <TableCell>{renderEditableCell("failureReason", claimData.failureReason, "textarea")}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bill File Name</TableCell>
                    <TableCell>{renderEditableCell("billFileName", claimData.billFileName)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Created At</TableCell>
                    <TableCell>{new Date(claimData.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Updated At</TableCell>
                    <TableCell>
                      {claimData.updatedAt ? new Date(claimData.updatedAt).toLocaleString() : "Not updated"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Claim Submission Date</TableCell>
                    <TableCell>{new Date(claimData.claimSubmissionDate).toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant={claimData.paymentStatus === "paid" ? "default" : "secondary"}>
                  Payment: {claimData.paymentStatus}
                </Badge>
                <Badge variant={claimData.ottStatus === "delivered" ? "default" : "secondary"}>
                  OTT: {claimData.ottStatus}
                </Badge>
                <Badge variant={claimData.automationProcessed ? "default" : "secondary"}>
                  Automation: {claimData.automationProcessed ? "Processed" : "Pending"}
                </Badge>
                {claimData.emailSent && <Badge variant="outline">Email: {claimData.emailSent}</Badge>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog for Field Updates */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update the field "{pendingUpdate?.field}" with the new value?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpdate}>Confirm Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
