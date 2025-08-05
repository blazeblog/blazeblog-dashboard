import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk'
])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  // If user is not signed in and trying to access a protected route
  if (!userId && !isPublicRoute(request)) {
    const signInUrl = new URL('/sign-in', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // If user is signed in and on the home page, redirect to admin
  if (userId && request.nextUrl.pathname === '/') {
    const adminUrl = new URL('/admin', request.url)
    return NextResponse.redirect(adminUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
