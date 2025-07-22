"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Gift, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function OTTClaimPage() {
  const [iframeError, setIframeError] = useState(false)

  const handleIframeError = () => {
    setIframeError(true)
  }

  const refreshIframe = () => {
    setIframeError(false)
    // Force iframe reload
    const iframe = document.getElementById("zoho-form") as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }

  const openInNewTab = () => {
    window.open(
      "https://forms.zohopublic.in/systechdigital/form/OTTCLAIM/formperma/iFwfutH0xSjgzXywCZsSiwR0H17Qnh5ESReNUVKkidI",
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-lg border-b border-red-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer flex items-center" onClick={() => (window.location.href = "/")}>
              <div className="relative h-8 w-8 mr-3">
                <Image
                  src="/logo.png"
                  alt="SYSTECH DIGITAL Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SYSTECH DIGITAL</h1>
                <p className="text-sm text-red-200 mt-1">OTT Subscription Claim Form</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-red-100 text-red-800 px-3 py-2 border border-red-300">
                <Gift className="w-4 h-4 mr-2" />
                Free OTT Claim
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshIframe}
                className="hidden sm:flex bg-white/10 border-red-300 text-white hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewTab}
                className="hidden sm:flex bg-white/10 border-red-300 text-white hover:bg-white/20"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Page Iframe */}
      <main className="flex-1 relative">
        {!iframeError ? (
          <iframe
            id="zoho-form"
            src="https://forms.zohopublic.in/systechdigital/form/OTTCLAIM/formperma/iFwfutH0xSjgzXywCZsSiwR0H17Qnh5ESReNUVKkidI"
            className="w-full h-full border-0"
            title="OTT Subscription Claim Form"
            aria-label="OTT CLAIM"
            onError={handleIframeError}
            style={{ minHeight: "calc(100vh - 100px)" }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-white">
            <div className="text-center p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Loading Issue</h2>
              <p className="text-gray-600 mb-6">
                The claim form is temporarily unavailable. Please try refreshing or opening in a new tab.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={refreshIframe} className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={openInNewTab}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Action Bar */}
      <div className="sm:hidden bg-gradient-to-r from-black via-red-900 to-black border-t border-red-200 p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshIframe}
            className="flex-1 bg-white/10 border-red-300 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="flex-1 bg-white/10 border-red-300 text-white hover:bg-white/20"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            New Tab
          </Button>
        </div>
      </div>
      {/* Footer would go here if needed - keeping it minimal for iframe page */}
    </div>
  )
}
