"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Info, Home } from "lucide-react"
import Footer from "@/components/footer"

export default function PricingPolicyPage() {
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
                <p className="text-[10px] sm:text-xs text-red-200">Pricing Policy</p>
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
            <Info className="h-3.5 w-3.5 mr-1" />
            Effective from 01 Aug 2025
          </Badge>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Pricing Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-neutral max-w-none text-sm sm:text-base">
            <p>
              This Pricing Policy outlines how SYSTECH IT SOLUTIONS Pvt. Ltd. prices and sells digital products,
              including OTTplay Power Play Pack and related services.
            </p>

            <Separator className="my-5" />

            <h3 className="text-lg font-semibold">1. Currency and Taxes</h3>
            <ul className="list-disc pl-5">
              <li>All prices are quoted in Indian Rupees (INR).</li>
              <li>Applicable taxes (including GST) are displayed at checkout where required.</li>
            </ul>

            <h3 className="mt-5 text-lg font-semibold">2. Price Changes</h3>
            <ul className="list-disc pl-5">
              <li>
                Prices are subject to change without prior notice due to partner/provider changes or market conditions.
              </li>
              <li>Any promotional pricing will be clearly indicated with validity dates.</li>
            </ul>

            <h3 className="mt-5 text-lg font-semibold">3. Discounts & Promotions</h3>
            <ul className="list-disc pl-5">
              <li>
                Discount codes are applicable only during the promotion period and cannot be combined unless stated.
              </li>
              <li>Misuse of discount codes may lead to order cancellation and account review.</li>
            </ul>

            <h3 className="mt-5 text-lg font-semibold">4. Order Confirmation</h3>
            <ul className="list-disc pl-5">
              <li>An order is confirmed only after successful payment verification.</li>
              <li>In case of payment failure but amount deduction, please contact support with transaction details.</li>
            </ul>

            <h3 className="mt-5 text-lg font-semibold">5. Errors and Omissions</h3>
            <p>
              We strive for accuracy. However, in case of pricing errors, we reserve the right to cancel orders and
              refund the full amount if charged.
            </p>

            <h3 className="mt-5 text-lg font-semibold">6. Refunds</h3>
            <p>
              Refunds, where applicable, are governed by our{" "}
              <a href="/refund-policy" className="text-red-700 underline">
                Refund Policy
              </a>
              .
            </p>

            <h3 className="mt-5 text-lg font-semibold">7. Contact</h3>
            <p>
              For pricing related questions, write to{" "}
              <a href="mailto:sales.systechdigital@gmail.com" className="text-red-700 underline">
                sales.systechdigital@gmail.com
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
    </div>
       {/* Footer */}
      <Footer />
  )
}
