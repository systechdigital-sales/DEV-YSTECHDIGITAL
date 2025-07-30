import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  ssl: true,
  tls: true,
  retryWrites: true,
  retryReads: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client
      .connect()
      .then((client) => {
        console.log("MongoDB connected successfully to systech_ott_platform in development mode")
        return client
      })
      .catch((err) => {
        console.error("Failed to connect to MongoDB systech_ott_platform in development:", err)
        throw err
      })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client
    .connect()
    .then((client) => {
      console.log("MongoDB connected successfully to systech_ott_platform in production mode")
      return client
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB systech_ott_platform in production:", err)
      throw err
    })
}

export async function getDatabase(): Promise<Db> {
  try {
    console.log("Getting database connection to systech_ott_platform...")
    const client = await clientPromise
    const db = client.db("systech_ott_platform")
    console.log("Database connection successful to systech_ott_platform")
    return db
  } catch (error) {
    console.error("Error connecting to systech_ott_platform database:", error)

    // Fallback to creating a new connection if the cached one fails
    try {
      console.log("Attempting fallback connection to systech_ott_platform...")
      const fallbackClient = new MongoClient(uri, options)
      await fallbackClient.connect()
      console.log("Fallback connection successful to systech_ott_platform")
      return fallbackClient.db("systech_ott_platform")
    } catch (fallbackError) {
      console.error("Fallback connection also failed for systech_ott_platform:", fallbackError)
      throw fallbackError
    }
  }
}

export default clientPromise
