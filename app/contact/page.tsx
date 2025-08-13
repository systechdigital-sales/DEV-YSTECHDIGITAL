"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, MapPin, Phone, Home, Send, Clock, ShieldCheck, Building2, ExternalLink } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Footer from "@/components/footer"

const ContactSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email."),
  phone: z
    .string()
    .optional()
    .transform((v) => (v ? v.trim() : ""))
    .refine((v) => v === "" || /^[0-9+\-\s()]{7,}$/.test(v), "Please enter a valid phone number."),
  subject: z.string().min(2, "Please add a subject."),
  message: z.string().min(10, "Message should be at least 10 characters."),
  // Honeypot anti-spam field (should remain empty)
  company: z.string().max(0).optional(),
})

type ContactFormValues = z.infer<typeof ContactSchema>

export default function ContactPage() {
  const router = useRouter()
  const [isSubmitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      company: "",
    },
  })

  async function onSubmit(values: ContactFormValues) {
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = (await res.json()) as { success: boolean; message: string }
      if (res.ok && data.success) {
        setResult({ ok: true, message: "Thanks! Your message has been sent. We’ll get back within 24 hours." })
        reset()
      } else {
        setResult({
          ok: false,
          message: data?.message || "Something went wrong. Please try again or email us directly.",
        })
      }
    } catch (err) {
      setResult({
        ok: false,
        message: "Network error. Please try again or reach us at sales.systechdigital@gmail.com",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const mapUrl = "https://www.google.com/maps/search/?api=1&query=Systech+IT+Solution+Pvt.+Ltd+JC+Road+Bengaluru+560027"

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-gradient-to-r from-black via-red-900 to-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="SYSTECH IT SOLUTIONS Logo"
                width={48}
                height={48}
                className="rounded-full mr-3"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">Systech Digital</h1>
                <p className="text-xs sm:text-sm text-red-200">Simplifying the Digital Experience</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/10 text-white hover:bg-white/20">Support</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-gray-100 hover:text-gray-800 border border-white/30 px-2 py-1 text-sm"
              >
                <Home className="w-4 h-4 mr-1" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-red-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 md:py-14">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Trusted Support
              </div>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">Contact SYSTECH IT SOLUTIONS</h2>
              <p className="mt-3 text-gray-600">
                We&apos;re here to help with OTTplay Power Play Pack redemption and other support queries. Expect a
                response within 24 hours on business days.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Mon–Sat: 10:00 AM – 6:00 PM IST</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-red-600" />
                  <a className="text-sm underline decoration-red-500 underline-offset-4" href="tel:+918062012555">
                    +91 80-62012555
                  </a>
                </div>
              </div>
            </div>

            {/* Quick info cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="shadow-sm border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-4 w-4 text-red-600" />
                    OTTplay Pack Redemption
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <a className="text-red-700 font-medium" href="mailto:sales.systechdigital@gmail.com">
                    sales.systechdigital@gmail.com
                  </a>
                  <p className="mt-1 text-xs text-gray-500">Replies within 24 hours</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-4 w-4 text-red-600" />
                    OTTplay Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <div className="flex flex-col">
                    <a className="text-red-700 font-medium" href="mailto:support@ottplay.com">
                      support@ottplay.com
                    </a>
                    <a className="mt-1 text-gray-700 hover:underline" href="tel:+918062012555">
                      +91 80-62012555
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-5">
          {/* Contact Form */}
          <section className="md:col-span-3">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                  {/* Honeypot */}
                  <input type="text" aria-hidden="true" tabIndex={-1} className="hidden" {...register("company")} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <Input id="name" autoComplete="name" placeholder="Your name" {...register("name")} />
                      {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...register("email")}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone (optional)
                      </label>
                      <Input id="phone" placeholder="+91 9XXXXXXXXX" {...register("phone")} />
                      {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message as string}</p>}
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <Input id="subject" placeholder="How can we help you?" {...register("subject")} />
                      {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Please include details like order ID, activation code, and issue summary."
                      {...register("message")}
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={isSubmitting} className={cn(isSubmitting && "opacity-80")}>
                      {isSubmitting ? (
                        <>
                          <Send className="mr-2 h-4 w-4 animate-pulse" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                    {result && (
                      <span role="status" className={cn("text-sm", result.ok ? "text-green-700" : "text-red-700")}>
                        {result.message}
                      </span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Address and map */}
          <aside className="md:col-span-2">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-red-600" />
                  Registered Office
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 text-red-600" />
                  <div className="text-sm">
                    <p>SYSTECH IT SOLUTIONS </p>
                    <p>#23/1, 1st Floor, J.C. 1st Cross</p>
                    <p>JC Road, Near Poornima Theatre, Bengaluru</p>
                    <p>Karnataka, India - 560027</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-5 w-5 text-red-600" />
                  <div className="text-sm">
                    <a className="hover:underline" href="tel:+918062012555">
                      +91 80-62012555
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-5 w-5 text-red-600" />
                  <div className="text-sm">
                    <a className="hover:underline" href="mailto:sales.systechdigital@gmail.com">
                      sales.systechdigital@gmail.com
                    </a>
                  </div>
                </div>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-red-700 hover:underline"
                >
                  Get Directions
                  <ExternalLink className="h-4 w-4" />
                </a>

                <Separator className="my-4" />

                <div className="rounded-md bg-red-50 p-3 text-xs text-red-800">
                  For OTTplay Power Play Pack support related to subscription/app access, contact OTTplay Support:
                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <a className="underline" href="mailto:support@ottplay.com">
                      support@ottplay.com
                    </a>
                    <span className="hidden sm:inline text-red-400">|</span>
                    <a className="underline" href="tel:+918062012555">
                      +91 80-62012555
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

      
      </main>

      {/* JSON-LD Organization schema */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "SYSTECH IT SOLUTIONS",
            url: typeof window !== "undefined" ? window.location.origin : "https://example.com",
            logo: "/logo.png",
            email: "sales.systechdigital@gmail.com",
            telephone: "+91 80-62012555",
            address: {
              "@type": "PostalAddress",
              streetAddress: "#23/1, 1st Floor, J.C. 1st Cross, JC Road, Near Poornima Theatre",
              addressLocality: "Bengaluru",
              addressRegion: "Karnataka",
              postalCode: "560027",
              addressCountry: "IN",
            },
            sameAs: [],
          }),
        }}
      />

      <Footer/>
    </div>
  )
}
