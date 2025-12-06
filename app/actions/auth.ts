"use server"

import { redirect } from "next/navigation"
import { findUserByEmail, verifyPassword, createSession, clearSession, createUser } from "@/lib/auth"

export interface AuthResult {
  success: boolean
  error?: string
}

export async function login(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  const user = await findUserByEmail(email)

  if (!user) {
    return { success: false, error: "Invalid email or password" }
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return { success: false, error: "Invalid email or password" }
  }

  await createSession(user)

  if (user.role === "admin") {
    redirect("/admin")
  } else {
    redirect("/employee")
  }
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!name || !email || !password) {
    return { success: false, error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" }
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }

  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    return { success: false, error: "An account with this email already exists" }
  }

  const newUser = await createUser(email, name, password, "employee")
  await createSession(newUser)

  redirect("/employee")
}

export async function logout(): Promise<void> {
  await clearSession()
  redirect("/login")
}
