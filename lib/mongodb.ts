import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  ssl: true,
  tls: true
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
    globalWithMongo._mongoClientPromise = client.connect()
      .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      throw err;
    });
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise
    return client.db("systech_ott_platform")
  } catch (error) {
    console.error("Error connecting to database:", error)
    // Fallback to creating a new connection if the cached one fails
    const fallbackClient = new MongoClient(uri, {
      ...options
    })
    try {
      await fallbackClient.connect()
      return fallbackClient.db("systech_ott_platform")
    } catch (fallbackError) {
      console.error("Fallback connection also failed:", fallbackError)
      throw fallbackError
    }
  }
}

export default clientPromise
