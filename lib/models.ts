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
  ottCodeStatus: "pending" | "assigned" | "delivered" | "failed"
  ottCode?: string
  createdAt: string
  updatedAt: string
}

export interface SalesRecord {
  id: string
  customerName: string
  email: string
  phone: string
  activationCode: string
  purchaseDate: string
  productType: string
  amount: number
  status: "active" | "claimed" | "expired"
  createdAt: string
}

export interface OTTKey {
  id: string
  platform: string
  keyCode: string
  status: "available" | "assigned" | "used"
  assignedTo?: string
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
  status: "success" | "failed"
  customerEmail: string
  customerName: string
  createdAt: string
}
