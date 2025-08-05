import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, BarChart3, Settings } from "lucide-react"

export default function HomePage() {
  const { userId } = auth()

  // If user is signed in, redirect to admin dashboard
  if (userId) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Admin Panel</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A modern, secure admin dashboard built with Next.js, Clerk authentication, and shadcn/ui components.
          </p>
          <div className="flex gap-4 justify-center">
            <SignInButton mode="modal">
              <Button size="lg">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline" size="lg">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Secure Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Enterprise-grade security with Clerk authentication system</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Complete user management with roles and permissions</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Real-time analytics and reporting with interactive charts</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Settings className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Easy Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Intuitive settings and configuration management</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground">Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui</p>
        </div>
      </div>
    </div>
  )
}
