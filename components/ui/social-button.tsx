import { SOCIAL_BUTTON, SocialIcon } from "@/components/ui/social-icon"
import type { SocialLink } from "@/lib/store-rules"
import { cn } from "@/lib/utils"

/**
 * Botão de rede social com a cor e o símbolo do app oficial (Instagram em
 * degradê, Facebook azul…). Único no projeto: banner da loja, /contato e onde
 * mais houver rede social como botão usam este componente.
 */
export function SocialButton({
  link,
  text,
  className,
}: {
  link: SocialLink
  /** Texto do botão; por padrão o nome da rede ("Instagram"). */
  text?: string
  className?: string
}) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Seguir a loja no ${link.label} (abre em nova aba)`}
      className={cn(
        "inline-flex h-11 min-w-0 items-center gap-2 rounded-sm px-3 text-xs font-bold shadow-sm transition sm:px-4 sm:text-sm",
        SOCIAL_BUTTON[link.network],
        className,
      )}
    >
      <SocialIcon network={link.network} />
      <span className="truncate">{text ?? link.label}</span>
    </a>
  )
}
