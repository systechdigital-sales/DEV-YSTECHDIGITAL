import mongoose, { Schema, type Document } from "mongoose"

export interface IClaimResponse extends Document {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  activationCode: string
  paymentStatus: "pending" | "paid" | "failed"
  ottCode: string
  ottCodeStatus: "pending" | "delivered" | "failed" | "already_claimed" | "activation_code_not_found"
  ottAssignedAt?: Date
  razorpayPaymentId?: string
  razorpayOrderId?: string
  amount?: number
  createdAt: Date
  updatedAt: Date
}

const ClaimResponseSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    activationCode: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    ottCode: { type: String, default: "" },
    ottCodeStatus: {
      type: String,
      enum: ["pending", "delivered", "failed", "already_claimed", "activation_code_not_found"],
      default: "pending", // Ensure this is set to "pending" by default
    },
    ottAssignedAt: { type: Date },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    amount: { type: Number },
  },
  { timestamps: true },
)

// Create compound index for better query performance
ClaimResponseSchema.index({ activationCode: 1, ottCodeStatus: 1 })
ClaimResponseSchema.index({ paymentStatus: 1, ottCodeStatus: 1 })
ClaimResponseSchema.index({ email: 1 })

const ClaimResponse =
  mongoose.models.ClaimResponse || mongoose.model<IClaimResponse>("ClaimResponse", ClaimResponseSchema)

export default ClaimResponse
