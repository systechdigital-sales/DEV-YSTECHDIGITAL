import type { ClaimResponse, OTTKey, SalesRecord } from "@/lib/models"

// Fallback data for claims
export const getFallbackClaims = (): ClaimResponse[] => {
  return []
}

// Fallback data for OTT keys
export const getFallbackOTTKeys = (): OTTKey[] => {
  return []
}

// Fallback data for sales records
export const getFallbackSales = (): SalesRecord[] => {
  return []
}

// Helper function to handle database operations with fallback
export async function withFallback<T>(
  dbOperation: () => Promise<T>,
  fallbackData: T,
  errorMessage: string
): Promise<T> {
  try {
    return await dbOperation()
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    // Return fallback data during build or when database is unavailable
    return fallbackData
  }
}
