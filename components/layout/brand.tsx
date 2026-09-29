import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * A marca vem do banco (`settings/store.brand`). Sem logo cadastrada, o nome é
 * desenhado com a própria tipografia do site — nunca fica um buraco na página.
 */
export function Brand({
  name,
  logoUrl,
  className,
}: {
  name: string
  logoUrl?: string
  className?: string
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={160}
        height={40}
        priority
        className={cn("h-8 w-auto", className)}
      />
    )
  }
  return (
    <span className={cn("display text-xl text-brand-strong", className)}>
      {name}
      <span className="text-tag">.</span>
    </span>
  )
}
