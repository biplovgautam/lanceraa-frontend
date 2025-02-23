'use client'

import { useThemeContext } from "@/components/theme-provider";

export default function Footer() {
  const { theme } = useThemeContext();

  return (
    <footer className="bg-[var(--secondary)] text-[var(--secondary-foreground)]">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-2">
          <p className="text-center">
            © {new Date().getFullYear()} Lanceraa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}