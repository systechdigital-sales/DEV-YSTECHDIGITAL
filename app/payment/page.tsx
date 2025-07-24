"use client"

import PaymentClient from "@/components/payment-client"

export default function PaymentPage() {
  // Get the public key from environment variable
  const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ""

  return <PaymentClient publicKey={publicKey} />
}
