"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Mail, Send, Eye, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SendManualEmailPage() {
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    htmlBody: "",
  })
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [templateData, setTemplateData] = useState({
    customerName: "",
    ottCode: "",
    platform: "",
    claimId: "",
    activationCode: "",
  })
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const ottCodeTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTT Code is Ready!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff; }
        .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 30px; }
        .success-badge { background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .ott-code-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center; }
        .ott-code-label { color: white; margin: 0 0 15px 0; font-size: 16px; opacity: 0.9; }
        .ott-code-box { background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; border: 2px dashed rgba(255,255,255,0.5); }
        .ott-code { color: white; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 3px; font-family: 'Courier New', monospace; }
        .platform-badge { background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin: 15px 0; display: inline-block; }
        .instructions-section { background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3b82f6; }
        .instructions-section h3 { color: #1e40af; margin: 0 0 20px 0; }
        .instructions-section ol { color: #1e40af; line-height: 1.8; margin: 0; padding-left: 20px; }
        .instructions-section li { margin-bottom: 8px; }
        .details-section { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #4a5568; }
        .detail-value { color: #2d3748; font-family: 'Courier New', monospace; }
        .important-note { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .important-note h4 { color: #92400e; margin: 0 0 10px 0; }
        .important-note p { margin: 0; color: #78350f; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your OTT Code is Ready!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Enjoy your premium subscription</p>
        </div>
        
        <div class="content">
            <div class="success-badge">✅ Code Delivered</div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Dear {{customerName}},</p>
            
            <p style="color: #374151; line-height: 1.6;">
                Fantastic news! Your OTT subscription claim has been processed successfully. Here's your premium activation code:
            </p>
            
            <div class="platform-badge">{{platform}}</div>
            
            <div class="ott-code-section">
                <p class="ott-code-label">Your Activation Code</p>
                <div class="ott-code-box">
                    <h1 class="ott-code">{{ottCode}}</h1>
                </div>
            </div>
            
            <div class="instructions-section">
                <h3>📱 How to Redeem Your Code</h3>
                <ol>
                    <li>Download the <a href="https://www.ottplay.com/partner/systech-it-solution/ott_sustech_annualtest">OTT Play app</a> from your device's app store</li>
                    <li>Open the app and create an account or sign in to your existing account</li>
                    <li>Look for "Redeem Code", "Activate Subscription", or "Promo Code" option</li>
                    <li>Enter your activation code: <strong>{{ottCode}}</strong></li>
                    <li>Follow the on-screen instructions to complete activation</li>
                    <li>Start enjoying your premium content immediately!</li>
                </ol>
            </div>
            
            <div class="details-section">
                <h3 style="color: #2d3748; margin-top: 0;">📋 Order Summary</h3>
                <div class="detail-row">
                    <span class="detail-label">Claim ID:</span>
                    <span class="detail-value">{{claimId}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Platform:</span>
                    <span class="detail-value">{{platform}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Activation Code:</span>
                    <span class="detail-value">{{ottCode}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Original Code:</span>
                    <span class="detail-value">{{activationCode}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Processed On:</span>
                    <span class="detail-value">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                </div>
            </div>
            
            <div class="important-note">
                <h4>⚠️ Important Instructions</h4>
                <p><strong>Save this email:</strong> Keep this email safe for future reference. You may need the activation code again.</p>
                <p><strong>One-time use:</strong> This activation code can only be used once. Do not share it with others.</p>
                <p><strong>Validity:</strong> Please redeem your code as soon as possible to avoid any expiration issues.</p>
                <p><strong>Support:</strong> If you face any issues during activation, contact us with your Claim ID.</p>
            </div>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h4 style="color: #166534; margin: 0 0 10px 0;">🌟 Enjoy Your Premium Experience!</h4>
                <p style="margin: 0; color: #166534;">
                    You now have access to premium content, ad-free streaming, and exclusive features.
                </p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-top: 25px;">
                Thank you for choosing SYSTECH DIGITAL. We hope you enjoy your premium OTT experience!
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-weight: bold;">SYSTECH DIGITAL</p>
            <p style="margin: 5px 0;">📞 +91 7709803412 | ✉️ sales.systechdigital@gmail.com</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>`

  const applyTemplate = (template: string) => {
    let processedTemplate = template
    Object.entries(templateData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      processedTemplate = processedTemplate.replace(new RegExp(placeholder, "g"), value || `[${key}]`)
    })
    return processedTemplate
  }

  const handleTemplateSelect = (templateType: string) => {
    setSelectedTemplate(templateType)
    if (templateType === "ott-code") {
      setEmailData((prev) => ({
        ...prev,
        subject: "🎉 Your OTT Code is Ready! - SYSTECH DIGITAL",
        htmlBody: applyTemplate(ottCodeTemplate),
      }))
    } else if (templateType === "default") {
      setEmailData((prev) => ({
        ...prev,
        htmlBody: defaultHtmlTemplate,
      }))
    }
  }

  const handleTemplateDataChange = (field: string, value: string) => {
    setTemplateData((prev) => ({ ...prev, [field]: value }))
    if (selectedTemplate === "ott-code") {
      setEmailData((prev) => ({
        ...prev,
        htmlBody: applyTemplate(ottCodeTemplate),
      }))
    }
  }

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
        setSelectedTemplate("")
        setTemplateData({
          customerName: "",
          ottCode: "",
          platform: "",
          claimId: "",
          activationCode: "",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 lg:mb-8">
          <Link href="/emails">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Emails
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Mail className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              Send Manual Email
            </h1>
            <p className="text-slate-600 mt-1 text-sm lg:text-base">Compose and send custom emails to customers</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <Alert className="mb-4 lg:mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4 lg:mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col xl:grid xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Email Composer */}
          <Card className="shadow-lg border-0 bg-white w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                Compose Email
              </CardTitle>
              <CardDescription className="text-sm">
                Fill in the email details. From address is fixed as sales.systechdigital@gmail.com
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template" className="text-sm font-medium">
                  Email Template
                </Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Template</SelectItem>
                    <SelectItem value="ott-code">OTT Code Delivery Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate === "ott-code" && (
                <div className="space-y-3 p-3 lg:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 text-sm">Template Data</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="customerName" className="text-xs font-medium">
                        Customer Name
                      </Label>
                      <Input
                        id="customerName"
                        placeholder="John Doe"
                        value={templateData.customerName}
                        onChange={(e) => handleTemplateDataChange("customerName", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ottCode" className="text-xs font-medium">
                        OTT Code
                      </Label>
                      <Input
                        id="ottCode"
                        placeholder="ABC123XYZ"
                        value={templateData.ottCode}
                        onChange={(e) => handleTemplateDataChange("ottCode", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="platform" className="text-xs font-medium">
                        Platform
                      </Label>
                      <Input
                        id="platform"
                        placeholder="Netflix Premium"
                        value={templateData.platform}
                        onChange={(e) => handleTemplateDataChange("platform", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="claimId" className="text-xs font-medium">
                        Claim ID
                      </Label>
                      <Input
                        id="claimId"
                        placeholder="CLAIM-123456"
                        value={templateData.claimId}
                        onChange={(e) => handleTemplateDataChange("claimId", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="activationCode" className="text-xs font-medium">
                        Original Activation Code
                      </Label>
                      <Input
                        id="activationCode"
                        placeholder="ORIG-CODE-123"
                        value={templateData.activationCode}
                        onChange={(e) => handleTemplateDataChange("activationCode", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="from" className="text-sm font-medium">
                  From (Fixed)
                </Label>
                <Input id="from" value="sales.systechdigital@gmail.com" disabled className="bg-slate-50 text-sm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to" className="text-sm font-medium">
                  To Email Address *
                </Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="customer@example.com"
                  value={emailData.to}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, to: e.target.value }))}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, subject: e.target.value }))}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="htmlBody" className="text-sm font-medium">
                  HTML Body *
                </Label>
                <Textarea
                  id="htmlBody"
                  placeholder="Enter HTML email content"
                  value={emailData.htmlBody}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, htmlBody: e.target.value }))}
                  className="min-h-[250px] lg:min-h-[300px] font-mono text-xs resize-y"
                />
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
          <Card className="shadow-lg border-0 bg-white w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5" />
                Email Preview
              </CardTitle>
              <CardDescription className="text-sm">Live preview of how your email will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-3 lg:p-4 bg-slate-50 min-h-[400px] lg:min-h-[500px] max-h-[600px] overflow-auto">
                {emailData.htmlBody ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: emailData.htmlBody }}
                    className="prose prose-sm max-w-none [&>*]:max-w-full [&_img]:max-w-full [&_table]:w-full [&_table]:table-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <Eye className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm lg:text-base">Email preview will appear here</p>
                      <p className="text-xs lg:text-sm">Start typing HTML content to see the preview</p>
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
