"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Pause, CheckCircle, XCircle, AlertCircle, ArrowLeft, Database } from "lucide-react"
import Image from "next/image"

interface AutomationResult {
  processed: number
  success: number
  failed: number
  skipped: number
  details: Array<{
    email: string
    status: "success" | "failed" | "skipped"
    message: string
    ottCode?: string
  }>
}

export default function AutomationPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [results, setResults] = useState<AutomationResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
  }, [router])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const startAutomation = async () => {
    setIsRunning(true)
    setProgress(0)
    setResults(null)
    setLogs([])
    setError("")

    try {
      addLog("Starting automation process...")
      setCurrentStep("Initializing...")
      setProgress(10)

      addLog("Fetching claims with paid status...")
      setCurrentStep("Fetching paid claims...")
      setProgress(20)

      const response = await fetch("/api/admin/process-automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Automation failed")
      }

      // Simulate progress updates
      setCurrentStep("Processing claims...")
      setProgress(40)
      addLog(`Found ${data.results.processed} claims to process`)

      setCurrentStep("Matching activation codes...")
      setProgress(60)
      addLog("Validating activation codes against sales records...")

      setCurrentStep("Assigning OTT keys...")
      setProgress(80)
      addLog("Assigning available OTT keys to valid claims...")

      setCurrentStep("Sending notifications...")
      setProgress(90)
      addLog("Sending email notifications to customers...")

      setCurrentStep("Completed")
      setProgress(100)
      setResults(data.results)

      addLog(`Automation completed successfully!`)
      addLog(`Processed: ${data.results.processed} claims`)
      addLog(`Success: ${data.results.success}`)
      addLog(`Failed: ${data.results.failed}`)
      addLog(`Skipped: ${data.results.skipped}`)
    } catch (error: any) {
      console.error("Automation error:", error)
      setError(error.message || "Automation failed")
      addLog(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
      setCurrentStep("")
    }
  }

  const goBackToAdmin = () => {
    router.push("/admin")
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
                <p className="text-sm text-red-200 mt-1">Automation Dashboard</p>
              </div>
            </div>
            <Button
              onClick={goBackToAdmin}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Automation Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">OTT Key Assignment Automation</h3>
                    <p className="text-sm text-gray-600">
                      Process paid claims, validate activation codes, and assign OTT keys automatically
                    </p>
                  </div>
                  <Button onClick={startAutomation} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Automation
                      </>
                    )}
                  </Button>
                </div>

                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{currentStep}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Summary */}
          {results && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Database className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{results.processed}</p>
                      <p className="text-sm text-gray-600">Processed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{results.success}</p>
                      <p className="text-sm text-gray-600">Success</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <XCircle className="w-8 h-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{results.failed}</p>
                      <p className="text-sm text-gray-600">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{results.skipped}</p>
                      <p className="text-sm text-gray-600">Skipped</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Results */}
          {results && results.details.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.details.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {detail.status === "success" && <CheckCircle className="w-4 h-4 text-green-600 mr-2" />}
                        {detail.status === "failed" && <XCircle className="w-4 h-4 text-red-600 mr-2" />}
                        {detail.status === "skipped" && <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />}
                        <div>
                          <p className="font-medium">{detail.email}</p>
                          <p className="text-sm text-gray-600">{detail.message}</p>
                          {detail.ottCode && (
                            <p className="text-xs font-mono text-blue-600">OTT Code: {detail.ottCode}</p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          detail.status === "success"
                            ? "default"
                            : detail.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {detail.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Start automation to see live updates...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
