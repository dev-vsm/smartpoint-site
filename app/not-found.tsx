import Link from "next/link"
import { ButtonLink } from "@/components/ui/button"
import { Container } from "@/components/ui/section"

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center">
      <Container className="max-w-xl">
        <p className="display text-6xl text-tag">404</p>
        <h1 className="mt-3 text-2xl">Essa página não existe</h1>
        <p className="mt-2 text-ink-soft">
          O link pode ter mudado ou o produto saiu da vitrine. Veja o que tem no balcão hoje.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/produtos" className="w-auto">
            Ver produtos
          </ButtonLink>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-sm font-semibold underline"
          >
            Voltar ao início
          </Link>
        </div>
      </Container>
    </main>
  )
}
