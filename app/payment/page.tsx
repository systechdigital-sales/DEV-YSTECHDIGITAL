import PaymentClient from "@/components/payment-client"

export default async function PaymentPage() {
  const publicKey = process.env.RAZORPAY_KEY_ID!

  return <PaymentClient publicKey={publicKey} />
}
