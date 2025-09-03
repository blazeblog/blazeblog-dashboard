"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth, useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react"
import { useClientApi } from "@/lib/client-api"

interface AcceptInviteState {
  status: 'loading' | 'success' | 'error' | 'expired' | 'already-accepted'
  message: string
  details?: string
}

export default function AcceptInvitePage() {
  const params = useParams()
  const router = useRouter()
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const api = useClientApi()
  const token = params.token as string

  const [state, setState] = useState<AcceptInviteState>({
    status: 'loading',
    message: 'Processing your invitation...'
  })

  useEffect(() => {
    if (!token) {
      setState({
        status: 'error',
        message: 'Invalid invitation link',
        details: 'The invitation token is missing or invalid.'
      })
      return
    }

    // Always proceed with accepting invitation - backend will handle user creation/linking
    acceptInvitation()
  }, [token])

  const acceptInvitation = async () => {
    if (!token) return

    try {
      setState({
        status: 'loading',
        message: 'Accepting your invitation...'
      })

      // Make public API call to accept invitation
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/invitations/accept/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorization: isSignedIn && user ? await getToken() : '',
          username: user?.username || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const result = await response.json()

      setState({
        status: 'success',
        message: 'Welcome to the team!',
        details: isSignedIn 
          ? 'Your invitation has been accepted successfully. You now have access to the admin dashboard.'
          : 'Your invitation has been accepted! Please sign in to access the admin dashboard.'
      })

      // Redirect appropriately after 3 seconds
      setTimeout(() => {
        if (isSignedIn) {
          router.push('/admin')
        } else {
          router.push('/sign-in')
        }
      }, 3000)

    } catch (error) {
      console.error('Error accepting invitation:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept invitation'
      
      if (errorMessage.includes('expired')) {
        setState({
          status: 'expired',
          message: 'Invitation has expired',
          details: 'This invitation link has expired. Please request a new invitation from your administrator.'
        })
      } else if (errorMessage.includes('already accepted') || errorMessage.includes('already used')) {
        setState({
          status: 'already-accepted',
          message: 'Invitation already used',
          details: 'This invitation has already been accepted. If you need access, please contact your administrator.'
        })
      } else {
        setState({
          status: 'error',
          message: 'Unable to accept invitation',
          details: errorMessage
        })
      }
    }
  }

  const getIcon = () => {
    switch (state.status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-400" />
      case 'expired':
      case 'already-accepted':
      case 'error':
        return <XCircle className="h-12 w-12 text-gray-400" />
      default:
        return <Mail className="h-12 w-12 text-gray-400" />
    }
  }

  const getBackgroundGradient = () => {
    return 'bg-black'
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border border-white/10 backdrop-blur-xl bg-black">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {state.message}
          </CardTitle>
          {state.details && (
            <CardDescription className="text-base mt-2 text-white/70">
              {state.details}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {state.status === 'success' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  {isSignedIn 
                    ? 'Redirecting to admin dashboard in a few seconds...'
                    : 'Redirecting to sign in page in a few seconds...'
                  }
                </p>
              </div>
              <Button 
                onClick={() => router.push(isSignedIn ? '/admin' : '/sign-in')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSignedIn ? 'Go to Dashboard' : 'Sign In to Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {state.status === 'error' && (
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          )}

          {(state.status === 'expired' || state.status === 'already-accepted') && (
            <Button 
              onClick={() => router.push('/admin')}
              variant="outline"
              className="w-full"
            >
              Go to Dashboard
            </Button>
          )}

          {state.status === 'loading' && (
            <div className="py-4">
              <div className="animate-pulse text-sm text-muted-foreground">
                This may take a few moments...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}