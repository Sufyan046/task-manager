"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  userId: string
  email: string
  name: string
  role: "admin" | "employee"
}

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: User | null }) {
  const [user] = useState<User | null>(initialUser)
  const [loading] = useState(false)

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
