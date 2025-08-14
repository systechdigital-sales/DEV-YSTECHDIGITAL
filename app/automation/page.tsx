"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Play,
  Pause,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Zap,
  Database,
  Mail,
  Key,
  Activity,
} from "lucide-react"

interface AutomationSettings {
  enabled: boolean
  intervalMinutes: number
  emailEnabled: boolean
  processOnlyPaid: boolean
}

interface AutomationLog {
  timestamp: string
  type: "info" | "success" | "error" | "warning"
  message: string
  details?: any
}

interface AutomationStats {
  totalProcessed: number
  keysAssigned: number
  emailsSent: number
  errors: number
  lastRun?: string
}

interface ClaimsMonitorStats {
  newClaims: number
  claimIds: string[]
  lastCheck?: string
}

export default function AutomationPage() {
  const [settings, setSettings] = useState<AutomationSettings>({
    enabled: false,
    intervalMinutes: 30,
    emailEnabled: true,
    processOnlyPaid: true,
  })

  const [isRunning, setIsRunning] = useState(false)
  const [isClaimsMonitoring, setIsClaimsMonitoring] = useState(false)
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [stats, setStats] = useState<AutomationStats>({
    totalProcessed: 0,
    keysAssigned: 0,
    emailsSent: 0,
    errors: 0,
  })
  const [claimsStats, setClaimsStats] = useState<ClaimsMonitorStats>({
    newClaims: 0,
    claimIds: [],
  })
  const [loading, setLoading] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Start automation timer when enabled
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (settings.enabled && isRunning) {
      addLog("info", `Automation started with ${settings.intervalMinutes} minute intervals`)

      interval = setInterval(
        () => {
          runAutomation()
        },
        settings.intervalMinutes * 60 * 1000,
      )
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [settings.enabled, settings.intervalMinutes, isRunning])

  // Start claims monitoring (every 30 seconds)
  useEffect(() => {
    let claimsInterval: NodeJS.Timeout | null = null

    if (isClaimsMonitoring) {
      addLog("info", "Claims monitoring started (checking every 30 seconds)")

      // Run immediately
      monitorClaims()

      // Then run every 30 seconds
      claimsInterval = setInterval(() => {
        monitorClaims()
      }, 30000) // 30 seconds
    }

    return () => {
      if (claimsInterval) {
        clearInterval(claimsInterval)
        addLog("info", "Claims monitoring stopped")
      }
    }
  }, [isClaimsMonitoring])

  const addLog = (type: AutomationLog["type"], message: string, details?: any) => {
    const newLog: AutomationLog = {
      timestamp: new Date().toLocaleString(),
      type,
      message,
      details,
    }
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]) // Keep last 50 logs
  }

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/automation-settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      addLog("error", "Failed to load automation settings", error)
    }
  }

  const saveSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/automation-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        addLog("success", "Automation settings saved successfully")
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      addLog("error", "Failed to save automation settings", error)
    } finally {
      setLoading(false)
    }
  }

  const monitorClaims = async () => {
    try {
      const response = await fetch("/api/admin/claims-monitor")
      const data = await response.json()

      if (data.success) {
        setClaimsStats({
          newClaims: data.newClaims,
          claimIds: data.claimIds || [],
          lastCheck: new Date().toLocaleString(),
        })

        if (data.newClaims > 0) {
          addLog("success", `🎯 Found ${data.newClaims} new claims - triggering automation`, {
            claimIds: data.claimIds,
            automationResult: data.automationResult,
          })

          // Update stats if automation was successful
          if (data.automationResult?.success) {
            setStats((prev) => ({
              ...prev,
              totalProcessed: prev.totalProcessed + data.newClaims,
              lastRun: new Date().toLocaleString(),
            }))
          }
        }
      } else {
        addLog("warning", "Claims monitoring failed", data)
      }
    } catch (error) {
      addLog("error", "Claims monitoring error", error)
    }
  }

  const runAutomation = async () => {
    try {
      addLog("info", "🚀 Running scheduled automation...")

      const response = await fetch("/api/admin/process-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (data.success) {
        addLog("success", `✅ Automation completed successfully`, data)
        setStats((prev) => ({
          ...prev,
          totalProcessed: prev.totalProcessed + (data.processedCount || 0),
          keysAssigned: prev.keysAssigned + (data.keysAssigned || 0),
          emailsSent: prev.emailsSent + (data.emailsSent || 0),
          lastRun: new Date().toLocaleString(),
        }))
      } else {
        addLog("error", "❌ Automation failed", data)
        setStats((prev) => ({ ...prev, errors: prev.errors + 1 }))
      }
    } catch (error) {
      addLog("error", "💥 Automation error", error)
      setStats((prev) => ({ ...prev, errors: prev.errors + 1 }))
    }
  }

  const runManualAutomation = async () => {
    setLoading(true)
    addLog("info", "🔧 Running manual automation...")
    await runAutomation()
    setLoading(false)
  }

  const toggleAutomation = () => {
    setIsRunning(!isRunning)
    if (!isRunning) {
      addLog("info", "Automation enabled")
    } else {
      addLog("info", "Automation disabled")
    }
  }

  const toggleClaimsMonitoring = () => {
    setIsClaimsMonitoring(!isClaimsMonitoring)
  }

  const getStatusColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      default:
        return "text-blue-600"
    }
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Automation Control</h1>
          <p className="text-muted-foreground">Automated OTT key processing with real-time claims monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isClaimsMonitoring ? "default" : "secondary"} className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Claims Monitor: {isClaimsMonitoring ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={isRunning && settings.enabled ? "default" : "secondary"} className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Automation: {isRunning && settings.enabled ? "Running" : "Stopped"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims Processed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProcessed}</div>
            <p className="text-xs text-muted-foreground">
              {claimsStats.newClaims > 0 ? `${claimsStats.newClaims} new found` : "No new claims"}
            </p>
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
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <p className="text-xs text-muted-foreground">Processing failures</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Automation Settings
            </CardTitle>
            <CardDescription>Configure automated OTT key processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="claims-monitor">Claims Monitoring (30s)</Label>
              <Switch id="claims-monitor" checked={isClaimsMonitoring} onCheckedChange={toggleClaimsMonitoring} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="automation-enabled">Scheduled Automation</Label>
              <Switch
                id="automation-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Automation Interval (minutes)</Label>
              <Input
                id="interval"
                type="number"
                min="30"
                max="1440"
                value={settings.intervalMinutes}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    intervalMinutes: Number.parseInt(e.target.value) || 30,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email-enabled">Email Notifications</Label>
              <Switch
                id="email-enabled"
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="paid-only">Process Only Paid Claims</Label>
              <Switch
                id="paid-only"
                checked={settings.processOnlyPaid}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, processOnlyPaid: checked }))}
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button onClick={saveSettings} disabled={loading} className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>

              <Button
                onClick={toggleAutomation}
                variant={isRunning ? "destructive" : "default"}
                disabled={!settings.enabled}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>

            <Button
              onClick={runManualAutomation}
              disabled={loading}
              variant="outline"
              className="w-full bg-transparent"
            >
              <Zap className="h-4 w-4 mr-2" />
              Run Now
            </Button>

            {stats.lastRun && <p className="text-sm text-muted-foreground">Last run: {stats.lastRun}</p>}

            {claimsStats.lastCheck && (
              <p className="text-sm text-muted-foreground">Last claims check: {claimsStats.lastCheck}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Logs
            </CardTitle>
            <CardDescription>Real-time automation and monitoring activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity logs yet. Start automation to see logs here.
                  </p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                      <div className={`mt-0.5 ${getStatusColor(log.type)}`}>{getStatusIcon(log.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.message}</p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                        {log.details && (
                          <details className="mt-1">
                            <summary className="text-xs cursor-pointer text-blue-600">View details</summary>
                            <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
