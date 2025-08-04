"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, MapPin } from "lucide-react";
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
                src="/Logo.png"
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
              Systech Digital streamlines technology—offering secure, efficient software and digital services
              for a smarter, frictionless experience.
            </p>
          </div>

          {/* Empty Spacer or Future Links */}
          <div className="hidden sm:block" />

          {/* Contact Info */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Contact Info</h5>
            <div className="space-y-4 text-sm sm:text-base">
              <div className="flex items-start sm:items-center">
                <Mail className="w-5 h-5 text-blue-400 mr-3 mt-1 sm:mt-0" />
                <p>sales.systechdigital@gmail.com</p>
              </div>
              <div className="flex items-start sm:items-center">
                <MapPin className="w-5 h-5 text-blue-400 mr-3 mt-1 sm:mt-0" />
                <p>India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © 2025 Systech Digital. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => router.push("/terms-and-conditions")}
              >
                Terms & Conditions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => router.push("/privacy-policy")}
              >
                Privacy Policy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => router.push("/refund-policy")}
              >
                Refund Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
