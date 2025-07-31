import { z } from "zod"

export const SignupFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }).trim(),
  lastName: z.string().min(1, { message: "Last name is required." }).trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .max(15, { message: "Phone number must not exceed 15 digits." })
    .regex(/^\+?[1-9]\d{9,14}$/, { message: "Please enter a valid phone number." })
    .trim(),
})

export type FormState =
  | {
      errors?: {
        firstName?: string[]
        lastName?: string[]
        email?: string[]
        phoneNumber?: string[]
      }
      message?: string
      ottCode?: string // To display the assigned OTT code
    }
  | undefined
