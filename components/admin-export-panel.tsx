"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileSpreadsheet, Database, Loader2 } from "lucide-react"

interface ExportPanelProps {
  onExport: (tableType?: string) => Promise<void>
  onExportAll: () => Promise<void>
  exporting: boolean
  exportingTable: string | null
}

export function AdminExportPanel({ onExport, onExportAll, exporting, exportingTable }: ExportPanelProps) {
  const exportButtons = [
    {
      id: "claims",
      label: "Claims Records",
      description: "Export all redemption claims",
      color: "bg-blue-500 hover:bg-blue-600",
      icon: FileSpreadsheet,
    },
    {
      id: "sales",
      label: "Sales Records",
      description: "Export activation codes data",
      color: "bg-green-500 hover:bg-green-600",
      icon: FileSpreadsheet,
    },
    {
      id: "keys",
      label: "OTT Keys Inventory",
      description: "Export OTT keys database",
      color: "bg-purple-500 hover:bg-purple-600",
      icon: FileSpreadsheet,
    },
    {
      id: "transactions",
      label: "Razorpay Transactions",
      description: "Export payment transactions",
      color: "bg-orange-500 hover:bg-orange-600",
      icon: FileSpreadsheet,
    },
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </CardTitle>
        <CardDescription>Download data from individual tables or export all records at once</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Individual Table Exports */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Individual Table Exports</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {exportButtons.map((button) => {
                const Icon = button.icon
                const isExporting = exportingTable === button.id

                return (
                  <Button
                    key={button.id}
                    onClick={() => onExport(button.id)}
                    disabled={exporting}
                    className={`${button.color} text-white h-auto p-3 flex flex-col items-center gap-2 relative`}
                  >
                    {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                    <div className="text-center">
                      <div className="font-medium text-xs">{button.label}</div>
                      <div className="text-xs opacity-90">{button.description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Bulk Export */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Bulk Operations</h4>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onExportAll}
                disabled={exporting}
                className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
              >
                {exporting && !exportingTable ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                Export All Tables
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
