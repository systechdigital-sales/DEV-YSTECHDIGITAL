"use client"

import { Home, Users, Key, DollarSign, FileSpreadsheet, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function DashboardSidebar() {
  const router = useRouter()

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated")
    router.push("/login")
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/admin",
      active: true,
    },
    {
      title: "Claims",
      icon: Users,
      href: "#claims",
    },
    {
      title: "Sales Records",
      icon: DollarSign,
      href: "#sales",
    },
    {
      title: "OTT Keys",
      icon: Key,
      href: "#keys",
    },
    {
      title: "Transactions",
      icon: FileSpreadsheet,
      href: "#transactions",
    },
  ]

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Image src="/logo.png" alt="SYSTECH DIGITAL Logo" width={24} height={24} className="rounded-full" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">SYSTECH</h2>
            <p className="text-sm text-gray-600">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`w-full justify-start ${
                  item.active ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <a href={item.href} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
