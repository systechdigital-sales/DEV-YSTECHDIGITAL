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
  billFileName?: string
  paymentStatus: "pending" | "completed" | "failed"
  paymentId?: string
  ottCodeStatus: "pending" | "sent" | "not_found" | "already_claimed"
  ottCode?: string
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
  status: "available" | "assigned"
  assignedEmail?: string
  assignedDate?: string
  createdAt: string
}

export interface PaymentRecord {
  id: string
  claimId: string
  paymentId: string
  orderId: string
  amount: number
  currency: string
  status: "created" | "completed" | "failed"
  razorpaySignature?: string
  createdAt: string
  updatedAt: string
}
