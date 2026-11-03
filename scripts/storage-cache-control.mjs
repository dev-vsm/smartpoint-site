// Ajusta o Cache-Control das variantes geradas pela extensão Resize Images.
// Só o metadado muda; o conteúdo das imagens não é tocado.
//
//   pnpm images:cache --cred <credencial.json> [--mode dry|pilot|apply] [--bucket <nome>] [--prefix products/] [--concurrency 24]
//
//   dry   (padrão) só conta o que falta — leitura
//   pilot ajusta UMA variante e mostra o cabeçalho que o Firebase devolve
//   apply ajusta todas as que faltam
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { parseArgs } from "node:util"
import { cert, initializeApp } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"

const HEADER = "public, max-age=31536000, immutable"
const VARIANT = /_(\d+x\d+)\.webp$/
const MODES = {
  dry: "simulação (só leitura)",
  pilot: "piloto (altera 1 arquivo)",
  apply: "aplicar (altera todos os pendentes)",
}
const TOTAL_STEPS = 4
const PROGRESS_EVERY_MS = 2000

const startedAt = Date.now()

// ---------- saída ----------
const elapsed = (from = startedAt) => {
  const s = (Date.now() - from) / 1000
  return s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}min ${Math.round(s % 60)}s`
}
const num = (n) => n.toLocaleString("pt-BR")
const pct = (part, total) => (total ? `${((part / total) * 100).toFixed(1)}%` : "0%")
const clock = () => new Date().toLocaleTimeString("pt-BR")
const log = (msg = "") => console.log(msg ? `[${clock()}] ${msg}` : "")
const detail = (label, value) => console.log(`           ${label.padEnd(22)} ${value}`)
const step = (n, title) => {
  console.log("")
  log(`ETAPA ${n}/${TOTAL_STEPS} · ${title}`)
  return Date.now()
}
const done = (from, msg = "concluída") => log(`  ✓ ${msg} em ${elapsed(from)}`)
const fail = (msg) => {
  log(`  ✗ ${msg}`)
  process.exit(1)
}
const bar = (part, total, width = 24) => {
  const filled = total ? Math.round((part / total) * width) : 0
  return `[${"#".repeat(filled)}${".".repeat(width - filled)}]`
}

// ---------- parâmetros ----------
const { values } = parseArgs({
  options: {
    cred: { type: "string" },
    mode: { type: "string", default: "dry" },
    bucket: { type: "string" },
    prefix: { type: "string", default: "products/" },
    concurrency: { type: "string", default: "24" },
  },
})
const concurrency = Number(values.concurrency)

if (!values.cred || !(values.mode in MODES) || !(concurrency > 0)) {
  console.error(
    "uso: pnpm images:cache --cred <credencial.json> [--mode dry|pilot|apply] [--bucket <nome>] [--prefix products/] [--concurrency 24]",
  )
  process.exit(1)
}

console.log("════════════════════════════════════════════════════════════")
console.log(" Cache-Control das variantes do Resize Images")
console.log("════════════════════════════════════════════════════════════")

// ---------- 1. conexão ----------
let t = step(1, "Conectando ao Firebase")
let credential
try {
  credential = JSON.parse(readFileSync(resolve(values.cred), "utf8"))
} catch (error) {
  fail(`não consegui ler a credencial ${values.cred}: ${error.message}`)
}
const bucketName = values.bucket ?? `${credential.project_id}.firebasestorage.app`
const app = initializeApp({ credential: cert(credential) })
const bucket = getStorage(app).bucket(bucketName)
detail("projeto", credential.project_id)
detail("conta", credential.client_email)
detail("bucket", bucketName)
detail("pasta", values.prefix)
detail("modo", `${values.mode} — ${MODES[values.mode]}`)
detail("cabeçalho alvo", HEADER)
if (values.mode === "apply") detail("requisições paralelas", concurrency)
done(t)

// ---------- 2. listagem ----------
t = step(2, `Listando arquivos em ${values.prefix}`)
let files
try {
  ;[files] = await bucket.getFiles({ prefix: values.prefix })
} catch (error) {
  fail(`falha ao listar o bucket: ${error.message}`)
}
detail("arquivos encontrados", num(files.length))
done(t)

// ---------- 3. análise ----------
t = step(3, "Analisando variantes")
const variants = files.filter((file) => VARIANT.test(file.name))
const todo = variants.filter((file) => file.metadata.cacheControl !== HEADER)
const alreadyOk = variants.length - todo.length

const bySize = {}
for (const file of todo) {
  const size = file.name.match(VARIANT)[1]
  bySize[size] = (bySize[size] ?? 0) + 1
}
const byCurrent = {}
for (const file of todo) {
  const key = file.metadata.cacheControl ?? "(vazio)"
  byCurrent[key] = (byCurrent[key] ?? 0) + 1
}

detail("originais e outros", num(files.length - variants.length))
detail("variantes", num(variants.length))
detail("já corretas", `${num(alreadyOk)} (${pct(alreadyOk, variants.length)})`)
detail("pendentes", `${num(todo.length)} (${pct(todo.length, variants.length)})`)
if (todo.length > 0) {
  console.log("           pendentes por tamanho:")
  for (const [size, count] of Object.entries(bySize).sort((a, b) => Number.parseInt(a[0]) - Number.parseInt(b[0])))
    console.log(`             ${size.padEnd(12)} ${num(count)}`)
  console.log("           valor atual do Cache-Control nas pendentes:")
  for (const [value, count] of Object.entries(byCurrent)) console.log(`             ${value.padEnd(12)} ${num(count)}`)
}
done(t)

// ---------- 4. execução ----------
const publicUrl = (file) =>
  `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`

let updated = 0
const failed = []
t = step(4, `Executando · ${MODES[values.mode]}`)

if (todo.length === 0) {
  log("  nada a fazer: todas as variantes já têm o cabeçalho certo")
} else if (values.mode === "dry") {
  log(`  nenhuma alteração feita; ${num(todo.length)} variantes seriam ajustadas no modo apply`)
} else if (values.mode === "pilot") {
  const file = todo[0]
  detail("arquivo", file.name)
  detail("antes", file.metadata.cacheControl ?? "(vazio)")
  try {
    await file.setMetadata({ cacheControl: HEADER })
    updated = 1
    log("  metadado gravado; conferindo a resposta pública…")
    const response = await fetch(publicUrl(file))
    await response.body?.cancel()
    const served = response.headers.get("cache-control")
    detail("HTTP", response.status)
    detail("depois (servido)", served)
    log(served === HEADER ? "  ✓ o Firebase entrega o cabeçalho novo" : "  ✗ o cabeçalho servido não bate com o alvo")
  } catch (error) {
    failed.push([file.name, error.message])
  }
} else {
  const queue = [...todo]
  const total = todo.length
  let processed = 0
  const runStart = Date.now()

  const report = () => {
    const seconds = (Date.now() - runStart) / 1000
    const rate = seconds > 0 ? processed / seconds : 0
    const eta = rate > 0 ? Math.ceil((total - processed) / rate) : 0
    log(
      `  ${bar(processed, total)} ${pct(processed, total).padStart(6)} · ${num(processed)}/${num(total)}` +
        ` · ${rate.toFixed(0)}/s · falhas ${failed.length} · restante ~${eta}s`,
    )
  }
  const timer = setInterval(report, PROGRESS_EVERY_MS)

  await Promise.all(
    Array.from({ length: Math.min(concurrency, total) }, async () => {
      for (let file = queue.shift(); file; file = queue.shift()) {
        try {
          await file.setMetadata({ cacheControl: HEADER })
          updated += 1
        } catch (error) {
          failed.push([file.name, error.message])
        }
        processed += 1
      }
    }),
  )
  clearInterval(timer)
  report()
}
done(t)

// ---------- resumo ----------
const pendingAfter = todo.length - updated
console.log("")
console.log("════════════════════════════════════════════════════════════")
console.log(` RESUMO · ${failed.length ? "concluído com falhas" : "concluído"} em ${elapsed()}`)
console.log("════════════════════════════════════════════════════════════")
detail("modo", values.mode)
detail("variantes", num(variants.length))
detail("já estavam corretas", num(alreadyOk))
detail("ajustadas agora", num(updated))
detail("falhas", num(failed.length))
detail("ainda pendentes", num(pendingAfter))

if (failed.length > 0) {
  console.log("           arquivos com falha:")
  for (const [name, message] of failed) console.log(`             ${name} → ${message}`)
}

console.log("")
if (failed.length > 0) log("próximo passo: rode o mesmo comando de novo; ele só reprocessa o que ficou pendente")
else if (values.mode === "dry" && pendingAfter > 0) log("próximo passo: --mode pilot para testar em 1 arquivo")
else if (values.mode === "pilot" && pendingAfter > 0) log("próximo passo: --mode apply para ajustar o restante")
else log("tudo certo: nenhuma variante pendente nesta pasta")

process.exit(failed.length > 0 ? 1 : 0)
