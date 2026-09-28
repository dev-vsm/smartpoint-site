@AGENTS.md

# CLAUDE.md — SmartPoint Site

Site público da SmartPoint (acessórios de celular e assistência técnica, Uberlândia/MG).
O plano vive em `docs/design-doc.md`; o andamento, em `docs/etapas.md`. **Leia os dois antes
de propor mudanças de escopo.**

## Acordo de trabalho

- **Diferencie pergunta de ordem:** só altere código quando for pedido explicitamente.
- **Responda no idioma da pergunta** (o projeto é em português).
- Mantenha os commits pequenos e focados. Não troque o gerenciador de pacotes.
- Este é o **Next.js 16**: consulte `node_modules/next/dist/docs/` antes de usar API que você
  acha que conhece (ver `AGENTS.md`).

## Comandos

```bash
pnpm dev         # http://localhost:3000
pnpm build       # build de produção
pnpm lint        # Biome (app/, components/, lib/, __tests__/)
pnpm lint:fix    # Biome com correção
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest (watch)
pnpm test:run    # Vitest uma vez
pnpm check       # lint + typecheck + testes
```

**Portão de qualidade após qualquer mudança:** `pnpm check` e `pnpm build`.

## Arquitetura

- **Next.js 16 (App Router)** + **Tailwind 4** + **Firebase (só leitura)** + deploy na Vercel.
- **O site não escreve em lugar nenhum.** Sem rota de API na v1: o catálogo é lido no
  servidor e todo CTA leva ao WhatsApp.
- **Leitura via Admin SDK em componentes de servidor**, com ISR (`revalidate`). Credencial
  só em variável de ambiente — nunca `NEXT_PUBLIC_*`, nunca no cliente.
- Pastas: `app/` (rotas), `components/ui` (base), `components/layout` (cabeçalho, rodapé),
  `lib/` (dados e utilitários), `__tests__/` espelhando `lib/`.

## Fonte dos dados

| Dado | Origem | Observação |
|---|---|---|
| Produtos | `Products` + `productVariants` | Só aparece com `isActive !== false` **e** `site.published === true` |
| Loja (endereço, telefone, WhatsApp, horário, redes) | `settings/store` | Mesmo documento que o admin edita em `/loja` |
| Marca (logo, ícone, og:image, cor) | `settings/store.brand` | URLs no Storage; **nunca** arquivo de logo no repositório |
| Conteúdo editorial (hero, banners, destaques) | `siteContent/*` | Tela nova no admin |

Nada de endereço, telefone, horário ou logo escritos no código — apenas fallbacks mínimos
para quando o documento não existir.

## Convenções

- **Dinheiro em centavos** (inteiros), como no admin. Formate na borda da UI.
- **Raio:** `rounded-sm` para controles e `rounded-md` para cards/painéis; `rounded-full`
  só para o que é círculo/pílula por natureza.
- **Cor:** use os tokens do `app/globals.css` (`brand`, `muted`, `border`…). O **verde do
  WhatsApp é exclusivo dos CTAs de conversão** — não use como cor decorativa.
- Componentes de servidor por padrão; `'use client'` só com interação real.
- Imagens sempre pelo `next/image`, com `sizes` correto; `priority` só no LCP.
- Acessibilidade: contraste AA, foco visível, `alt` em toda imagem, navegação por teclado.
- Commits convencionais: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.

## Orçamento de performance

Home com **menos de 250 KB de JS**; Lighthouse ≥ 95 em Performance, SEO e Acessibilidade
(mobile). Se um componente novo estourar isso, ele precisa virar servidor ou sair.
