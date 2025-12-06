import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { AdminDashboard } from "@/components/admin-dashboard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAllTasks } from "@/lib/tasks-db"
import { getEmployees } from "@/lib/auth"

export default async function AdminPage() {
  const tasks = await getAllTasks()
  const employees = await getEmployees()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage tasks and assign work to your team</p>
              </div>
              <AdminDashboard initialTasks={tasks} employees={employees} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
