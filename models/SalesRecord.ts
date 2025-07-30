import mongoose, { Schema, type Document } from "mongoose"

export interface ISalesRecord extends Document {
  activationCode: string
  product: string
  productSubCategory: string
  saleDate: Date
  customerEmail: string
  status: "sold" | "claimed"
  claimedBy?: string
  claimedDate?: Date
  createdAt: Date
  updatedAt: Date
}

const SalesRecordSchema: Schema = new Schema(
  {
    activationCode: { type: String, required: true, unique: true },
    product: { type: String, required: true },
    productSubCategory: { type: String, required: true },
    saleDate: { type: Date, required: true },
    customerEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["sold", "claimed"],
      default: "sold",
    },
    claimedBy: { type: String },
    claimedDate: { type: Date },
  },
  { timestamps: true },
)

// Create indexes for better query performance
SalesRecordSchema.index({ activationCode: 1 })
SalesRecordSchema.index({ status: 1 })
SalesRecordSchema.index({ customerEmail: 1 })

const SalesRecord = mongoose.models.SalesRecord || mongoose.model<ISalesRecord>("SalesRecord", SalesRecordSchema)

export default SalesRecord
