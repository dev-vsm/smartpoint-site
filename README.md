# SmartPoint — site

Site público da SmartPoint: vitrine de acessórios de celular e assistência técnica em
Uberlândia/MG. Next.js 16 + Tailwind 4, dados no Firebase (somente leitura), deploy na Vercel.

- Plano: [`docs/design-doc.md`](./docs/design-doc.md)
- Andamento: [`docs/etapas.md`](./docs/etapas.md)
- Convenções: [`CLAUDE.md`](./CLAUDE.md)

```bash
pnpm install
cp .env.example .env.local   # credenciais do Firebase (staging em dev)
pnpm dev                     # http://localhost:3000
pnpm check                   # lint + typecheck + testes
```

## Variáveis de ambiente

Ficam no `.env.local` (nunca no git) e na Vercel. As `NEXT_PUBLIC_*` são gravadas no build e vão
para o navegador: nunca coloque segredo nelas. **Regra:** toda variável nova, renomeada, removida
ou com uso alterado atualiza esta tabela no mesmo commit.

| NOME | VALOR_EXEMPLO | DESCRICAO |
| --- | --- | --- |
| `FIREBASE_PROJECT_ID` | `meu-projeto` | Projeto Firebase lido pelo Admin SDK (catálogo, loja, conteúdo). Sem as três credenciais do Firebase, o site sobe com o catálogo vazio. |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxx@meu-projeto.iam.gserviceaccount.com` | Conta de serviço do Admin SDK (só leitura no uso do site). Só servidor. |
| `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\n..."` | Chave privada da conta de serviço, com `\n` literais. Só servidor. |
| `FIREBASE_STORAGE_BUCKET` | `meu-projeto.firebasestorage.app` | Bucket das fotos de produto (staging e produção são diferentes). Padrão `<FIREBASE_PROJECT_ID>.firebasestorage.app`. |
| `NEXT_PUBLIC_SITE_URL` | `https://capinhasudi.com.br` | Endereço público do site para SEO (canonical, sitemap, Open Graph, JSON-LD). Padrão `https://capinhasudi.com.br`. |
| `ADMIN_API_URL` | `https://admin.exemplo.com.br` | Endereço do smartpoint-admin, que cria os pedidos e calcula o frete. Sem ela (ou sem `SITE_CHECKOUT_SECRET`), a compra online some e o carrinho manda o pedido pelo WhatsApp. |
| `SITE_CHECKOUT_SECRET` | `gerado com openssl rand -base64 32` | Segredo compartilhado com o admin (mesmo valor dos dois lados, 16+ caracteres). Só servidor. |
| `GOOGLE_PLACES_API_KEY` | `AIzaSy...` | Google Places API (New): nota e avaliações da loja na página do produto e no carrinho. Só servidor. Sem ela, a seção some. |
| `GOOGLE_PLACE_ID` | `ChIJ...` | Id do perfil da loja no Google, usado com a chave acima. |
| `NODE_ENV` | `production` | Definida pelo Next (não defina à mão). Fora de produção, a CSP libera o que o modo de desenvolvimento precisa. |
