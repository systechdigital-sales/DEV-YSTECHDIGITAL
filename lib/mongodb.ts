import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI
let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local or environment variables.")
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const connectedClient = await clientPromise
    // Use the database name from the URI or a default if not specified
    const db = connectedClient.db(process.env.MONGODB_DB_NAME || "systech_ott_platform")
    console.log("Successfully connected to MongoDB.")
    return { client: connectedClient, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw new Error("Database connection failed.")
  }
}
