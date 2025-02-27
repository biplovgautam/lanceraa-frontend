import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import "@/styles/globals.css";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import TopNavbar from "@/components/layout/TopNavbar";
import BottomNavbar from "@/components/layout/BottomNavbar";
import { AuthProvider } from "@/context/auth-context";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Lazy load components
const Footer = dynamic(() => import("@/components/layout/Footer"), {
  loading: () => <div className="h-16 bg-[var(--secondary)] animate-pulse" />,
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lanceraa - Freelance Platform",
    template: "%s | Lanceraa",
  },
  description: "Connect with top freelancers in Nepal",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextThemesProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
        >
          <ThemeProvider>
            <AuthProvider>
              <AuthGuard>
                <Suspense
                  fallback={
                    <div className="h-16 bg-[var(--navbar)] animate-pulse" />
                  }
                >
                  <TopNavbar />
                </Suspense>
                <main className="pt-16 pb-16 md:pb-0 min-h-screen">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-screen">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary)]" />
                      </div>
                    }
                  >
                    {children}
                  </Suspense>
                </main>
                <Suspense
                  fallback={
                    <div className="h-16 bg-[var(--secondary)] animate-pulse" />
                  }
                >
                  <Footer />
                </Suspense>
                <BottomNavbar />
              </AuthGuard>
            </AuthProvider>
          </ThemeProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
