'use client'

import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function TopNavbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[var(--navbar)] text-[var(--navbar-foreground)] shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="font-bold text-xl text-[var(--navbar-foreground)]">
            Lanceraa
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-[var(--navbar-foreground)] hover:text-[var(--muted-foreground)] px-3 py-2 rounded-md"
            >
              Home
            </Link>
            <Link
              href="/profile"
              className="text-[var(--navbar-foreground)] hover:text-[var(--muted-foreground)] px-3 py-2 rounded-md"
            >
              Profile
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-[var(--accent)] text-[var(--navbar-foreground)]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}