"use client"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/section"

// O Next exige o default export; o nome interno evita sombrear o `Error` global.
export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center">
      <Container className="max-w-xl">
        <h1 className="text-2xl">Deu ruim aqui do nosso lado</h1>
        <p className="mt-2 text-ink-soft">
          A página não carregou. Tente de novo — se continuar, fale com a gente pelo WhatsApp que
          resolvemos por lá.
        </p>
        <Button className="mt-6 w-auto" onClick={reset}>
          Tentar de novo
        </Button>
      </Container>
    </main>
  )
}
