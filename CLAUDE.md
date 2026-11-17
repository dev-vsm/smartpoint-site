@AGENTS.md

# CLAUDE.md — SmartPoint Site

Site público da SmartPoint — **vitrine de acessórios de celular**, Uberlândia/MG.
Os consertos saíram daqui (decisão D14) e terão site próprio: não volte a adicionar
serviço, reparo ou orçamento a este repositório sem o usuário pedir.
O plano vive em `docs/design-doc.md`; o andamento, em `docs/etapas.md`. **Leia os dois antes
de propor mudanças de escopo.**

## Acordo de trabalho

- **Diferencie pergunta de ordem:** só altere código quando for pedido explicitamente.
- **Responda no idioma da pergunta** (o projeto é em português).
- Mantenha os commits pequenos e focados. Não troque o gerenciador de pacotes.
- **Variáveis de ambiente:** toda variável nova, renomeada, removida ou com uso alterado atualiza
  a tabela "Variáveis de ambiente" do `README.md` (NOME, VALOR_EXEMPLO, DESCRICAO) no mesmo
  commit. Valor de exemplo nunca é segredo real.
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
- **O site não escreve no Firestore.** O catálogo é lido no servidor. As rotas de API são
  `POST /api/checkout` e `POST /api/delivery-quote` (prévia do frete) (decisão D15): ela repassa a compra ao **admin**
  (`/api/site/checkout`, segredo `SITE_CHECKOUT_SECRET`), que cria o pedido, reserva o estoque
  e gera o link do **Checkout Pro do Mercado Pago**. Preço, estoque e taxa de entrega são
  sempre conferidos lá; o site só mostra a prévia. Encomenda e esgotado seguem no WhatsApp.
- **Carrinho no navegador** (`lib/cart-store.ts`, `localStorage`); `/pedido/[id]` é a volta do
  Mercado Pago e consulta o estado no admin. Sem `ADMIN_API_URL` + `SITE_CHECKOUT_SECRET`, a
  compra online some e o carrinho manda o pedido pelo WhatsApp.
- **Leitura via Admin SDK em componentes de servidor**, com ISR (`revalidate`). Credencial
  só em variável de ambiente — nunca `NEXT_PUBLIC_*`, nunca no cliente.
- Pastas: `app/` (rotas), `components/ui` (base), `components/layout` (cabeçalho, rodapé),
  `lib/` (dados e utilitários), `__tests__/` espelhando `lib/`.

## Fonte dos dados

| Dado | Origem | Observação |
|---|---|---|
| Produtos | `Products` (documento único: preço, estoque, SKU e características no produto; `productVariants` não existe mais) | Só aparece com `isActive !== false` **e** `site.published === true` |
| Loja (endereço, telefone, WhatsApp, horário, redes) | `settings/store` | Mesmo documento que o admin edita em `/loja` |
| Marca (logo, ícone, og:image, cor) | `settings/store.brand` | URLs no Storage; **nunca** arquivo de logo no repositório |
| Conteúdo editorial (hero, banners, destaques) | `siteContent/*` | Tela nova no admin; sem serviços |
| Avisos do cabeçalho (entrega, pagamento, promoção) | `siteContent/notices` | Faixa no topo; `tone: promo` pinta de laranja |
| Retirada e faixas de frete por km | `settings/store.delivery` | Admin em `/loja/site`. O frete vem sempre do admin (`POST /api/delivery-quote` → Google Maps, rota de carro); `lib/delivery.ts` só lê as faixas |
| Avaliações da loja (página do produto) | Google Places API (`lib/google-reviews.ts`) | Nota e comentários reais do perfil da loja no Google; `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` (só servidor), cache de 1 dia. Sem elas, a seção some. Nunca avaliação inventada |
| Pedidos do site | Admin (`/api/site/checkout`) | Nunca gravados pelo site; ver `docs/features/site-checkout.md` no admin |

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
- **Checkout:** dinheiro sempre conferido no admin; erro do admin chega como `{ code, error }`
  e vira texto para o cliente em `checkoutErrorMessage` (`lib/checkout.ts`).
- Commits convencionais: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.

## Orçamento de performance

Home com **menos de 250 KB de JS**; Lighthouse ≥ 95 em Performance, SEO e Acessibilidade
(mobile). Se um componente novo estourar isso, ele precisa virar servidor ou sair.
