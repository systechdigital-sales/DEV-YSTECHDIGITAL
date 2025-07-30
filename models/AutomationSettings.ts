import mongoose, { Schema, type Document } from "mongoose"

export interface IAutomationSettings extends Document {
  isEnabled: boolean
  intervalMinutes: number
  lastRun?: Date
  totalRuns: number
  createdAt: Date
  updatedAt: Date
}

const AutomationSettingsSchema: Schema = new Schema(
  {
    isEnabled: { type: Boolean, default: true },
    intervalMinutes: { type: Number, default: 1 }, // Default to 1 minute
    lastRun: { type: Date },
    totalRuns: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const AutomationSettings =
  mongoose.models.AutomationSettings ||
  mongoose.model<IAutomationSettings>("AutomationSettings", AutomationSettingsSchema)

export default AutomationSettings
