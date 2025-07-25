import mongoose, { Schema, type Document } from "mongoose"

export interface IOTTKey extends Document {
  productSubCategory: string
  product: string
  activationCode: string
  status: "available" | "assigned" | "used" // Added 'used' for more states
  assignedEmail?: string
  assignedDate?: Date
  createdAt: Date
}

const OTTKeySchema: Schema = new Schema(
  {
    productSubCategory: { type: String, required: true },
    product: { type: String, required: true },
    activationCode: { type: String, required: true, unique: true }, // Activation code should be unique
    status: { type: String, enum: ["available", "assigned", "used"], default: "available" },
    assignedEmail: { type: String },
    assignedDate: { type: Date },
  },
  { timestamps: true },
)

export default (mongoose.models.OTTKey ||
  mongoose.model<IOTTKey>("OTTKey", OTTKeySchema, "ottkeys")) as mongoose.Model<IOTTKey>
