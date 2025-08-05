import mongoose, { Schema, type Document } from "mongoose"

export interface IAutomationSettings extends Document {
  isEnabled: boolean
  intervalMinutes: number
  lastRun?: Date
  nextRun?: Date
  totalRuns: number
  isRunning: boolean
  lastError?: {
    message: string
    timestamp: Date
  }
  lastRunResult?: {
    expired: number
    processed: number
    success: number
    failed: number
    skipped: number
    details: Array<{
      email: string
      status: "success" | "failed" | "skipped"
      message: string
      ottCode?: string
      step?: string
    }>
  }
  createdAt: Date
  updatedAt: Date
}

const AutomationSettingsSchema: Schema = new Schema(
  {
    isEnabled: { type: Boolean, default: true },
    intervalMinutes: { type: Number, default: 1 }, // Default to 1 minute
    lastRun: { type: Date },
    nextRun: { type: Date },
    totalRuns: { type: Number, default: 0 },
    isRunning: { type: Boolean, default: false },
    lastError: {
      message: { type: String },
      timestamp: { type: Date },
    },
    lastRunResult: {
      expired: { type: Number },
      processed: { type: Number },
      success: { type: Number },
      failed: { type: Number },
      skipped: { type: Number },
      details: [
        {
          email: { type: String },
          status: { type: String, enum: ["success", "failed", "skipped"] },
          message: { type: String },
          ottCode: { type: String },
          step: { type: String },
        },
      ],
    },
  },
  { timestamps: true },
)

const AutomationSettings =
  mongoose.models.AutomationSettings ||
  mongoose.model<IAutomationSettings>("AutomationSettings", AutomationSettingsSchema)

export default AutomationSettings
