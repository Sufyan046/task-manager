"use client"

import { useState } from "react"
import { updateTask } from "@/app/actions/tasks"
import type { Task } from "@/lib/tasks-db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CheckCircle2, Circle, Clock } from "lucide-react"

type FilterType = "all" | "active" | "completed"

const statusConfig = {
  todo: { label: "To Do", variant: "secondary" as const, icon: Circle },
  "in-progress": { label: "In Progress", variant: "default" as const, icon: Clock },
  done: { label: "Done", variant: "outline" as const, icon: CheckCircle2 },
}

interface Props {
  initialTasks: Task[]
  userName: string
}

export function EmployeeDashboard({ initialTasks, userName }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState<FilterType>("all")

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return task.status !== "done"
    if (filter === "completed") return task.status === "done"
    return true
  })

  const handleStatusChange = async (task: Task) => {
    const nextStatus: Record<Task["status"], Task["status"]> = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    }
    const newStatus = nextStatus[task.status]

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))

    const result = await updateTask(task.id, { status: newStatus })
    if (!result.success) {
      // Revert on error
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)))
    }
  }

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>To Do</CardDescription>
            <CardTitle className="text-3xl">{stats.todo}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{stats.done}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>Click on a status badge to update progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No tasks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => {
                    const StatusIcon = statusConfig[task.status].icon
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground">
                          {task.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusConfig[task.status].variant}
                            className="cursor-pointer gap-1 transition-colors hover:opacity-80"
                            onClick={() => handleStatusChange(task)}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[task.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(task.dueDate), "MMM d")}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
