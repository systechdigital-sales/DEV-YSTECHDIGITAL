import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI
let client: MongoClient
let clientPromise: Promise<MongoClient>
let cachedDb: Db | null = null // Cache the database instance

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local or environment variables.")
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
    _mongoDb?: Db
  }
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
  if (globalWithMongo._mongoDb) {
    cachedDb = globalWithMongo._mongoDb
  }
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedDb) {
    console.log("Using cached MongoDB connection.")
    return { client: await clientPromise, db: cachedDb }
  }
  try {
    const connectedClient = await clientPromise
    // Use the database name from the URI or a default if not specified
    const db = connectedClient.db(process.env.MONGODB_DB_NAME || "systech_ott_platform")
    if (process.env.NODE_ENV === "development") {
      const globalWithMongo = global as typeof globalThis & {
        _mongoDb?: Db
      }
      globalWithMongo._mongoDb = db
    }
    cachedDb = db
    console.log("Successfully connected to MongoDB.")
    return { client: connectedClient, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw new Error("Database connection failed.")
  }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}
