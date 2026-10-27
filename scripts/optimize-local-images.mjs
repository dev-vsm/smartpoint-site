// Gera as versões WebP das imagens locais que o `lib/image-loader.ts` entrega.
// Rode depois de trocar ou adicionar um banner: `node scripts/optimize-local-images.mjs`.
// As larguras e pastas precisam bater com LOCAL_WIDTHS e LOCAL_VARIANT_DIRS em `lib/image-variants.ts`.
import { readdirSync } from "node:fs"
import { createRequire } from "node:module"
import { join } from "node:path"

// O sharp vem junto com o Next; não é dependência direta do projeto.
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve("next/package.json"))("sharp")

const WIDTHS = [640, 1080, 1600, 2172]
const DIRS = ["public/banners/carousel"]

for (const dir of DIRS) {
  for (const file of readdirSync(dir).filter((name) => /\.(png|jpe?g)$/i.test(name))) {
    const base = file.replace(/\.[^.]+$/, "")
    for (const width of WIDTHS) {
      const out = join(dir, `${base}-${width}.webp`)
      const info = await sharp(join(dir, file))
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(out)
      console.log(`${out}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`)
    }
  }
}
