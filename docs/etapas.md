# Etapas de implementação — SmartPoint Site

Checklist de execução do [design doc](./design-doc.md). Marque cada item ao concluir;
cada etapa só é considerada pronta quando o **critério de pronto** passa.

Legenda: `[ ]` pendente · `[x]` concluído · `[~]` em andamento · `[!]` bloqueado

> **29/09/2026 — os consertos saíram deste site** (decisão D14). A assistência técnica vai
> ganhar um site próprio; aqui fica só a vitrine de acessórios. A Etapa 5 foi cancelada e o
> que dependia dela está marcado abaixo.

---

## Etapa 0 — Dados e acessos (bloqueia tudo)

- [x] Domínio definido — **capinhasudi.com.br** (acesso ao DNS a confirmar no lançamento)
- [x] ~~Serviços listados~~ — fora deste site (D14)
- [x] Service accounts disponíveis (`acesso-rpido` em produção, `smartpoint-admin-staging` em preview)
- [x] CNPJ e endereço (rua e número)
- [x] WhatsApp completo — **+55 34 99834-9528** (`wa.me/5534998349528`)
- [x] Cidade e UF — Uberlândia/MG
- [x] Instagram — [@udiasmartpoint](https://www.instagram.com/udiasmartpoint/)
- [x] Marca do site — **SmartPoint**
- [x] Referência de design — negociodachinaudi.com.br
- [x] Fonte dos dados da loja definida — documento `settings/store` (o mesmo do admin)
- [x] Fonte da marca definida — `settings/store.brand` (upload no admin, URL no Storage)
- [ ] `settings/store` preenchido: endereço com CEP, telefone, WhatsApp, horário, Instagram
- [ ] `settings/store.brand` preenchido: logo, ícone, og:image e cor da marca

**Pronto quando:** os itens acima estiverem marcados. Os dois pendentes não travam o
desenvolvimento (há fallback em texto), mas travam o lançamento.

---

## Etapa 1 — Fundação do projeto

- [x] `create-next-app` — Next 16.3.6, React 19, App Router, TypeScript, pnpm
- [x] Tailwind 4 com os tokens no `@theme` de `app/globals.css`
- [x] Biome (lint + format) e `tsc --noEmit` rodando via `pnpm check`
- [x] Vitest + Testing Library configurados (`vitest.config.ts`, `test-helpers/setup.ts`)
- [x] `CLAUDE.md` com as convenções do projeto
- [x] Estrutura de pastas: `app/`, `components/ui`, `components/layout`, `lib/`, `__tests__/`
- [x] Variáveis de ambiente documentadas em `.env.example`
- [x] GitHub Actions: lint + typecheck + test + build no PR
- [x] `lib/whatsapp.ts` (normalização do número e montagem do link) com testes

**Pronto quando:** `pnpm dev`, `pnpm build` e `pnpm check` passam em um projeto vazio. ✅

---

## Etapa 2 — Design system

- [x] Paleta definida: `ink`, `ink-soft`, `shelf`, `line`, `tag`, `zap` — conceito "quiosque"
- [x] Tokens no `@theme` do `app/globals.css` (Tailwind 4 é CSS-first, sem `tailwind.config.ts`)
- [x] Tipografia: **Archivo** variável via `next/font`, uma família em dois extremos de largura
- [x] Componentes base: botão/link, etiqueta de preço, card de produto, skeleton, seção
- [x] `Brand` — logo do banco com fallback em texto
- [x] Cabeçalho com menu (em toda tela), faixa de avisos e rodapé (endereço, horário, Instagram, CNPJ)
- [x] CTA de WhatsApp (inline e flutuante) com mensagem contextual
- [x] `/styleguide` com tudo junto, fora do índice (`robots: noindex`)
- [x] Foco visível, `prefers-reduced-motion` respeitado, alvos de toque ≥ 44px
- [ ] Conferir contraste AA no navegador (falta rodar)

**Pronto quando:** o styleguide cobre todo componente usado nas páginas da v1. ✅
(dialog, accordion e breadcrumb entram quando uma página precisar — não se inventa
componente sem uso.)

---

## Etapa 3 — Camada de dados (Firebase)

- [ ] Admin SDK inicializado no servidor (`lib/firebase-admin.ts`), credencial só em env
- [ ] `lib/catalog.ts`: listar publicados, buscar por slug, destaques, categorias e marcas
- [ ] Regra de exibição (`isActive !== false && site.published === true`) centralizada e testada
- [ ] Preço "a partir de" a partir das variantes ativas
- [ ] `lib/site-content.ts` com valores padrão para todo campo
- [ ] `lib/store.ts` — lê `settings/store` (endereço, telefone, WhatsApp, horário, redes, marca) com fallback
- [ ] `images.remotePatterns` liberando o domínio do Firebase Storage
- [ ] Cache/ISR configurado (`revalidate`) e fallback quando o Firestore falha
- [ ] Testes dos mapeadores e da regra de publicação

**Pronto quando:** uma página de teste lista produtos reais do Firestore sem expor credencial.

---

## Etapa 4 — Páginas da vitrine

- [x] `/produtos` — listagem com busca e filtro por categoria (client-side, catálogo já no HTML)
- [x] `/produtos/[slug]` — galeria com miniaturas, etiqueta, variações, descrição e relacionados
- [x] Mensagem contextual no WhatsApp (nome, variação, preço e link) — `lib/messages.ts` com testes
- [x] Estados vazios: vitrine sendo montada, busca sem resultado, produto sem foto/estoque
- [x] `generateStaticParams` — cada produto publicado vira página estática
- [x] Regra nova descoberta no dado real: preço zero não entra na vitrine
- [ ] `/` — hero e categorias (hoje só os destaques)

**Pronto quando:** dá para navegar da home ao WhatsApp passando por um produto real. ✅
(a home ganha hero e seções quando o `siteContent` existir — Etapa 8 no admin)

---

## Etapa 5 — ~~Serviços e orçamento (WhatsApp)~~ — CANCELADA (D14)

Estava pronta e foi **removida do repositório** em 29/09/2026: saíram `/servicos`,
`/servicos/orcamento`, o `ServiceCard`, o `QuoteForm`, `lib/quote-validation.ts`,
`lib/site-content.ts`, o `quoteMessage` e o `serviceJsonLd`. O histórico fica no git,
pronto para servir de base ao site da assistência.

- [x] Conteúdo de serviços removido do site e das rotas
- [ ] Site próprio da assistência (outro repositório, outro plano)

---

## Etapa 6 — Institucional

- [x] `/sobre` — usa `store.about`, com texto padrão enquanto não for cadastrado (sem consertos)
- [x] `/contato` — endereço, horário, mapa preguiçoso e canais, tudo de `settings/store`
- [x] `/privacidade` — sem cookie de rastreamento; desde a Etapa 10 explica os dados da compra (pedido no admin, carrinho no navegador, pagamento no MP)
- [x] 404 e boundary de erro com a identidade do site

**Pronto quando:** todo link do cabeçalho e do rodapé leva a uma página pronta. ✅

---

## Etapa 7 — SEO, performance e analytics

- [x] `metadata` por rota com canonical, Open Graph e Twitter Card; ícone e og:image da marca
- [x] JSON-LD: `MobilePhoneStore` (home e contato), `Product` + `Offer`, `BreadcrumbList`
- [x] `sitemap.xml` (inclui cada produto publicado) e `robots.txt` (bloqueia `/styleguide`)
- [x] Imagens pelo `next/image` com `sizes`; `priority` só na foto do produto (LCP)
- [x] Vercel Analytics (o evento `orcamento_whatsapp` saiu com o formulário)
- [x] Orçamento de peso: **182–184 KB de JS (gzip)** em todas as páginas
- [ ] Lighthouse ≥ 95 (mobile) — falta rodar em navegador

**Pronto quando:** as metas de Lighthouse e de peso passam em `/`, `/produtos` e `/produtos/[slug]`.
Peso ✅ · Lighthouse pendente (precisa de navegador).

---

## Etapa 7.1 — Conversão e confiança (23/10/2026)

- [x] Evento `whatsapp_click` com origem (card, produto, barra, cabeçalho, flutuante…) e produto
- [x] Disponibilidade: pronta entrega, sob encomenda (action figures) e esgotado no fim da lista
- [x] Página do produto: parcelamento, disponibilidade, "aberto agora", faixa de confiança,
      trilha completa e barra fixa de preço e WhatsApp no celular
- [x] Home: abertura (`siteContent/home`), faixa de confiança, depoimentos, "venha conhecer
      a loja" e Instagram
- [x] Avisos padrão do cabeçalho a partir de `settings/store` (entrega, cartões, Mercado Pago)
- [x] Horário do JSON-LD corrigido ("Segunda a sexta" virava só segunda e sexta)
- [ ] Cadastrar no admin: fotos da loja, depoimentos, garantia padrão e mais destaques

---

## Etapa 8 — Publicação no admin (outro repositório)

- [ ] Campo `site.published` (e `highlight`, `slug`, SEO) no cadastro de produto
- [ ] Campos novos em `/loja`: `whatsapp`, `hours`, `social`, `mapsUrl`, `about`
- [ ] Upload da marca em `/loja` (logo, ícone, og:image) para o Storage + cor da marca
- [ ] Tela de conteúdo do site (`siteContent`): hero, banners, destaques, depoimentos (sem serviços)
- [ ] Faixa de avisos (`siteContent/notices`): texto, detalhe, ícone, tom (info/promo) e link
- [ ] Bloqueio de publicação para produto sem foto ou sem descrição
- [ ] (Opcional) Webhook de revalidação sob demanda ao publicar

**Pronto quando:** publicar um produto no admin faz ele aparecer no site.

---

## Etapa 9 — Lançamento

- [ ] Projeto criado na Vercel, variáveis de ambiente configuradas
- [ ] `capinhasudi.com.br` apontado, HTTPS e `www` → apex resolvidos
- [ ] Produção usando o projeto `acesso-rpido`; preview usando `smartpoint-admin-staging`
- [ ] Deploy de produção e conferência em celular real
- [ ] Google Search Console: propriedade verificada e sitemap enviado
- [ ] Perfil do Google Empresa vinculado ao site
- [ ] Revisão final de textos e preços

**Pronto quando:** o site está no ar no domínio próprio e indexável.

---

## Etapa 10 — Checkout com Mercado Pago (D15, 16/11/2026)

- [x] Carrinho no navegador: botão no produto com pronta entrega, atalho no cabeçalho, `/carrinho`
- [x] Retirada grátis ou entrega com frete por faixa de km (rota de carro no Google Maps, calculada no admin) — faixas em `/loja/site`, com simulador
- [x] `POST /api/checkout` → admin `POST /api/site/checkout` (segredo) → link do Checkout Pro
- [x] `/pedido/[id]`: volta do MP, atualiza sozinha até o pagamento, esvazia o carrinho quando pago
- [x] Admin: pedido `source: 'site'`, reserva de estoque, prazo de 30 min, aviso `site_order` quando pago
- [ ] Configurar `ADMIN_API_URL` e `SITE_CHECKOUT_SECRET` na Vercel; `SITE_CHECKOUT_SECRET` e `SITE_PUBLIC_URL` no admin
- [ ] `GOOGLE_MAPS_API_KEY` no admin (Geocoding API + Routes API, chave restrita e com cota diária)
- [ ] Cadastrar as faixas de entrega em `/loja/site` e conferir com o simulador
- [ ] Testar ponta a ponta com as credenciais de teste do Mercado Pago (Pix e cartão)
- [ ] (Opcional) Agendador chamando `POST /api/site/checkout/expire` no admin
- [x] Segurança e LGPD: Next 16.4.6, cabeçalhos de segurança, `/privacidade` completa, prazo de guarda de 5 anos com anonimização no admin, log sem endereço
- [ ] Firewall da Vercel: limite de requisições em `/api/checkout` e `/api/delivery-quote`
- [x] Página do produto para conversão: frete calculado na página, parcela, "Receba hoje", "+N vendidos", compatibilidade ("Não sabe o modelo?"), "Compre junto" (mesmo modelo, outra categoria), galeria com arrastar/zoom/contador, loja física, características em tabela e nos dados estruturados, eventos do funil
- [x] Carrinho que passa confiança: prazo de entrega/retirada nas opções, "Pagamento seguro pelo Mercado Pago" (empresa de pagamentos do Mercado Livre; a loja não vê o cartão), formas de pagamento, "Depois de pagar", loja física com CNPJ e nota do Google, ajuda pelo WhatsApp antes de pagar, etapas, total fixo no celular, garantia/compatibilidade por item, CEP do frete reaproveitado
- [ ] Avaliações do Google na página do produto: `GOOGLE_PLACES_API_KEY` (Places API) e `GOOGLE_PLACE_ID` **no admin** (o site lê por `/api/site/reviews`)
- [ ] Site sem Firebase: na Vercel do site, só `ADMIN_API_URL` + `SITE_CHECKOUT_SECRET`; apagar `FIREBASE_*`, `GOOGLE_PLACES_*` e `NEXT_PUBLIC_SITE_URL` (publicar o admin antes do site)
- [ ] Acompanhamento do pedido: `/acompanhar/[token]` (link assinado pelo admin); opcional `SITE_TRACKING_SECRET` no admin
- [ ] Revisar modelo/compatibilidade dos produtos (mesmo nome para capinha e película do mesmo celular) para o "Compre junto" aparecer
- [ ] Agendador mensal chamando `POST /api/site/checkout/retention` no admin; publicar o índice novo (`pnpm firebase:indexes`)

**Pronto quando:** uma compra paga no site vira pedido concluído no admin, com estoque baixado e aviso ao operador.

---

## Fase 2 (depois do lançamento)

- [ ] Consulta pública do status da OS
- [ ] Persistência dos orçamentos como lead no admin (hoje o histórico é a conversa)
- [ ] FAQ e blog (SEO de cauda longa)
- [x] Checkout online com MercadoPago (Etapa 10)
- [ ] Avaliações de clientes
