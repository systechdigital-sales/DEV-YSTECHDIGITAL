"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Scale, CreditCard, Users, FileText, Phone, Mail, MapPin } from "lucide-react"
import Image from "next/image"
import Footer from "@/components/footer"

export default function TermsAndConditions() {
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
              <Scale className="w-4 h-4 mr-2" />
              Legal Document
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <FileText className="w-6 h-6 mr-3 text-blue-600" />
              Terms and Conditions
            </CardTitle>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-700">
                <strong>Last Updated:</strong> july 23, 2025 | <strong>Effective Date:</strong> August 1, 2025
              </p>
              <p className="text-sm text-gray-600 mt-2">
                These Terms and Conditions govern your use of our services and website. By accessing our services, you
                agree to be bound by these terms.
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Company Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              1. Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Legal Entity</h4>
                <p className="text-sm text-gray-700">
                  <strong>Company Name:</strong> Systech IT Solutions Limited
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Trading As:</strong> SYSTECH DIGITAL
                </p>
                <p className="text-sm text-gray-700">
                  <strong>CIN:</strong> U72900KA2020PTC134567
                </p>
                <p className="text-sm text-gray-700">
                  <strong>GST No:</strong> 29AABCS1234C1Z5
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Registered Address</h4>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p>Unit NO H-04, 4th Floor, SOLUS No 2</p>
                    <p>JC Road, Bangalore South</p>
                    <p>Karnataka, India - 560027</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>2. Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">IT Solutions</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Hardware Sales & Support</li>
                  <li>• Software Licensing</li>
                  <li>• System Integration</li>
                  <li>• Technical Consulting</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Mobile Technology</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Mobile Device Sales</li>
                  <li>• Accessories & Parts</li>
                  <li>• Repair Services</li>
                  <li>• Mobile Solutions</li>
                </ul>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Digital Services</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• OTT Subscription Management</li>
                  <li>• Digital Content Access</li>
                  <li>• Online Payment Processing</li>
                  <li>• Customer Support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              3. Payment Terms & Razorpay Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Gateway</h4>
              <p className="text-sm text-blue-700">
                All online payments are processed through Razorpay Payment Gateway, which is PCI DSS Level 1 compliant
                and ensures secure transaction processing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Accepted Payment Methods</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Credit Cards (Visa, MasterCard, American Express)</li>
                  <li>• Debit Cards (All major banks)</li>
                  <li>• Net Banking (150+ banks supported)</li>
                  <li>• UPI (Google Pay, PhonePe, Paytm, etc.)</li>
                  <li>• Digital Wallets (Paytm, Mobikwik, etc.)</li>
                  <li>• EMI Options (Selected banks)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Payment Security</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 256-bit SSL encryption</li>
                  <li>• PCI DSS Level 1 compliance</li>
                  <li>• Two-factor authentication</li>
                  <li>• Fraud detection algorithms</li>
                  <li>• Secure tokenization</li>
                  <li>• Real-time transaction monitoring</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Payment Information</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Processing fee of ₹99 applies for OTT subscription claims</li>
                <li>• Payments are non-refundable once OTT codes are issued</li>
                <li>�� Failed transactions will be automatically refunded within 5-7 business days</li>
                <li>• All prices are inclusive of applicable taxes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>4. User Responsibilities & Account Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Account Registration</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Provide accurate and complete information</li>
                  <li>• Maintain confidentiality of account credentials</li>
                  <li>• Notify us immediately of unauthorized access</li>
                  <li>• Update information when changes occur</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Prohibited Activities</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Fraudulent or misleading claims</li>
                  <li>• Multiple claims for same product</li>
                  <li>• Sharing or selling OTT subscription codes</li>
                  <li>• Attempting to circumvent security measures</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OTT Subscription Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>5. OTT Subscription Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-900 mb-2">Eligibility & Validity</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Valid only for purchases between July 1, 2025 - September 30, 2025</li>
                <li>• One subscription per Activation Code/Product Serial Number/IMEI Number</li>
                <li>• Claims must be submitted before September 30, 2025</li>
                <li>• Processing fee of ₹99 required for claim processing</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Subscription Benefits</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 12-month access to 29+ OTT platform from the date of activation of OTT subscription</li>
                <li>• Powered by OTTplay premium service</li>
                <li>• HD/4K streaming where available</li>
                <li>• Multi-device access support</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">⚠️ Important Limitations</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• OTT service provided by third-party (OTTplay)</li>
                <li>• We are not responsible for OTT service delivery or technical issues</li>
                <li>• Platform availability subject to OTTplay's terms</li>
                <li>• No refunds once OTT codes are activated</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data Protection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              6. Privacy & Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Data Collection & Usage</h4>
              <p className="text-sm text-green-700 mb-2">
                We collect and process personal information in accordance with applicable data protection laws including
                the Information Technology Act, 2000 and Digital Personal Data Protection Act, 2023.
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Personal information for service delivery</li>
                <li>• Payment information for transaction processing</li>
                <li>• Device information for technical support</li>
                <li>• Communication preferences for service updates</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Your Rights</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Access to your personal data</li>
                  <li>• Correction of inaccurate information</li>
                  <li>• Deletion of personal data (where applicable)</li>
                  <li>• Data portability rights</li>
                  <li>• Withdrawal of consent</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Data Security</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Industry-standard encryption</li>
                  <li>• Regular security audits</li>
                  <li>• Access controls and monitoring</li>
                  <li>• Secure data storage practices</li>
                  <li>• Staff training on data protection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>7. Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Our Intellectual Property</h4>
              <p className="text-sm text-purple-700 mb-2">
                All content, trademarks, logos, and intellectual property on our website and services are owned by
                Systech IT Solutions Limited or our licensors.
              </p>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• SYSTECH DIGITAL trademark and logo</li>
                <li>• Website design and content</li>
                <li>• Software and technical documentation</li>
                <li>• Marketing materials and branding</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Third-Party Rights</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• OTTplay and associated platform trademarks</li>
                <li>• Razorpay payment gateway branding</li>
                <li>• Third-party software licenses</li>
                <li>• Content provider intellectual property</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>8. Limitation of Liability & Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">⚠️ Service Limitations</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• We are not liable for third-party service failures (OTTplay, payment gateways)</li>
                <li>• No guarantee of uninterrupted service availability</li>
                <li>• Technical issues may cause temporary service disruptions</li>
                <li>• Content availability subject to third-party licensing agreements</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Liability Cap</h4>
              <p className="text-sm text-yellow-700">
                Our total liability for any claims arising from our services shall not exceed the amount paid by you for
                the specific service in question, limited to a maximum of ₹10,000 per incident.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>9. Termination & Suspension</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Grounds for Termination</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Violation of these terms</li>
                  <li>• Fraudulent activity</li>
                  <li>• Non-payment of fees</li>
                  <li>• Misuse of services</li>
                  <li>• Legal or regulatory requirements</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Effect of Termination</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Immediate cessation of services</li>
                  <li>• No refund of processing fees</li>
                  <li>• Retention of data as per legal requirements</li>
                  <li>• Survival of applicable terms</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>10. Dispute Resolution & Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Governing Law</h4>
              <p className="text-sm text-blue-700">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive
                jurisdiction of courts in Bangalore, Karnataka.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Dispute Resolution Process</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="font-medium text-green-800">Direct Resolution</h5>
                    <p className="text-sm text-green-700">Contact our customer support for immediate assistance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="font-medium text-green-800">Mediation</h5>
                    <p className="text-sm text-green-700">
                      Attempt resolution through mediation if direct resolution fails
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="font-medium text-green-800">Legal Proceedings</h5>
                    <p className="text-sm text-green-700">Resort to courts in Bangalore, Karnataka as last option</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consumer Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>11. Consumer Rights & Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-900 mb-2">Consumer Protection Act 2019</h4>
              <p className="text-sm text-indigo-700 mb-2">
                Your rights as a consumer are protected under the Consumer Protection Act, 2019. You have the right to:
              </p>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Receive goods and services as per agreed specifications</li>
                <li>• Seek redressal for defective goods or deficient services</li>
                <li>• File complaints with consumer forums</li>
                <li>• Receive compensation for proven damages</li>
              </ul>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h4 className="font-semibold text-teal-900 mb-2">Grievance Redressal</h4>
              <p className="text-sm text-teal-700">
                For any grievances, contact our customer support team. We are committed to resolving issues within 7
                business days of receipt.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Updates & Modifications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>12. Updates & Modifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Terms Updates</h4>
              <p className="text-sm text-gray-700 mb-2">
                We reserve the right to update these terms at any time. Changes will be effective immediately upon
                posting on our website.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Email notification for significant changes</li>
                <li>• 30-day notice period for material modifications</li>
                <li>• Continued use constitutes acceptance of updated terms</li>
                <li>• Right to discontinue service if you disagree with changes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>13. Contact Information & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900 mb-2">Email Support</h4>
                <p className="text-sm text-green-700">sales.systechdigital@gmail.com</p>
                <p className="text-xs text-green-600 mt-1">Response within 24 hours</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900 mb-2">Office Address</h4>
                <p className="text-sm text-purple-700">Unit H-04, 4th Floor</p>
                <p className="text-sm text-purple-700">SOLUS No 2, JC Road</p>
                <p className="text-xs text-purple-600 mt-1">Bangalore - 560027</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acknowledgment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>14. Acknowledgment & Acceptance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these
                Terms and Conditions. If you do not agree with any part of these terms, please discontinue use of our
                services immediately.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Document Version:</strong> 2.1 | <strong>Last Review:</strong> July 23, 2025 |
                  <strong>Next Review:</strong> July 23, 2025
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  )
}
