"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, AlertTriangle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function RefundPolicyPage() {
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
                <p className="text-sm text-red-200 mt-1">Refund Policy</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2 border border-red-300">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refund Policy
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Refund & Cancellation Policy</h2>
          <p className="text-gray-600">Last updated: January 23, 2025</p>
        </div>

        {/* Important Notice */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Important Notice - Digital Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 font-semibold">
              Once digital services (including OTT subscriptions) are activated or delivered, they cannot be refunded.
              Please review all details carefully before completing your purchase.
            </p>
          </CardContent>
        </Card>

        {/* Processing Timeline */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Clock className="w-5 h-5 mr-2" />
              Refund Processing Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-700 space-y-2">
              <p>
                <strong>Credit/Debit Cards:</strong> 5-7 business days
              </p>
              <p>
                <strong>UPI/Net Banking:</strong> 2-3 business days
              </p>
              <p>
                <strong>Digital Wallets:</strong> 1-2 business days
              </p>
              <p>
                <strong>Failed Transactions:</strong> Auto-refund within 24 hours
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Refund Policy Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                SYSTECH IT SOLUTIONS LIMITED is committed to customer satisfaction and transparent refund practices.
                This policy outlines the conditions, procedures, and timelines for refunds across all our products and
                services. We comply with Consumer Protection Act, 2019 and RBI guidelines for digital payments.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Physical Products - Refund Eligibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Eligible for Full Refund</h4>
                  <ul className="list-disc ml-6 space-y-1 text-green-700">
                    <li>Defective products received (manufacturing defects)</li>
                    <li>Wrong product delivered due to our error</li>
                    <li>Products damaged during shipping (with photo evidence)</li>
                    <li>Products significantly different from description</li>
                    <li>Missing accessories or components</li>
                    <li>Products not delivered within promised timeline (15+ days delay)</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Partial Refund Conditions</h4>
                  <ul className="list-disc ml-6 space-y-1 text-yellow-700">
                    <li>Products returned after 7 days but within 15 days (10% restocking fee)</li>
                    <li>Products with minor cosmetic damage not affecting functionality</li>
                    <li>Products returned without original packaging (packaging cost deducted)</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Non-Refundable Items</h4>
                  <ul className="list-disc ml-6 space-y-1 text-red-700">
                    <li>Products returned after 15 days of delivery</li>
                    <li>Products damaged due to misuse or negligence</li>
                    <li>Products with tampered warranty seals</li>
                    <li>Personalized or customized products</li>
                    <li>Software licenses (once activated)</li>
                    <li>Products purchased during clearance sales (unless defective)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Digital Services & OTT Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">🚫 No Refund After Activation</h4>
                  <p className="text-red-700 mb-2">
                    <strong>
                      Digital services including OTT subscriptions are non-refundable once activated or delivered.
                    </strong>{" "}
                    This policy is in line with industry standards for digital content.
                  </p>
                  <ul className="list-disc ml-6 space-y-1 text-red-700">
                    <li>OTT subscription codes (once sent to customer)</li>
                    <li>Digital downloads (software, media files)</li>
                    <li>Online service activations</li>
                    <li>Gift cards or vouchers (once generated)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🔄 Pre-Activation Cancellation</h4>
                  <ul className="list-disc ml-6 space-y-1 text-blue-700">
                    <li>Cancellation allowed within 2 hours of purchase (before code generation)</li>
                    <li>Full refund processed if service not yet activated</li>
                    <li>Contact customer support immediately for cancellation</li>
                    <li>Provide order number and reason for cancellation</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">⚡ Technical Issues</h4>
                  <ul className="list-disc ml-6 space-y-1 text-orange-700">
                    <li>If OTT platform is permanently discontinued, alternative service provided</li>
                    <li>Technical issues resolved through OTT platform support</li>
                    <li>We facilitate communication but cannot refund third-party service issues</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Payment Refund Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">💳 Refund Methods</h4>
                  <ul className="list-disc ml-6 space-y-1 text-blue-700">
                    <li>
                      <strong>Original Payment Method:</strong> Refunds processed to the same payment method used
                    </li>
                    <li>
                      <strong>Bank Transfer:</strong> Available if original method unavailable (bank charges may apply)
                    </li>
                    <li>
                      <strong>Store Credit:</strong> Optional for faster processing (no expiry)
                    </li>
                  </ul>
                </div>

                <h4 className="font-semibold">Processing Timeline by Payment Method</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Payment Method</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Processing Time</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Additional Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Credit Card</td>
                        <td className="border border-gray-300 px-4 py-2">5-7 business days</td>
                        <td className="border border-gray-300 px-4 py-2">May take 1-2 billing cycles to reflect</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Debit Card</td>
                        <td className="border border-gray-300 px-4 py-2">5-7 business days</td>
                        <td className="border border-gray-300 px-4 py-2">Directly credited to bank account</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">UPI</td>
                        <td className="border border-gray-300 px-4 py-2">2-3 business days</td>
                        <td className="border border-gray-300 px-4 py-2">Fastest refund method</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Net Banking</td>
                        <td className="border border-gray-300 px-4 py-2">3-5 business days</td>
                        <td className="border border-gray-300 px-4 py-2">Bank processing time varies</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Digital Wallets</td>
                        <td className="border border-gray-300 px-4 py-2">1-2 business days</td>
                        <td className="border border-gray-300 px-4 py-2">Subject to wallet provider policies</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">💰 Refund Deductions</h4>
                  <ul className="list-disc ml-6 space-y-1 text-yellow-700">
                    <li>
                      <strong>Payment Gateway Charges:</strong> ₹10-25 per transaction (for customer-initiated returns)
                    </li>
                    <li>
                      <strong>Return Shipping:</strong> Actual shipping cost (if not our fault)
                    </li>
                    <li>
                      <strong>Restocking Fee:</strong> 10% for returns after 7 days
                    </li>
                    <li>
                      <strong>No deductions:</strong> For defective products or our errors
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Refund Request Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-4">
                <h4 className="font-semibold text-lg">Step-by-Step Process</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h5 className="font-semibold">Contact Customer Support</h5>
                      <p className="text-sm">Email: sales.systechdigital@gmail.com or Call: +91 7709803412</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h5 className="font-semibold">Provide Required Information</h5>
                      <p className="text-sm">
                        Order number, purchase date, reason for refund, supporting photos/videos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h5 className="font-semibold">Refund Authorization</h5>
                      <p className="text-sm">Our team reviews and approves eligible refund requests within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h5 className="font-semibold">Product Return (if applicable)</h5>
                      <p className="text-sm">Return shipping label provided for eligible physical products</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      5
                    </div>
                    <div>
                      <h5 className="font-semibold">Quality Check & Processing</h5>
                      <p className="text-sm">Returned products inspected and refund initiated within 2 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      6
                    </div>
                    <div>
                      <h5 className="font-semibold">Refund Confirmation</h5>
                      <p className="text-sm">Email confirmation sent with refund reference number and timeline</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">📋 Required Documents</h4>
                  <ul className="list-disc ml-6 space-y-1 text-gray-700">
                    <li>Original purchase invoice/receipt</li>
                    <li>Product photos showing defect/damage (if applicable)</li>
                    <li>Unboxing video (for high-value items)</li>
                    <li>Bank account details (for bank transfer refunds)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Failed Transaction Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">🔄 Automatic Refund Process</h4>
                  <ul className="list-disc ml-6 space-y-1 text-green-700">
                    <li>
                      <strong>Payment Debited but Order Failed:</strong> Auto-refund within 24 hours
                    </li>
                    <li>
                      <strong>Double Charge:</strong> Excess amount refunded within 48 hours
                    </li>
                    <li>
                      <strong>Gateway Timeout:</strong> Amount reversed by bank within 5-7 days
                    </li>
                    <li>
                      <strong>Insufficient Inventory:</strong> Full refund processed immediately
                    </li>
                  </ul>
                </div>
                <p>
                  <strong>Note:</strong> If auto-refund doesn't occur within the specified timeline, please contact our
                  support team with transaction details.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <h4 className="font-semibold">Order Cancellation Timeline</h4>
                <ul className="list-disc ml-6 space-y-2">
                  <li>
                    <strong>Before Processing (within 2 hours):</strong> Free cancellation with full refund
                  </li>
                  <li>
                    <strong>After Processing but before Dispatch:</strong> Cancellation possible with 5% processing fee
                  </li>
                  <li>
                    <strong>After Dispatch:</strong> Cancellation not possible; return process applies
                  </li>
                  <li>
                    <strong>Digital Services:</strong> Cancellation only before activation/delivery
                  </li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📞 Emergency Cancellation</h4>
                  <p className="text-blue-700">
                    For urgent cancellations, call +91 7709803412 immediately. Our team will attempt to stop processing
                    if possible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <h4 className="font-semibold">Internal Resolution Process</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Level 1: Customer support team (24-48 hours response)</li>
                  <li>Level 2: Supervisor review (2-3 business days)</li>
                  <li>Level 3: Management escalation (5-7 business days)</li>
                </ul>

                <h4 className="font-semibold mt-4">External Dispute Options</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Consumer Forum as per Consumer Protection Act, 2019</li>
                  <li>Banking Ombudsman for payment-related disputes</li>
                  <li>Razorpay dispute resolution for payment gateway issues</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                <p className="mb-3">For refund requests and support:</p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>Customer Support Email:</strong> sales.systechdigital@gmail.com
                  </p>
                  <p>
                    <strong>Customer Support Phone:</strong> +91 7709803412
                  </p>
                  <p>
                    <strong>WhatsApp Support:</strong> +91 7709803412
                  </p>
                  <p>
                    <strong>Business Hours:</strong> Monday to Saturday, 9:00 AM to 6:00 PM IST
                  </p>
                  <p>
                    <strong>Emergency Support:</strong> Available for urgent payment issues
                  </p>
                  <p>
                    <strong>Average Response Time:</strong> Email - 4 hours, Phone - Immediate
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
                    onClick={() => (window.location.href = "/cookie-policy")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Cookie Policy
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
