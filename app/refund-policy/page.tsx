"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Clock, AlertTriangle, CheckCircle, XCircle, Phone, Mail } from "lucide-react"
import Image from "next/image"
import Footer from "@/components/footer"

export default function RefundPolicy() {
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
                <h1 className="text-3xl font-bold text-white">Systech Digital</h1>
                <p className="text-sm text-red-200 mt-1">Simplifying the Digital Experience</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2 border border-red-300">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Policy
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
              Refund Policy
            </CardTitle>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-700">
                <strong>Last Updated:</strong> July 23, 2025 | <strong>Effective Date:</strong> August 1, 2025
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This refund policy outlines the terms and conditions for refunds on all products and services offered by
                Systech IT Solutions Limited.
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Razorpay Integration Notice */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Payment Gateway & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Razorpay Integration</h4>
              <p className="text-sm text-green-700 mb-2">
                All payments are processed through Razorpay, India's leading payment gateway that is RBI approved and
                PCI DSS Level 1 compliant.
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Secure 256-bit SSL encryption for all transactions</li>
                <li>• Real-time fraud detection and prevention</li>
                <li>• Automated refund processing system</li>
                <li>• Multiple payment method support</li>
                <li>• Instant payment confirmation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Refund Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>1. Refund Categories & Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Physical Products</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• IT Hardware & Components</li>
                  <li>• Mobile Phones & Accessories</li>
                  <li>• Laptops & Computers</li>
                  <li>• Networking Equipment</li>
                </ul>
                <div className="mt-2">
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    7-day return policy
                  </Badge>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Digital Services</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Software Licenses</li>
                  <li>• OTT Subscription Processing</li>
                  <li>• Digital Downloads</li>
                  <li>• Online Support Services</li>
                </ul>
                <div className="mt-2">
                  <Badge variant="outline" className="text-purple-700 border-purple-300">
                    Limited refund policy
                  </Badge>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">Processing Fees</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• OTT Claim Processing (₹99)</li>
                  <li>• Service Charges</li>
                  <li>• Administrative Fees</li>
                  <li>• Transaction Costs</li>
                </ul>
                <div className="mt-2">
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    Non-refundable*
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OTT Subscription Refund Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              2. OTT Subscription Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notice</h4>
              <p className="text-sm text-yellow-700 mb-2">
                The ₹99 processing fee for OTT subscription claims is <strong>non-refundable</strong> under the
                following conditions:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Once the OTT subscription code has been generated and sent to your email</li>
                <li>• After successful verification of your purchase details</li>
                <li>• If the claim has been processed and approved by our system</li>
                <li>• When third-party OTT services have been activated</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✅ Refund Eligible Scenarios</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Payment failed but amount was debited (automatic refund within 5-7 business days)</li>
                <li>• Duplicate payment made for the same claim</li>
                <li>• Technical error in payment processing</li>
                <li>• Claim rejected due to ineligible product purchase</li>
                <li>• System error preventing claim processing</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">❌ Non-Refundable Scenarios</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• OTT subscription code already delivered and activated</li>
                <li>• Change of mind after successful claim processing</li>
                <li>• Issues with third-party OTT service providers</li>
                <li>• Inability to use OTT platforms due to device compatibility</li>
                <li>• Internet connectivity issues affecting OTT usage</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Refund Processing Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              3. Refund Processing Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Bank Credit Time</TableHead>
                    <TableHead>Total Timeline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Credit Card</TableCell>
                    <TableCell>1-2 business days</TableCell>
                    <TableCell>5-7 business days</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-blue-700">
                        6-9 business days
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Debit Card</TableCell>
                    <TableCell>1-2 business days</TableCell>
                    <TableCell>5-7 business days</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-blue-700">
                        6-9 business days
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Net Banking</TableCell>
                    <TableCell>1-2 business days</TableCell>
                    <TableCell>3-5 business days</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-700">
                        4-7 business days
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">UPI</TableCell>
                    <TableCell>1 business day</TableCell>
                    <TableCell>1-3 business days</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-700">
                        2-4 business days
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Digital Wallets</TableCell>
                    <TableCell>1 business day</TableCell>
                    <TableCell>1-2 business days</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-700">
                        2-3 business days
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Processing Steps</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800">Refund Request Received</h5>
                    <p className="text-sm text-blue-700">Initial review and validation within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800">Razorpay Processing</h5>
                    <p className="text-sm text-blue-700">Refund initiated through secure payment gateway</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800">Bank Processing</h5>
                    <p className="text-sm text-blue-700">Your bank processes the refund credit</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                    4
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800">Refund Completed</h5>
                    <p className="text-sm text-blue-700">Amount credited to your original payment method</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physical Products Refund */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>4. Physical Products Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Return Conditions</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Product must be in original condition</li>
                  <li>• All original packaging and accessories included</li>
                  <li>• No physical damage or signs of use</li>
                  <li>• Return within 7 days of delivery</li>
                  <li>• Original invoice/receipt required</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Refund Deductions</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Shipping charges: Non-refundable</li>
                  <li>• Restocking fee: 5% for opened items</li>
                  <li>• Payment gateway charges: 2-3%</li>
                  <li>• Return shipping: Customer responsibility</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">⚠️ Non-Returnable Items</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Software licenses (once activated)</li>
                <li>• Customized or personalized products</li>
                <li>• Items damaged by customer misuse</li>
                <li>• Products beyond 7-day return window</li>
                <li>• Consumable items (batteries, cables with wear)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Refund Request Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>5. How to Request a Refund</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4">📝 Step-by-Step Process</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800">Contact Customer Support</h5>
                    <p className="text-sm text-blue-700">
                      Email us at sales.systechdigital@gmail.com or call +91 7709803412
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800">Provide Required Information</h5>
                    <p className="text-sm text-blue-700">
                      Order ID, payment details, reason for refund, and supporting documents
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800">Refund Review</h5>
                    <p className="text-sm text-blue-700">Our team will review your request within 24-48 hours</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                    4
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800">Approval & Processing</h5>
                    <p className="text-sm text-blue-700">If approved, refund will be processed through Razorpay</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                    5
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800">Refund Completion</h5>
                    <p className="text-sm text-blue-700">Amount credited to your original payment method</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                    6
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800">Confirmation</h5>
                    <p className="text-sm text-blue-700">Email confirmation sent with refund transaction details</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Failed Transaction Refunds */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-red-600" />
              6. Failed Transaction Refunds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Automatic Refund Scenarios</h4>
              <p className="text-sm text-red-700 mb-2">
                In case of payment failures, refunds are processed automatically by Razorpay:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Payment debited but transaction failed</li>
                <li>• Double deduction for single transaction</li>
                <li>• Network timeout during payment</li>
                <li>• Bank server errors</li>
                <li>• Gateway processing failures</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✅ Automatic Processing</h4>
              <p className="text-sm text-green-700">
                Failed transaction refunds are processed automatically within 5-7 business days. No manual intervention
                required.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>7. Dispute Resolution & Escalation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Internal Resolution</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Customer support team review</li>
                  <li>• Manager escalation if needed</li>
                  <li>• Technical team consultation</li>
                  <li>• Resolution within 7 business days</li>
                </ul>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">External Options</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Consumer forum complaints</li>
                  <li>• Banking ombudsman (payment issues)</li>
                  <li>• RBI grievance portal</li>
                  <li>• Legal proceedings if necessary</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>8. Refund Support & Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900 mb-2">Email Support</h4>
                <p className="text-sm text-green-700">sales.systechdigital@gmail.com</p>
                <p className="text-xs text-green-600 mt-1">Response within 24 hours</p>
                <p className="text-xs text-green-600">Include order details in email</p>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📋 Required Information for Refund Requests</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <ul className="space-y-1">
                  <li>• Order ID / Transaction ID</li>
                  <li>• Payment method used</li>
                  <li>• Date of transaction</li>
                  <li>• Amount paid</li>
                </ul>
                <ul className="space-y-1">
                  <li>• Reason for refund request</li>
                  <li>• Supporting documents/screenshots</li>
                  <li>• Bank account details (if different)</li>
                  <li>• Contact information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Updates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>9. Policy Updates & Modifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Policy Changes</h4>
              <p className="text-sm text-yellow-700 mb-2">
                We reserve the right to modify this refund policy at any time. Changes will be effective immediately
                upon posting on our website.
              </p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Email notification for significant changes</li>
                <li>• 30-day notice for material modifications</li>
                <li>• Existing transactions governed by policy at time of purchase</li>
                <li>• Regular review and updates for compliance</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  )
}
