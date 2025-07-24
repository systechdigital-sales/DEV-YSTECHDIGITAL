export interface ClaimResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  streetAddress: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  purchaseType: "hardware" | "software"
  activationCode: string
  purchaseDate: string
  invoiceNumber?: string
  sellerName?: string
  paymentStatus: "pending" | "completed" | "failed"
  paymentId?: string
  razorpayOrderId?: string
  ottCodeStatus: "pending" | "sent" | "failed"
  ottCode?: string
  billFileName?: string
  createdAt: string
  updatedAt: string
}

export interface SalesRecord {
  id: string
  productSubCategory: string
  product: string
  activationCode: string
  createdAt: string
}

export interface OTTKey {
  id: string
  productSubCategory: string
  product: string
  activationCode: string
  status: "available" | "assigned" | "used"
  assignedEmail?: string
  assignedDate?: string
  createdAt: string
}

export interface PaymentRecord {
  id: string
  claimId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  createdAt: string
  updatedAt: string
}
