import type { ObjectId } from "mongodb"

// Interfaces for MongoDB documents
export interface IClaimResponse {
  _id?: ObjectId
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
  ottCodeStatus: string // e.g., "pending", "delivered", "failed", "already_claimed", "activation_code_not_found"
  ottCode?: string
  createdAt?: Date
  updatedAt?: Date
  billFileName?: string
  razorpayOrderId?: string
}

export interface ISalesRecord {
  _id?: ObjectId
  productSubCategory: string
  product: string
  activationCode: string
  status?: "available" | "claimed" // Status field
  claimedBy?: string // Email of the person who claimed it
  claimedDate?: Date // Date when it was claimed
  createdAt?: Date
  updatedAt?: Date
}

export interface IOTTKey {
  _id?: ObjectId
  productSubCategory: string
  product: string
  activationCode: string
  status: "available" | "assigned" | "used"
  assignedEmail?: string
  assignedDate?: Date
  assignedTo?: ObjectId // Added to link to ClaimResponse _id
  createdAt?: Date
  updatedAt?: Date
}

export interface IRazorpayTransaction {
  _id?: ObjectId
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature?: string
  amount: number // Amount in paise
  currency: string
  status: "created" | "authorized" | "captured" | "refunded" | "failed"
  method?: string // payment method used
  email?: string
  contact?: string
  fee?: number
  tax?: number
  error_code?: string
  error_description?: string
  created_at: Date // Razorpay's created timestamp
  captured_at?: Date
  refunded_at?: Date
  claimId?: string // Link to our claims collection
  createdAt?: Date // Our database timestamp
  updatedAt?: Date
}

// Client-side interfaces (mapping _id to id string)
export interface ClaimResponse extends Omit<IClaimResponse, "_id" | "createdAt" | "updatedAt"> {
  pincode: string
  ottStatus(ottStatus: any): import("react").ReactNode
  amount: number
  phoneNumber: string
  claimId: string
  _id: string
  id: string
  createdAt: string
  updatedAt?: string
  razorpayOrderId?: string
}

export interface SalesRecord extends Omit<ISalesRecord, "_id" | "createdAt" | "updatedAt" | "claimedDate"> {
  _id: string
  id: string
  createdAt?: string
  updatedAt?: string
  claimedDate?: string
}

export interface OTTKey extends Omit<IOTTKey, "_id" | "createdAt" | "updatedAt" | "assignedDate" | "assignedTo"> {
  _id: string
  id: string
  createdAt?: string
  updatedAt?: string
  assignedDate?: string
  assignedTo?: string
}

export interface RazorpayTransaction
  extends Omit<IRazorpayTransaction, "_id" | "createdAt" | "updatedAt" | "created_at" | "captured_at" | "refunded_at"> {
  _id: string
  id: string
  created_at: string
  captured_at?: string
  refunded_at?: string
  createdAt?: string
  updatedAt?: string
}

// Mongoose-style model classes for compatibility with existing code
export class Claim {
  constructor(data: Partial<IClaimResponse>) {
    Object.assign(this, data)
  }

  static async findOne(query: any) {
    const { getDatabase } = await import("./mongodb")
    const db = await getDatabase()
    return await db.collection("claims").findOne(query)
  }

  static async findById(id: string | ObjectId) {
    const { getDatabase } = await import("./mongodb")
    const { ObjectId: MongoObjectId } = await import("mongodb")
    const db = await getDatabase()
    return await db.collection("claims").findOne({ _id: new MongoObjectId(id) })
  }

  static async findByIdAndUpdate(id: string | ObjectId, update: any) {
    const { getDatabase } = await import("./mongodb")
    const { ObjectId: MongoObjectId } = await import("mongodb")
    const db = await getDatabase()
    return await db
      .collection("claims")
      .findOneAndUpdate({ _id: new MongoObjectId(id) }, { $set: update }, { returnDocument: "after" })
  }

  async save() {
    const { getDatabase } = await import("./mongodb")
    const db = await getDatabase()
    const result = await db.collection("claims").insertOne(this)
    return { ...this, _id: result.insertedId }
  }
}

export class SalesRecordClass {
  constructor(data: Partial<ISalesRecord>) {
    Object.assign(this, data)
  }

  static async findOne(query: any) {
    const { getDatabase } = await import("./mongodb")
    const db = await getDatabase()
    return await db.collection("salesrecords").findOne(query)
  }

  static async findById(id: string | ObjectId) {
    const { getDatabase } = await import("./mongodb")
    const { ObjectId: MongoObjectId } = await import("mongodb")
    const db = await getDatabase()
    return await db.collection("salesrecords").findOne({ _id: new MongoObjectId(id) })
  }

  static async findByIdAndUpdate(id: string | ObjectId, update: any) {
    const { getDatabase } = await import("./mongodb")
    const { ObjectId: MongoObjectId } = await import("mongodb")
    const db = await getDatabase()
    return await db
      .collection("salesrecords")
      .findOneAndUpdate({ _id: new MongoObjectId(id) }, { $set: update }, { returnDocument: "after" })
  }

  async save() {
    const { getDatabase } = await import("./mongodb")
    const db = await getDatabase()
    const result = await db.collection("salesrecords").insertOne(this)
    return { ...this, _id: result.insertedId }
  }
}

export class OTTKeyClass {
  constructor(data: Partial<IOTTKey>) {
    Object.assign(this, data)
  }

  static async findOne(query: any) {
    const { getDatabase } = await import("./mongodb")
    const db = await getDatabase()
    return await db.collection("ottkeys").findOne(query)
  }

  static async findById(id: string | ObjectId) {
    const { getDatabase } = await import("./mongodb")
    const { ObjectId: MongoObjectId } = await import("mongodb")
    const db = await getDatabase()
    return await db.collection("ottkeys").findOne({ _id: new MongoObjectId(id) })
  }

  static async findByIdAndUpdate(id: string | ObjectId, update: any) {
    const { getDatabase } = await import("./mongodb")
    const { ObjectId: MongoObjectId } = await import("mongodb")
    const db = await getDatabase()
    return await db
      .collection("ottkeys")
      .findOneAndUpdate({ _id: new MongoObjectId(id) }, { $set: update }, { returnDocument: "after" })
  }

  async save() {
    const { getDatabase } = await import("./mongodb")
    const db = await getDatabase()
    const result = await db.collection("ottkeys").insertOne(this)
    return { ...this, _id: result.insertedId }
  }
}
