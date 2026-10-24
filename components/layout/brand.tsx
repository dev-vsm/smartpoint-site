import Image from "next/image"
import { cn, isSvgUrl } from "@/lib/utils"

/**
 * A marca vem do banco (`settings/store.brand`). Sem logo cadastrada, o nome é
 * desenhado com a própria tipografia do site — nunca fica um buraco na página.
 * Os dois ocupam o mesmo espaço: quem define o tamanho é quem chama.
 */
export function Brand({
  name,
  logoUrl,
  className,
  priority = false,
}: {
  name: string
  logoUrl?: string
  className?: string
  /** Só quando a logo é a maior imagem da abertura da página. */
  priority?: boolean
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={160}
        height={40}
        priority={priority}
        // O otimizador do Next recusa SVG; vetor não precisa dele e, dentro de <img>, não roda script.
        unoptimized={isSvgUrl(logoUrl)}
        className={cn("max-h-full w-auto max-w-full object-contain object-left", className)}
      />
    )
  }
  return (
    <span className={cn("display truncate text-xl text-brand-strong", className)}>
      {name}
      <span className="text-tag">.</span>
    </span>
  )
}
