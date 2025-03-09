"use client";

import Link from "next/link";
import { Sun, Moon, UserRoundPlus, Search, Bell, X } from "lucide-react";
import { useThemeContext } from "@/components/theme-provider";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "@/assets/images/logo.png"; // Import logo

export default function TopNavbar() {
  const { theme, toggleTheme } = useThemeContext();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const NavLinks = [
    { id: 1, title: "Home", href: "/" },
    { id: 2, title: "Freelancers", href: "/freelancers" },
    { id: 3, title: "Works", href: "/works" },
    { id: 4, title: "Profile", href: "/profile" },
  ];

  const getSearchPlaceholder = () => {
    switch (pathname) {
      case "/works":
        return "Search for works...";
      case "/freelancers":
        return "Search for freelancers...";
      default:
        return "Search Lanceraa...";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed w-full top-0 left-0 right-0 
        bg-[var(--background)]/80 backdrop-blur-md text-[var(--text)] 
        z-50 transition-all duration-300
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
        ${
          theme === "dark" ? "shadow-[0_2px_10px_rgba(0,0,0,0.3)]" : "shadow-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={Logo}
              alt="Lanceraa Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-bold text-xl text-[var(--text)] transition duration-300 hover:text-[var(--accent)]">
              Lanceraa
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
            {NavLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-[var(--text)] hover:text-[var(--accent)] px-3 py-2 rounded-md 
                  transition-all duration-300 transform hover:scale-105"
              >
                {link.title}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-2xl mx-4 relative">
            {isSearchOpen ? (
              <div className="absolute inset-0 flex items-center">
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  className="w-full px-4 py-2 rounded-full bg-[var(--background)] border border-[var(--accent)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 text-[var(--text)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full
                  hover:bg-[var(--accent)]/10 text-[var(--text)]"
              >
                <Search className="h-5 w-5" />
                <span className="text-sm">{getSearchPlaceholder()}</span>
              </button>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-[var(--accent)]/10 text-[var(--text)] 
                transition-all duration-300 transform hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  className="p-2 rounded-full hover:bg-[var(--accent)]/10 text-[var(--text)]"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                </button>
                <Link href="/profile">
                  <div
                    className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white"
                    title={user.fullName || user.username}
                  >
                    {getInitials(user.fullName || user.username)}
                  </div>
                </Link>
              </div>
            ) : (
              <Link href="/signup">
                <button
                  className="flex items-center space-x-2 bg-[var(--accent)] text-[var(--text)] 
                    px-3.5 py-1.5 rounded-md transition-all duration-300 transform hover:scale-105
                    hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]"
                >
                  <span className="hidden sm:inline">Sign up</span>
                  <UserRoundPlus className="h-5 w-5" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
