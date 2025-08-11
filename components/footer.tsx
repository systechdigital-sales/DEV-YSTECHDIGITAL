"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="SYSTECH DIGITAL Logo"
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <div>
                <h4 className="text-xl sm:text-2xl font-bold">Systech Digital</h4>
                <p className="text-gray-400 text-sm sm:text-base">
                  Simplifying the Digital Experience
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed">
              Systech Digital streamlines technology—offering secure, efficient software and
              digital services for a smarter, frictionless experience.
            </p>
          </div>

          {/* Empty Spacer */}
          <div className="hidden sm:block" />
        </div>

        {/* Bottom Row */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row md:justify-between gap-6">
          {/* Left Section */}
          <div>
            <p className="text-gray-400 text-sm mb-1">
              © 2025 Systech IT Solutions Limited. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Developed By Bytewise Consulting LLP
            </p>
          </div>

          {/* Right Section - Buttons */}
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-800"
              onClick={() => router.push("/shipment-policy")}
            >
              Shipment Policy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-800"
              onClick={() => router.push("/pricingpolicy")}
            >
              Pricing Policy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-800"
              onClick={() => router.push("/claim&redeem")}
            >
              Claim & Redeem
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-800"
              onClick={() => router.push("/terms-and-conditions")}
            >
              Terms & Conditions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-800"
              onClick={() => router.push("/privacy-policy")}
            >
              Privacy Policy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-800"
              onClick={() => router.push("/refund-policy")}
            >
              Refund Policy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-800 "
              onClick={() => router.push("/contact")}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
