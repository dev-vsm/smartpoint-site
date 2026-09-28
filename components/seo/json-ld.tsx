/**
 * Dados estruturados. O `<` vira `<` porque `JSON.stringify` não escapa
 * HTML — sem isso, um texto vindo do banco poderia fechar o `<script>`.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: única forma de emitir JSON-LD; o payload é nosso e vai escapado.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
