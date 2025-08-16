import type { ObjectId } from "mongodb"

// Interfaces for MongoDB documents
export interface IClaimResponse {
  _id?: ObjectId
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
  purchaseType: string
  activationCode: string
  purchaseDate: string
  claimSubmissionDate: string
  invoiceNumber?: string
  sellerName?: string
  paymentStatus: string
  paymentId?: string
  ottCodeStatus: string // e.g., "pending", "delivered", "failed", "already_claimed", "activation_code_not_found"
  ottCode?: string
  createdAt?: Date
  updatedAt?: Date
  billFileName?: string
  razorpayOrderId?: string
}

export interface ISalesRecord {
  _id?: ObjectId
  productSubCategory: string
  product: string
  activationCode: string
  status?: "available" | "claimed" // Status field
  claimedBy?: string // Email of the person who claimed it
  claimedDate?: Date // Date when it was claimed
  createdAt?: Date
  updatedAt?: Date
}

export interface IOTTKey {
  _id?: ObjectId
  productSubCategory: string
  product: string
  activationCode: string
  status: "available" | "assigned" | "used"
  assignedEmail?: string
  assignedDate?: Date
  assignedTo?: ObjectId // Added to link to ClaimResponse _id
  createdAt?: Date
  updatedAt?: Date
}

// Client-side interfaces (mapping _id to id string)
export interface ClaimResponse extends Omit<IClaimResponse, "_id" | "createdAt" | "updatedAt"> {
  pincode: string
  ottStatus(ottStatus: any): import("react").ReactNode
  amount: number
  phoneNumber: string
  claimId: string
  _id: string
  id: string
  createdAt: string
  updatedAt?: string
  razorpayOrderId?: string
}

export interface SalesRecord extends Omit<ISalesRecord, "_id" | "createdAt" | "updatedAt" | "claimedDate"> {
  _id: string
  id: string
  createdAt?: string
  updatedAt?: string
  claimedDate?: string
}

export interface OTTKey extends Omit<IOTTKey, "_id" | "createdAt" | "updatedAt" | "assignedDate" | "assignedTo"> {
  _id: string
  id: string
  createdAt?: string
  updatedAt?: string
  assignedDate?: string
  assignedTo?: string
}
