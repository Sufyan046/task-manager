import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"

export interface Task {
  id: string
  title: string
  description: string
  assignee: string
  status: "todo" | "in-progress" | "done"
  dueDate: string
}

interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null
  currentUser: string
}

// Mock data for initial tasks
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design System Update",
    description: "Update the design system components to match new brand guidelines",
    assignee: "Eddie Lake",
    status: "in-progress",
    dueDate: "2025-01-15",
  },
  {
    id: "2",
    title: "API Integration",
    description: "Integrate the new payment gateway API",
    assignee: "Jamik Tashpulatov",
    status: "todo",
    dueDate: "2025-01-20",
  },
  {
    id: "3",
    title: "User Testing",
    description: "Conduct user testing sessions for the new dashboard",
    assignee: "Eddie Lake",
    status: "done",
    dueDate: "2025-01-10",
  },
  {
    id: "4",
    title: "Documentation",
    description: "Write documentation for the new features",
    assignee: "Sarah Chen",
    status: "todo",
    dueDate: "2025-01-25",
  },
  {
    id: "5",
    title: "Performance Optimization",
    description: "Optimize database queries for better performance",
    assignee: "Jamik Tashpulatov",
    status: "in-progress",
    dueDate: "2025-01-18",
  },
]

const initialState: TasksState = {
  tasks: mockTasks,
  loading: false,
  error: null,
  currentUser: "Eddie Lake",
}

// Async thunks (simulated API calls)
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockTasks
})

export const addTask = createAsyncThunk("tasks/addTask", async (task: Omit<Task, "id">) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { ...task, id: Date.now().toString() }
})

export const updateTask = createAsyncThunk("tasks/updateTask", async (task: Task) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))
  return task
})

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))
  return id
})

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<string>) => {
      state.currentUser = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch tasks"
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload)
      })
  },
})

export const { setCurrentUser } = tasksSlice.actions

// Selectors
export const selectAllTasks = (state: RootState) => state.tasks.tasks
export const selectTasksLoading = (state: RootState) => state.tasks.loading
export const selectCurrentUser = (state: RootState) => state.tasks.currentUser
export const selectTasksAssignedToMe = (state: RootState) =>
  state.tasks.tasks.filter((task) => task.assignee === state.tasks.currentUser)
export const selectCompletedTasks = (state: RootState) => state.tasks.tasks.filter((task) => task.status === "done")

export default tasksSlice.reducer
