"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Send, Eye, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SendManualEmailPage() {
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    htmlBody: "",
  })
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.htmlBody) {
      setError("Please fill in all fields")
      return
    }

    setSending(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/admin/send-manual-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.htmlBody,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage("Email sent successfully!")
        setEmailData({
          to: "",
          subject: "",
          htmlBody: "",
        })
      } else {
        setError(result.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Send email error:", error)
      setError("Network error occurred while sending email")
    } finally {
      setSending(false)
    }
  }

  const defaultHtmlTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email from SYSTECH DIGITAL</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">SYSTECH DIGITAL</h1>
            <p style="font-size: 16px; margin: 10px 0 0 0; opacity: 0.9;">Your Digital Solutions Partner</p>
        </div>
        
        <div style="padding: 40px 30px; text-align: left;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                This is a message from SYSTECH DIGITAL.
            </p>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
                [Your message content goes here]
            </p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h4 style="color: #1976d2; margin: 0 0 10px 0;">Need Help?</h4>
                <p style="color: #1976d2; margin: 5px 0;">
                    <strong>Email:</strong> sales.systechdigital@gmail.com
                </p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px; padding: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0; font-weight: bold;">Thank you for choosing SYSTECH DIGITAL</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">
                © ${new Date().getFullYear()} SYSTECH DIGITAL. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/emails">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Emails
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              Send Manual Email
            </h1>
            <p className="text-slate-600 mt-1">Compose and send custom emails to customers</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Composer */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Compose Email
              </CardTitle>
              <CardDescription>
                Fill in the email details. From address is fixed as sales.systechdigital@gmail.com
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="from">From (Fixed)</Label>
                <Input id="from" value="sales.systechdigital@gmail.com" disabled className="bg-slate-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">To Email Address *</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="customer@example.com"
                  value={emailData.to}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, to: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="htmlBody">HTML Body *</Label>
                <Textarea
                  id="htmlBody"
                  placeholder="Enter HTML email content"
                  value={emailData.htmlBody}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, htmlBody: e.target.value }))}
                  className="min-h-[400px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEmailData((prev) => ({ ...prev, htmlBody: defaultHtmlTemplate }))}
                  >
                    Load Template
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSendEmail}
                disabled={sending || !emailData.to || !emailData.subject || !emailData.htmlBody}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Email Preview */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Email Preview
              </CardTitle>
              <CardDescription>Live preview of how your email will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-slate-50 min-h-[500px]">
                {emailData.htmlBody ? (
                  <div dangerouslySetInnerHTML={{ __html: emailData.htmlBody }} className="prose prose-sm max-w-none" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Email preview will appear here</p>
                      <p className="text-sm">Start typing HTML content to see the preview</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
