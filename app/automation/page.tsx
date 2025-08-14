"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Database,
  Mail,
  Key,
  Eye,
} from "lucide-react"

interface AutomationSettings {
  enabled: boolean
  intervalMinutes: number
  emailEnabled: boolean
  maxProcessingLimit: number
}

interface LogEntry {
  timestamp: string
  type: "info" | "success" | "error" | "warning"
  message: string
  details?: any
}

export default function AutomationPage() {
  const [settings, setSettings] = useState<AutomationSettings>({
    enabled: false,
    intervalMinutes: 30,
    emailEnabled: true,
    maxProcessingLimit: 50,
  })

  const [isRunning, setIsRunning] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const [nextRun, setNextRun] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState({
    totalProcessed: 0,
    successfulAssignments: 0,
    emailsSent: 0,
    errors: 0,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const monitorRef = useRef<NodeJS.Timeout | null>(null)
  const nextRunRef = useRef<NodeJS.Timeout | null>(null)

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Update next run timer
  useEffect(() => {
    if (isRunning && settings.enabled) {
      updateNextRunTimer()
    } else {
      if (nextRunRef.current) {
        clearInterval(nextRunRef.current)
        nextRunRef.current = null
      }
      setNextRun(null)
    }
  }, [isRunning, settings.enabled, settings.intervalMinutes])

  const addLog = (type: LogEntry["type"], message: string, details?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleString(),
      type,
      message,
      details,
    }
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]) // Keep last 100 logs
  }

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/automation-settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
          setIsRunning(data.settings.enabled)
          if (data.settings.enabled) {
            startAutomation()
            startClaimsMonitoring()
          }
        }
      }
    } catch (error) {
      addLog("error", "Failed to load automation settings", error)
    }
  }

  const saveSettings = async () => {
    try {
      const response = await fetch("/api/admin/automation-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        addLog("success", "Automation settings saved successfully")
        if (settings.enabled && !isRunning) {
          startAutomation()
          startClaimsMonitoring()
        } else if (!settings.enabled && isRunning) {
          stopAutomation()
          stopClaimsMonitoring()
        }
      } else {
        addLog("error", "Failed to save automation settings")
      }
    } catch (error) {
      addLog("error", "Error saving settings", error)
    }
  }

  const updateNextRunTimer = () => {
    if (nextRunRef.current) {
      clearInterval(nextRunRef.current)
    }

    const updateTimer = () => {
      if (lastRun) {
        const lastRunTime = new Date(lastRun)
        const nextRunTime = new Date(lastRunTime.getTime() + settings.intervalMinutes * 60 * 1000)
        const now = new Date()

        if (nextRunTime > now) {
          const timeLeft = nextRunTime.getTime() - now.getTime()
          const minutes = Math.floor(timeLeft / 60000)
          const seconds = Math.floor((timeLeft % 60000) / 1000)
          setNextRun(`${minutes}m ${seconds}s`)
        } else {
          setNextRun("Running soon...")
        }
      }
    }

    updateTimer()
    nextRunRef.current = setInterval(updateTimer, 1000)
  }

  const startClaimsMonitoring = () => {
    if (monitorRef.current) return

    setIsMonitoring(true)
    addLog("info", "Started claims monitoring (30-second intervals)")

    const monitor = async () => {
      try {
        const response = await fetch("/api/admin/claims-monitor")
        const data = await response.json()

        if (data.success && data.claimsProcessed > 0) {
          addLog("success", `Claims monitor triggered automation for ${data.claimsProcessed} new claims`)
          setStats((prev) => ({
            ...prev,
            totalProcessed: prev.totalProcessed + data.claimsProcessed,
          }))
        }
      } catch (error) {
        addLog("warning", "Claims monitoring check failed", error)
      }
    }

    // Run immediately, then every 30 seconds
    monitor()
    monitorRef.current = setInterval(monitor, 30000)
  }

  const stopClaimsMonitoring = () => {
    if (monitorRef.current) {
      clearInterval(monitorRef.current)
      monitorRef.current = null
    }
    setIsMonitoring(false)
    addLog("info", "Stopped claims monitoring")
  }

  const startAutomation = () => {
    if (intervalRef.current) return

    setIsRunning(true)
    addLog("info", `Started automation with ${settings.intervalMinutes}-minute intervals`)

    const runAutomation = async () => {
      try {
        addLog("info", "Running scheduled automation...")
        const response = await fetch("/api/admin/process-automation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trigger: "scheduled" }),
        })

        const data = await response.json()
        setLastRun(new Date().toISOString())

        if (data.success) {
          addLog("success", `Automation completed: ${data.summary}`)
          setStats((prev) => ({
            totalProcessed: prev.totalProcessed + (data.processed || 0),
            successfulAssignments: prev.successfulAssignments + (data.keysAssigned || 0),
            emailsSent: prev.emailsSent + (data.emailsSent || 0),
            errors: prev.errors + (data.errors || 0),
          }))
        } else {
          addLog("error", `Automation failed: ${data.message}`)
          setStats((prev) => ({ ...prev, errors: prev.errors + 1 }))
        }
      } catch (error) {
        addLog("error", "Automation execution failed", error)
        setStats((prev) => ({ ...prev, errors: prev.errors + 1 }))
      }
    }

    // Run immediately, then at intervals
    runAutomation()
    intervalRef.current = setInterval(runAutomation, settings.intervalMinutes * 60 * 1000)
  }

  const stopAutomation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (nextRunRef.current) {
      clearInterval(nextRunRef.current)
      nextRunRef.current = null
    }
    setIsRunning(false)
    setNextRun(null)
    addLog("info", "Stopped automation")
  }

  const runManualAutomation = async () => {
    try {
      addLog("info", "Running manual automation...")
      const response = await fetch("/api/admin/process-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "manual" }),
      })

      const data = await response.json()

      if (data.success) {
        addLog("success", `Manual automation completed: ${data.summary}`)
        setStats((prev) => ({
          totalProcessed: prev.totalProcessed + (data.processed || 0),
          successfulAssignments: prev.successfulAssignments + (data.keysAssigned || 0),
          emailsSent: prev.emailsSent + (data.emailsSent || 0),
          errors: prev.errors + (data.errors || 0),
        }))
      } else {
        addLog("error", `Manual automation failed: ${data.message}`)
      }
    } catch (error) {
      addLog("error", "Manual automation failed", error)
    }
  }

  const getStatusBadge = () => {
    if (isRunning && isMonitoring) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <Activity className="w-3 h-3 mr-1" />
          Smart Active
        </Badge>
      )
    } else if (isRunning) {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled Only
        </Badge>
      )
    } else if (isMonitoring) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Eye className="w-3 h-3 mr-1" />
          Monitoring Only
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary">
          <Pause className="w-3 h-3 mr-1" />
          Stopped
        </Badge>
      )
    }
  }

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Activity className="w-4 h-4 text-blue-600" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Automation</h1>
          <p className="text-muted-foreground">
            Automated OTT key assignment and email delivery with real-time claims monitoring
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProcessed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keys Assigned</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsSent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Automation Settings
            </CardTitle>
            <CardDescription>Configure smart automation with real-time claims monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enable Smart Automation</Label>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Scheduled Interval (minutes)</Label>
              <Input
                id="interval"
                type="number"
                min="5"
                max="1440"
                value={settings.intervalMinutes}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, intervalMinutes: Number.parseInt(e.target.value) || 30 }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Claims monitoring runs every 30 seconds regardless of this setting
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email">Enable Email Notifications</Label>
              <Switch
                id="email"
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailEnabled: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Max Processing Limit</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="1000"
                value={settings.maxProcessingLimit}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, maxProcessingLimit: Number.parseInt(e.target.value) || 50 }))
                }
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button onClick={saveSettings} className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
              <Button onClick={runManualAutomation} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Run Now
              </Button>
            </div>

            {isRunning && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Smart Automation Active</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Claims monitoring: Every 30 seconds</div>
                  <div>• Scheduled automation: Every {settings.intervalMinutes} minutes</div>
                  {lastRun && <div>• Last run: {new Date(lastRun).toLocaleString()}</div>}
                  {nextRun && <div>• Next scheduled run: {nextRun}</div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Logs
              <Badge variant="outline" className="ml-auto">
                {logs.length} entries
              </Badge>
            </CardTitle>
            <CardDescription>Real-time automation and monitoring activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No activity logs yet. Start automation to see logs here.
                  </p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                      {getLogIcon(log.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.message}</p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                        {log.details && (
                          <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
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
