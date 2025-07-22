"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Cookie } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer flex items-center" onClick={() => (window.location.href = "/")}>
              <img
                src="/logo-white.png"
                alt="SYSTECH DIGITAL Logo"
                className="h-10 w-auto mr-3"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling.style.display = "block"
                }}
              />
              <div style={{ display: "none" }}>
                <h1 className="text-3xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-red-200 mt-1">Cookie Policy</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2 border border-red-300">
              <Cookie className="w-4 h-4 mr-2" />
              Cookie Policy
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mb-4 border-red-300 text-red-700 hover:bg-red-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h2>
          <p className="text-gray-600">Last updated: January 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. What Are Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Cookies are small text files that are placed on your computer or mobile device when you visit our
                website. They are widely used to make websites work more efficiently and provide information to website
                owners.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>SYSTECH IT SOLUTIONS LIMITED uses cookies for the following purposes:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>To ensure our website functions properly</li>
                  <li>To remember your preferences and settings</li>
                  <li>To analyze website traffic and usage patterns</li>
                  <li>To improve user experience</li>
                  <li>To process payments securely through Razorpay</li>
                  <li>To prevent fraud and enhance security</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-4">
                <div>
                  <h4 className="font-semibold">Essential Cookies</h4>
                  <p>
                    These cookies are necessary for the website to function properly. They enable basic functions like
                    page navigation, form submissions, and secure payment processing.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Performance Cookies</h4>
                  <p>
                    These cookies collect information about how visitors use our website, such as which pages are
                    visited most often. This data helps us improve our website performance.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Functionality Cookies</h4>
                  <p>
                    These cookies allow our website to remember choices you make and provide enhanced, more personal
                    features.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Security Cookies</h4>
                  <p>These cookies help us detect and prevent fraudulent activities and secure your transactions.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>We may use third-party services that place cookies on your device:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    <strong>Razorpay:</strong> For secure payment processing
                  </li>
                  <li>
                    <strong>Google Analytics:</strong> For website analytics (if applicable)
                  </li>
                  <li>
                    <strong>OTTplay:</strong> For OTT subscription services
                  </li>
                  <li>
                    <strong>Zoho Forms:</strong> For form submissions and data collection
                  </li>
                </ul>
                <p>These third parties have their own privacy policies and cookie policies.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Managing Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>You can control and manage cookies in several ways:</p>

                <h4 className="font-semibold">Browser Settings</h4>
                <p>Most web browsers allow you to control cookies through their settings. You can:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>View what cookies are stored on your device</li>
                  <li>Delete cookies</li>
                  <li>Block cookies from specific websites</li>
                  <li>Block all cookies</li>
                  <li>Delete cookies when you close your browser</li>
                </ul>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800">
                    <strong>Note:</strong> Disabling cookies may affect the functionality of our website and your
                    ability to use certain features, including payment processing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookie Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>We retain cookies for different periods depending on their purpose:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    <strong>Session Cookies:</strong> Deleted when you close your browser
                  </li>
                  <li>
                    <strong>Persistent Cookies:</strong> Remain on your device for a set period or until you delete them
                  </li>
                  <li>
                    <strong>Security Cookies:</strong> May be retained for fraud prevention purposes
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other
                operational, legal, or regulatory reasons. We will notify you of any material changes by posting the
                updated policy on our website.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                <p>If you have any questions about our use of cookies, please contact us:</p>
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <p>
                    <strong>Email:</strong> sales.systechdigital@gmail.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +91 7709803412
                  </p>
                  <p>
                    <strong>Address:</strong> Unit NO H-04, 4th Floor, SOLUS No 2, JC Road, Bangalore South, Karnataka -
                    560027
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black via-red-900 to-black text-white py-8 border-t border-red-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">SYSTECH DIGITAL</h3>
              <p className="text-red-200 text-sm">Your trusted partner for IT Solutions & Mobile Technology</p>
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
                    onClick={() => (window.location.href = "/ottclaim")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    OTT Claim
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Policies</h4>
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
            <p className="text-sm text-red-200">© 2025 Systech IT Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
