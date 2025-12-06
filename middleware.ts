import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "task-tracker-session"

// Routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/"]

// Routes that require admin role
const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(SESSION_COOKIE)

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    // If logged in and trying to access login/signup, redirect to appropriate page
    if (sessionCookie && (pathname === "/login" || pathname === "/signup")) {
      try {
        const session = JSON.parse(sessionCookie.value)
        const redirectUrl = session.role === "admin" ? "/admin" : "/employee"
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      } catch {
        // Invalid session, continue to login
      }
    }
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Check admin routes
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (session.role !== "admin") {
        return NextResponse.redirect(new URL("/employee", request.url))
      }
    }

    return NextResponse.next()
  } catch {
    // Invalid session
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
