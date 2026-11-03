// Gera as versões WebP das imagens locais que o `lib/image-loader.ts` entrega.
//
//   pnpm images:local [--dir public/banners/carousel] [--quality 78]
//
// As larguras e pastas precisam bater com LOCAL_WIDTHS e LOCAL_VARIANT_DIRS em
// `lib/image-variants.ts`. Rode depois de trocar ou adicionar um banner.
import { readdirSync } from "node:fs"
import { createRequire } from "node:module"
import { join } from "node:path"
import { parseArgs } from "node:util"

// O sharp vem junto com o Next; não é dependência direta do projeto.
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve("next/package.json"))("sharp")

const WIDTHS = [640, 1080, 1600, 2172]

const { values } = parseArgs({
  options: {
    dir: { type: "string", multiple: true, default: ["public/banners/carousel"] },
    quality: { type: "string", default: "78" },
  },
})
const quality = Number(values.quality)

for (const dir of values.dir) {
  for (const file of readdirSync(dir).filter((name) => /\.(png|jpe?g)$/i.test(name))) {
    const base = file.replace(/\.[^.]+$/, "")
    for (const width of WIDTHS) {
      const out = join(dir, `${base}-${width}.webp`)
      const info = await sharp(join(dir, file))
        .resize({ width, withoutEnlargement: true })
        .webp({ quality })
        .toFile(out)
      console.log(`${out}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`)
    }
  }
}
