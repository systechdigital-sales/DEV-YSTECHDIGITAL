import mongoose, { Schema, type Document } from "mongoose"

export interface ISalesRecord extends Document {
  productSubCategory: string
  product: string
  activationCode: string
  createdAt: Date
}

const SalesRecordSchema: Schema = new Schema(
  {
    productSubCategory: { type: String, required: true },
    product: { type: String, required: true },
    activationCode: { type: String, required: true, unique: true }, // Activation code should be unique
  },
  { timestamps: true },
)

export default (mongoose.models.SalesRecord ||
  mongoose.model<ISalesRecord>("SalesRecord", SalesRecordSchema, "salesrecords")) as mongoose.Model<ISalesRecord>
