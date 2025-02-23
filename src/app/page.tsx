'use client'
export default function HomePage() {
  return (
    <div className="container mx-auto px-4">
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[var(--foreground)]">
            Welcome to Lanceraa
          </h1>
          <p className="text-[var(--muted-foreground)]">
          Connect with top freelancers in Nepal
          </p>
        </div>
      </main>
    </div>
  );
}
