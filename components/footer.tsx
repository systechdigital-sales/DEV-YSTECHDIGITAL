"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path if your button component is in a different location

export default function Footer() {
  const router = useRouter();

  const handleCustomerDashboard = () => {
    router.push("/customer-dashboard"); // Change this route if it's different in your app
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <Image
                src="/logo.png"
                alt="SYSTECH DIGITAL Logo"
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <div>
                <h4 className="text-2xl font-bold">SYSTECH DIGITAL</h4>
                <p className="text-gray-400">
                  Simplifying the Digital Experience
                </p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Your trusted partner for premium OTT subscriptions. We provide
              genuine activation codes and exceptional customer service to
              enhance your entertainment experience.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">t</span>
              </div>
              <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">i</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-lg font-semibold mb-6">Quick Links</h5>
            <ul className="space-y-3">
              <li>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:text-gray-800 p-0 h-auto font-normal"
                  onClick={() => router.push("/ott")}
                >
                  Claim OTT Code
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:text-gray-800 p-0 h-auto font-normal"
                  onClick={handleCustomerDashboard}
                >
                  Customer Dashboard
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:text-gray-800 p-0 h-auto font-normal"
                  onClick={() => router.push("/terms-and-conditions")}
                >
                  Terms & Conditions
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:text-gray-800 p-0 h-auto font-normal"
                  onClick={() => router.push("/privacy-policy")}
                >
                  Privacy Policy
                </Button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-lg font-semibold mb-6">Contact Info</h5>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-white">sales.systechdigital@gmail.com</p>
                  <p className="text-gray-400 text-sm">24/7 Email Support</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-white">India</p>
                  <p className="text-gray-400 text-sm">Serving Nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SYSTECH DIGITAL. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:text-gray-800"
                onClick={() => router.push("/terms-and-conditions")}
              >
                Terms
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:text-gray-800"
                onClick={() => router.push("/privacy-policy")}
              >
                Privacy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:text-gray-800"
                onClick={() => router.push("/refund-policy")}
              >
                Refunds
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
