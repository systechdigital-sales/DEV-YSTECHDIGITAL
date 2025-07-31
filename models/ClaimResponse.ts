import { Schema, model, models } from "mongoose"

export interface IClaimResponse {
  email: string
  name: string
  phone: string
  ottCode: string // The OTT code assigned to this claim
  status: "pending" | "approved" | "rejected" | "redeemed"
  claimedAt: Date
  approvedAt?: Date
  rejectedAt?: Date
  redeemedAt?: Date
  notes?: string
  paymentId?: string // For Razorpay payment ID
  orderId?: string // For Razorpay order ID
  amount?: number // Amount paid if any
  paymentStatus?: "pending" | "completed" | "failed"
}

const ClaimResponseSchema = new Schema<IClaimResponse>(
  {
    email: { type: String, required: true, unique: true }, // Email should be unique for claims
    name: { type: String, required: true },
    phone: { type: String, required: true },
    ottCode: { type: String, required: true, unique: true }, // OTT code should be unique per claim
    status: { type: String, enum: ["pending", "approved", "rejected", "redeemed"], default: "pending" },
    claimedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    redeemedAt: { type: Date },
    notes: { type: String },
    paymentId: { type: String },
    orderId: { type: String },
    amount: { type: Number },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"] },
  },
  { timestamps: true },
)

const ClaimResponse = models.ClaimResponse || model<IClaimResponse>("ClaimResponse", ClaimResponseSchema)

export default ClaimResponse
