"use client"

import { useState } from "react"
import { updateTask, deleteTask } from "@/app/actions/tasks"
import type { Task } from "@/lib/tasks-db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Plus, Users, CheckCircle2, Clock, ListTodo } from "lucide-react"
import { EditTaskSheet } from "./edit-task-sheet"
import { format } from "date-fns"
import Link from "next/link"

type FilterType = "all" | "todo" | "in-progress" | "done"

const statusConfig = {
  todo: { label: "To Do", variant: "secondary" as const },
  "in-progress": { label: "In Progress", variant: "default" as const },
  done: { label: "Done", variant: "outline" as const },
}

interface Employee {
  id: string
  name: string
  email: string
}

interface Props {
  initialTasks: Task[]
  employees: Employee[]
}

export function AdminDashboard({ initialTasks, employees }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState<FilterType>("all")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const filteredTasks = filter === "all" ? tasks : tasks.filter((task) => task.status === filter)

  const handleDelete = async (id: string) => {
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== id))

    const result = await deleteTask(id)
    if (!result.success) {
      // Revert on error - refetch would be better in production
      setTasks(initialTasks)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsEditOpen(true)
  }

  const handleStatusChange = async (task: Task) => {
    const nextStatus: Record<Task["status"], Task["status"]> = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    }
    const newStatus = nextStatus[task.status]

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))

    const result = await updateTask(task.id, { status: newStatus })
    if (!result.success) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)))
    }
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
  }

  // Stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  }

  // Team stats
  const tasksByAssignee = employees.map((emp) => ({
    name: emp.name,
    total: tasks.filter((t) => t.assigneeId === emp.id).length,
    completed: tasks.filter((t) => t.assigneeId === emp.id && t.status === "done").length,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Tasks</CardDescription>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>To Do</CardDescription>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>In Progress</CardDescription>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Completed</CardDescription>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.done}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team
            </CardTitle>
            <CardDescription>Task completion by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasksByAssignee.map((member) => (
                <div key={member.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-muted-foreground">
                      {member.completed}/{member.total}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${member.total > 0 ? (member.completed / member.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>Click status to update, or use the menu to edit/delete</CardDescription>
              </div>
              <Button asChild>
                <Link href="/tasks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="mb-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="todo">To Do</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="done">Done</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No tasks found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell className="text-muted-foreground">{task.assigneeName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={statusConfig[task.status].variant}
                            className="cursor-pointer transition-colors hover:opacity-80"
                            onClick={() => handleStatusChange(task)}
                          >
                            {statusConfig[task.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(task.dueDate), "MMM d")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(task)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditTaskSheet
        task={editingTask}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        employees={employees}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  )
}
