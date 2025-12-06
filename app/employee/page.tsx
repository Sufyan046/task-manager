import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { EmployeeDashboard } from "@/components/employee-dashboard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSession } from "@/lib/auth"
import { getTasksForUser } from "@/lib/tasks-db"

export default async function EmployeePage() {
  const session = await getSession()
const tasks = session ? await getTasksForUser(session.userId) : []

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
                <h1 className="text-2xl font-semibold tracking-tight">My Tasks</h1>
                <p className="text-muted-foreground">Here are the tasks assigned to you</p>
              </div>
              <EmployeeDashboard initialTasks={tasks} userName={session?.name || ""} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
