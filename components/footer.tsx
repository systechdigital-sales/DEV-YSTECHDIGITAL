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
                <h4 className="text-2xl font-bold">Systech Digital</h4>
                <p className="text-gray-400">
                  Simplifying the Digital Experience
                </p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md text-sm">
              Systech Digital streamlines technology—offering secure, efficient software and digital services
              for a smarter, frictionless experience
            </p>
            
          </div>

          <div>
            
          </div>

          <div>
            <h5 className="text-lg font-semibold mb-6">Contact Info</h5>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-white">sales.systechdigital@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-white">India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Systech Digital. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:text-gray-800"
                onClick={() => router.push("/terms-and-conditions")}
              >
                Terms & Conditions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:text-gray-800"
                onClick={() => router.push("/privacy-policy")}
              >
                Privacy Policy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:text-gray-800"
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
