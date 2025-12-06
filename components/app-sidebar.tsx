import type * as React from "react"
import { cookies } from "next/headers"
import { IconHelp, IconInnerShadowTop, IconListDetails, IconPlus, IconSettings, IconShield } from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

async function getUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("task-tracker-session")
  if (!sessionCookie) return null

  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = await getUser()

  // Build nav items based on role
  const navMain = [
    ...(user?.role === "admin"
      ? [
          {
            title: "Admin Dashboard",
            url: "/admin",
            icon: IconShield,
          },
        ]
      : []),
    {
      title: "My Tasks",
      url: "/employee",
      icon: IconListDetails,
    },
    ...(user?.role === "admin"
      ? [
          {
            title: "Add Task",
            url: "/tasks/new",
            icon: IconPlus,
          },
        ]
      : []),
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Help",
      url: "#",
      icon: IconHelp,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href={user?.role === "admin" ? "/admin" : "/employee"}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Task Tracker</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent> */}
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.name,
              email: user.email,
              role: user.role,
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
