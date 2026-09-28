export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-4 px-6">
      <p className="text-sm font-medium text-brand">SmartPoint</p>
      <h1 className="font-display text-3xl font-semibold">Fundação pronta.</h1>
      <p className="text-muted-foreground">
        Next.js, Tailwind, Biome, Vitest e CI configurados. As páginas da vitrine entram nas etapas
        4 a 6 — ver <code className="rounded-sm bg-muted px-1">docs/etapas.md</code>.
      </p>
    </main>
  )
}
