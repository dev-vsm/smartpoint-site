import Image from "next/image"
import { OpenNow } from "@/components/layout/open-now"
import type { SiteStore } from "@/lib/store"

/**
 * "A loja existe": fotos (quando cadastradas), endereço com rota, horário e o
 * "aberto agora". Para comprar de loja local pela internet, é o que mais pesa.
 */
export function VisitStore({ store, className }: { store: SiteStore; className?: string }) {
  if (!store.addressLine && store.photos.length === 0) return null

  return (
    <section aria-labelledby="visite" className={className}>
      <h2 id="visite" className="mb-5 text-2xl">
        Venha conhecer a loja
      </h2>
      <div className="grid gap-6 rounded-md bg-paper p-5 ring-1 ring-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-3 text-sm">
          {store.addressLine && (
            <address className="not-italic">
              <span className="block font-semibold text-ink">{store.addressLine}</span>
              <span className="block text-ink-soft">
                {store.cityLine}
                {store.postalCode && ` · CEP ${store.postalCode}`}
              </span>
            </address>
          )}
          <OpenNow hours={store.hours} />
          {store.hours.length > 0 && (
            <dl className="space-y-1 text-ink-soft">
              {store.hours.map((slot) => (
                <div key={slot.days} className="flex justify-between gap-3 sm:max-w-xs">
                  <dt>{slot.days}</dt>
                  <dd className="tabular-nums">
                    {slot.opens} às {slot.closes}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {store.map && (
            <a
              href={store.map.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-sm border border-brand-strong px-4 font-semibold text-brand-strong hover:bg-brand-soft"
            >
              Como chegar
            </a>
          )}
        </div>

        {store.photos.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2">
            {store.photos.slice(0, 4).map((photo, index) => (
              <li
                key={photo.url}
                className="relative aspect-[4/3] overflow-hidden rounded-md bg-shelf"
              >
                <Image
                  src={photo.url}
                  alt={photo.alt ?? `Foto ${index + 1} da loja ${store.name}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        ) : (
          store.map && (
            <iframe
              title={`Mapa: ${store.name}`}
              src={store.map.embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-56 w-full rounded-md ring-1 ring-line"
            />
          )
        )}
      </div>
    </section>
  )
}
