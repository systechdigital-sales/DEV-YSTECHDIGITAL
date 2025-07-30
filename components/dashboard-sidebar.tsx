"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LayoutDashboard, Settings, BarChart3, Mail, Zap, LogOut, User, Shield } from "lucide-react"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Admin Panel",
    url: "/admin",
    icon: Settings,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Email Logs",
    url: "/emails",
    icon: Mail,
  },
  {
    title: "Automation",
    url: "/automation",
    icon: Zap,
  },
]

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Clear session storage
      sessionStorage.removeItem("adminAuthenticated")

      // Clear any other stored data
      localStorage.clear()

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Sidebar className="border-r border-gray-200">
      {/* Header */}
      <SidebarHeader className="p-6 bg-blue-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={32} height={32} className="rounded-full" />
          </div>
          <div>
            <h2 className="text-lg font-bold">SYSTECH DIGITAL</h2>
            <p className="text-sm text-blue-200">Admin Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="p-4">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className="w-full justify-start p-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-600 data-[active=true]:border-r-2 data-[active=true]:border-blue-600"
              >
                <a href={item.url} className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <SidebarMenuButton
                className="w-full justify-start p-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={isLoggingOut}
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </div>
              </SidebarMenuButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>Confirm Logout</span>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to logout? You will need to enter your credentials again to access the admin
                  panel.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
