"use client"
import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Lock, ArrowRight, Home, CheckCircle } from "lucide-react"
import Image from "next/image"
import type { FormState } from "@/lib/definitions"

// Server Action for signup
async function signupAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const phoneNumber = formData.get("phoneNumber") as string

  try {
    const response = await fetch("/api/customer/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, phoneNumber }),
    })

    const data = await response.json()

    if (data.success) {
      return { message: data.message, ottCode: data.ottCode }
    } else {
      return { errors: data.errors, message: data.message || "Signup failed. Please try again." }
    }
  } catch (error) {
    console.error("Network error during signup:", error)
    return { message: "Network error. Please check your connection and try again." }
  }
}

export default function CustomerSignup() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(signupAction, undefined)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="mb-4 text-purple-200 hover:text-purple-50"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Image
            src="/logo.png"
            alt="SYSTECH DIGITAL Logo"
            width={60}
            height={60}
            className="rounded-full mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Sign Up for OTT Access</h1>
          <p className="text-purple-200">Create your account and get your activation code</p>
        </div>

        <Card className="shadow-2xl border-0 bg-purple-700 text-white">
          <CardHeader className="bg-purple-800 rounded-t-lg">
            <CardTitle className="flex items-center justify-center">
              <User className="w-5 h-5 mr-2" />
              Create Your Account
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {state?.message && (
              <Alert className={`mb-4 ${state.ottCode ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                {state.ottCode ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className={`${state.ottCode ? "text-green-800" : "text-red-800"}`}>
                  {state.message}
                </AlertDescription>
              </Alert>
            )}

            {state?.ottCode ? (
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-white">Your OTT Activation Code:</p>
                <div className="bg-purple-900 p-4 rounded-lg border border-purple-600">
                  <p className="text-4xl font-bold tracking-widest text-yellow-300">{state.ottCode}</p>
                </div>
                <p className="text-sm text-purple-200">Please save this code. You can now proceed to the login page.</p>
                <Button
                  onClick={() => router.push("/customer-login")}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 py-2 font-semibold"
                >
                  Go to Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-purple-100">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className="mt-1 bg-purple-600 border-purple-500 text-white placeholder:text-purple-300"
                    required
                  />
                  {state?.errors?.firstName && <p className="text-red-300 text-xs mt-1">{state.errors.firstName[0]}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-purple-100">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    className="mt-1 bg-purple-600 border-purple-500 text-white placeholder:text-purple-300"
                    required
                  />
                  {state?.errors?.lastName && <p className="text-red-300 text-xs mt-1">{state.errors.lastName[0]}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-purple-100">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="mt-1 bg-purple-600 border-purple-500 text-white placeholder:text-purple-300"
                    required
                  />
                  {state?.errors?.email && <p className="text-red-300 text-xs mt-1">{state.errors.email[0]}</p>}
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-purple-100">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="mt-1 bg-purple-600 border-purple-500 text-white placeholder:text-purple-300"
                    required
                  />
                  {state?.errors?.phoneNumber && (
                    <p className="text-red-300 text-xs mt-1">{state.errors.phoneNumber[0]}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 py-2 font-semibold"
                  disabled={pending}
                >
                  {pending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-900 mr-2"></div>
                      Signing Up...
                    </div>
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Login Link */}
            {!state?.ottCode && (
              <div className="mt-4 text-center text-sm text-purple-200">
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => router.push("/customer-login")}
                  className="text-yellow-300 hover:text-yellow-200 p-0 h-auto"
                >
                  Login here
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-purple-200 mb-2">Need help?</p>
          <div className="flex justify-center space-x-4 text-xs text-purple-300">
            <span>📞 +91 7709803412</span>
            <span>✉️ sales.systechdigital@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
