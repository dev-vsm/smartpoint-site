# Etapas de implementação — SmartPoint Site

Checklist de execução do [design doc](./design-doc.md). Marque cada item ao concluir;
cada etapa só é considerada pronta quando o **critério de pronto** passa.

Legenda: `[ ]` pendente · `[x]` concluído · `[~]` em andamento · `[!]` bloqueado

---

## Etapa 0 — Dados e acessos (bloqueia tudo)

- [x] Domínio definido — **capinhasudi.com.br** (acesso ao DNS a confirmar no lançamento)
- [x] Serviços listados (tela, bateria, dock, tampa, botões) — preço e prazo a combinar no WhatsApp
- [x] Canal de orçamento definido: **só WhatsApp**, sem e-mail e sem backend
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
- [x] Componentes base: botão/link, etiqueta de preço, card de produto, campos, skeleton, seção
- [x] `Brand` — logo do banco com fallback em texto
- [x] Cabeçalho com menu mobile e rodapé (endereço, horário, Instagram, CNPJ)
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

- [ ] `/` — hero, destaques, categorias, resumo de serviços, prova social, CTA
- [ ] `/produtos` — listagem, busca e filtros (categoria, marca, faixa de preço)
- [ ] `/produtos/[slug]` — galeria, preço, variações, descrição, relacionados
- [ ] Botão "Chamar no WhatsApp" com mensagem contextual em produto e serviço
- [ ] Estados vazios e de erro (sem produto, busca sem resultado)
- [ ] `generateStaticParams` para os produtos publicados

**Pronto quando:** dá para navegar da home ao WhatsApp passando por um produto real.

---

## Etapa 5 — Serviços e orçamento (WhatsApp)

- [ ] `/servicos` — os cinco reparos, cada um com CTA de WhatsApp e "preço a combinar"
- [ ] `/servicos/orcamento` — formulário: aparelho, reparo, descrição do problema, nome
- [ ] Validação com Zod **no cliente** (nada é enviado ao servidor)
- [ ] `buildQuoteMessage` — monta a mensagem formatada e testada
- [ ] Botão abre `wa.me` em nova aba com a mensagem pronta
- [ ] Evento de clique no analytics (é a única métrica de orçamento que teremos)
- [ ] Testes do montador de mensagem (acentos, quebras de linha, campos vazios)

**Pronto quando:** preencher o formulário abre o WhatsApp Business com a mensagem completa.

---

## Etapa 6 — Institucional

- [ ] `/sobre` — história, diferenciais, equipe
- [ ] `/contato` — endereço, mapa preguiçoso, horário e canais, tudo vindo de `settings/store`
- [ ] Política de privacidade no rodapé
- [ ] Páginas 404 e 500 com identidade do site

**Pronto quando:** todo link do cabeçalho e do rodapé leva a uma página pronta.

---

## Etapa 7 — SEO, performance e analytics

- [ ] `metadata` por rota, canonical, Open Graph e Twitter Card (ícone e og:image vindos da marca)
- [ ] JSON-LD: `LocalBusiness`, `Product` + `Offer`, `Service`, `BreadcrumbList`
- [ ] `sitemap.xml` e `robots.txt` gerados do catálogo publicado
- [ ] Imagens otimizadas (`next/image`, `sizes`, `priority` só no LCP)
- [ ] Vercel Analytics ligado
- [ ] Lighthouse ≥ 95 em Performance, SEO e Acessibilidade (mobile)
- [ ] Orçamento de peso respeitado (< 250 KB de JS na home)

**Pronto quando:** as metas de Lighthouse e de peso passam em `/`, `/produtos` e `/produtos/[slug]`.

---

## Etapa 8 — Publicação no admin (outro repositório)

- [ ] Campo `site.published` (e `highlight`, `slug`, SEO) no cadastro de produto
- [ ] Campos novos em `/loja`: `whatsapp`, `hours`, `social`, `mapsUrl`, `about`
- [ ] Upload da marca em `/loja` (logo, ícone, og:image) para o Storage + cor da marca
- [ ] Tela de conteúdo do site (`siteContent`): hero, banners, destaques, depoimentos
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

## Fase 2 (depois do lançamento)

- [ ] Consulta pública do status da OS
- [ ] Persistência dos orçamentos como lead no admin (hoje o histórico é a conversa)
- [ ] FAQ e blog (SEO de cauda longa)
- [ ] Checkout online com MercadoPago
- [ ] Avaliações de clientes
