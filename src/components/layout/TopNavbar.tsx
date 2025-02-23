'use client'

import Link from "next/link";
import { Sun, Moon, UserRoundPlus } from "lucide-react";
import { useThemeContext } from "@/components/theme-provider";

export default function TopNavbar() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[var(--background)] text-[var(--text)] shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl text-[var(--text)]">
            Lanceraa
          </Link>

          {/* Center Navigation Links */}
          <div className="flex-1 flex justify-center items-center space-x-8">
            <Link
              href="/"
              className="text-[var(--text)] hover:text-[var(--accent)] px-3 py-2 rounded-md transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/freelancers"
              className="text-[var(--text)] hover:text-[var(--accent)] px-3 py-2 rounded-md transition-colors duration-200"
            >
              Freelancers
            </Link>
            <Link
              href="/works"
              className="text-[var(--text)] hover:text-[var(--accent)] px-3 py-2 rounded-md transition-colors duration-200"
            >
              Works
            </Link>
            <Link
              href="/profile"
              className="text-[var(--text)] hover:text-[var(--accent)] px-3 py-2 rounded-md transition-colors duration-200"
            >
              Profile
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-[gray] text-[var(--text)] transition-colors duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              className="flex items-center space-x-2 bg-[var(--accent)] text-[var(--text)] 
              px-3.5 py-1.5 rounded-md transition-all duration-300 ease-in-out scale-95
              hover:shadow-[0_0_15px_rgba(109,136,213,0.5)] 
              dark:hover:shadow-[0_0_15px_rgba(42,70,146,0.5)]
              hover:scale-100 transform origin-center"
            >
              <span>Sign up</span>
              <UserRoundPlus className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}