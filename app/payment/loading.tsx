import { Loader2 } from "lucide-react"

export default function PaymentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Payment</h2>
        <p className="text-gray-600">Please wait while we prepare your secure payment...</p>
      </div>
    </div>
  )
}
