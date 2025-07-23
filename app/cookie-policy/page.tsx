"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Cookie, Shield, Settings, Globe, Eye, Users } from "lucide-react"
import Image from "next/image"

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer flex items-center" onClick={() => (window.location.href = "/")}>
              <div className="relative h-10 w-10 mr-3">
                <Image
                  src="/logo.png"
                  alt="SYSTECH DIGITAL Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-red-200 mt-1">Cookie Policy</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2 border border-red-300">
              <Cookie className="w-4 h-4 mr-2" />
              Privacy Policy
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Cookie className="w-6 h-6 mr-3 text-blue-600" />
              Cookie Policy
            </CardTitle>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-700">
                <strong>Last Updated:</strong> January 23, 2025 | <strong>Effective Date:</strong> January 1, 2025
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This Cookie Policy explains how Systech IT Solutions Limited uses cookies and similar technologies on
                our website and services.
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* What are Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2 text-green-600" />
              1. What are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Definition</h4>
              <p className="text-sm text-green-700 mb-2">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit
                our website. They help us provide you with a better browsing experience and enable certain website
                functionalities.
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Store user preferences and settings</li>
                <li>• Remember login information</li>
                <li>• Analyze website traffic and usage patterns</li>
                <li>• Provide personalized content and advertisements</li>
                <li>• Enable secure payment processing</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>2. Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🔧 Essential Cookies</h4>
                <p className="text-sm text-blue-700 mb-2">Required for basic website functionality</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Session management</li>
                  <li>• Security authentication</li>
                  <li>• Form submission handling</li>
                  <li>• Shopping cart functionality</li>
                </ul>
                <Badge variant="outline" className="mt-2 text-blue-700 border-blue-300">
                  Cannot be disabled
                </Badge>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">📊 Analytics Cookies</h4>
                <p className="text-sm text-purple-700 mb-2">Help us understand website usage</p>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Page view tracking</li>
                  <li>• User behavior analysis</li>
                  <li>• Performance monitoring</li>
                  <li>• Error reporting</li>
                </ul>
                <Badge variant="outline" className="mt-2 text-purple-700 border-purple-300">
                  Can be disabled
                </Badge>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">⚙️ Functional Cookies</h4>
                <p className="text-sm text-orange-700 mb-2">Enhance user experience</p>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Language preferences</li>
                  <li>• Theme settings</li>
                  <li>• Location data</li>
                  <li>• Accessibility options</li>
                </ul>
                <Badge variant="outline" className="mt-2 text-orange-700 border-orange-300">
                  Can be disabled
                </Badge>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">🎯 Marketing Cookies</h4>
                <p className="text-sm text-red-700 mb-2">Used for advertising and marketing</p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Targeted advertisements</li>
                  <li>• Social media integration</li>
                  <li>• Campaign tracking</li>
                  <li>• Retargeting pixels</li>
                </ul>
                <Badge variant="outline" className="mt-2 text-red-700 border-red-300">
                  Can be disabled
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Details Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3. Detailed Cookie Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cookie Name</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Provider</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">session_id</TableCell>
                    <TableCell>User session management</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-blue-700">
                        Essential
                      </Badge>
                    </TableCell>
                    <TableCell>Session</TableCell>
                    <TableCell>Systech Digital</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">csrf_token</TableCell>
                    <TableCell>Security protection</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-blue-700">
                        Essential
                      </Badge>
                    </TableCell>
                    <TableCell>Session</TableCell>
                    <TableCell>Systech Digital</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">razorpay_checkout</TableCell>
                    <TableCell>Payment processing</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-blue-700">
                        Essential
                      </Badge>
                    </TableCell>
                    <TableCell>Session</TableCell>
                    <TableCell>Razorpay</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">_ga</TableCell>
                    <TableCell>Google Analytics tracking</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-purple-700">
                        Analytics
                      </Badge>
                    </TableCell>
                    <TableCell>2 years</TableCell>
                    <TableCell>Google</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">_gid</TableCell>
                    <TableCell>Google Analytics session</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-purple-700">
                        Analytics
                      </Badge>
                    </TableCell>
                    <TableCell>24 hours</TableCell>
                    <TableCell>Google</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">user_preferences</TableCell>
                    <TableCell>Store user settings</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-orange-700">
                        Functional
                      </Badge>
                    </TableCell>
                    <TableCell>1 year</TableCell>
                    <TableCell>Systech Digital</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">zoho_form_session</TableCell>
                    <TableCell>Form submission tracking</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-orange-700">
                        Functional
                      </Badge>
                    </TableCell>
                    <TableCell>Session</TableCell>
                    <TableCell>Zoho</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-600" />
              4. Third-Party Cookies & Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💳 Razorpay</h4>
                <p className="text-sm text-blue-700 mb-2">Payment gateway integration</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Secure payment processing</li>
                  <li>• Fraud detection</li>
                  <li>• Transaction analytics</li>
                  <li>• Payment method preferences</li>
                </ul>
                <p className="text-xs text-blue-600 mt-2">
                  <strong>Privacy Policy:</strong>{" "}
                  <a href="https://razorpay.com/privacy" target="_blank" rel="noopener noreferrer">
                    razorpay.com/privacy
                  </a>
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">📋 Zoho Forms</h4>
                <p className="text-sm text-green-700 mb-2">Form management and data collection</p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Form submission tracking</li>
                  <li>• Data validation</li>
                  <li>• User session management</li>
                  <li>• Anti-spam protection</li>
                </ul>
                <p className="text-xs text-green-600 mt-2">
                  <strong>Privacy Policy:</strong>{" "}
                  <a href="https://zoho.com/privacy.html" target="_blank" rel="noopener noreferrer">
                    zoho.com/privacy.html
                  </a>
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">🎬 OTTplay</h4>
                <p className="text-sm text-purple-700 mb-2">OTT subscription service provider</p>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Subscription management</li>
                  <li>• Content preferences</li>
                  <li>• Usage analytics</li>
                  <li>• Device tracking</li>
                </ul>
                <p className="text-xs text-purple-600 mt-2">
                  <strong>Privacy Policy:</strong>{" "}
                  <a href="https://ottplay.com/privacy" target="_blank" rel="noopener noreferrer">
                    ottplay.com/privacy
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Third-Party Data Processing</h4>
              <p className="text-sm text-yellow-700 mb-2">
                When you interact with third-party services integrated into our website, your data may be processed by
                these providers according to their own privacy policies:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Data may be transferred to servers outside India</li>
                <li>• Each provider has their own data retention policies</li>
                <li>• You can opt-out of non-essential third-party cookies</li>
                <li>• Some services may require cookies for basic functionality</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Consent & Control */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-orange-600" />
              5. Your Cookie Choices & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">🎛️ Cookie Preferences</h4>
              <p className="text-sm text-orange-700 mb-2">
                You have control over which cookies you accept. You can manage your preferences through:
              </p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Our cookie consent banner (appears on first visit)</li>
                <li>• Browser settings and preferences</li>
                <li>• Third-party opt-out tools</li>
                <li>• Account settings (for registered users)</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Browser Controls</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="bg-gray-50 p-3 rounded">
                    <strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Impact of Disabling Cookies</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Some website features may not work properly</li>
                    <li>• Payment processing may be affected</li>
                    <li>• User preferences will not be saved</li>
                    <li>• Login sessions may not persist</li>
                    <li>• Analytics and improvements will be limited</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              6. Data Retention & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">🔒 Security Measures</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Encrypted cookie transmission</li>
                  <li>• Secure cookie flags (HttpOnly, Secure)</li>
                  <li>• Regular security audits</li>
                  <li>• Access controls and monitoring</li>
                  <li>• Data minimization practices</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">⏰ Retention Periods</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Session cookies: Until browser closes</li>
                  <li>• Functional cookies: Up to 1 year</li>
                  <li>• Analytics cookies: Up to 2 years</li>
                  <li>• Marketing cookies: Up to 1 year</li>
                  <li>• Security cookies: As needed for protection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* International Data Transfers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-purple-600" />
              7. International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">🌍 Cross-Border Data Processing</h4>
              <p className="text-sm text-purple-700 mb-2">
                Some of our third-party service providers may process your cookie data outside of India:
              </p>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Google Analytics: Data processed in USA and other countries</li>
                <li>• Razorpay: Data primarily processed in India</li>
                <li>• Zoho: Data processed in India and USA</li>
                <li>• OTTplay: Data processed in India</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🛡️ Transfer Safeguards</h4>
              <p className="text-sm text-blue-700 mb-2">
                We ensure appropriate safeguards are in place for international transfers:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Standard Contractual Clauses (SCCs)</li>
                <li>• Adequacy decisions where applicable</li>
                <li>• Privacy Shield frameworks (where available)</li>
                <li>• Binding Corporate Rules (BCRs)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              8. Your Rights & Choices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-900 mb-2">📋 Your Data Rights</h4>
              <p className="text-sm text-indigo-700 mb-2">
                Under applicable data protection laws, you have the following rights regarding cookies and personal
                data:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Right to be informed about cookie usage</li>
                  <li>• Right to access your cookie data</li>
                  <li>• Right to rectify inaccurate information</li>
                  <li>• Right to erase personal data</li>
                </ul>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Right to restrict processing</li>
                  <li>• Right to data portability</li>
                  <li>• Right to object to processing</li>
                  <li>• Right to withdraw consent</li>
                </ul>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h4 className="font-semibold text-teal-900 mb-2">✉️ Exercising Your Rights</h4>
              <p className="text-sm text-teal-700 mb-2">To exercise any of these rights, please contact us at:</p>
              <ul className="text-sm text-teal-700 space-y-1">
                <li>• Email: sales.systechdigital@gmail.com</li>
                <li>• Phone: +91 7709803412</li>
                <li>• Include "Cookie Rights Request" in your subject line</li>
                <li>• We will respond within 30 days of receiving your request</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Updates & Changes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>9. Policy Updates & Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">📝 Policy Modifications</h4>
              <p className="text-sm text-yellow-700 mb-2">
                We may update this Cookie Policy from time to time to reflect changes in our practices or legal
                requirements:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Material changes will be notified via email or website banner</li>
                <li>• Minor updates will be posted with updated "Last Modified" date</li>
                <li>• Continued use of our website constitutes acceptance of changes</li>
                <li>• Previous versions available upon request</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>10. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4">📞 Get in Touch</h4>
              <p className="text-sm text-blue-700 mb-4">
                If you have any questions about this Cookie Policy or our use of cookies, please contact us:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-blue-800 mb-2">Contact Information</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      📧 <strong>Email:</strong> sales.systechdigital@gmail.com
                    </li>
                    <li>
                      📞 <strong>Phone:</strong> +91 7709803412
                    </li>
                    <li>
                      🌐 <strong>Website:</strong> www.systechdigital.co.in
                    </li>
                    <li>
                      ⏰ <strong>Hours:</strong> Mon-Sat, 9 AM - 6 PM IST
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800 mb-2">Postal Address</h5>
                  <div className="text-sm text-blue-700">
                    <p>Systech IT Solutions Limited</p>
                    <p>Unit NO H-04, 4th Floor, SOLUS No 2</p>
                    <p>JC Road, Bangalore South</p>
                    <p>Karnataka, India - 560027</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black via-red-900 to-black text-white py-8 border-t border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center md:items-start">
              <div className="relative h-10 w-10 mr-3 hidden md:block">
                <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={40} height={40} className="rounded-full" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">SYSTECH DIGITAL</h3>
                <p className="text-red-200 text-sm">Your trusted partner for IT Solutions & Mobile Technology</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => (window.location.href = "/ott")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    OTT Claim Form
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => (window.location.href = "/terms-and-conditions")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => (window.location.href = "/refund-policy")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Refund Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => (window.location.href = "/privacy-policy")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Contact Us</h4>
              <ul className="space-y-2 text-sm text-red-200">
                <li>📞 +91 7709803412</li>
                <li>📧 sales.systechdigital@gmail.com</li>
                <li>🌐 www.systechdigital.co.in</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-red-800 mt-8 pt-8 text-center">
            <p className="text-sm text-red-200">© 2025 Systech IT Solutions Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
