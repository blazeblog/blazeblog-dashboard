// "use client"

// import { useState } from "react"
// import { ThemeProvider } from "./components/theme-provider"
// import Dashboard from "./pages/dashboard"
// import PostsMain from "./pages/posts-main"
// import Categories from "./pages/categories"
// import Users from "./pages/users"

// type Page = "dashboard" | "posts" | "categories" | "users"

// export default function CompleteDemo() {
//   const [currentPage, setCurrentPage] = useState<Page>("posts")

//   const renderPage = () => {
//     switch (currentPage) {
//       case "dashboard":
//         return <Dashboard />
//       case "posts":
//         return <PostsMain />
//       case "categories":
//         return <Categories />
//       case "users":
//         return <Users />
//       default:
//         return <PostsMain />
//     }
//   }

//   return (
//     <ThemeProvider defaultTheme="system" storageKey="admin-ui-theme">
//       <div className="min-h-screen bg-background">
//         {/* Navigation Demo */}
//         <div className="fixed top-4 right-4 z-50 flex gap-2">
//           <button
//             onClick={() => setCurrentPage("dashboard")}
//             className={`px-3 py-1 rounded text-sm ${
//               currentPage === "dashboard" ? "bg-primary text-primary-foreground" : "bg-muted"
//             }`}
//           >
//             Dashboard
//           </button>
//           <button
//             onClick={() => setCurrentPage("posts")}
//             className={`px-3 py-1 rounded text-sm ${
//               currentPage === "posts" ? "bg-primary text-primary-foreground" : "bg-muted"
//             }`}
//           >
//             Posts
//           </button>
//           <button
//             onClick={() => setCurrentPage("categories")}
//             className={`px-3 py-1 rounded text-sm ${
//               currentPage === "categories" ? "bg-primary text-primary-foreground" : "bg-muted"
//             }`}
//           >
//             Categories
//           </button>
//           <button
//             onClick={() => setCurrentPage("users")}
//             className={`px-3 py-1 rounded text-sm ${
//               currentPage === "users" ? "bg-primary text-primary-foreground" : "bg-muted"
//             }`}
//           >
//             Users
//           </button>
//         </div>
//         {renderPage()}
//       </div>
//     </ThemeProvider>
//   )
// }
