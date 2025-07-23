export interface ClaimResponse {
  _id?: string
  id: string
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
  ottCodeStatus: string
  ottCode?: string
  createdAt: string
  billFileName?: string
}

export interface SalesRecord {
  _id?: string
  id: string
  productSubCategory: string
  product: string
  activationCode: string
  createdAt?: string
}

export interface OTTKey {
  _id?: string
  id: string
  productSubCategory: string
  product: string
  activationCode: string
  status: string
  assignedEmail?: string
  assignedDate?: string
  createdAt?: string
}
