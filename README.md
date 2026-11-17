# SmartPoint — site

Site público da SmartPoint: vitrine de acessórios de celular e assistência técnica em
Uberlândia/MG. Next.js 16 + Tailwind 4, dados no Firebase (somente leitura), deploy na Vercel.

- Plano: [`docs/design-doc.md`](./docs/design-doc.md)
- Andamento: [`docs/etapas.md`](./docs/etapas.md)
- Convenções: [`CLAUDE.md`](./CLAUDE.md)

```bash
pnpm install
cp .env.example .env.local   # ADMIN_API_URL + SITE_CHECKOUT_SECRET (admin de staging em dev)
pnpm dev                     # http://localhost:3000
pnpm check                   # lint + typecheck + testes
```

## Variáveis de ambiente

Ficam no `.env.local` (nunca no git) e na Vercel. As `NEXT_PUBLIC_*` são gravadas no build e vão
para o navegador: nunca coloque segredo nelas. **Regra:** toda variável nova, renomeada, removida
ou com uso alterado atualiza esta tabela no mesmo commit.

| NOME | VALOR_EXEMPLO | DESCRICAO |
| --- | --- | --- |
| `ADMIN_API_URL` | `https://admin.exemplo.com.br` | Endereço do smartpoint-admin, **a única fonte de dados do site**: catálogo, loja, conteúdo, avaliações, frete, pedidos e acompanhamento (`/api/site/*`). Sem ela (ou sem o segredo), o site sobe com o catálogo vazio e a compra online some. Com ela e o admin fora do ar, o build falha e as páginas já geradas continuam no ar. |
| `SITE_CHECKOUT_SECRET` | `gerado com openssl rand -base64 32` | Segredo compartilhado com o admin (mesmo valor dos dois lados, 16+ caracteres). Só servidor. |
| `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` | `capinhasudi.com.br` | **Definida pela Vercel** (variável de sistema; não configure): domínio de produção para SEO (canonical, sitemap, Open Graph). Fora da Vercel, `https://capinhasudi.com.br`. |
| `NODE_ENV` | `production` | Definida pelo Next (não defina à mão). Fora de produção, a CSP libera o que o modo de desenvolvimento precisa. |
