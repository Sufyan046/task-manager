"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  selectAllTasks,
  selectTasksAssignedToMe,
  selectCompletedTasks,
  selectCurrentUser,
  deleteTask,
  updateTask,
  type Task,
} from "@/lib/features/tasks-slice"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { EditTaskSheet } from "./edit-task-sheet"
import { format } from "date-fns"

type FilterType = "all" | "assigned" | "completed"

const statusConfig = {
  todo: { label: "Todo", variant: "secondary" as const },
  "in-progress": { label: "In Progress", variant: "default" as const },
  done: { label: "Done", variant: "outline" as const },
}

export function TaskTable() {
  const dispatch = useAppDispatch()
  const allTasks = useAppSelector(selectAllTasks)
  const assignedTasks = useAppSelector(selectTasksAssignedToMe)
  const completedTasks = useAppSelector(selectCompletedTasks)
  const currentUser = useAppSelector(selectCurrentUser)

  const [filter, setFilter] = useState<FilterType>("all")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const filteredTasks = {
    all: allTasks,
    assigned: assignedTasks,
    completed: completedTasks,
  }[filter]

  const handleDelete = (id: string) => {
    dispatch(deleteTask(id))
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsEditOpen(true)
  }

  const handleStatusChange = (task: Task) => {
    const nextStatus: Record<Task["status"], Task["status"]> = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    }
    dispatch(updateTask({ ...task, status: nextStatus[task.status] }))
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground">
                    {task.description}
                  </TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusConfig[task.status].variant}
                      className="cursor-pointer"
                      onClick={() => handleStatusChange(task)}
                    >
                      {statusConfig[task.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(task.dueDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
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

      <EditTaskSheet task={editingTask} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </div>
  )
}
