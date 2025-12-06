"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { selectTasksAssignedToMe, selectCurrentUser, updateTask, type Task } from "@/lib/features/tasks-slice"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CheckCircle2, Circle, Clock } from "lucide-react"

type FilterType = "all" | "active" | "completed"

const statusConfig = {
  todo: { label: "Todo", variant: "secondary" as const, icon: Circle },
  "in-progress": { label: "In Progress", variant: "default" as const, icon: Clock },
  done: { label: "Done", variant: "outline" as const, icon: CheckCircle2 },
}

export function EmployeeTaskTable() {
  const dispatch = useAppDispatch()
  const myTasks = useAppSelector(selectTasksAssignedToMe)
  const currentUser = useAppSelector(selectCurrentUser)

  const [filter, setFilter] = useState<FilterType>("all")

  const filteredTasks = myTasks.filter((task) => {
    if (filter === "active") return task.status !== "done"
    if (filter === "completed") return task.status === "done"
    return true
  })

  const handleStatusChange = (task: Task) => {
    const nextStatus: Record<Task["status"], Task["status"]> = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    }
    dispatch(updateTask({ ...task, status: nextStatus[task.status] }))
  }

  const stats = {
    total: myTasks.length,
    todo: myTasks.filter((t) => t.status === "todo").length,
    inProgress: myTasks.filter((t) => t.status === "in-progress").length,
    done: myTasks.filter((t) => t.status === "done").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tasks</CardDescription>
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

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks Assigned to {currentUser}</CardTitle>
          <CardDescription>Click on status to update progress</CardDescription>
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
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
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
                        <TableCell className="hidden md:table-cell max-w-[250px] truncate text-muted-foreground">
                          {task.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusConfig[task.status].variant}
                            className="cursor-pointer gap-1"
                            onClick={() => handleStatusChange(task)}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[task.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(task.dueDate), "MMM d, yyyy")}</TableCell>
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
