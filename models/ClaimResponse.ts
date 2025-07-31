import { Schema, model, models } from "mongoose"

export interface IClaimResponse {
  name: string
  email: string
  phone: string
  ottCode: string // The OTT code assigned to this claim
  status: "pending" | "approved" | "rejected" | "delivered"
  claimedAt: Date
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  deliveryMethod?: string // e.g., "email", "SMS"
  deliveryStatus?: "sent" | "failed"
  deliveredAt?: Date
  paymentStatus?: "pending" | "paid" | "failed"
  paymentId?: string
  orderId?: string
  signature?: string
  createdAt?: Date
  updatedAt?: Date
}

const ClaimResponseSchema = new Schema<IClaimResponse>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    ottCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "delivered"],
      default: "pending",
    },
    claimedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    deliveryMethod: { type: String },
    deliveryStatus: { type: String, enum: ["sent", "failed"] },
    deliveredAt: { type: Date },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentId: { type: String },
    orderId: { type: String },
    signature: { type: String },
  },
  { timestamps: true },
)

const ClaimResponse = models.ClaimResponse || model<IClaimResponse>("ClaimResponse", ClaimResponseSchema)

export default ClaimResponse
