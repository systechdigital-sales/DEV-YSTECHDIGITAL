import mongoose, { Schema, type Document } from "mongoose"

export interface IOTTKey extends Document {
  ottCode: string
  status: "available" | "assigned" | "redeemed"
  assignedTo?: string // Email of the user it's assigned to
  assignedAt?: Date
  redeemedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const OTTKeySchema: Schema = new Schema(
  {
    ottCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["available", "assigned", "redeemed"],
      default: "available",
    },
    assignedTo: { type: String },
    assignedAt: { type: Date },
    redeemedAt: { type: Date },
  },
  { timestamps: true },
)

// Create index for efficient lookup of available keys and assigned keys
OTTKeySchema.index({ status: 1, assignedTo: 1 })

const OTTKey = mongoose.models.OTTKey || mongoose.model<IOTTKey>("OTTKey", OTTKeySchema)

export default OTTKey
