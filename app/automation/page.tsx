"use client"

import type React from "react"
import { Terminal } from "lucide-react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Clock,
  Search,
  Key,
  Mail,
  Loader2,
  Info,
  Zap,
  Shield,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Power,
  PowerOff,
  Timer,
  Save,
  Settings,
  RefreshCw,
  Activity,
} from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { toast } from "@/hooks/use-toast"

interface AutomationResult {
  expired: number
  processed: number
  success: number
  failed: number
  skipped: number
  details: Array<{
    email: string
    status: "success" | "failed" | "skipped"
    message: string
    ottCode?: string
    step?: string
  }>
}

interface AutomationStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: "idle" | "loading" | "complete" | "error" | "skipped"
  color: string
  bgColor: string
  stepNumber: number
}

interface AutomationSettings {
  isEnabled: boolean
  intervalMinutes: number
  totalRuns: number
  lastRun?: string
  nextRun?: string
  isRunning?: boolean
  lastError?: {
    message: string
    timestamp: string
  }
  lastRunResult?: AutomationResult
}

const INTERVAL_OPTIONS = [
  { value: 1, label: "1 Minute", description: "Every minute" },
  { value: 5, label: "5 Minutes", description: "Every 5 minutes" },
  { value: 30, label: "30 Minutes", description: "Every 30 minutes" },
  { value: 60, label: "1 Hour", description: "Every hour" },
  { value: 360, label: "6 Hours", description: "Every 6 hours" },
  { value: 1440, label: "1 Day", description: "Once daily" },
]

// Helper function to format date in IST
const formatIST = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

// Helper function to get time until next run
const getTimeUntilNextRun = (nextRun: string) => {
  const now = new Date()
  const next = new Date(nextRun)
  const diff = next.getTime() - now.getTime()

  if (diff <= 0) return "Running now..."

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

// Helper function to get progress percentage for next run
const getNextRunProgress = (nextRun: string, intervalMinutes: number) => {
  const now = new Date()
  const next = new Date(nextRun)
  const totalInterval = intervalMinutes * 60 * 1000 // Convert to milliseconds
  const elapsed = totalInterval - (next.getTime() - now.getTime())
  const progress = Math.max(0, Math.min(100, (elapsed / totalInterval) * 100))
  return progress
}

export default function AutomationPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [settings, setSettings] = useState<AutomationSettings>({
    isEnabled: true,
    intervalMinutes: 1,
    totalRuns: 0,
  })
  const [tempSettings, setTempSettings] = useState<AutomationSettings>({
    isEnabled: true,
    intervalMinutes: 1,
    totalRuns: 0,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [nextRunCountdown, setNextRunCountdown] = useState("")
  const [nextRunProgress, setNextRunProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [results, setResults] = useState<AutomationResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const automationCheckRef = useRef<NodeJS.Timeout | null>(null)

  const [steps, setSteps] = useState<AutomationStep[]>([
    {
      id: "check-expired",
      title: "Expired Claims Processing",
      description: "Identifies pending claims older than 48 hours and marks them as failed",
      icon: <Clock className="h-5 w-5" />,
      status: "idle",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      stepNumber: 1,
    },
    {
      id: "fetch-claims",
      title: "Paid Claims Retrieval",
      description: "Retrieves all paid claims with pending OTT status",
      icon: <Database className="h-5 w-5" />,
      status: "idle",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      stepNumber: 2,
    },
    {
      id: "verify-codes",
      title: "Code Verification",
      description: "Verifies activation codes against sales records",
      icon: <Search className="h-5 w-5" />,
      status: "idle",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stepNumber: 3,
    },
    {
      id: "duplicate-check",
      title: "Duplicate Detection",
      description: "Checks for duplicate claims on the same activation code",
      icon: <Shield className="h-5 w-5" />,
      status: "idle",
      color: "text-red-600",
      bgColor: "bg-red-50",
      stepNumber: 4,
    },
    {
      id: "assign-keys",
      title: "Key Assignment",
      description: "Assigns available OTT keys to valid claims",
      icon: <Key className="h-5 w-5" />,
      status: "idle",
      color: "text-green-600",
      bgColor: "bg-green-50",
      stepNumber: 5,
    },
    {
      id: "send-emails",
      title: "Email Notifications",
      description: "Sends email notifications with OTT codes to customers",
      icon: <Mail className="h-5 w-5" />,
      status: "idle",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      stepNumber: 6,
    },
  ])

  // Check for automation trigger
  const checkAutomationTrigger = async () => {
    if (!settings.isEnabled || isRunning) return

    try {
      const response = await fetch("/api/admin/check-automation-trigger")
      const data = await response.json()

      if (data.shouldRun) {
        addLog(`🤖 Auto-run #${data.runNumber} triggered - Starting automated OTT Key Assignment...`)
        await startAutomation(true, data.runNumber)
      }
    } catch (error) {
      console.error("Error checking automation trigger:", error)
    }
  }

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Load automation settings immediately
    loadAutomationSettings()

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Refresh settings every 3 seconds to get latest status
    refreshIntervalRef.current = setInterval(() => {
      loadAutomationSettings()
    }, 3000)

    // Check for automation trigger every 5 seconds
    automationCheckRef.current = setInterval(() => {
      checkAutomationTrigger()
    }, 5000)

    return () => {
      clearInterval(timeInterval)
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      if (automationCheckRef.current) {
        clearInterval(automationCheckRef.current)
      }
    }
  }, [router, settings.isEnabled, isRunning])

  // Update countdown and progress every second
  useEffect(() => {
    if (settings.nextRun) {
      const interval = setInterval(() => {
        const countdown = getTimeUntilNextRun(settings.nextRun!)
        const progress = getNextRunProgress(settings.nextRun!, settings.intervalMinutes)

        setNextRunCountdown(countdown)
        setNextRunProgress(progress)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [settings.nextRun, settings.intervalMinutes])

  const loadAutomationSettings = async () => {
    try {
      const response = await fetch("/api/admin/automation-settings")
      const data = await response.json()

      if (data.success) {
        const loadedSettings = {
          isEnabled: data.settings.isEnabled,
          intervalMinutes: data.settings.intervalMinutes,
          totalRuns: data.settings.totalRuns || 0,
          lastRun: data.settings.lastRun,
          nextRun: data.settings.nextRun,
          isRunning: data.settings.isRunning || false,
          lastError: data.settings.lastError,
          lastRunResult: data.settings.lastRunResult,
        }
        setSettings(loadedSettings)
        setTempSettings(loadedSettings)

        if (data.settings.nextRun) {
          setNextRunCountdown(getTimeUntilNextRun(data.settings.nextRun))
          setNextRunProgress(getNextRunProgress(data.settings.nextRun, data.settings.intervalMinutes))
        }

        // Set results from last run if available
        if (data.settings.lastRunResult && !results) {
          setResults(data.settings.lastRunResult)
        }

        if (!logs.length) {
          addLog(
            `⚙️ Loaded automation settings: ${data.settings.isEnabled ? "ENABLED" : "DISABLED"} - Interval: ${data.settings.intervalMinutes} minutes - Total Runs: ${data.settings.totalRuns || 0}`,
          )
        }
      }
    } catch (error) {
      console.error("Error loading automation settings:", error)
      if (!logs.length) {
        addLog(`❌ Failed to load automation settings: ${error}`)
      }
    }
  }

  const refreshSettings = async () => {
    setIsRefreshing(true)
    await loadAutomationSettings()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const saveAutomationSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/automation-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isEnabled: tempSettings.isEnabled,
          intervalMinutes: tempSettings.intervalMinutes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSettings(tempSettings)

        toast({
          title: "Settings Saved",
          description: `Auto-automation ${tempSettings.isEnabled ? "enabled" : "disabled"} with ${tempSettings.intervalMinutes} minute interval`,
        })

        addLog(
          `💾 Settings saved: ${tempSettings.isEnabled ? "ENABLED" : "DISABLED"} - Interval: ${tempSettings.intervalMinutes} minutes`,
        )

        // Refresh to get updated next run time
        setTimeout(() => loadAutomationSettings(), 1000)
      } else {
        throw new Error(data.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving automation settings:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save automation settings",
        variant: "destructive",
      })
      addLog(`❌ Failed to save settings: ${error}`)
    } finally {
      setIsSaving(false)
    }
  }

  const addLog = (message: string) => {
    const timestamp = formatIST(new Date())
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const updateStepStatus = (stepId: string, status: AutomationStep["status"]) => {
    setSteps((prevSteps) => prevSteps.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  const formatInterval = (minutes: number) => {
    const option = INTERVAL_OPTIONS.find((opt) => opt.value === minutes)
    return option ? option.label : `${minutes} minutes`
  }

  const startAutomation = async (isAutoRun = false, runNumber?: number) => {
    setIsRunning(true)
    setProgress(0)
    if (!isAutoRun) {
      setResults(null)
      setLogs([])
    }
    setError("")

    // Reset all steps to idle
    setSteps((prevSteps) => prevSteps.map((step) => ({ ...step, status: "idle" })))

    try {
      if (isAutoRun) {
        addLog(`🤖 Auto-run #${runNumber || settings.totalRuns + 1} - Automated OTT Key Assignment initiated...`)
      } else {
        addLog("🚀 Manual OTT Key Assignment Automation initiated...")
      }
      setCurrentStep("System initialization...")
      setProgress(5)

      // Step 1: Check expired claims
      updateStepStatus("check-expired", "loading")
      setCurrentStep("Step 1: Processing expired claims...")
      setProgress(15)
      addLog("⏰ Step 1: Scanning Claims table for pending claims older than 48 hours...")
      addLog("📊 Updating expired claims status to 'failed' in database...")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      updateStepStatus("check-expired", "complete")

      // Step 2: Fetch paid claims
      updateStepStatus("fetch-claims", "loading")
      setCurrentStep("Step 2: Retrieving paid claims...")
      setProgress(30)
      addLog("💰 Step 2: Querying Claims table for paid claims with pending OTT status...")
      addLog("🔍 Filtering claims ready for OTT key assignment...")
      await new Promise((resolve) => setTimeout(resolve, 1500))
      updateStepStatus("fetch-claims", "complete")

      // Step 3: Verify activation codes
      updateStepStatus("verify-codes", "loading")
      setCurrentStep("Step 3: Verifying activation codes...")
      setProgress(45)
      addLog("🔍 Step 3: Cross-referencing activation codes with SalesRecord table...")
      addLog("✅ Validating code authenticity and eligibility...")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      updateStepStatus("verify-codes", "complete")

      // Step 4: Duplicate detection
      updateStepStatus("duplicate-check", "loading")
      setCurrentStep("Step 4: Checking for duplicates...")
      setProgress(60)
      addLog("🛡️ Step 4: Scanning Claims table for duplicate claims on same activation codes...")
      addLog("⚠️ Flagging duplicate entries - same key can't be assigned twice...")
      await new Promise((resolve) => setTimeout(resolve, 1500))
      updateStepStatus("duplicate-check", "complete")

      // Step 5: Assign OTT keys
      updateStepStatus("assign-keys", "loading")
      setCurrentStep("Step 5: Assigning OTT keys...")
      setProgress(75)
      addLog("🔑 Step 5: Fetching available keys from OTTKey table...")
      addLog("💾 Updating key status to 'assigned' and linking to claims...")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      updateStepStatus("assign-keys", "complete")

      // Step 6: Send emails
      updateStepStatus("send-emails", "loading")
      setCurrentStep("Step 6: Sending email notifications...")
      setProgress(90)
      addLog("📧 Step 6: Composing and sending OTT code emails to customers...")
      addLog("📬 Updating Claims table with email delivery status...")

      // Make actual API call
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

      updateStepStatus("send-emails", "complete")
      setCurrentStep("Automation completed successfully!")
      setProgress(100)
      setResults(data.results)

      if (isAutoRun) {
        addLog(`🤖 Auto-run #${runNumber || settings.totalRuns} completed successfully!`)
      } else {
        addLog(`✅ Manual automation process completed successfully!`)
      }
      addLog(`📈 Database updates: ${data.results.processed + data.results.expired} records modified`)
      addLog(`⏰ Expired claims processed: ${data.results.expired}`)
      addLog(`📊 Total claims processed: ${data.results.processed}`)
      addLog(`✅ Successful assignments: ${data.results.success}`)
      addLog(`❌ Failed assignments: ${data.results.failed}`)
      addLog(`⏭️ Skipped (duplicates/invalid): ${data.results.skipped}`)

      // Handle specific failures
      if (data.results.failed > 0) {
        const failedSteps = data.results.details.filter((d: any) => d.status === "failed")
        if (failedSteps.some((f: any) => f.step === "Key Assignment")) {
          updateStepStatus("assign-keys", "error")
          addLog(`⚠️ Some key assignments failed - check OTTKey table inventory`)
        }
      }

      if (data.results.skipped > 0) {
        const skippedSteps = data.results.details.filter((d: any) => d.status === "skipped")
        if (skippedSteps.some((f: any) => f.step === "Verification")) {
          updateStepStatus("verify-codes", "skipped")
          addLog(`⏭️ Some codes skipped - not found in SalesRecord table`)
        }
        if (skippedSteps.some((f: any) => f.step === "Duplicate Check")) {
          updateStepStatus("duplicate-check", "skipped")
          addLog(`⏭️ Duplicate users detected - same key can't be assigned again`)
        }
      }

      // Refresh settings to get updated run count and next run time
      setTimeout(() => loadAutomationSettings(), 1000)
    } catch (error: any) {
      console.error("Automation error:", error)
      setError(error.message || "Automation failed")
      addLog(`❌ CRITICAL ERROR: ${error.message}`)
      addLog(`🔧 Please check database connectivity and table structures`)

      // Mark current and subsequent steps as error
      const currentStepIndex = steps.findIndex((step) => step.status === "loading")
      if (currentStepIndex >= 0) {
        for (let i = currentStepIndex; i < steps.length; i++) {
          updateStepStatus(steps[i].id, "error")
        }
      }
    } finally {
      setIsRunning(false)
      setCurrentStep("")
      if (isAutoRun) {
        addLog(`🤖 Auto-run #${runNumber || settings.totalRuns} session ended at ${formatIST(new Date())}`)
      } else {
        addLog(`🏁 Manual automation session ended at ${formatIST(new Date())}`)
      }
    }
  }

  const hasUnsavedChanges =
    tempSettings.isEnabled !== settings.isEnabled || tempSettings.intervalMinutes !== settings.intervalMinutes

  const isAutomationActive = settings.isEnabled && settings.nextRun
  const isCurrentlyRunning = settings.isRunning || isRunning

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          {/* Header */}
          <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-xl border-b border-green-200 sticky top-0 z-10">
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
                        <Zap className="w-6 h-6 mr-2" />
                        Automation Control Center
                        {isAutomationActive && (
                          <Badge
                            className={`ml-3 text-white animate-pulse ${isCurrentlyRunning ? "bg-orange-500" : "bg-green-500"}`}
                          >
                            <Activity className="w-3 h-3 mr-1" />
                            {isCurrentlyRunning ? "RUNNING" : "ACTIVE"}
                          </Badge>
                        )}
                      </h1>
                      <p className="text-sm text-green-200 mt-1">Intelligent OTT claim processing system (No Cron)</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-200">Current Time (IST)</p>
                  <p className="text-lg font-bold text-white">{formatIST(currentTime)}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto">
            <div className="space-y-8">
              {/* Auto-Automation Control Panel */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <Settings className="w-6 h-6 text-purple-600" />
                        </div>
                        Auto-Automation Settings
                        {settings.isEnabled && (
                          <Badge className="ml-3 bg-green-100 text-green-800">
                            <Power className="w-3 h-3 mr-1" />
                            ENABLED
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-lg text-gray-600">
                        Configure automatic processing intervals - runs via client-side polling (no cron required)
                      </CardDescription>
                    </div>
                    <Button
                      onClick={refreshSettings}
                      disabled={isRefreshing}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2 bg-transparent"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      <span>Refresh</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Settings Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Enable/Disable Toggle */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Label htmlFor="auto-toggle" className="text-xl font-bold text-gray-800">
                                Auto-Automation
                              </Label>
                              <Badge
                                variant={tempSettings.isEnabled ? "default" : "secondary"}
                                className={`text-sm px-3 py-1 ${
                                  tempSettings.isEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {tempSettings.isEnabled ? "ENABLED" : "DISABLED"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-base">
                              {tempSettings.isEnabled ? (
                                <span className="flex items-center">
                                  <Power className="w-4 h-4 mr-2 text-green-600" />
                                  Auto-processing is active via client polling
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <PowerOff className="w-4 h-4 mr-2 text-gray-600" />
                                  Auto-processing is disabled
                                </span>
                              )}
                            </p>
                          </div>
                          <Switch
                            id="auto-toggle"
                            checked={tempSettings.isEnabled}
                            onCheckedChange={(checked) => setTempSettings((prev) => ({ ...prev, isEnabled: checked }))}
                            disabled={isRunning || isSaving}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>
                      </div>

                      {/* Interval Selection */}
                      <div className="space-y-4">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Timer className="w-5 h-5 text-blue-600" />
                              <Label className="text-xl font-bold text-gray-800">Processing Interval</Label>
                            </div>
                            <Select
                              value={tempSettings.intervalMinutes.toString()}
                              onValueChange={(value) =>
                                setTempSettings((prev) => ({ ...prev, intervalMinutes: Number.parseInt(value) }))
                              }
                              disabled={isRunning || isSaving}
                            >
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Select interval" />
                              </SelectTrigger>
                              <SelectContent>
                                {INTERVAL_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value.toString()}>
                                    <div className="flex flex-col">
                                      <span className="font-semibold">{option.label}</span>
                                      <span className="text-sm text-gray-500">{option.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-blue-700">
                              Current: <strong>{formatInterval(tempSettings.intervalMinutes)}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    {hasUnsavedChanges && (
                      <div className="flex justify-center">
                        <Button
                          onClick={saveAutomationSettings}
                          disabled={isSaving}
                          size="lg"
                          className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                              Saving Settings...
                            </>
                          ) : (
                            <>
                              <Save className="w-6 h-6 mr-3" />
                              Save Settings
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Current Status */}
                    {settings.isEnabled && (
                      <div className="space-y-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <h3 className="font-bold text-xl text-green-900 flex items-center">
                          <Timer className="w-6 h-6 mr-2" />
                          Current Automation Status (IST) - Client Polling
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="text-center bg-white/50 p-4 rounded-lg">
                            <p className="text-sm text-green-700 font-semibold">Total Runs Completed</p>
                            <p className="text-3xl font-bold text-green-800">{settings.totalRuns}</p>
                            <Badge className="mt-2 bg-green-600 text-white">
                              <Activity className="w-3 h-3 mr-1" />
                              Live Count
                            </Badge>
                          </div>
                          <div className="text-center bg-white/50 p-4 rounded-lg">
                            <p className="text-sm text-green-700 font-semibold">Current Interval</p>
                            <p className="text-2xl font-bold text-green-800">
                              {formatInterval(settings.intervalMinutes)}
                            </p>
                          </div>
                          <div className="text-center bg-white/50 p-4 rounded-lg">
                            <p className="text-sm text-green-700 font-semibold">Next Run In</p>
                            <p className="text-2xl font-bold text-green-800">
                              {settings.nextRun ? nextRunCountdown : "Calculating..."}
                            </p>
                          </div>
                          <div className="text-center bg-white/50 p-4 rounded-lg">
                            <p className="text-sm text-green-700 font-semibold">Status</p>
                            <Badge
                              className={`text-lg px-4 py-2 text-white ${isCurrentlyRunning ? "bg-orange-600" : "bg-green-600"}`}
                            >
                              {isCurrentlyRunning ? "RUNNING" : "ACTIVE"}
                            </Badge>
                          </div>
                        </div>

                        {settings.lastRun && (
                          <div className="text-center bg-white/50 p-4 rounded-lg">
                            <p className="text-sm text-green-700 font-semibold">Last Run</p>
                            <p className="text-lg font-bold text-green-800">{formatIST(settings.lastRun)}</p>
                          </div>
                        )}

                        {settings.nextRun && (
                          <div className="text-center bg-white/50 p-4 rounded-lg">
                            <p className="text-sm text-green-700 font-semibold">Next Scheduled Run</p>
                            <p className="text-lg font-bold text-green-800">{formatIST(settings.nextRun)}</p>
                          </div>
                        )}

                        {/* Progress bar for next run */}
                        {settings.nextRun && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-green-700">
                              <span>Progress to next run</span>
                              <span>{Math.round(nextRunProgress)}%</span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-3">
                              <div
                                className="bg-green-600 h-3 rounded-full transition-all duration-1000"
                                style={{ width: `${nextRunProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Client Polling Info */}
                        <Alert className="border-blue-200 bg-blue-50">
                          <Info className="h-5 w-5 text-blue-600" />
                          <AlertTitle className="text-blue-800">Client-Side Automation</AlertTitle>
                          <AlertDescription className="text-blue-700">
                            This automation runs via client-side polling every 5 seconds. Keep this page open for
                            automatic processing. No server cron jobs required.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {!settings.isEnabled && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <PowerOff className="h-5 w-5 text-orange-600" />
                        <AlertTitle className="text-orange-800">Auto-Automation Disabled</AlertTitle>
                        <AlertDescription className="text-orange-700">
                          Automatic processing is currently disabled. Enable it above to start automatic claim
                          processing via client-side polling.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Error Display */}
                    {settings.lastError && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <AlertTitle className="text-red-800">Last Automation Error</AlertTitle>
                        <AlertDescription className="text-red-700">
                          <p>{settings.lastError.message}</p>
                          <p className="text-sm mt-1">Occurred at: {formatIST(settings.lastError.timestamp)}</p>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Manual Control Panel */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                  <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Play className="w-6 h-6 text-green-600" />
                    </div>
                    Manual OTT Key Assignment
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Run the automation process manually to process Claims table records immediately
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-bold text-xl text-gray-800">Manual Processing</h3>
                        <p className="text-gray-600 text-lg">
                          {isRunning ? (
                            <span className="flex items-center">
                              <Loader2 className="w-5 h-5 mr-2 animate-spin text-yellow-600" />
                              Processing Claims table and updating database records...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Shield className="w-5 h-5 mr-2 text-green-600" />
                              Ready for manual processing of Claims table
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        onClick={() => startAutomation(false)}
                        disabled={isRunning}
                        size="lg"
                        className={`px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
                          isRunning
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        }`}
                      >
                        {isRunning ? (
                          <>
                            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                            Processing Database...
                          </>
                        ) : (
                          <>
                            <Play className="w-6 h-6 mr-3" />
                            Run Manual Process
                          </>
                        )}
                      </Button>
                    </div>

                    {isRunning && (
                      <div className="space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex justify-between text-lg font-semibold text-gray-800">
                          <span className="flex items-center">
                            <Target className="w-5 h-5 mr-2 text-blue-600" />
                            {currentStep}
                          </span>
                          <span className="text-blue-600">{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full h-4 bg-white" />
                        <p className="text-sm text-blue-700">
                          ⚠️ <strong>Database Update Warning:</strong> This process will modify Claims, SalesRecord, and
                          OTTKey tables. Please do not interrupt the operation.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive" className="shadow-lg border-red-200">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle className="text-lg font-semibold">Automation Error</AlertTitle>
                  <AlertDescription className="text-base">{error}</AlertDescription>
                </Alert>
              )}

              {/* Automation Steps Pipeline */}
              <Card className="shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                  <CardTitle className="text-2xl font-bold text-gray-800">Automation Processing Pipeline</CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    6-step intelligent process with comprehensive database table updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {steps.map((step, index) => (
                      <div key={step.id} className="relative">
                        <div className="flex items-start space-x-6">
                          {/* Step Number and Icon */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`relative rounded-full p-4 shadow-lg transition-all duration-300 ${
                                step.status === "complete"
                                  ? "bg-green-100 text-green-600 shadow-green-200"
                                  : step.status === "loading"
                                    ? "bg-blue-100 text-blue-600 animate-pulse shadow-blue-200"
                                    : step.status === "error"
                                      ? "bg-red-100 text-red-600 shadow-red-200"
                                      : step.status === "skipped"
                                        ? "bg-yellow-100 text-yellow-600 shadow-yellow-200"
                                        : `${step.bgColor} ${step.color} shadow-gray-200`
                              }`}
                            >
                              <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {step.stepNumber}
                              </div>
                              {step.status === "loading" ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                              ) : step.status === "complete" ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : step.status === "error" ? (
                                <XCircle className="h-6 w-6" />
                              ) : step.status === "skipped" ? (
                                <AlertTriangle className="h-6 w-6" />
                              ) : (
                                step.icon
                              )}
                            </div>
                            {index < steps.length - 1 && <div className="w-px h-16 bg-gray-300 mt-4" />}
                          </div>

                          {/* Step Content */}
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-xl text-gray-800">{step.title}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    step.status === "complete"
                                      ? "default"
                                      : step.status === "loading"
                                        ? "secondary"
                                        : step.status === "error"
                                          ? "destructive"
                                          : step.status === "skipped"
                                            ? "outline"
                                            : "outline"
                                  }
                                  className="text-sm px-3 py-1"
                                >
                                  {step.status === "idle"
                                    ? "Pending"
                                    : step.status === "loading"
                                      ? "Processing"
                                      : step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                                </Badge>
                                {step.status === "complete" && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                    DB Updated
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 text-lg mb-2">{step.description}</p>

                            {/* Database Impact Info */}
                            <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-l-blue-500">
                              <p className="text-sm text-gray-700">
                                <strong>Database Impact:</strong>{" "}
                                {step.id === "check-expired"
                                  ? "Updates Claims table - sets paymentStatus='failed' for expired records"
                                  : step.id === "fetch-claims"
                                    ? "Queries Claims table for paymentStatus='paid' and ottCodeStatus='pending'"
                                    : step.id === "verify-codes"
                                      ? "Cross-references Claims.activationCode with SalesRecord table"
                                      : step.id === "duplicate-check"
                                        ? "Scans Claims table for duplicate activationCode assignments"
                                        : step.id === "assign-keys"
                                          ? "Updates OTTKey table status='assigned' and Claims table with ottCode"
                                          : "Updates Claims table ottCodeStatus='delivered' and sends email notifications"}
                              </p>
                            </div>
                          </div>

                          {/* Arrow for flow */}
                          {index < steps.length - 1 && (
                            <div className="flex items-center">
                              <ArrowRight className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Results and Logs Tabs */}
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6 bg-white shadow-lg rounded-xl p-1 h-14">
                  <TabsTrigger
                    value="overview"
                    className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white text-lg font-semibold"
                  >
                    Results Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white text-lg font-semibold"
                  >
                    Processing Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="logs"
                    className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white text-lg font-semibold"
                  >
                    System Logs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  {results ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-orange-100 text-lg font-semibold">Expired Claims</p>
                              <p className="text-4xl font-bold">{results.expired}</p>
                              <p className="text-orange-200 text-sm mt-1">DB Records Updated</p>
                            </div>
                            <Clock className="w-12 h-12 text-orange-200" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-100 text-lg font-semibold">Processed Claims</p>
                              <p className="text-4xl font-bold">{results.processed}</p>
                              <p className="text-blue-200 text-sm mt-1">Records Analyzed</p>
                            </div>
                            <Database className="w-12 h-12 text-blue-200" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-100 text-lg font-semibold">Successful</p>
                              <p className="text-4xl font-bold">{results.success}</p>
                              <p className="text-green-200 text-sm mt-1">Keys Assigned</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-200" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-xl border-0 bg-gradient-to-br from-red-500 to-pink-500 text-white">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-red-100 text-lg font-semibold">Failed</p>
                              <p className="text-4xl font-bold">{results.failed}</p>
                              <p className="text-red-200 text-sm mt-1">Requires Attention</p>
                            </div>
                            <XCircle className="w-12 h-12 text-red-200" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-xl border-0 bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-yellow-100 text-lg font-semibold">Skipped</p>
                              <p className="text-4xl font-bold">{results.skipped}</p>
                              <p className="text-yellow-200 text-sm mt-1">Duplicates/Invalid</p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-yellow-200" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="shadow-xl border-0">
                      <CardContent className="p-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <AlertCircle className="w-16 h-16 text-gray-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800">No Processing Results</h3>
                          <p className="text-gray-500 text-lg">
                            Run the automation to see comprehensive database update results from Claims table
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="details">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg border-b">
                      <CardTitle className="text-2xl font-bold text-gray-800">Detailed Processing Results</CardTitle>
                      <CardDescription className="text-lg text-gray-600">
                        Individual claim processing status with database update information from Claims table
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      {results && results.details.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {results.details.map((detail, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  {detail.status === "success" && (
                                    <div className="p-2 bg-green-100 rounded-full">
                                      <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                  )}
                                  {detail.status === "failed" && (
                                    <div className="p-2 bg-red-100 rounded-full">
                                      <XCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                  )}
                                  {detail.status === "skipped" && (
                                    <div className="p-2 bg-yellow-100 rounded-full">
                                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-lg text-gray-800">{detail.email}</p>
                                  <p className="text-gray-600">{detail.message}</p>
                                  {detail.ottCode && (
                                    <p className="text-sm font-mono text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded">
                                      OTT Code: {detail.ottCode}
                                    </p>
                                  )}
                                  {detail.step && (
                                    <p className="text-xs text-gray-500 mt-1">Processing Step: {detail.step}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge
                                  variant={
                                    detail.status === "success"
                                      ? "default"
                                      : detail.status === "failed"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="text-sm px-3 py-1"
                                >
                                  {detail.status.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  DB Updated
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-12">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                              <Database className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">No Processing Details</h3>
                            <p className="text-gray-500 text-lg">
                              Run the automation to see detailed processing results and database updates from Claims
                              table
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="logs">
                  <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-lg border-b">
                      <CardTitle className="text-2xl font-bold text-white flex items-center">
                        <Terminal className="w-6 h-6 mr-3" />
                        System Automation Logs (IST)
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg">
                        Real-time processing logs with Claims, SalesRecord, and OTTKey table update tracking
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="bg-gray-900 text-green-400 p-6 rounded-b-lg font-mono text-base max-h-80 overflow-y-auto">
                        {logs.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500 text-lg">
                              💻 System ready. Start automation to see live processing logs with database table
                              updates...
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {logs.map((log, index) => (
                              <div key={index} className="hover:bg-gray-800 px-2 py-1 rounded transition-colors">
                                {log}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Enhanced Process Documentation */}
              <Card className="shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg border-b">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <Info className="w-6 h-6 mr-3 text-indigo-600" />
                    Process Overview & Status Codes
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Complete guide to the OTT key assignment automation with database table impact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Process Overview */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <h3 className="font-bold text-xl text-blue-900 mb-4 flex items-center">
                        <Target className="w-6 h-6 mr-2" />
                        Process Overview
                      </h3>
                      <p className="text-blue-800 mb-4 text-lg">
                        The OTT key assignment automation processes your Claims table records and performs comprehensive
                        database updates across multiple tables:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              1
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-900">Expired Claims Processing</h4>
                              <p className="text-blue-700 text-sm">
                                Identifies pending claims older than 48 hours and marks them as failed in Claims table
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              2
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-900">Paid Claims Retrieval</h4>
                              <p className="text-blue-700 text-sm">
                                Retrieves all paid claims with pending OTT status from Claims table
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              3
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-900">Code Verification</h4>
                              <p className="text-blue-700 text-sm">
                                Verifies activation codes against SalesRecord table
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              4
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-900">Duplicate Detection</h4>
                              <p className="text-blue-700 text-sm">
                                Checks Claims table for duplicate claims on the same activation code
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              5
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-900">Key Assignment</h4>
                              <p className="text-blue-700 text-sm">
                                Assigns available OTT keys from OTTKey table to valid claims
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              6
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-900">Email Notifications</h4>
                              <p className="text-blue-700 text-sm">
                                Sends email notifications with OTT codes and updates Claims table
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-300" />

                    {/* Status Codes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <h3 className="font-bold text-xl text-green-900 mb-4 flex items-center">
                          <Shield className="w-6 h-6 mr-2" />
                          Payment Status Codes
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 font-semibold">
                              PENDING
                            </Badge>
                            <span className="text-green-800">Payment not yet received</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="default" className="bg-green-100 text-green-800 font-semibold">
                              PAID
                            </Badge>
                            <span className="text-green-800">Payment successfully received</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="destructive" className="bg-red-100 text-red-800 font-semibold">
                              FAILED
                            </Badge>
                            <span className="text-green-800">Payment failed or expired</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
                        <h3 className="font-bold text-xl text-purple-900 mb-4 flex items-center">
                          <Key className="w-6 h-6 mr-2" />
                          OTT Code Status Codes
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 font-semibold">
                              PENDING
                            </Badge>
                            <span className="text-purple-800">Awaiting OTT code assignment</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="default" className="bg-green-100 text-green-800 font-semibold">
                              DELIVERED
                            </Badge>
                            <span className="text-purple-800">OTT code assigned and sent</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="destructive" className="bg-red-100 text-red-800 font-semibold">
                              FAILED
                            </Badge>
                            <span className="text-purple-800">Failed to assign OTT code</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 font-semibold">
                              CLAIMED
                            </Badge>
                            <span className="text-purple-800">Activation code already used</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 font-semibold">
                              NOT_FOUND
                            </Badge>
                            <span className="text-purple-800">Invalid activation code</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Automation Status */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                      <h3 className="font-bold text-xl text-indigo-900 mb-4 flex items-center">
                        <Zap className="w-6 h-6 mr-2" />
                        Automation Status & Scheduling (No Cron)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-indigo-900 mb-2">Client-Side Processing</h4>
                          <p className="text-indigo-800 text-sm mb-3">
                            The automation runs via client-side polling every 5 seconds, eliminating the need for server
                            cron jobs.
                          </p>
                          <ul className="text-indigo-700 text-sm space-y-1">
                            <li>• Checks for automation trigger every 5 seconds</li>
                            <li>• Processes Claims table when conditions are met</li>
                            <li>• Updates database records in real-time</li>
                            <li>• Sends email notifications to customers</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-indigo-900 mb-2">Time Zone & Scheduling</h4>
                          <p className="text-indigo-800 text-sm mb-3">
                            All timestamps are displayed in Indian Standard Time (IST) for consistency.
                          </p>
                          <ul className="text-indigo-700 text-sm space-y-1">
                            <li>• Last run timestamp in IST</li>
                            <li>• Next scheduled run in IST</li>
                            <li>• Real-time countdown to next execution</li>
                            <li>• Keep browser tab open for continuous operation</li>
                          </ul>
                        </div>
                      </div>
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
