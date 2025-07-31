import { Schema, model, models } from "mongoose"

export interface IOTTKey {
  ottCode: string
  platform: string
  status: "available" | "assigned" | "redeemed"
  assignedTo?: string // Email of the customer
  assignedAt?: Date
  redeemedAt?: Date
  validity?: string // e.g., "1 month", "3 months"
  plan?: string // e.g., "Premium", "Standard"
  source?: string // e.g., "manual", "sale"
  saleId?: Schema.Types.ObjectId // Reference to SalesRecord if applicable
}

const OTTKeySchema = new Schema<IOTTKey>(
  {
    ottCode: { type: String, required: true, unique: true },
    platform: { type: String, required: true },
    status: { type: String, enum: ["available", "assigned", "redeemed"], default: "available" },
    assignedTo: { type: String, sparse: true }, // Use sparse to allow nulls and still index unique non-nulls
    assignedAt: { type: Date },
    redeemedAt: { type: Date },
    validity: { type: String },
    plan: { type: String },
    source: { type: String },
    saleId: { type: Schema.Types.ObjectId, ref: "SalesRecord" },
  },
  { timestamps: true },
)

const OTTKey = models.OTTKey || model<IOTTKey>("OTTKey", OTTKeySchema)

export default OTTKey
