"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertTriangle, RefreshCw } from "lucide-react"

interface PaymentCooldownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cooldownUntil: Date
  remainingMinutes: number
  onReturnToForm: () => void
}

export default function PaymentCooldownDialog({
  open,
  onOpenChange,
  cooldownUntil,
  remainingMinutes: initialMinutes,
  onReturnToForm,
}: PaymentCooldownDialogProps) {
  const [remainingMinutes, setRemainingMinutes] = useState(initialMinutes)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  useEffect(() => {
    if (!open) return

    const updateCountdown = () => {
      const now = new Date()
      const remaining = cooldownUntil.getTime() - now.getTime()

      if (remaining <= 0) {
        setRemainingMinutes(0)
        setRemainingSeconds(0)
        return
      }

      const minutes = Math.floor(remaining / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      setRemainingMinutes(minutes)
      setRemainingSeconds(seconds)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [open, cooldownUntil])

  const formatTime = (minutes: number, seconds: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m ${seconds}s`
    }
    return `${mins}m ${seconds}s`
  }

  const canRetry = remainingMinutes === 0 && remainingSeconds === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Payment Limit Reached</span>
          </DialogTitle>
          <DialogDescription className="text-left">
            You have exceeded the maximum number of payment attempts (3) for this claim.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <Clock className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="font-medium mb-2">Cooldown Period Active</div>
              <div className="text-sm">For security reasons, you must wait before attempting payment again.</div>
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-mono font-bold text-gray-900 mb-2">
              {canRetry ? "Ready to retry!" : formatTime(remainingMinutes, remainingSeconds)}
            </div>
            <div className="text-sm text-gray-600">
              {canRetry ? "You can now attempt payment again" : "Time remaining until next attempt"}
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Why this happens:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Multiple failed payment attempts were detected</li>
              <li>This is a security measure to protect your account</li>
              <li>The cooldown period is 6 hours from your last attempt</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            {canRetry ? (
              <Button
                onClick={() => {
                  onOpenChange(false)
                  window.location.reload()
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Payment Again
              </Button>
            ) : (
              <Button onClick={onReturnToForm} variant="outline" className="flex-1 bg-transparent">
                Return to Form
              </Button>
            )}
          </div>

          <div className="text-xs text-center text-gray-500">
            Need help? Contact support at{" "}
            <a href="mailto:sales.systechdigital@gmail.com" className="text-blue-600 hover:underline">
              sales.systechdigital@gmail.com
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
