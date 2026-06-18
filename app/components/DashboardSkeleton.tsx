// LLM API Sentinel — Dashboard Skeleton (pure presentational)
// Static shimmer-only layout that mirrors the general dashboard structure.
// No hooks, no state, no interactivity — safe for Suspense fallback.
export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header shadow bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted/40 animate-pulse" />
              <div className="h-4 w-32 rounded-md bg-muted/40 animate-pulse" />
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="h-8 w-24 rounded-full bg-muted/40 animate-pulse" />
              <div className="h-9 w-9 rounded-lg bg-muted/40 animate-pulse" />
              <div className="h-9 w-28 rounded-lg bg-muted/40 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        {/* Hero shimmer */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative z-10 text-center">
            <div className="mx-auto mb-6 h-6 w-60 rounded-full bg-muted/40 animate-pulse" />
            <div className="mx-auto mb-6 h-12 md:h-16 w-[min(90%,720px)] rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-pulse" />
            <div className="mx-auto mb-12 h-5 w-[min(90%,640px)] rounded-md bg-muted/40 animate-pulse" />

            {/* 4 stat cards shimmer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-muted/40 animate-pulse" />
                    <div className="h-3 w-16 rounded-md bg-muted/40 animate-pulse" />
                  </div>
                  <div className="h-7 w-16 rounded-md bg-muted/40 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alert card placeholder */}
        <section className="-mt-4 mb-8">
          <div className="flex items-start gap-4 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/40 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded-md bg-muted/40 animate-pulse" />
              <div className="h-3 w-72 rounded-md bg-muted/40 animate-pulse" />
            </div>
            <div className="h-9 w-28 rounded-lg bg-muted/40 animate-pulse" />
          </div>
        </section>

        {/* Status card header shimmer */}
        <section className="py-8 md:py-12">
          <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col items-start gap-4 border-b border-border/30 p-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 rounded-md bg-muted/40 animate-pulse" />
                <div className="h-4 w-64 rounded-md bg-muted/40 animate-pulse" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-8 w-36 rounded-full bg-muted/40 animate-pulse" />
                <div className="h-9 w-28 rounded-lg bg-muted/40 animate-pulse" />
                <div className="h-9 w-32 rounded-lg bg-muted/40 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Status grid shimmer placeholder */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`sg-${i}`}
                className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-muted/40 animate-pulse" />
                    <div className="h-4 w-24 rounded-md bg-muted/40 animate-pulse" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-muted/40 animate-pulse" />
                </div>
                <div className="mt-4 h-3 w-32 rounded-md bg-muted/40 animate-pulse" />
                <div className="mt-2 h-3 w-24 rounded-md bg-muted/40 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Latency history card shimmer */}
        <section className="py-8 md:py-12">
          <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col items-start gap-4 border-b border-border/30 p-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 rounded-md bg-muted/40 animate-pulse" />
                <div className="h-4 w-60 rounded-md bg-muted/40 animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={`tb-${i}`} className="h-8 w-24 rounded-lg bg-muted/40 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6 flex flex-wrap gap-2 pb-6 border-b border-border/20">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`lb-${i}`} className="h-6 w-24 rounded-full bg-muted/40 animate-pulse" />
                ))}
              </div>
              <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Footer shimmer */}
        <footer className="border-t border-border/30 py-10">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <div className="mx-auto h-4 w-64 rounded-md bg-muted/40 animate-pulse" />
            <div className="mx-auto h-3 w-96 rounded-md bg-muted/40 animate-pulse" />
          </div>
        </footer>
      </main>
    </div>
  );
}
