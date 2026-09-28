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
