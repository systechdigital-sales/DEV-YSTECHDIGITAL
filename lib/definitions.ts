import { z } from "zod"

export const signupFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
})

export type FormState =
  | {
      errors?: {
        firstName?: string[]
        lastName?: string[]
        email?: string[]
        phoneNumber?: string[]
        name?: string[]
        phone?: string[]
      }
      message?: string
      ottCode?: string
    }
  | undefined
