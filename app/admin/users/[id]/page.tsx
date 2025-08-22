"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useClientApi } from "@/lib/client-api"
import type { User } from "@/lib/client-api"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Calendar, Clock, User as UserIcon, Mail, AlertTriangle } from "lucide-react"
import { LoadingState } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"
import { getImageUrl } from "@/lib/image-utils"

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const api = useClientApi()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    avatar: ''
  })

  const userId = params.id as string

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get<User>(`/users/${userId}`)
      setUser(response)
      setFormData({
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        username: response.username || '',
        bio: response.bio || '',
        avatar: response.avatar || ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
    } finally {
      setLoading(false)
    }
  }

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.firstName) return user.firstName
    if (user.lastName) return user.lastName
    return user.username
  }

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`
    }
    if (user.firstName) return user.firstName[0].toUpperCase()
    if (user.lastName) return user.lastName[0].toUpperCase()
    return user.username[0]?.toUpperCase() || 'U'
  }

  const handleSave = async () => {
    if (!user) return
    
    try {
      setSaving(true)
      const updateData = {
        firstName: formData.firstName.trim() || null,
        lastName: formData.lastName.trim() || null,
        username: formData.username.trim() || null,
        bio: formData.bio.trim() || null,
        avatar: formData.avatar.trim() || null
      }
      
      const updatedUser = await api.patch<User>(`/users/${user.id}`, updateData)
      setUser(updatedUser)
      // Show success feedback
      alert('User updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      alert('Failed to update user: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDeleteUser = async () => {
    if (!user) return
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      try {
        await api.delete(`/users/${user.id}`)
        router.push('/admin/users')
      } catch (err) {
        alert('Failed to delete user')
      }
    }
  }

  const handleSendEmail = () => {
    if (user?.email) {
      window.open(`mailto:${user.email}`, '_blank')
    }
  }

  if (loading) return <LoadingState message="Loading User Details" />
  if (error) return <ErrorState message={error} onRetry={fetchUser} />
  if (!user) return <ErrorState message="User not found" />

  return (
    <AdminLayout title={`User: ${getUserDisplayName(user)}`}>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
            <p className="text-muted-foreground">
              Manage user information for {getUserDisplayName(user)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            {/* <Button variant="outline" onClick={handleSendEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button> */}
          </div>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              Edit user profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {formData.avatar ? (
                  <AvatarImage src={getImageUrl(formData.avatar)} alt="Avatar" />
                ) : null}
                <AvatarFallback className="text-lg">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{getUserDisplayName(user)}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">@{user.username}</Badge>
                </div>
                <div className="mt-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar}
                    onChange={(e) => handleInputChange('avatar', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="username">Username</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertTriangle className="h-4 w-4 text-amber-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-semibold text-amber-600">⚠️ Important Warning</p>
                          <p className="text-sm mt-1">
                            Changing the username will affect all author page links and URLs 
                            where this user is referenced. This may break existing bookmarks 
                            and SEO rankings for author pages.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username (affects author page URLs)"
                    className={formData.username !== user.username ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : ""}
                  />
                  {formData.username !== user.username && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Username change detected - author page URLs will be affected
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email (Read Only)</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="createdAt">Account Created</Label>
                  <Input
                    value={`${new Date(user.createdAt).toLocaleString()} (${formatDistanceToNow(new Date(user.createdAt))} ago)`}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="updatedAt">Last Updated</Label>
                  <Input
                    value={`${new Date(user.updatedAt).toLocaleString()} (${formatDistanceToNow(new Date(user.updatedAt))} ago)`}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Enter user bio"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}