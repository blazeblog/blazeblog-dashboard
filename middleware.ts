import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/api/webhooks/clerk"],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/webhooks/clerk"],
  // Protect all admin routes
  afterAuth(auth, req, evt) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return Response.redirect(new URL("/sign-in", req.url))
    }

    // If the user is logged in and trying to access a protected route, allow them to access route
    if (auth.userId && !auth.isPublicRoute) {
      return
    }

    // Allow users visiting public routes to access them
    return
  },
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
