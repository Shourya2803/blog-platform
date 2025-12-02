"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, X } from "lucide-react"
import { useEffect, useState, memo } from "react"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // track whether we're on a mobile viewport (client-side guard)
  const [isMobile, setIsMobile] = useState(false)

  // close the mobile menu if the viewport is resized to >= md
  useEffect(() => {
    const onResize = () => {
      try {
        const mobile = window.innerWidth < 768
        setIsMobile(mobile)
        if (!mobile) setMenuOpen(false)
      } catch {
        // ignore SSR errors
      }
    }
    window.addEventListener("resize", onResize)
    onResize()
    return () => window.removeEventListener("resize", onResize)
  }, [])

  

  // close menu on escape + lock body scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    if (menuOpen) {
      document.addEventListener("keydown", onKey)
      document.documentElement.style.overflow = "hidden"
    } else {
      document.documentElement.style.overflow = ""
    }
    return () => {
      document.removeEventListener("keydown", onKey)
      document.documentElement.style.overflow = ""
    }
  }, [menuOpen])

  if (!mounted) return null

  const navBgClass = isMobile && menuOpen ? 'bg-white dark:bg-black' : 'bg-white dark:bg-zinc-900'

  return (
    <nav className={`${navBgClass} shadow-sm`}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-2 sm:py-2 md:py-3 lg:py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-600 hover:scale-105 transition-transform"
          >
            Blogify
          </Link>
        </div>

        {/* Center: Navigation Links (render only on non-mobile to guard against missing Tailwind responsive CSS) */}
        {!isMobile && (
          <div className="hidden md:flex items-center gap-4 md:gap-6 lg:gap-8 text-gray-700 dark:text-gray-300 text-sm md:text-base lg:text-lg">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/blog">Blogs</NavLink>
            <NavLink href="/blog/create">New Post</NavLink>
            <NavLink href="/drafts">Draft</NavLink>
          </div>
        )}

        {/* Right: Menu + Theme Toggle */}
  <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          {/* Mobile menu button (render only on mobile) */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen((s) => !s)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="p-1 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          {/* Theme Toggle */}
          <Button
            aria-label="Toggle theme"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="relative z-10 hover:bg-purple-100 dark:hover:bg-gray-800 transition"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-purple-600" />
            ) : (
              <Sun className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-yellow-400" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu panel: only render DOM when open so no extra area/border shows when closed */}
      {isMobile && menuOpen && (
        <div
          id="mobile-menu"
          className="transition-all duration-200 ease-in-out overflow-hidden max-h-64 opacity-100 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black"
          aria-hidden={!menuOpen}
        >
          <div className="px-3 py-2 space-y-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
                className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm"
            >
              Home
            </Link>
            <Link
              href="/blog"
              onClick={() => setMenuOpen(false)}
                className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm"
            >
              Blogs
            </Link>
            <Link
              href="/blog/create"
              onClick={() => setMenuOpen(false)}
                className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm"
            >
              New Post
            </Link>
            <Link
              href="/drafts"
              onClick={() => setMenuOpen(false)}
                className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm"
            >
              Draft
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// Helper component for glowing hover link + active highlight
const NavLink = memo(function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <div className="relative group inline-flex">
  <span className="pointer-events-none absolute -inset-1 rounded-md blur-3xl bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-0 group-hover:opacity-30 transition-opacity" />
      <Link
        href={href}
        className={`relative z-10 px-2 py-1 transition-colors ${
          isActive
            ? "text-purple-600 font-semibold"
            : "hover:text-purple-500 text-gray-700 dark:text-gray-300"
        }`}
      >
        {children}
      </Link>
    </div>
  )
})
