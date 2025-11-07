"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <nav className="bg-white dark:bg-black shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="text-2xl font-bold text-purple-600">
          Blogify
        </Link>

        {/* Center: Navigation Links */}
        <div className="flex items-center gap-6 text-gray-700 dark:text-gray-300 text-sm">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/blog">Blogs</NavLink>
            <NavLink href="/blog/create">New Post</NavLink>
          <NavLink href="/categories">Categories</NavLink>
          <NavLink href="/draft">Draft</NavLink>
        </div>

        {/* Right: Theme Toggle */}
        <Button
          aria-label="Toggle theme"
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="relative z-10 hover:bg-purple-100 dark:hover:bg-gray-800 transition"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 text-purple-600" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400" />
          )}
        </Button>
      </div>
    </nav>
  )
}

// Helper component for glowing hover link
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="relative group inline-flex">
      <span className="pointer-events-none absolute -inset-1 rounded-md blur-3xl bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-0 group-hover:opacity-30 transition-opacity" />
      <Link href={href} className="relative z-10 hover:text-purple-500 transition-colors px-2 py-1">
        {children}
      </Link>
    </div>
  )
}
