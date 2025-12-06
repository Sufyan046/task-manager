import type React from "react"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { TaskForm } from "@/components/task-form"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSession, getEmployees } from "@/lib/auth"

export default async function NewTaskPage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/employee")
  }

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
              <TaskForm employees={employees} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
