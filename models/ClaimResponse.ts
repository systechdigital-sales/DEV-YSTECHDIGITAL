import mongoose, { Schema, type Document } from "mongoose"

export interface IClaimResponse extends Document {
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
  ottCodeStatus: string
  ottCode?: string
  createdAt: Date
  billFileName?: string
  razorpayOrderId?: string
}

const ClaimResponseSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    purchaseType: { type: String, required: true },
    activationCode: { type: String, required: true },
    purchaseDate: { type: String, required: true }, // Storing as string for simplicity based on original code
    claimSubmissionDate: { type: String, required: true }, // Storing as string
    invoiceNumber: { type: String },
    sellerName: { type: String },
    paymentStatus: { type: String, required: true },
    paymentId: { type: String },
    ottCodeStatus: { type: String, required: true, default: "pending" },
    ottCode: { type: String },
    billFileName: { type: String },
    razorpayOrderId: { type: String },
  },
  { timestamps: true },
)

export default (mongoose.models.ClaimResponse ||
  mongoose.model<IClaimResponse>(
    "ClaimResponse",
    ClaimResponseSchema,
    "claimresponses",
  )) as mongoose.Model<IClaimResponse>
