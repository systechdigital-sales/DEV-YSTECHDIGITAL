import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Globe, Mail, Phone, ExternalLink, Gift, Smartphone, Laptop, Shield } from 'lucide-react'
import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Gift className="w-4 h-4" />
            Help & Support
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Claim & Redeem Your OTTplay Power Play Pack
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Follow these easy steps to claim and redeem your OTTplay Power Play Pack subscription
          </p>
        </div>

        {/* How to Claim Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              How to Claim Your OTTplay Power Play Pack
            </CardTitle>
            <CardDescription className="text-blue-100">
              Complete these steps to get your OTTplay subscription code
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Visit the Website
                  </h3>
                  <p className="text-gray-600">
                    Log on to{' '}
                    <Link href="/" className="text-blue-600 hover:underline font-medium">
                      www.systechdigital.co.in
                    </Link>
                  </p>
                </div>
              </div>

              <Separator />

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Initiate Claim</h3>
                  <p className="text-gray-600 mb-3">
                    Click on "Claim Your OTT Code" available on the homepage.
                  </p>
                  <Link href="/ott">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Claim Your OTT Code
                    </Button>
                  </Link>
                </div>
              </div>

              <Separator />

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Fill the OTTplay Claim Form</h3>
                  <p className="text-gray-600">
                    Enter all necessary details in the OTTplay claim form accurately.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Select Purchase Type</h3>
                  <p className="text-gray-600 mb-3">Choose your purchase type:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Laptop className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Hardware Purchase</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Software Purchase</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Smartphone className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Mobile Purchase</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Enter Required Information</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Software Purchase (Antivirus)</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Enter your activation code (ensure the activation code for antivirus is first activated, then entered here).
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Laptop className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Hardware Purchase (Laptop/TV/Others)</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Enter your product serial number.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-800">Mobile Purchase</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        Enter your IMEI number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Step 6 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Complete the Steps</h3>
                  <p className="text-gray-600">
                    Follow the on-screen instructions to complete the claim process.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Step 7 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    7
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    Receive Your OTTplay Code
                  </h3>
                  <p className="text-gray-600">
                    Once verified, your OTTplay code along with the redemption link will be sent to your registered email ID.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redemption Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Redeem Your OTTplay Code
            </CardTitle>
            <CardDescription className="text-green-100">
              Two easy ways to redeem your OTTplay subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <Badge variant="secondary" className="mb-3">Option 1</Badge>
                <h3 className="font-semibold text-lg mb-2">From Homepage</h3>
                <p className="text-gray-600 mb-4">
                  Click on "Redeem Now" on the Systech Digital Homepage.
                </p>
                <Link href="/ott">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Redeem Now
                  </Button>
                </Link>
              </div>

              {/* Option 2 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <Badge variant="secondary" className="mb-3">Option 2</Badge>
                <h3 className="font-semibold text-lg mb-2">Direct Link</h3>
                <p className="text-gray-600 mb-4">
                  Directly visit the redemption link:
                </p>
                <a 
                  href="https://www.ottplay.com/partner/systech-it-solution/ott_sustech_annualtest" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block w-full"
                >
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit OTTplay
                  </Button>
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Steps to Redeem:</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Enter your OTTplay Code in the Apply Coupon option.</li>
                <li>Follow the instructions displayed on the screen to complete redemption.</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Support & Queries</CardTitle>
            <CardDescription className="text-purple-100">
              Get help when you need it
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  OTTplay Power Play Pack Redemption
                </h3>
                <p className="text-gray-600 mb-2">For redemption support:</p>
                <a 
                  href="mailto:sales.systechdigital@gmail.com" 
                  className="text-blue-600 hover:underline font-medium"
                >
                  sales.systechdigital@gmail.com
                </a>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  OTTplay Related Queries
                </h3>
                <p className="text-gray-600 mb-2">For OTTplay support:</p>
                <div className="space-y-1">
                  <a 
                    href="mailto:support@ottplay.com" 
                    className="block text-blue-600 hover:underline font-medium"
                  >
                    support@ottplay.com
                  </a>
                  <a 
                    href="tel:+918062012555" 
                    className="block text-green-600 hover:underline font-medium"
                  >
                    +91 80-62012555
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Important Notes */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Important Note:</h3>
                <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                  <li>This is a bundled offer.</li>
                  <li>
                    The offer is valid only on Activation Codes, Product Serial Numbers, or IMEI Numbers 
                    associated with products sold by Systech IT Solutions, Sara Mobile, and their registered partners.
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-2">For detailed Terms & Conditions:</p>
                <Link href="/terms-and-conditions">
                  <Button variant="outline">
                    View Full T&C
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="inline-flex gap-4">
            <Link href="/ott">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Claiming
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
