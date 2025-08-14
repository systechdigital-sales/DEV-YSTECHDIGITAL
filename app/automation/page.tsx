"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "lucide-react"

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

export default function AutomationPage() {
  // Automation state
  const [isRunning, setIsRunning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [settings, setSettings] = useState<AutomationSettings>({
    enabled: false,
    intervalMinutes: 30,
    emailNotifications: true,
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
  const [claimsMonitorEnabled, setClaimsMonitorEnabled] = useState(false)
  const [claimsMonitorStatus, setClaimsMonitorStatus] = useState<"idle" | "monitoring" | "processing">("idle")
  const [lastClaimsCheck, setLastClaimsCheck] = useState<string>("")
  const [claimsFound, setClaimsFound] = useState(0)

  // Add activity log
  const addLog = useCallback((type: ActivityLog["type"], message: string, details?: any) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      type,
      message,
      details,
    }
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]) // Keep last 50 logs
  }, [])

  // Claims monitoring function
  const checkForNewClaims = useCallback(async () => {
    if (!claimsMonitorEnabled) return

    try {
      setClaimsMonitorStatus("monitoring")
      const response = await fetch("/api/admin/claims-monitor")
      const result = await response.json()

      setLastClaimsCheck(new Date().toLocaleString())

      if (result.success) {
        if (result.claimsFound > 0) {
          setClaimsFound(result.claimsFound)
          setClaimsMonitorStatus("processing")
          addLog("success", `Found ${result.claimsFound} new claims - triggering automation`, {
            claimIds: result.claimIds,
            automationResult: result.automationResult,
          })

          // Update stats if automation was successful
          if (result.automationResult?.success) {
            setStats((prev) => ({
              ...prev,
              totalProcessed: prev.totalProcessed + result.claimsFound,
              lastRun: new Date().toLocaleString(),
            }))
          }
        } else {
          addLog("info", "Claims monitor: No new claims found")
        }
      } else {
        addLog("error", `Claims monitor error: ${result.message}`, result)
      }
    } catch (error) {
      addLog("error", "Claims monitor failed", error)
    } finally {
      setTimeout(() => setClaimsMonitorStatus("idle"), 2000)
    }
  }, [claimsMonitorEnabled, addLog])

  // Claims monitoring interval
  useEffect(() => {
    if (!claimsMonitorEnabled) return

    const interval = setInterval(checkForNewClaims, 30000) // Check every 30 seconds
    addLog("info", "Claims monitoring started - checking every 30 seconds")

    return () => {
      clearInterval(interval)
      addLog("info", "Claims monitoring stopped")
    }
  }, [claimsMonitorEnabled, checkForNewClaims, addLog])

  // Scheduled automation interval
  useEffect(() => {
    if (!isRunning || !settings.enabled) return

    const interval = setInterval(
      async () => {
        await runAutomation()
      },
      settings.intervalMinutes * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [isRunning, settings.enabled, settings.intervalMinutes])

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("automationSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    const savedClaimsMonitor = localStorage.getItem("claimsMonitorEnabled")
    if (savedClaimsMonitor) {
      setClaimsMonitorEnabled(JSON.parse(savedClaimsMonitor))
    }

    addLog("info", "Automation system initialized")
  }, [addLog])

  // Save settings
  const saveSettings = useCallback(
    (newSettings: AutomationSettings) => {
      setSettings(newSettings)
      localStorage.setItem("automationSettings", JSON.stringify(newSettings))
      addLog("info", "Settings updated", newSettings)
    },
    [addLog],
  )

  // Run automation manually or scheduled
  const runAutomation = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    addLog("info", "Starting automation process...")

    try {
      const response = await fetch("/api/admin/process-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()

      if (result.success) {
        setStats((prev) => ({
          totalProcessed: prev.totalProcessed + (result.stats?.processed || 0),
          keysAssigned: prev.keysAssigned + (result.stats?.keysAssigned || 0),
          emailsSent: prev.emailsSent + (result.stats?.emailsSent || 0),
          errors: prev.errors + (result.stats?.errors || 0),
          lastRun: new Date().toLocaleString(),
        }))
        addLog("success", `Automation completed successfully`, result.stats)
      } else {
        setStats((prev) => ({ ...prev, errors: prev.errors + 1 }))
        addLog("error", `Automation failed: ${result.message}`, result)
      }
    } catch (error) {
      setStats((prev) => ({ ...prev, errors: prev.errors + 1 }))
      addLog("error", "Automation process failed", error)
    } finally {
      setIsProcessing(false)
    }
  }

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
          <Badge variant="default" className="bg-blue-500">
            <Activity className="w-3 h-3 mr-1" />
            Monitoring
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="default" className="bg-orange-500">
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Automation System</h1>
          <p className="text-muted-foreground">Automated OTT key processing with real-time claims monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(claimsMonitorStatus)}
          {isRunning && (
            <Badge variant="default" className="bg-green-500">
              <Play className="w-3 h-3 mr-1" />
              Running
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="default" className="bg-orange-500">
              <RotateCcw className="w-3 h-3 mr-1 animate-spin" />
              Processing
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims Processed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProcessed}</div>
            <p className="text-xs text-muted-foreground">Total automated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keys Assigned</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.keysAssigned}</div>
            <p className="text-xs text-muted-foreground">OTT keys distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsSent}</div>
            <p className="text-xs text-muted-foreground">Notifications delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.errors}</div>
            <p className="text-xs text-muted-foreground">Processing failures</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Smart Claims Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="claims-monitor">Real-time Claims Detection</Label>
                <p className="text-sm text-muted-foreground">Monitors database every 30 seconds for new paid claims</p>
              </div>
              <Switch
                id="claims-monitor"
                checked={claimsMonitorEnabled}
                onCheckedChange={(checked) => {
                  setClaimsMonitorEnabled(checked)
                  localStorage.setItem("claimsMonitorEnabled", JSON.stringify(checked))
                  addLog("info", `Claims monitoring ${checked ? "enabled" : "disabled"}`)
                }}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                {getStatusBadge(claimsMonitorStatus)}
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Check:</span>
                <span className="text-muted-foreground">{lastClaimsCheck || "Never"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Claims Found:</span>
                <span className="font-medium">{claimsFound}</span>
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
                  Checking...
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="automation-enabled">Enable Scheduled Processing</Label>
                <p className="text-sm text-muted-foreground">Runs automation at regular intervals as backup</p>
              </div>
              <Switch
                id="automation-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => saveSettings({ ...settings, enabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Interval (minutes)</Label>
              <select
                id="interval"
                value={settings.intervalMinutes}
                onChange={(e) => saveSettings({ ...settings, intervalMinutes: Number.parseInt(e.target.value) })}
                className="w-full p-2 border rounded-md"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => saveSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (isRunning) {
                    setIsRunning(false)
                    addLog("info", "Scheduled automation stopped")
                  } else {
                    setIsRunning(true)
                    addLog("info", `Scheduled automation started (${settings.intervalMinutes} min intervals)`)
                  }
                }}
                disabled={!settings.enabled}
                className="flex-1"
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
                onClick={runAutomation}
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

            {stats.lastRun && <p className="text-sm text-muted-foreground">Last run: {stats.lastRun}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Logs
            <Badge variant="outline" className="ml-auto">
              {activityLogs.length} entries
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {activityLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No activity logs yet</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {log.type === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                        {log.type === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                        {log.type === "info" && <Activity className="h-4 w-4 text-blue-500" />}
                        <span className="font-medium">{log.message}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                        {log.details && (
                          <Button variant="ghost" size="sm" onClick={() => toggleLogExpansion(log.id)}>
                            {expandedLogs.has(log.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                    {log.details && expandedLogs.has(log.id) && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
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
  )
}
