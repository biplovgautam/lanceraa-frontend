'use client'

import Link from "next/link";
import { Home, Briefcase, Plus, UsersRound, UserRound } from "lucide-react";
import { usePathname } from 'next/navigation';

export default function BottomNavbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-transparent">
      {/* Curved Background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[var(--background)]/80 backdrop-blur-md
        shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]
        before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
        before:w-20 before:h-20 before:bg-[var(--background)]/80 before:rounded-full before:backdrop-blur-md" />

      <div className="relative h-16 grid grid-cols-5 items-center">
        <Link href="/" className="flex flex-col items-center justify-center w-full">
          <Home
            className={`h-6 w-6 ${isActive('/') ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}
          />
          <span className={`text-xs mt-1 ${isActive('/') ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
            Home
          </span>
        </Link>

        <Link href="/works" className="flex flex-col items-center justify-center w-full">
          <Briefcase
            className={`h-6 w-6 ${isActive('/works') ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}
          />
          <span className={`text-xs mt-1 ${isActive('/works') ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
            Works
          </span>
        </Link>

        <button className="flex flex-col items-center justify-center w-full -mt-8">
          <div className="bg-[var(--accent)] p-4 rounded-full shadow-lg relative z-10">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs mt-1 text-[var(--text)]">Post</span>
        </button>

        <Link href="/freelancers" className="flex flex-col items-center justify-center w-full">
          <UsersRound
            className={`h-6 w-6 ${isActive('/freelancers') ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}
          />
          <span className={`text-xs mt-1 ${isActive('/freelancers') ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
            Lancers
          </span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center justify-center w-full">
          <UserRound
            className={`h-6 w-6 ${isActive('/profile') ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}
          />
          <span className={`text-xs mt-1 ${isActive('/profile') ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
}