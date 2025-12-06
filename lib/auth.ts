import { cookies } from "next/headers"
import { connectToDatabase } from "./mongodb"
import { User, type IUser, type UserRole } from "./models/user"
import bcrypt from "bcryptjs"

export type { UserRole }

export interface Session {
  userId: string
  email: string
  name: string
  role: UserRole
}

export interface UserData {
  id: string
  email: string
  name: string
  role: UserRole
}

const SESSION_COOKIE = "task-tracker-session"

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)

  if (!sessionCookie) return null

  try {
    return JSON.parse(sessionCookie.value) as Session
  } catch {
    return null
  }
}

export async function createSession(user: IUser): Promise<void> {
  const cookieStore = await cookies()
  const session: Session = {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  }

  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  await connectToDatabase()
  return User.findOne({ email: email.toLowerCase() })
}

export async function findUserById(id: string): Promise<IUser | null> {
  await connectToDatabase()
  return User.findById(id)
}

export async function createUser(
  email: string,
  name: string,
  password: string,
  role: UserRole = "employee",
): Promise<IUser> {
  await connectToDatabase()
  const hashedPassword = await bcrypt.hash(password, 12)
  const user = new User({
    email: email.toLowerCase(),
    name,
    password: hashedPassword,
    role,
  })
  await user.save()
  return user
}

export async function verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(inputPassword, hashedPassword)
}

export async function getAllUsers(): Promise<UserData[]> {
  await connectToDatabase()
  const users = await User.find({}).lean()
  return users.map((u) => ({
    id: u._id.toString(),
    email: u.email,
    name: u.name,
    role: u.role,
  }))
}

export async function getEmployees(): Promise<UserData[]> {
  await connectToDatabase()
  const users = await User.find({ role: "employee" }).lean()
  return users.map((u) => ({
    id: u._id.toString(),
    email: u.email,
    name: u.name,
    role: u.role,
  }))
}
