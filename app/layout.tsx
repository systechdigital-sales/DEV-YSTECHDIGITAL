import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.systechdigital.co.in"),
  title: "SYSTECH DIGITAL - IT Solutions & Mobile Technology",
  description:
    "Your trusted partner for IT Solutions & Mobile Technology. Get free OTT subscriptions with eligible purchases. Secure payment processing with Razorpay.",
  keywords: "IT solutions, mobile technology, OTT subscription, Razorpay payments, Systech Digital, Sara Mobiles",
  authors: [{ name: "SYSTECH IT SOLUTIONS LIMITED" }],
  creator: "SYSTECH IT SOLUTIONS LIMITED",
  publisher: "SYSTECH IT SOLUTIONS LIMITED",
  robots: "index, follow",
  openGraph: {
    title: "SYSTECH DIGITAL - IT Solutions & Mobile Technology",
    description:
      "Your trusted partner for IT Solutions & Mobile Technology. Get free OTT subscriptions with eligible purchases.",
    url: "https://systechdigital.co.in",
    siteName: "SYSTECH DIGITAL",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "SYSTECH DIGITAL Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SYSTECH DIGITAL - IT Solutions & Mobile Technology",
    description:
      "Your trusted partner for IT Solutions & Mobile Technology. Get free OTT subscriptions with eligible purchases.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/site.webmanifest",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "sy8jnufecp");
            `,
          }}
        />
      </body>
    </html>
  )
}
