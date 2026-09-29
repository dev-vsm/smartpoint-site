import Link from "next/link"
import { Brand } from "@/components/layout/brand"

export interface FooterStore {
  name: string
  logoUrl?: string
  addressLine: string
  cityLine: string
  hours: Array<{ days: string; opens: string; closes: string }>
  instagram?: string
  cnpj?: string
}

/**
 * Rodapé com o que o cliente procura antes de sair: onde fica, quando abre e
 * como falar. Tudo vem de `settings/store`.
 */
export function Footer({ store }: { store: FooterStore }) {
  return (
    <footer className="mt-16 border-t border-line bg-brand-soft/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <Brand name={store.name} logoUrl={store.logoUrl} />
          <p className="mt-3 text-sm text-ink-soft">
            Acessórios para celular, no quiosque da {store.addressLine}.
          </p>
        </div>

        <div>
          <h2 className="text-sm">Onde estamos</h2>
          <address className="mt-2 text-sm not-italic text-ink-soft">
            {store.addressLine}
            <br />
            {store.cityLine}
          </address>
          {store.instagram && (
            <a
              href={store.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-brand-strong hover:underline"
            >
              Instagram
            </a>
          )}
        </div>

        <div>
          <h2 className="text-sm">Horário</h2>
          <dl className="mt-2 space-y-1 text-sm text-ink-soft">
            {store.hours.length === 0 && <dd>Consulte pelo WhatsApp.</dd>}
            {store.hours.map((slot) => (
              <div key={slot.days} className="flex justify-between gap-3">
                <dt>{slot.days}</dt>
                <dd className="tabular-nums">
                  {slot.opens} às {slot.closes}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-ink-soft">
          <p>
            {store.name}
            {store.cnpj && ` · CNPJ ${store.cnpj}`}
          </p>
          <Link href="/privacidade" className="hover:underline">
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
