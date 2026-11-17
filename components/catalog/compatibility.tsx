/**
 * "Serve no meu celular?": o modelo em destaque e, ao abrir, como descobrir o modelo do
 * aparelho. É a maior dúvida antes de comprar capinha e película — e a maior causa de troca.
 * Só aparece quando o produto tem a característica de modelo/compatibilidade.
 */
export function Compatibility({ model }: { model: string }) {
  return (
    <div className="rounded-md bg-brand-soft p-3 ring-1 ring-brand/30">
      <p className="flex items-center gap-2 text-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-brand-strong"
        >
          <rect x="6" y="2" width="12" height="20" rx="2" />
          <path d="m9.5 12 2 2 3.5-4" />
        </svg>
        <span>
          Compatível com <strong className="text-ink">{model}</strong>
        </span>
      </p>
      <details className="group mt-1 pl-7 text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-brand-strong underline">
          Não sabe o modelo do seu celular?
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
          <li>
            <strong className="text-ink">iPhone:</strong> Ajustes › Geral › Sobre › Nome do Modelo.
          </li>
          <li>
            <strong className="text-ink">Android:</strong> Configurações › Sobre o telefone › Nome
            do modelo (ou Modelo).
          </li>
          <li>
            Na dúvida, chame no WhatsApp com uma foto da traseira do celular que a gente confirma.
          </li>
        </ul>
      </details>
    </div>
  )
}
