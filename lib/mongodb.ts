import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local")
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri!, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri!, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Function to get database connection
export async function getDatabase(databaseName = "systech_ott_platform"): Promise<Db> {
  try {
    const client = await clientPromise
    console.log(`Connected to MongoDB database: ${databaseName}`)
    return client.db(databaseName)
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

// Function to get specific collection
export async function getCollection(collectionName: string, databaseName = "systech_ott_platform") {
  try {
    const db = await getDatabase(databaseName)
    console.log(`Accessing collection: ${databaseName}.${collectionName}`)
    return db.collection(collectionName)
  } catch (error) {
    console.error(`Failed to access collection ${databaseName}.${collectionName}:`, error)
    throw error
  }
}
