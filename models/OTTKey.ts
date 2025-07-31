import mongoose, { Schema, type Document } from "mongoose"

export interface IOTTKey extends Document {
  activationCode: string
  product: string
  productSubCategory: string
  status: "available" | "assigned" | "expired"
  assignedEmail?: string
  assignedDate?: Date
  createdAt: Date
  updatedAt: Date
}

const OTTKeySchema: Schema = new Schema(
  {
    activationCode: { type: String, required: true, unique: true },
    product: { type: String, required: true },
    productSubCategory: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "assigned", "expired"],
      default: "available",
    },
    assignedEmail: { type: String },
    assignedDate: { type: Date },
  },
  { timestamps: true },
)

// Create indexes for better query performance
OTTKeySchema.index({ status: 1 })
OTTKeySchema.index({ assignedEmail: 1 })
OTTKeySchema.index({ activationCode: 1 })

const OTTKey = mongoose.models.OTTKey || mongoose.model<IOTTKey>("OTTKey", OTTKeySchema)

export default OTTKey
