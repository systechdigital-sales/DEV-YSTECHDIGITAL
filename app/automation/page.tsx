"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Database,
  Mail,
  Key,
  Eye,
  EyeOff,
  Zap,
  Info,
  Timer,
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"

interface AutomationSettings {
  enabled: boolean
  intervalMinutes: number
  emailNotifications: boolean
  processOnlyPaid: boolean
}

interface AutomationStats {
  totalProcessed: number
  keysAssigned: number
  emailsSent: number
  errors: number
  lastRun?: string
}

interface ActivityLog {
  id: string
  timestamp: string
  type: "info" | "success" | "warning" | "error"
  message: string
  details?: any
}

interface ClaimsMonitorStats {
  claimsFound: number
  claimIds: string[]
  lastCheck?: string
  isActive: boolean
}

export default function AutomationPage() {
  const router = useRouter()

  // Automation state
  const [isRunning, setIsRunning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [settings, setSettings] = useState<AutomationSettings>({
    enabled: true, // Enable scheduled processing by default
    intervalMinutes: 1, // Set to 1 minute
    emailNotifications: true, // Keep email notifications enabled
    processOnlyPaid: true,
  })
  const [stats, setStats] = useState<AutomationStats>({
    totalProcessed: 0,
    keysAssigned: 0,
    emailsSent: 0,
    errors: 0,
  })
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  // Claims monitoring state
  const [claimsMonitorEnabled, setClaimsMonitorEnabled] = useState(true)
  const [claimsMonitorStatus, setClaimsMonitorStatus] = useState<"idle" | "monitoring" | "processing">("idle")
  const [claimsStats, setClaimsStats] = useState<ClaimsMonitorStats>({
    claimsFound: 0,
    claimIds: [],
    isActive: false,
  })

  // Password protection state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [pendingAction, setPendingAction] = useState<{
    type: "scheduledProcessing" | "emailNotifications" | "realTimeDetection"
    value: boolean
  } | null>(null)

  // Progress tracking
  const [automationProgress, setAutomationProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  // Refs for intervals
  const claimsMonitorInterval = useRef<NodeJS.Timeout | null>(null)
  const scheduledAutomationInterval = useRef<NodeJS.Timeout | null>(null)
  const nextRunTimer = useRef<NodeJS.Timeout | null>(null)

  // Check authentication on mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Load saved settings
    loadSettings()
    setIsRunning(true)
  }, [router])

  // Add activity log
  const addLog = useCallback((type: ActivityLog["type"], message: string, details?: any) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      type,
      message,
      details,
    }
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]) // Keep last 50 logs
  }, [])

  // Load settings from localStorage and API
  const loadSettings = useCallback(async () => {
    try {
      // Load from localStorage first
      const savedSettings = localStorage.getItem("automationSettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }

      const savedClaimsMonitor = localStorage.getItem("claimsMonitorEnabled")
      if (savedClaimsMonitor) {
        setClaimsMonitorEnabled(JSON.parse(savedClaimsMonitor))
      }

      // Try to load from API
      const response = await fetch("/api/admin/automation-settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
          localStorage.setItem("automationSettings", JSON.stringify(data.settings))
        }
      }

      addLog("info", "🚀 Smart automation system initialized")
    } catch (error) {
      addLog("error", "Failed to load automation settings", error)
    }
  }, [addLog])

  // Claims monitoring function
  const checkForNewClaims = useCallback(async () => {
    if (!claimsMonitorEnabled || claimsMonitorStatus === "processing") return

    try {
      setClaimsMonitorStatus("monitoring")
      const response = await fetch("/api/admin/claims-monitor")
      const result = await response.json()

      setClaimsStats((prev) => ({
        ...prev,
        lastCheck: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        isActive: true,
      }))

      if (result.success) {
        if (result.claimsFound > 0) {
          setClaimsStats((prev) => ({
            ...prev,
            claimsFound: result.claimsFound,
            claimIds: result.claimIds || [],
          }))

          setClaimsMonitorStatus("processing")
          addLog("success", `🎯 Claims monitor found ${result.claimsFound} new claims - automation triggered!`, {
            claimIds: result.claimIds,
            automationResult: result.automationResult,
          })

          // Update stats if automation was successful
          if (result.automationResult?.success) {
            setStats((prev) => ({
              ...prev,
              totalProcessed: prev.totalProcessed + result.claimsFound,
              lastRun: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            }))
          }

          // Reset status after processing
          setTimeout(() => setClaimsMonitorStatus("idle"), 3000)
        } else {
          addLog("info", "👁️ Claims monitor: No new claims found")
        }
      } else {
        addLog("warning", `⚠️ Claims monitor warning: ${result.message}`, result)
      }
    } catch (error) {
      addLog("error", "💥 Claims monitor error", error)
    } finally {
      if (claimsMonitorStatus === "monitoring") {
        setTimeout(() => setClaimsMonitorStatus("idle"), 1000)
      }
    }
  }, [claimsMonitorEnabled, claimsMonitorStatus, addLog])

  // Claims monitoring interval effect
  useEffect(() => {
    if (!claimsMonitorEnabled) {
      if (claimsMonitorInterval.current) {
        clearInterval(claimsMonitorInterval.current)
        claimsMonitorInterval.current = null
      }
      setClaimsStats((prev) => ({ ...prev, isActive: false }))
      return
    }

    // Start monitoring
    setClaimsStats((prev) => ({ ...prev, isActive: true }))
    addLog("info", "👁️ Claims monitoring started - checking every 30 seconds")

    // Run immediately
    checkForNewClaims()

    // Then run every 30 seconds
    claimsMonitorInterval.current = setInterval(checkForNewClaims, 30000)

    return () => {
      if (claimsMonitorInterval.current) {
        clearInterval(claimsMonitorInterval.current)
        claimsMonitorInterval.current = null
      }
      addLog("info", "⏸️ Claims monitoring stopped")
    }
  }, [claimsMonitorEnabled, checkForNewClaims, addLog])

  // Scheduled automation function
  const runScheduledAutomation = useCallback(async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setAutomationProgress(0)
    setCurrentStep("Initializing automation...")
    addLog("info", "🔄 Running scheduled automation process...")

    try {
      // Simulate progress steps
      const steps = [
        "Checking expired claims...",
        "Fetching paid claims...",
        "Verifying activation codes...",
        "Checking for duplicates...",
        "Assigning OTT keys...",
        "Sending email notifications...",
      ]

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i])
        setAutomationProgress(((i + 1) / steps.length) * 90) // 90% for steps
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const response = await fetch("/api/admin/process-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "scheduled" }),
      })

      const result = await response.json()
      setAutomationProgress(100)
      setCurrentStep("Automation completed!")

      if (result.success) {
        setStats((prev) => ({
          totalProcessed: prev.totalProcessed + (result.stats?.processed || 0),
          keysAssigned: prev.keysAssigned + (result.stats?.keysAssigned || 0),
          emailsSent: prev.emailsSent + (result.stats?.emailsSent || 0),
          errors: prev.errors + (result.stats?.errors || 0),
          lastRun: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        }))
        addLog("success", `✅ Scheduled automation completed successfully`, result.stats)
      } else {
        setStats((prev) => ({ ...prev, errors: prev.errors + 1 }))
        addLog("error", `❌ Scheduled automation failed: ${result.message}`, result)
      }
    } catch (error) {
      setStats((prev) => ({ ...prev, errors: prev.errors + 1 }))
      addLog("error", "💥 Scheduled automation process failed", error)
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setAutomationProgress(0)
        setCurrentStep("")
      }, 2000)
    }
  }, [isProcessing, addLog])

  // Scheduled automation interval effect
  useEffect(() => {
    if (!isRunning || !settings.enabled) {
      if (scheduledAutomationInterval.current) {
        clearInterval(scheduledAutomationInterval.current)
        scheduledAutomationInterval.current = null
      }
      return
    }

    addLog("info", `⏰ Scheduled automation started - running every ${settings.intervalMinutes} minutes`)

    scheduledAutomationInterval.current = setInterval(runScheduledAutomation, settings.intervalMinutes * 60 * 1000)

    return () => {
      if (scheduledAutomationInterval.current) {
        clearInterval(scheduledAutomationInterval.current)
        scheduledAutomationInterval.current = null
      }
      addLog("info", "⏸️ Scheduled automation stopped")
    }
  }, [isRunning, settings.enabled, settings.intervalMinutes, runScheduledAutomation, addLog])

  // Save settings
  const saveSettings = useCallback(
    (newSettings: AutomationSettings) => {
      setSettings(newSettings)
      localStorage.setItem("automationSettings", JSON.stringify(newSettings))
      addLog("info", "💾 Settings updated and saved", newSettings)
    },
    [addLog],
  )

  // Toggle claims monitoring
  const toggleClaimsMonitoring = useCallback(
    (enabled: boolean) => {
      setClaimsMonitorEnabled(enabled)
      localStorage.setItem("claimsMonitorEnabled", JSON.stringify(enabled))
      addLog("info", `👁️ Claims monitoring ${enabled ? "enabled" : "disabled"}`)
    },
    [addLog],
  )

  // Toggle scheduled automation
  const toggleScheduledAutomation = useCallback(() => {
    const newRunning = !isRunning
    setIsRunning(newRunning)
    addLog("info", `⏰ Scheduled automation ${newRunning ? "started" : "stopped"}`)
  }, [isRunning, addLog])

  // Run manual automation
  const runManualAutomation = useCallback(async () => {
    addLog("info", "🔧 Running manual automation...")
    await runScheduledAutomation()
  }, [runScheduledAutomation, addLog])

  // Toggle log expansion
  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(logId)) {
        newSet.delete(logId)
      } else {
        newSet.add(logId)
      }
      return newSet
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "monitoring":
        return (
          <Badge variant="default" className="bg-blue-500 animate-pulse">
            <Activity className="w-3 h-3 mr-1" />
            Monitoring
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="default" className="bg-orange-500 animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        )
      case "idle":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Idle
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  // Password verification function
  const verifyPassword = (password: string): boolean => {
    return password === "Admin@12345"
  }

  // Password protected toggle functions
  const handlePasswordProtectedToggle = (
    type: "scheduledProcessing" | "emailNotifications" | "realTimeDetection",
    newValue: boolean,
  ) => {
    // If trying to disable, require password
    if (!newValue) {
      setPendingAction({ type, value: newValue })
      setShowPasswordDialog(true)
      setPasswordInput("")
    } else {
      // Allow enabling without password
      executeToggle(type, newValue)
    }
  }

  const executeToggle = (type: "scheduledProcessing" | "emailNotifications" | "realTimeDetection", value: boolean) => {
    switch (type) {
      case "scheduledProcessing":
        saveSettings({ ...settings, enabled: value })
        if (!value) setIsRunning(false)
        break
      case "emailNotifications":
        saveSettings({ ...settings, emailNotifications: value })
        break
      case "realTimeDetection":
        toggleClaimsMonitoring(value)
        break
    }
    addLog("info", `${type} ${value ? "enabled" : "disabled"}`)
  }

  const handlePasswordSubmit = () => {
    if (verifyPassword(passwordInput) && pendingAction) {
      executeToggle(pendingAction.type, pendingAction.value)
      setShowPasswordDialog(false)
      setPendingAction(null)
      setPasswordInput("")
    } else {
      alert("Incorrect password!")
      setPasswordInput("")
    }
  }

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
                        Smart Automation System
                        {claimsStats.isActive && (
                          <Badge className="ml-3 bg-blue-500 text-white animate-pulse">
                            <Eye className="w-3 h-3 mr-1" />
                            MONITORING
                          </Badge>
                        )}
                        {isRunning && (
                          <Badge className="ml-2 bg-green-500 text-white">
                            <Timer className="w-3 h-3 mr-1" />
                            SCHEDULED
                          </Badge>
                        )}
                      </h1>
                      <p className="text-sm text-green-200 mt-1">Real-time claims detection + scheduled automation</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-200">Current Time (IST)</p>
                  <p className="text-lg font-bold text-white">
                    {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto">
            <div className="space-y-8">
              {/* Status Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Smart Automation Active:</strong> System monitors claims collection every 30 seconds for new
                  paid claims. When detected, automation runs immediately. Scheduled automation provides backup
                  processing.
                </AlertDescription>
              </Alert>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-100">Claims Processed</CardTitle>
                    <Database className="h-4 w-4 text-blue-200" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProcessed}</div>
                    <p className="text-xs text-blue-200">
                      {claimsStats.claimsFound > 0 ? `${claimsStats.claimsFound} new found` : "Total automated"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-100">Keys Assigned</CardTitle>
                    <Key className="h-4 w-4 text-green-200" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.keysAssigned}</div>
                    <p className="text-xs text-green-200">OTT keys distributed</p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-100">Emails Sent</CardTitle>
                    <Mail className="h-4 w-4 text-purple-200" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.emailsSent}</div>
                    <p className="text-xs text-purple-200">Notifications delivered</p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-orange-500 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-100">Errors</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-200" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.errors}</div>
                    <p className="text-xs text-red-200">Processing failures</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Claims Monitor */}
                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                      <Eye className="h-5 w-5 text-blue-600" />
                      Smart Claims Monitor
                      {getStatusBadge(claimsMonitorStatus)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="claims-monitor" className="text-base font-semibold">
                          Real-time Detection
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Monitors database every 30 seconds for new paid claims
                        </p>
                      </div>
                      <Switch
                        id="claims-monitor"
                        checked={claimsMonitorEnabled}
                        onCheckedChange={(checked) => handlePasswordProtectedToggle("realTimeDetection", checked)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Status:</span>
                        {getStatusBadge(claimsMonitorStatus)}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Last Check:</span>
                        <span className="text-muted-foreground">{claimsStats.lastCheck || "Never"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Claims Found:</span>
                        <Badge variant="outline" className="font-bold">
                          {claimsStats.claimsFound}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      onClick={checkForNewClaims}
                      disabled={claimsMonitorStatus === "monitoring"}
                      className="w-full bg-transparent"
                      variant="outline"
                    >
                      {claimsMonitorStatus === "monitoring" ? (
                        <>
                          <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                          Checking Database...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4 mr-2" />
                          Check Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Scheduled Automation */}
                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                      <Timer className="h-5 w-5 text-green-600" />
                      Scheduled Automation
                      {isRunning && (
                        <Badge className="bg-green-100 text-green-800">
                          <Play className="w-3 h-3 mr-1" />
                          RUNNING
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="automation-enabled" className="text-base font-semibold">
                          Enable Scheduled Processing
                        </Label>
                        <p className="text-sm text-muted-foreground">Runs automation at regular intervals as backup</p>
                      </div>
                      <Switch
                        id="automation-enabled"
                        checked={settings.enabled}
                        onCheckedChange={(checked) => handlePasswordProtectedToggle("scheduledProcessing", checked)}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interval" className="text-sm font-medium">
                        Interval (minutes)
                      </Label>
                      <select
                        id="interval"
                        value={settings.intervalMinutes}
                        onChange={(e) =>
                          saveSettings({ ...settings, intervalMinutes: Number.parseInt(e.target.value) })
                        }
                        className="w-full p-2 border rounded-md bg-white"
                      >
                        <option value={1}>1 minute</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={240}>4 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="text-sm font-medium">
                        Email Notifications
                      </Label>
                      <Switch
                        id="email-notifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handlePasswordProtectedToggle("emailNotifications", checked)}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button
                        onClick={toggleScheduledAutomation}
                        disabled={!settings.enabled}
                        className="flex-1"
                        variant={isRunning ? "destructive" : "default"}
                      >
                        {isRunning ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={runManualAutomation}
                        disabled={isProcessing}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        {isProcessing ? (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Run Now
                          </>
                        )}
                      </Button>
                    </div>

                    <Separator className="my-4" />

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <Database className="w-4 h-4 mr-2" />
                        Manual Claims Processing
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Process all claims with <strong>payment status = "paid"</strong> and{" "}
                        <strong>OTT status = "pending"</strong>
                      </p>

                      <div className="bg-white p-3 rounded border border-blue-200 mb-3">
                        <h5 className="font-medium text-blue-900 mb-2">This button will:</h5>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>
                            • <strong>Step 1:</strong> Find all claims where payment is completed but OTT code is
                            pending
                          </li>
                          <li>
                            • <strong>Step 2:</strong> Verify activation codes against sales records
                          </li>
                          <li>
                            • <strong>Step 3:</strong> Check for duplicate claims (already used codes)
                          </li>
                          <li>
                            • <strong>Step 4:</strong> Assign available OTT keys from inventory
                          </li>
                          <li>
                            • <strong>Step 5:</strong> Update claim status from "pending" to "delivered"
                          </li>
                          <li>
                            • <strong>Step 6:</strong> Send success emails with OTT codes to customers
                          </li>
                          <li>
                            • <strong>Step 7:</strong> Send WhatsApp notifications (if phone number available)
                          </li>
                        </ul>
                      </div>

                      <Button
                        onClick={runManualAutomation}
                        disabled={isProcessing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isProcessing ? (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                            Processing Claims...
                          </>
                        ) : (
                          <>
                            <Database className="w-4 h-4 mr-2" />
                            Process Paid Claims Now
                          </>
                        )}
                      </Button>
                    </div>

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{currentStep}</span>
                          <span className="text-blue-600">{automationProgress}%</span>
                        </div>
                        <Progress value={automationProgress} className="w-full h-2" />
                      </div>
                    )}

                    {stats.lastRun && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Last run:</strong> {stats.lastRun}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Activity Logs */}
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg border-b">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                    <Activity className="h-5 w-5 text-gray-600" />
                    Activity Logs
                    <Badge variant="outline" className="ml-auto">
                      {activityLogs.length} entries
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {activityLogs.length === 0 ? (
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-muted-foreground">No activity logs yet</p>
                          <p className="text-sm text-muted-foreground">
                            Enable monitoring or run automation to see logs here
                          </p>
                        </div>
                      ) : (
                        activityLogs.map((log) => (
                          <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getLogIcon(log.type)}
                                <span className="font-medium text-gray-900">{log.message}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                                {log.details && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleLogExpansion(log.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {expandedLogs.has(log.id) ? (
                                      <EyeOff className="h-3 w-3" />
                                    ) : (
                                      <Eye className="h-3 w-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                            {log.details && expandedLogs.has(log.id) && (
                              <div className="mt-3 p-3 bg-gray-100 rounded text-xs">
                                <pre className="whitespace-pre-wrap overflow-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>

        {/* Password Dialog */}
        {showPasswordDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Password Required</h3>
              <p className="text-sm text-gray-600 mb-4">Enter the admin password to disable this feature:</p>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                className="w-full p-2 border rounded-md mb-4"
                placeholder="Enter password"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handlePasswordSubmit} className="flex-1">
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordDialog(false)
                    setPendingAction(null)
                    setPasswordInput("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}
