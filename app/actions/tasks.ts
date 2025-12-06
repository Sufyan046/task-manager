"use server"

import { revalidatePath } from "next/cache"
import { getSession, getEmployees, findUserById } from "@/lib/auth"
import {
  getAllTasks,
  getTasksForUser,
  addTaskToDb,
  updateTaskInDb,
  deleteTaskFromDb,
  type TaskData,
  type TaskStatus,
} from "@/lib/tasks-db"

export interface TaskResult {
  success: boolean
  error?: string
  task?: TaskData
}

export async function fetchTasks(): Promise<TaskData[]> {
  const session = await getSession()
  if (!session) return []

  if (session.role === "admin") {
    return getAllTasks()
  }

  return getTasksForUser(session.userId)
}

export async function fetchAllTasks(): Promise<TaskData[]> {
  const session = await getSession()
  if (!session || session.role !== "admin") return []

  return getAllTasks()
}

export async function createTask(formData: FormData): Promise<TaskResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Not authenticated" }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const assigneeId = formData.get("assigneeId") as string
  const status = formData.get("status") as TaskStatus
  const dueDate = formData.get("dueDate") as string

  if (!title || !assigneeId || !dueDate) {
    return { success: false, error: "Title, assignee, and due date are required" }
  }

  const assignee = await findUserById(assigneeId)
  if (!assignee) {
    return { success: false, error: "Invalid assignee" }
  }

  const task = await addTaskToDb({
    title,
    description: description || "",
    assigneeId,
    assigneeName: assignee.name,
    status: status || "todo",
    dueDate,
    createdBy: session.userId,
  })

  revalidatePath("/admin")
  revalidatePath("/employee")

  return { success: true, task }
}

export async function updateTask(
  taskId: string,
  updates: Partial<Pick<TaskData, "title" | "description" | "assigneeId" | "status" | "dueDate">>,
): Promise<TaskResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Not authenticated" }
  }

  let assigneeName: string | undefined
  if (updates.assigneeId) {
    const assignee = await findUserById(updates.assigneeId)
    if (assignee) {
      assigneeName = assignee.name
    }
  }

  const task = await updateTaskInDb(taskId, {
    ...updates,
    ...(assigneeName && { assigneeName }),
  })

  if (!task) {
    return { success: false, error: "Task not found" }
  }

  revalidatePath("/admin")
  revalidatePath("/employee")

  return { success: true, task }
}

export async function deleteTask(taskId: string): Promise<TaskResult> {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    return { success: false, error: "Not authorized" }
  }

  const success = await deleteTaskFromDb(taskId)
  if (!success) {
    return { success: false, error: "Task not found" }
  }

  revalidatePath("/admin")
  revalidatePath("/employee")

  return { success: true }
}

export { getEmployees }
