# SmartPoint — Site institucional e vitrine

**Documento de design** · v1.1 · 29/09/2026
Status: **aprovado nas decisões, pendente de dados** (ver §14)

> **v1.1 — os consertos saíram deste site** (D14). A assistência técnica ganha um site
> próprio; aqui fica só a vitrine de acessórios. Os trechos afetados estão marcados.

---

## 1. Contexto e objetivo

A SmartPoint é uma loja de acessórios de celular com assistência técnica, operada hoje pelo
**SmartPoint Admin** (Next.js + Firebase), onde já vivem o catálogo (`Products` /
`productVariants`), as ordens de serviço e as vendas.

O que falta é presença pública: hoje não existe um endereço na internet para onde mandar o
cliente, nem para ser encontrado por quem procura "película iPhone 15" ou "troca de tela"
na cidade.

**Objetivo do site:** ser a vitrine e o cartão de visitas da loja — mostrar o que se vende e
levar o visitante ao WhatsApp com o mínimo de atrito. **Não é uma loja online**: não há
carrinho nem pagamento nesta versão. **A assistência técnica não vive aqui** (D14): ela terá
site próprio, com o SEO e a conversa de venda dela.

## 2. Métricas de sucesso

| Métrica | Alvo na v1 |
|---|---|
| Cliques em "Chamar no WhatsApp" | principal indicador de conversão |
| Páginas de produto indexadas no Google | > 80% do catálogo publicado |
| Core Web Vitals (campo) | LCP < 2,5s · INP < 200ms · CLS < 0,1 |
| Peso da home | < 250 KB de JS |

## 3. Escopo

### Na v1
- **Home** com destaques, categorias e prova social.
- **Catálogo** com busca e filtro por categoria/marca.
- **Página de produto** com fotos, preço, variações e CTA de WhatsApp.
- **Sobre** e **Contato** (endereço, horário, mapa, canais).
- SEO técnico, sitemap, dados estruturados e analytics.

### Fora da v1 (não-objetivos)
- **Consertos e orçamento de reparo** — saíram para um site separado (D14).
- Carrinho, checkout e pagamento online.
- Consulta pública do status da OS.
- Blog e FAQ (previstos para a v2, já com o SEO preparado).
- Login de cliente, lista de desejos, avaliações.
- Multi-idioma (o site é pt-BR).

## 4. Decisões

| # | Decisão | Escolha | Por quê | Descartado |
|---|---|---|---|---|
| D1 | Framework | **Next.js (App Router)** | Mesma stack do admin: tipos, utilitários e padrões reaproveitados; SSR/ISR resolve SEO; integração nativa com a Vercel | Astro (stack paralela para manter), Vite SPA (ruim para SEO) |
| D2 | Origem do catálogo | **Firestore do admin, filtrado** | Cadastro único: o que já é feito no admin alimenta o site | Coleção própria (cadastro duplicado), estático (exige deploy a cada mudança) |
| D3 | Leitura do Firestore | **Servidor (Admin SDK) + ISR** | Não expõe o banco, não gasta leitura por visitante, HTML pronto para o Google | SDK no cliente (exigiria abrir as regras), geração só no build (produto novo só aparece no próximo deploy) |
| D4 | Publicação de produto | **Campo `site.published` por produto** | Curadoria explícita; produto interno/teste nunca vaza para a vitrine | "Tudo ativo com estoque" (sem curadoria), lista de exceções (fácil esquecer) |
| D5 | Preço na vitrine | **Visível** | Gera confiança, filtra curioso e o cliente chega ao WhatsApp decidido | "Consulte o preço" (perde conversão) |
| D6 | Conversão | **WhatsApp** | Caminho mais curto até a venda no varejo de acessórios | Checkout online (escopo de e-commerce), status público de OS (v2) |
| ~~D7~~ | ~~Destino do orçamento~~ | — | Sem formulário de orçamento neste site depois de D14 | — |
| D8 | Conteúdo editorial | **`siteContent` no Firestore + tela no admin** | Banner, destaques e textos mudam sem deploy, na ferramenta que já é usada diariamente | Console do Firebase (desconfortável), hardcoded (exige deploy) |
| D12 | Dados da loja | **`settings/store`, o documento que o admin já mantém** | Fonte única: endereço, telefone, CNPJ e horário já existem e alimentam o recibo; duplicar no código geraria divergência | Repetir no `siteContent`, escrever no código do site |
| D13 | Logo e marca | **Upload no admin → Storage, URL em `settings/store.brand`** | Trocar a marca não exige deploy nem mexer no repositório; a mesma fonte serve cabeçalho, favicon e og:image | Arquivo `public/logo.svg` versionado no site |
| D9 | Identidade visual | **Nova, a partir de referências** | O site fala com o cliente final, não com o operador do admin | Reaproveitar a identidade do admin |
| D10 | Analytics | **Vercel Analytics** | Uma linha de código, sem cookies e sem banner de consentimento | GA4 e Meta Pixel (entram se houver campanha paga) |
| D11 | Deploy | **Vercel** + domínio próprio | Padrão do ecossistema Next; preview por branch | — |
| D14 | Consertos | **Site separado** | Público, vocabulário e SEO diferentes: quem procura "troca de tela" não é quem procura "capinha iPhone 15". Cada site converte na sua linguagem e a vitrine fica de um assunto só | Manter serviços aqui (dilui o foco da vitrine e do domínio `capinhasudi.com.br`) |

> **Consequência de D14:** saíram do repositório as rotas `/servicos` e
> `/servicos/orcamento`, o card de conserto, o formulário de orçamento (e a validação que
> ele usava), o `Service` no JSON-LD e o `siteContent/services`. O que sobrou é vitrine:
> catálogo, institucional e WhatsApp. A decisão D7 (orçamento só pelo WhatsApp, sem gravar)
> continua valendo — mas agora é assunto do outro site.

## 5. Arquitetura

```
                    ┌───────────────────────────┐
  visitante ──────▶ │  Next.js (App Router)      │
                    │  Server Components + ISR   │
                    └────────────┬──────────────┘
                                 │ Admin SDK (service account)
                                 ▼
                    ┌───────────────────────────┐
                    │  Firebase (projeto do      │
                    │  admin, somente leitura)   │
                    │  Products · productVariants│
                    │  siteContent               │
                    └───────────────────────────┘
                                 ▲
                                 │ escrita
                    ┌────────────┴──────────────┐
                    │  SmartPoint Admin          │
                    │  (cadastro + siteContent)  │
                    └───────────────────────────┘

  CTA do produto ──▶ monta a mensagem ──▶ WhatsApp Business (wa.me)
```

**Princípios**

1. **O site só lê.** Nenhuma rota escreve em lugar nenhum.
2. **Sem backend próprio.** Não há route handler na v1: o site só lê o Firestore e monta
   links de WhatsApp.
3. **Credencial só no servidor.** A service account vive em variável de ambiente da Vercel;
   nada de `NEXT_PUBLIC_*` para dados sensíveis. As regras de segurança do Firestore
   continuam exigindo autenticação — o site passa por cima delas por ser Admin SDK, no
   servidor.
4. **Cache por padrão.** Páginas de catálogo e produto são estáticas com revalidação
   (`revalidate = 300`); um webhook de revalidação sob demanda pode ser ligado depois para
   refletir a publicação na hora.
5. **Degradação graciosa.** Se o Firestore falhar, a página servida do cache continua no ar;
   um produto sem foto usa placeholder; sem `siteContent`, os textos caem em valores padrão
   do código.

## 6. Modelo de dados

### 6.1 Leitura (coleções existentes)

```ts
// Products/{id} — o que o site consome
{
  name, description, category, brand,
  images: string[],
  isActive: boolean,
  totalStock: number,
  // NOVO, escrito pelo admin:
  site?: {
    published: boolean;      // D4 — entra na vitrine
    highlight?: boolean;     // aparece nos destaques da home
    slug?: string;           // URL amigável; gerado a partir do nome se ausente
    seoTitle?: string;
    seoDescription?: string;
    order?: number;          // ordenação manual na vitrine
  }
}

// productVariants/{id} — variação (cor, capacidade)
{ productId, attributes, price, stock, images, sku, isActive }
```

**Regra de exibição:** produto aparece quando `isActive !== false` **e**
`site.published === true`. O preço mostrado é o menor preço entre as variantes ativas
("a partir de" quando houver mais de um valor).

### 6.2 Conteúdo editorial (nova coleção)

```ts
// siteContent/home
{
  hero: { title, subtitle, ctaLabel, ctaHref, image },
  highlights: string[],           // ids de produtos em destaque
  banners: Array<{ image, alt, href, active }>,
  testimonials: Array<{ name, text, rating }>
}

// siteContent/notices — a faixa de avisos do cabeçalho
{ items: Array<{ text, icon?, tone?: 'info' | 'promo', href? }> }

```

### 6.3 Dados da loja (documento já existente)

Nome, CNPJ, telefone e endereço **não são duplicados no site**: vêm de `settings/store`, o
mesmo documento que o admin já edita em `/loja` e que alimenta o recibo da maquininha.

```ts
// settings/store — o que já existe
{
  nomeFantasia, razaoSocial, cnpj, telefone, email,
  endereco: { logradouro, numero, complemento?, bairro, cidade, estado, cep }
}

// Campos NOVOS para o site (escritos na mesma tela do admin):
{
  whatsapp?: string;          // só dígitos, formato wa.me (ex.: 5534998349528)
  hours?: Array<{ days: string; opens: string; closes: string }>;  // vira openingHours no JSON-LD
  social?: { instagram?: string; facebook?: string };
  mapsUrl?: string;           // link/iframe do Google Maps
  about?: string;             // texto curto usado na página Sobre
  brand?: {
    logoUrl: string;          // marca principal (SVG/PNG transparente) — cabeçalho e rodapé
    logoDarkUrl?: string;     // versão para fundo escuro, se houver
    iconUrl?: string;         // ícone quadrado → favicon e atalho no celular
    ogImageUrl?: string;      // 1200×630, usado no compartilhamento (WhatsApp, Instagram)
    color?: string;           // cor da marca em hex, alimenta os tokens do tema
  };
}
```

**Logo vem do banco (D13).** Nada de arquivo de marca no repositório: o admin faz o upload
para o Storage (`site/brand/...`) e grava a URL em `settings/store.brand`. O site consome
essas URLs no cabeçalho, no rodapé, no favicon (`metadata.icons`) e na imagem de
compartilhamento. Duas consequências técnicas:

- o domínio do Storage entra em `images.remotePatterns` do `next.config.ts`;
- enquanto não houver logo, o cabeçalho mostra a marca em **texto** ("SmartPoint") com a
  tipografia do tema — o site nunca fica quebrado esperando um arquivo.

> Não confundir com `receiptLogoBase64`, que já existe: aquele é um BMP monocromático para a
> impressora da maquininha e não serve para a web.

**Regra:** a loja é a **fonte única** desses dados. O site não tem endereço, telefone nem
horário escritos no código — só um fallback mínimo para o caso de o documento não existir.

**Onde cada coisa é editada no admin:** `settings/store` na tela `/loja` que já existe;
`siteContent` em uma tela nova (`/site`). As duas ficam no repositório do admin — descritas
aqui só para fixar o contrato.

## 7. Rotas

| Rota | Conteúdo | Render | Revalidação |
|---|---|---|---|
| `/` | Hero, destaques, categorias, prova social, CTA | Estática | 5 min |
| `/produtos` | Listagem com busca e filtros (categoria, marca, faixa de preço) | Estática + filtro no cliente | 5 min |
| `/produtos/[slug]` | Galeria, preço, variações, descrição, relacionados, CTA WhatsApp | Estática (`generateStaticParams`) | 5 min |
| `/sobre` | História, equipe, diferenciais | Estática | 1 h |
| `/contato` | Endereço, mapa, horário, canais | Estática | 1 h |
| `/sitemap.xml`, `/robots.txt` | Gerados a partir do catálogo publicado | Estáticos | 1 h |

## 8. Integrações

**WhatsApp** — link `https://wa.me/<número>?text=<mensagem>` montado por contexto: na
página de produto a mensagem já vem com nome, variação, preço e link. Sem biblioteca: é só
uma URL.

**Mapa** — iframe do Google Maps carregado de forma preguiçosa (`loading="lazy"`), sem SDK.

## 9. SEO e performance

- `metadata` por rota, `canonical` no domínio próprio, Open Graph e Twitter Card.
- **JSON-LD**: `LocalBusiness` (home e contato), `Product` + `Offer` (produto),
  `BreadcrumbList` (catálogo).
- `sitemap.xml` gerado do catálogo publicado; `robots.txt` liberando tudo menos `/api`.
- Imagens pelo `next/image` (AVIF/WebP, `sizes` correto, `priority` só no LCP).
- Fontes via `next/font` (self-hosted, sem layout shift); logo e og:image vindos do Storage,
  servidos pelo `next/image` com `remotePatterns`.
- Sem JS desnecessário: componentes de servidor por padrão; `'use client'` só em busca,
  filtros e galeria.
- Orçamento de peso: **< 250 KB de JS na home**.

## 10. Design

**Referência:** [negociodachinaudi.com.br](https://www.negociodachinaudi.com.br/) — varejo
local de Uberlândia, base branca e neutra, destaque em azul, produtos em grade com preço bem
visível e badge de oferta, WhatsApp em evidência no topo e categorias em ícones.

**O que trazemos da referência:** base clara, grade de produtos com foto grande e preço
sempre visível, categorias navegáveis logo abaixo do topo, telefone/WhatsApp fixo no
cabeçalho e bloco de ofertas na home.

**O que fazemos diferente:** sem carrinho, lista de desejos ou "visualização rápida" (não
vendemos online na v1) — todo CTA leva ao WhatsApp; tipografia e espaçamento mais atuais,
mobile-first de verdade (a referência é pensada para desktop); e o verde do WhatsApp fica
**exclusivo** dos botões de conversão, para o olho aprender que verde = falar com a loja.
A cor de marca (definida com a logo) cobre navegação e destaques.

O que já está definido:

- **Tokens** em CSS variables (cor, raio, sombra, espaçamento), Tailwind consumindo os tokens.
- **Tipografia**: uma família para texto e uma para títulos, via `next/font`.
- **Componentes base**: botão, card de produto, badge, input, select, dialog, accordion,
  breadcrumb, skeleton.
- **Responsivo mobile-first** — a maior parte do tráfego virá do Instagram, no celular.
- **Acessibilidade**: contraste AA, navegação por teclado, foco visível, `alt` em toda imagem.
- **Dark mode**: fora da v1.

## 11. Segurança e LGPD

- Service account apenas em variável de ambiente do servidor; nunca no cliente nem no git.
- Nenhuma escrita pública no Firestore; regras de segurança permanecem como estão.
- O site não recebe nada: sem formulário, sem route handler, sem superfície de abuso
  (sem spam, sem rate limit a manter).
- JSON-LD escapa `<` como `\u003c`: texto vindo do banco não pode fechar o `<script>`.
- Sem cookies de rastreamento na v1 (Vercel Analytics não usa) → sem banner de consentimento.
- Política de privacidade simples no rodapé: o site não coleta nem envia dado nenhum.

## 12. Operação

| Item | Definição |
|---|---|
| Ambientes | `production` → `capinhasudi.com.br` (Firebase `acesso-rpido`) · `preview` por branch (Firebase `smartpoint-admin-staging`) |
| Variáveis | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP` |
| Gerenciador | pnpm |
| Qualidade | Biome (lint/format) + `tsc --noEmit` + Vitest nos utilitários |
| CI | GitHub Actions rodando lint, typecheck, testes e build a cada PR |

## 13. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Catálogo do admin sem foto/descrição boa | Vitrine pobre e SEO fraco | Checklist de publicação; produto sem foto não é publicável |
| Preço divergente entre site e loja | Frustração do cliente | Fonte única (variantes) + revalidação de 5 min |
| Custo de leitura do Firestore | Conta inesperada | Leitura no servidor com ISR: uma leitura por revalidação, não por visitante |
| Conteúdo editorial vazio no lançamento | Home sem graça | Valores padrão no código para todo campo de `siteContent` |

## 14. Dados do projeto

| Item | Valor |
|---|---|
| Domínio | **capinhasudi.com.br** |
| Marca no site | **SmartPoint** (o domínio `capinhasudi.com.br` fica como endereço, não como marca) |
| CNPJ | 59.237.018/0001-54 |
| Endereço | Quiosque na Avenida João Pinheiro, 337 — Uberlândia/MG ⟨CEP a confirmar⟩ |
| WhatsApp | **+55 34 99834-9528** (Business) → `wa.me/5534998349528` |
| E-mail público | não haverá; o contato é pelo WhatsApp |
| Serviços | fora deste site (D14) — irão para um site próprio da assistência |
| Firebase (produção) | projeto `acesso-rpido` — service account `firebase-adminsdk-fbsvc@acesso-rpido.iam.gserviceaccount.com` |
| Firebase (preview/dev) | projeto `smartpoint-admin-staging` |
| Instagram | [@udiasmartpoint](https://www.instagram.com/udiasmartpoint/) |
| Referência de design | [negociodachinaudi.com.br](https://www.negociodachinaudi.com.br/) — varejo local de Uberlândia |
| Analytics | Vercel Analytics |

### Ainda pendente

1. **Preencher `settings/store` no admin** — endereço completo (com CEP), telefone, WhatsApp,
   horário de funcionamento, Instagram e a **marca** (logo, ícone, og:image, cor). Deixa de ser
   pendência de projeto e vira cadastro: o site lê de lá. Os campos novos (`whatsapp`, `hours`,
   `social`, `mapsUrl`, `about`, `brand`) precisam entrar na tela `/loja` do admin — Etapa 8.

> Os valores já conhecidos (CNPJ 59.237.018/0001-54, Av. João Pinheiro 337 — Uberlândia/MG,
> WhatsApp 5534998349528, @udiasmartpoint) servem de referência para conferir o cadastro, mas
> **o que o site exibe é o que estiver em `settings/store`**.

---

## Alternativas consideradas e por que não

**Astro** — seria mais leve, mas partiria a stack em duas e complicaria as partes de
aplicação previstas para a v2 (status de OS, área do cliente).

**Headless CMS (Sanity, Contentful)** — melhor editor de conteúdo, porém mais uma assinatura
e mais um lugar para manter, sendo que o admin já é o lugar natural para editar.

**Loja online completa na v1** — multiplicaria o escopo (frete, estoque reservado, pagamento,
pós-venda) para um público que hoje compra pelo WhatsApp. Fica para quando o site tiver tráfego.
