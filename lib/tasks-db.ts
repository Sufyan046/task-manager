import { connectToDatabase } from "./mongodb"
import { Task, type ITask, type TaskStatus } from "./models/task"
import mongoose from "mongoose"

export type { TaskStatus }

export interface TaskData {
  id: string
  title: string
  description: string
  assigneeId: string
  assigneeName: string
  status: TaskStatus
  dueDate: string
  createdBy: string
  createdAt: string
}

function formatTask(task: ITask): TaskData {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    assigneeId: task.assigneeId.toString(),
    assigneeName: task.assigneeName,
    status: task.status,
    dueDate: task.dueDate.toISOString().split("T")[0],
    createdBy: task.createdBy.toString(),
    createdAt: task.createdAt.toISOString().split("T")[0],
  }
}

export async function getAllTasks(): Promise<TaskData[]> {
  await connectToDatabase()
  const tasks = await Task.find({}).sort({ createdAt: -1 })
  return tasks.map(formatTask)
}

export async function getTasksForUser(userId: string): Promise<TaskData[]> {
  await connectToDatabase()
  const tasks = await Task.find({
    assigneeId: new mongoose.Types.ObjectId(userId),
  }).sort({ createdAt: -1 })
  return tasks.map(formatTask)
}

export async function getTaskById(id: string): Promise<TaskData | null> {
  await connectToDatabase()
  const task = await Task.findById(id)
  return task ? formatTask(task) : null
}

export async function addTaskToDb(data: {
  title: string
  description: string
  assigneeId: string
  assigneeName: string
  status: TaskStatus
  dueDate: string
  createdBy: string
}): Promise<TaskData> {
  await connectToDatabase()
  const task = new Task({
    title: data.title,
    description: data.description,
    assigneeId: new mongoose.Types.ObjectId(data.assigneeId),
    assigneeName: data.assigneeName,
    status: data.status,
    dueDate: new Date(data.dueDate),
    createdBy: new mongoose.Types.ObjectId(data.createdBy),
  })
  await task.save()
  return formatTask(task)
}

export async function updateTaskInDb(
  id: string,
  updates: Partial<{
    title: string
    description: string
    assigneeId: string
    assigneeName: string
    status: TaskStatus
    dueDate: string
  }>,
): Promise<TaskData | null> {
  await connectToDatabase()

  const updateData: Record<string, unknown> = {}
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.assigneeName !== undefined) updateData.assigneeName = updates.assigneeName
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.assigneeId !== undefined) {
    updateData.assigneeId = new mongoose.Types.ObjectId(updates.assigneeId)
  }
  if (updates.dueDate !== undefined) {
    updateData.dueDate = new Date(updates.dueDate)
  }

  const task = await Task.findByIdAndUpdate(id, updateData, { new: true })
  return task ? formatTask(task) : null
}

export async function deleteTaskFromDb(id: string): Promise<boolean> {
  await connectToDatabase()
  const result = await Task.findByIdAndDelete(id)
  return result !== null
}
