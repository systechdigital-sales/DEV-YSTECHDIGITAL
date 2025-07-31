import { Schema, model, models } from "mongoose"

export interface IOTTKey {
  ottCode: string
  status: "available" | "assigned" | "redeemed" | "expired"
  assignedTo?: string // Email of the customer it's assigned to
  assignedAt?: Date
  redeemedAt?: Date
  platform?: string // e.g., "Hotstar", "SonyLIV"
  validityDays?: number
  createdAt: Date
  updatedAt: Date
}

const OTTKeySchema = new Schema<IOTTKey>(
  {
    ottCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["available", "assigned", "redeemed", "expired"],
      default: "available",
    },
    assignedTo: { type: String, sparse: true }, // Use sparse to allow nulls and still index unique non-nulls
    assignedAt: { type: Date },
    redeemedAt: { type: Date },
    platform: { type: String },
    validityDays: { type: Number },
  },
  { timestamps: true },
)

const OTTKey = models.OTTKey || model<IOTTKey>("OTTKey", OTTKeySchema)

export default OTTKey
