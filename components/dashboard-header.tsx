"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, CheckSquare } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Task Tracker</h1>
        </div>
        <Link href="/tasks/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </Link>
      </div>
    </header>
  )
}
