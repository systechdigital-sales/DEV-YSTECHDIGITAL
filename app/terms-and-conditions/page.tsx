"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function TermsAndConditionsPage() {
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
                <p className="text-sm text-red-200 mt-1">Terms and Conditions</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2 border border-red-300">
              <FileText className="w-4 h-4 mr-2" />
              Legal Document
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h2>
          <p className="text-gray-600">Last updated: January 23, 2025</p>
        </div>

        {/* Important Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Shield className="w-5 h-5 mr-2" />
              Secure Payment Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              All payments are processed securely through Razorpay Payment Gateway. We comply with PCI DSS standards and
              RBI guidelines for secure online transactions.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                By accessing and using the services provided by SYSTECH IT SOLUTIONS LIMITED ("Company", "we", "us", or
                "our"), you accept and agree to be bound by these terms and conditions. These terms constitute a legally
                binding agreement between you and our company. If you do not agree to these terms, please discontinue
                use of our services immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Company Information & Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>
                    <strong>Legal Entity:</strong> SYSTECH IT SOLUTIONS LIMITED
                  </p>
                  <p>
                    <strong>Corporate Identity Number (CIN):</strong> [To be provided]
                  </p>
                  <p>
                    <strong>GST Registration Number:</strong> [To be provided]
                  </p>
                  <p>
                    <strong>Registered Address:</strong> Unit NO H-04, 4th Floor, SOLUS No 2, 8/9, No 23, PID No
                    48-74-2, 1st Cross, JC Road, Bangalore South, Karnataka, India - 560027
                  </p>
                  <p>
                    <strong>Contact Email:</strong> sales.systechdigital@gmail.com
                  </p>
                  <p>
                    <strong>Contact Phone:</strong> +91 7709803412
                  </p>
                  <p>
                    <strong>Website:</strong> www.systechdigital.co.in
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>SYSTECH IT SOLUTIONS LIMITED provides the following services:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>
                    <strong>E-commerce Sales:</strong> IT Peripherals, Mobile Phones, Personal Computers, Laptops, and
                    related accessories
                  </li>
                  <li>
                    <strong>Digital Services:</strong> OTT subscription promotional offers and digital content services
                  </li>
                  <li>
                    <strong>Payment Processing:</strong> Secure online payment processing through authorized payment
                    gateways
                  </li>
                  <li>
                    <strong>Customer Support:</strong> Technical assistance, order support, and after-sales service
                  </li>
                  <li>
                    <strong>Warranty Services:</strong> Product warranty claims and technical support as per
                    manufacturer terms
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Payment Terms & Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <h4 className="font-semibold text-lg">Payment Gateway</h4>
                <ul className="list-disc ml-6 space-y-2">
                  <li>All payments are processed through Razorpay Payment Gateway (PCI DSS Level 1 compliant)</li>
                  <li>We accept Credit Cards, Debit Cards, UPI, Net Banking, and Digital Wallets</li>
                  <li>All transactions are secured with 256-bit SSL encryption</li>
                  <li>Payment confirmation is sent via email and SMS</li>
                </ul>

                <h4 className="font-semibold text-lg mt-4">Pricing & Charges</h4>
                <ul className="list-disc ml-6 space-y-2">
                  <li>All prices are listed in Indian Rupees (INR) and include applicable taxes</li>
                  <li>GST will be charged as per prevailing government rates</li>
                  <li>Prices are subject to change without prior notice</li>
                  <li>Payment must be completed before product dispatch</li>
                  <li>Failed transactions will be automatically refunded within 5-7 business days</li>
                </ul>

                <h4 className="font-semibold text-lg mt-4">Transaction Security</h4>
                <ul className="list-disc ml-6 space-y-2">
                  <li>We do not store credit card information on our servers</li>
                  <li>All payment data is handled by Razorpay's secure infrastructure</li>
                  <li>Transactions are monitored for fraud prevention</li>
                  <li>Two-factor authentication may be required for high-value transactions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. OTT Subscription Promotional Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Offer Validity & Eligibility</h4>
                  <ul className="list-disc ml-6 space-y-1 text-yellow-700">
                    <li>Valid for purchases made between July 1, 2025, and September 30, 2025</li>
                    <li>Applicable only on eligible products as specified in the offer terms</li>
                    <li>One OTT subscription per product serial number</li>
                    <li>Claims must be submitted before October 31, 2025</li>
                  </ul>
                </div>

                <h4 className="font-semibold">Terms & Conditions</h4>
                <ul className="list-disc ml-6 space-y-2">
                  <li>OTT subscription is provided by OTTplay and subject to their terms of service</li>
                  <li>Subscription duration and content access as per OTTplay's current offerings</li>
                  <li>We act as a facilitator and are not responsible for OTT service delivery issues</li>
                  <li>Valid purchase invoice and product serial number required for claims</li>
                  <li>Fraudulent claims will result in permanent disqualification</li>
                  <li>Offer cannot be combined with other promotional offers</li>
                  <li>We reserve the right to modify or terminate the offer with 7 days notice</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Order Processing & Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <h4 className="font-semibold">Order Confirmation</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Order confirmation sent via email within 2 hours of payment</li>
                  <li>Order tracking details provided within 24 hours of dispatch</li>
                  <li>Estimated delivery time: 3-7 business days (subject to location)</li>
                </ul>

                <h4 className="font-semibold mt-4">Delivery Terms</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Free delivery for orders above ₹500 within India</li>
                  <li>Delivery charges applicable for orders below ₹500</li>
                  <li>Delivery attempted twice; after which customer pickup required</li>
                  <li>Signature required for delivery confirmation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Return & Exchange Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <ul className="list-disc ml-6 space-y-2">
                  <li>7-day return policy for defective or damaged products</li>
                  <li>Products must be in original packaging with all accessories</li>
                  <li>Return shipping costs borne by customer unless product defect</li>
                  <li>Refund processed within 7-10 business days after return verification</li>
                  <li>Exchange subject to product availability</li>
                  <li>Custom or personalized products are non-returnable</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Privacy & Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <ul className="list-disc ml-6 space-y-2">
                  <li>We comply with Information Technology Act, 2000 and Privacy Rules</li>
                  <li>Personal data collected only for order processing and service delivery</li>
                  <li>Data shared with logistics partners only for delivery purposes</li>
                  <li>Payment information processed securely through Razorpay</li>
                  <li>Marketing communications sent only with explicit consent</li>
                  <li>Data retention as per legal requirements and business needs</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <ul className="list-disc ml-6 space-y-2">
                  <li>All website content, logos, and trademarks are our intellectual property</li>
                  <li>Product images and descriptions used with manufacturer permission</li>
                  <li>Unauthorized use of our content is strictly prohibited</li>
                  <li>Customer reviews and feedback may be used for marketing purposes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <p>Our liability is limited to the maximum extent permitted by law. We shall not be liable for:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages exceeding the order value</li>
                  <li>Third-party service failures (shipping, OTT platforms)</li>
                  <li>Force majeure events beyond our reasonable control</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 space-y-3">
                <ul className="list-disc ml-6 space-y-2">
                  <li>All disputes subject to Bangalore jurisdiction only</li>
                  <li>Governing law: Laws of India</li>
                  <li>Mediation preferred before legal proceedings</li>
                  <li>Consumer complaints as per Consumer Protection Act, 2019</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Modifications & Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Material changes will be notified via email or
                website notice 15 days in advance. Continued use of our services after modifications constitutes
                acceptance of updated terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                <p className="mb-3">For any questions regarding these Terms and Conditions:</p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>Customer Support Email:</strong> sales.systechdigital@gmail.com
                  </p>
                  <p>
                    <strong>Customer Support Phone:</strong> +91 7709803412
                  </p>
                  <p>
                    <strong>Business Hours:</strong> Monday to Saturday, 9:00 AM to 6:00 PM IST
                  </p>
                  <p>
                    <strong>Registered Address:</strong> Unit NO H-04, 4th Floor, SOLUS No 2, JC Road, Bangalore South,
                    Karnataka - 560027
                  </p>
                  <p>
                    <strong>Grievance Officer:</strong> Available during business hours for complaint resolution
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
                    onClick={() => (window.location.href = "/refund-policy")}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    Refund Policy
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
