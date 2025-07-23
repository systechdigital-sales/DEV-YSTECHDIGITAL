"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Cookie, Shield, Settings, Eye } from "lucide-react"
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
                src="/favicon.png"
                alt="SYSTECH DIGITAL Logo"
                className="h-10 w-10 mr-3 rounded-full"
                onError={(e) => {
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
          <p className="text-gray-600">Last updated: January 23, 2025</p>
        </div>

        {/* Cookie Consent Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Shield className="w-5 h-5 mr-2" />
              Your Privacy Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic.
              By continuing to use our website, you consent to our use of cookies as described in this policy.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. What Are Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>
                  Cookies are small text files that are stored on your computer, tablet, or mobile device when you visit
                  our website. They are widely used to make websites work more efficiently and provide a better user
                  experience.
                </p>
                <p>
                  Cookies contain information about your preferences and activities on our website, which helps us
                  remember your settings and provide personalized services.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>SYSTECH IT SOLUTIONS LIMITED uses cookies for the following legitimate purposes:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">🔧 Essential Functions</h4>
                    <ul className="list-disc ml-4 space-y-1 text-green-700 text-sm">
                      <li>Website functionality and navigation</li>
                      <li>User authentication and security</li>
                      <li>Shopping cart and checkout process</li>
                      <li>Form data retention</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">📊 Analytics & Performance</h4>
                    <ul className="list-disc ml-4 space-y-1 text-blue-700 text-sm">
                      <li>Website traffic analysis</li>
                      <li>User behavior patterns</li>
                      <li>Performance optimization</li>
                      <li>Error tracking and debugging</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">🎯 Personalization</h4>
                    <ul className="list-disc ml-4 space-y-1 text-purple-700 text-sm">
                      <li>Remember user preferences</li>
                      <li>Language and region settings</li>
                      <li>Customized content delivery</li>
                      <li>Product recommendations</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">🔒 Security & Fraud Prevention</h4>
                    <ul className="list-disc ml-4 space-y-1 text-orange-700 text-sm">
                      <li>Secure payment processing</li>
                      <li>Fraud detection and prevention</li>
                      <li>Account protection</li>
                      <li>Suspicious activity monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Cookie Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Can be Disabled?</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <strong>Essential Cookies</strong>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Required for basic website functionality, security, and payment processing
                        </td>
                        <td className="border border-gray-300 px-4 py-2">Session/Persistent</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="text-red-600">❌ No</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <strong>Performance Cookies</strong>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Collect anonymous data about website usage and performance
                        </td>
                        <td className="border border-gray-300 px-4 py-2">Up to 2 years</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="text-green-600">✅ Yes</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <strong>Functionality Cookies</strong>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Remember user preferences and provide enhanced features
                        </td>
                        <td className="border border-gray-300 px-4 py-2">Up to 1 year</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="text-green-600">✅ Yes</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <strong>Security Cookies</strong>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Protect against fraud and ensure secure transactions
                        </td>
                        <td className="border border-gray-300 px-4 py-2">Session/24 hours</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="text-red-600">❌ No</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Third-Party Cookies & Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-4">
                <p>We work with trusted third-party services that may place cookies on your device:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">💳 Payment Processing</h4>
                    <ul className="list-disc ml-4 space-y-1 text-blue-700 text-sm">
                      <li>
                        <strong>Razorpay:</strong> Secure payment gateway for transaction processing
                      </li>
                      <li>
                        <strong>Purpose:</strong> Payment security, fraud prevention, transaction completion
                      </li>
                      <li>
                        <strong>Data Shared:</strong> Payment details, transaction amount, customer information
                      </li>
                      <li>
                        <strong>Privacy Policy:</strong>{" "}
                        <a href="https://razorpay.com/privacy/" className="underline">
                          razorpay.com/privacy
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">📺 OTT Services</h4>
                    <ul className="list-disc ml-4 space-y-1 text-green-700 text-sm">
                      <li>
                        <strong>OTTplay:</strong> Digital subscription service provider
                      </li>
                      <li>
                        <strong>Purpose:</strong> Subscription activation, content delivery, user authentication
                      </li>
                      <li>
                        <strong>Data Shared:</strong> User details, subscription preferences
                      </li>
                      <li>
                        <strong>Privacy Policy:</strong> Available on OTTplay platform
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">📋 Form Management</h4>
                    <ul className="list-disc ml-4 space-y-1 text-purple-700 text-sm">
                      <li>
                        <strong>Zoho Forms:</strong> Customer data collection and management
                      </li>
                      <li>
                        <strong>Purpose:</strong> Form submissions, customer support, data processing
                      </li>
                      <li>
                        <strong>Data Shared:</strong> Form responses, contact information
                      </li>
                      <li>
                        <strong>Privacy Policy:</strong>{" "}
                        <a href="https://www.zoho.com/privacy.html" className="underline">
                          zoho.com/privacy
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">📈 Analytics (Optional)</h4>
                    <ul className="list-disc ml-4 space-y-1 text-orange-700 text-sm">
                      <li>
                        <strong>Google Analytics:</strong> Website traffic and user behavior analysis
                      </li>
                      <li>
                        <strong>Purpose:</strong> Performance optimization, user experience improvement
                      </li>
                      <li>
                        <strong>Data Shared:</strong> Anonymous usage statistics
                      </li>
                      <li>
                        <strong>Opt-out:</strong>{" "}
                        <a href="https://tools.google.com/dlpage/gaoptout" className="underline">
                          Google Analytics Opt-out
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Note:</strong> These third-party services have their own privacy policies and cookie
                    practices. We recommend reviewing their policies for complete information about their data handling
                    practices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                5. Managing Your Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-4">
                <h4 className="font-semibold text-lg">Browser Settings</h4>
                <p>You can control cookies through your web browser settings:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-2">🌐 Chrome/Edge</h5>
                    <ul className="list-disc ml-4 space-y-1 text-gray-700 text-sm">
                      <li>Settings → Privacy and Security → Cookies</li>
                      <li>Choose "Block third-party cookies" or "Block all cookies"</li>
                      <li>Manage exceptions for specific sites</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-2">🦊 Firefox</h5>
                    <ul className="list-disc ml-4 space-y-1 text-gray-700 text-sm">
                      <li>Settings → Privacy & Security → Cookies</li>
                      <li>Select "Strict" or "Custom" protection</li>
                      <li>Manage cookie exceptions</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-2">🍎 Safari</h5>
                    <ul className="list-disc ml-4 space-y-1 text-gray-700 text-sm">
                      <li>Preferences → Privacy → Cookies</li>
                      <li>Choose "Block all cookies" or customize settings</li>
                      <li>Manage website data</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-2">📱 Mobile Browsers</h5>
                    <ul className="list-disc ml-4 space-y-1 text-gray-700 text-sm">
                      <li>Access browser settings menu</li>
                      <li>Navigate to Privacy/Security settings</li>
                      <li>Adjust cookie preferences</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ Important Notice</h4>
                  <p className="text-red-700">
                    Disabling essential cookies may affect website functionality, including:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1 text-red-700">
                    <li>Payment processing and checkout</li>
                    <li>User account access and authentication</li>
                    <li>Shopping cart functionality</li>
                    <li>Form submissions and data saving</li>
                    <li>Security features and fraud protection</li>
                  </ul>
                </div>

                <h4 className="font-semibold text-lg">Cookie Preference Center</h4>
                <p>
                  We provide a cookie preference center where you can manage your consent for different types of
                  cookies. You can access this at any time by clicking the "Cookie Settings" link in our website footer.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookie Retention & Expiration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>We retain cookies for different periods based on their purpose and type:</p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Cookie Category</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Retention Period</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Automatic Deletion</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Session Cookies</td>
                        <td className="border border-gray-300 px-4 py-2">Until browser is closed</td>
                        <td className="border border-gray-300 px-4 py-2">✅ Automatic</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Authentication Cookies</td>
                        <td className="border border-gray-300 px-4 py-2">30 days (or until logout)</td>
                        <td className="border border-gray-300 px-4 py-2">✅ Automatic</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Preference Cookies</td>
                        <td className="border border-gray-300 px-4 py-2">1 year</td>
                        <td className="border border-gray-300 px-4 py-2">✅ Automatic</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Analytics Cookies</td>
                        <td className="border border-gray-300 px-4 py-2">2 years</td>
                        <td className="border border-gray-300 px-4 py-2">✅ Automatic</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Security Cookies</td>
                        <td className="border border-gray-300 px-4 py-2">24 hours - 30 days</td>
                        <td className="border border-gray-300 px-4 py-2">✅ Automatic</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🔄 Manual Cookie Clearing</h4>
                  <p className="text-blue-700">
                    You can manually clear cookies at any time through your browser settings. This will remove all
                    stored cookies and may require you to re-enter preferences and login information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>
                  Some of our third-party service providers may process cookie data outside of India. We ensure that:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>All international transfers comply with applicable data protection laws</li>
                  <li>Adequate safeguards are in place to protect your data</li>
                  <li>Service providers maintain appropriate security standards</li>
                  <li>Data processing agreements include privacy protection clauses</li>
                </ul>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">🌍 Countries Where Data May Be Processed</h4>
                  <ul className="list-disc ml-4 space-y-1 text-gray-700 text-sm">
                    <li>
                      <strong>India:</strong> Primary data processing location
                    </li>
                    <li>
                      <strong>United States:</strong> Cloud services and analytics (with Privacy Shield/adequacy
                      protections)
                    </li>
                    <li>
                      <strong>European Union:</strong> GDPR-compliant processing for EU visitors
                    </li>
                    <li>
                      <strong>Singapore:</strong> Regional data centers for performance optimization
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Updates to This Cookie Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices, technology,
                  legal requirements, or other operational factors.
                </p>

                <h4 className="font-semibold">How We Notify You of Changes</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Email notification to registered users (for material changes)</li>
                  <li>Website banner notification for 30 days</li>
                  <li>Updated "Last Modified" date at the top of this policy</li>
                  <li>Social media announcements for significant updates</li>
                </ul>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">📧 Stay Informed</h4>
                  <p className="text-green-700">
                    Subscribe to our newsletter or follow our social media channels to receive notifications about
                    policy updates and other important announcements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                9. Your Rights & Choices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>
                  Under applicable privacy laws, you have the following rights regarding cookies and your personal data:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">🔍 Right to Information</h4>
                    <ul className="list-disc ml-4 space-y-1 text-blue-700 text-sm">
                      <li>Know what cookies we use and why</li>
                      <li>Understand how your data is processed</li>
                      <li>Access this cookie policy at any time</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">⚙️ Right to Control</h4>
                    <ul className="list-disc ml-4 space-y-1 text-green-700 text-sm">
                      <li>Accept or reject non-essential cookies</li>
                      <li>Change your preferences at any time</li>
                      <li>Delete cookies from your browser</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">🗑️ Right to Deletion</h4>
                    <ul className="list-disc ml-4 space-y-1 text-purple-700 text-sm">
                      <li>Request deletion of your cookie data</li>
                      <li>Clear browser cookies manually</li>
                      <li>Opt-out of analytics tracking</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">📞 Right to Support</h4>
                    <ul className="list-disc ml-4 space-y-1 text-orange-700 text-sm">
                      <li>Contact us with cookie-related questions</li>
                      <li>Request technical assistance</li>
                      <li>File complaints about cookie practices</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                <p className="mb-3">
                  If you have any questions about our use of cookies or this policy, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>Data Protection Officer:</strong> Available during business hours
                  </p>
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
                  <p>
                    <strong>Business Hours:</strong> Monday to Saturday, 9:00 AM to 6:00 PM IST
                  </p>
                  <p>
                    <strong>Response Time:</strong> We aim to respond to all cookie-related inquiries within 48 hours
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🛡️ Privacy Complaints</h4>
                  <p className="text-blue-700 text-sm">
                    If you're not satisfied with our response to your privacy concerns, you may file a complaint with
                    the relevant data protection authority in your jurisdiction.
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
