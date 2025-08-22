"use client"

import { useUser } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  Hash,
  Settings,
  BarChart3,
  MessageSquare,
  Shield,
  ChevronRight,
  Globe,
  MessageCircle,
  Palette,
  Mail,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getImageUrl } from "@/lib/image-utils"

interface SubmenuItem {
  title: string
  url: string
}

interface NavigationItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  submenu?: SubmenuItem[]
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

const navigation: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
      },
      // {
      //   title: "Analytics",
      //   url: "/admin/analytics",
      //   icon: BarChart3,
      //   badge: "New",
      // },
    ],
  },
  {
    title: "Content Management",
    items: [
      {
        title: "Posts",
        url: "/admin/posts",
        icon: FileText,
        submenu: [
          { title: "All Posts", url: "/admin/posts" },
          { title: "Add New", url: "/admin/posts/add" },
        ],
      },
      {
        title: "Categories",
        url: "/admin/categories",
        icon: FolderOpen,
        submenu: [
          { title: "All Categories", url: "/admin/categories" },
          { title: "Add New", url: "/admin/categories/add" },
        ],
      },
      {
        title: "Tags",
        url: "/admin/tags",
        icon: Hash,
          submenu: [
          { title: "All Tags", url: "/admin/tags" },
          { title: "Add New", url: "/admin/tags/add" },
        ],
      },
      {
        title: "Comments",
        url: "/admin/comments",
        icon: MessageCircle,
        submenu: [
          { title: "All Comments", url: "/admin/comments" },
          { title: "Pending Approval", url: "/admin/comments?status=pending" },
        ],
      },
      {
        title: "Lead Forms",
        url: "/admin/forms",
        icon: MessageSquare,
        badge: "Beta",
      },
      {
        title: "Newsletter",
        url: "/admin/newsletter",
        icon: Mail,
        submenu: [
          { title: "Subscribers", url: "/admin/newsletter" },
        ],
      },
    ],
  },
  {
    title: "User Management",
    items: [
      {
        title: "Users",
        url: "/admin/users",
        icon: Users,
      },
      // {
      //   title: "Roles & Permissions",
      //   url: "/admin/roles",
      //   icon: Shield,
      // },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Themes",
        url: "/admin/themes",
        icon: Palette,
      },
      {
        title: "Site Settings",
        url: "/admin/settings",
        icon: Settings,
      },
      {
        title: "Custom Domain",
        url: "/admin/custom-domain",
        icon: Globe,
      },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Blazeblog</span>
                  <span className="truncate text-xs">CMS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.url || pathname.startsWith(item.url + "/")

                  if (item.submenu) {
                    return (
                      <Collapsible key={item.title} asChild defaultOpen={isActive}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                              <item.icon className="size-4" />
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.submenu.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton tooltip={item.title} isActive={isActive} asChild>
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getImageUrl(user?.imageUrl) || "/placeholder.svg"} alt={user?.firstName || "User"} />
                  <AvatarFallback>
                    {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.emailAddresses[0]?.emailAddress || "User"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
