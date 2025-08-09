"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Package, Home } from "lucide-react"
import Footer from "@/components/footer"

export default function ShipmentPolicyPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-black via-red-900 to-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="SYSTECH IT SOLUTIONS Logo"
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold">SYSTECH IT SOLUTIONS</h1>
                <p className="text-[10px] sm:text-xs text-red-200">Shipment Policy</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-gray-100 hover:text-white border border-white/30 px-2 py-1 text-sm"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
        <div className="mb-6 flex items-center gap-2">
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <Package className="h-3.5 w-3.5 mr-1" />
            Digital Delivery
          </Badge>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Shipment (Digital Delivery) Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-neutral max-w-none text-sm sm:text-base">
            <p>
              SYSTECH IT SOLUTIONS Pvt. Ltd. delivers digital products such as OTTplay Power Play Pack activation codes
              via electronic means. There is no physical shipment involved.
            </p>

            <Separator className="my-5" />

            <h3 className="text-lg font-semibold">1. Delivery Method</h3>
            <ul className="list-disc pl-5">
              <li>Delivery is completed via email and/or SMS to the contact details provided during checkout.</li>
              <li>Customers will receive confirmation after successful payment verification.</li>
            </ul>

            <h3 className="mt-5 text-lg font-semibold">2. Delivery Timeline</h3>
            <ul className="list-disc pl-5">
              <li>Typical delivery: Instant to within 24 hours post payment verification.</li>
              <li>
                Delays may occur due to verification checks, stock allocation, or partner system downtime. You will be
                notified in such cases.
              </li>
            </ul>

            <h3 className="mt-5 text-lg font-semibold">3. Delivery Confirmation</h3>
            <ul className="list-disc pl-5">
              <li>Please check your email inbox, spam folder, and SMS for the activation code.</li>
              <li>
                If you do not receive the code within the communicated timeline, contact support with your order ID.
              </li>
            </ul>

            <h3 className="mt-5 text-lg font-semibold">4. Incorrect Contact Details</h3>
            <ul className="list-disc pl-5">
              <li>It is the customer’s responsibility to provide accurate email and phone number.</li>
              <li>If incorrect details were provided, contact support immediately for assistance.</li>
            </ul>

            <h3 className="mt-5 text-lg font-semibold">5. Non-Delivery Resolution</h3>
            <ul className="list-disc pl-5">
              <li>We will investigate failed deliveries and resend codes after verification.</li>
              <li>
                Refunds, if applicable, will follow the{" "}
                <a className="text-red-700 underline" href="/refund-policy">
                  Refund Policy
                </a>
                .
              </li>
            </ul>

            <h3 className="mt-5 text-lg font-semibold">6. Contact</h3>
            <p>
              For delivery-related questions, write to{" "}
              <a href="mailto:sales.systechdigital@gmail.com" className="text-red-700 underline">
                sales.systechdigital@gmail.com
              </a>{" "}
              or call{" "}
              <a href="tel:+918062012555" className="text-red-700 underline">
                +91 80-62012555
              </a>
              .
            </p>

            <Separator className="my-5" />
            <p className="text-xs text-neutral-600">
              Owned by <strong>SYSTECH IT SOLUTIONS Pvt. Ltd.</strong> • Developed by{" "}
              <strong>BYTEWISE CONSULTING LLP</strong>
            </p>
          </CardContent>
        </Card>
      </main>
    
             {/* Footer */}
          <Footer />
  </div>

  )
}
