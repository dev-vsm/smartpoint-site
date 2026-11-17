"use client"

import { useEffect, useRef, useState } from "react"
import { ProductPhoto } from "@/components/ui/product-photo"
import type { ProductImage } from "@/lib/product-media"
import { cn } from "@/lib/utils"

/** Arraste mínimo (px) para trocar de foto com o dedo. */
const SWIPE_PX = 40

/**
 * Galeria da página do produto: foto grande com contador ("2/5"), troca pelas miniaturas,
 * pelas setas ou arrastando com o dedo, e toque/clique para ver ampliada (tela cheia, com a
 * foto original). A ampliação é um `<dialog>` nativo: Esc fecha e o foco volta sozinho.
 */
export function ProductGallery({
  media,
  name,
  soldOut = false,
}: {
  media: ProductImage[]
  name: string
  soldOut?: boolean
}) {
  const [index, setIndex] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const start = useRef<number | null>(null)
  const moved = useRef(false)
  const count = media.length
  const current = media[index] ?? media[0]

  const go = (step: number) => setIndex((value) => (value + step + count) % count)

  // Na ampliação: setas do teclado trocam a foto e o toque no fundo fecha.
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    const onKey = (event: KeyboardEvent) => {
      if (count < 2) return
      if (event.key === "ArrowRight") setIndex((value) => (value + 1) % count)
      if (event.key === "ArrowLeft") setIndex((value) => (value - 1 + count) % count)
    }
    // Toque no fundo escuro (fora da foto) fecha; no teclado, o Esc do `<dialog>` faz o mesmo.
    const onBackdrop = (event: MouseEvent) => {
      if (event.target === element) element.close()
    }
    element.addEventListener("keydown", onKey)
    element.addEventListener("click", onBackdrop)
    return () => {
      element.removeEventListener("keydown", onKey)
      element.removeEventListener("click", onBackdrop)
    }
  }, [count])

  const swipe = {
    onPointerDown: (event: React.PointerEvent) => {
      start.current = event.clientX
      moved.current = false
    },
    onPointerUp: (event: React.PointerEvent) => {
      if (start.current === null || count < 2) return
      const delta = event.clientX - start.current
      start.current = null
      if (Math.abs(delta) < SWIPE_PX) return
      moved.current = true
      go(delta < 0 ? 1 : -1)
    },
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-md bg-paper ring-1 ring-line">
        {current ? (
          <button
            type="button"
            aria-label={`Ampliar foto ${index + 1} de ${count}: ${name}`}
            className="absolute inset-0 cursor-zoom-in touch-pan-y"
            {...swipe}
            onClick={() => {
              // Arrastar não abre a ampliação.
              if (moved.current) return
              dialog.current?.showModal()
            }}
          >
            <ProductPhoto
              key={current.id}
              image={current}
              eager={index === 0}
              sizes="(min-width: 768px) 45vw, 100vw"
              className={cn(
                "absolute inset-0 h-full w-full object-contain p-6",
                soldOut && "opacity-60 grayscale",
              )}
            />
          </button>
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-ink-soft">
            sem foto
          </span>
        )}

        {count > 1 && (
          <>
            <span className="pointer-events-none absolute right-2 bottom-2 rounded-sm bg-ink/75 px-2 py-0.5 text-xs font-semibold text-paper tabular-nums">
              {index + 1}/{count}
            </span>
            <ArrowButton side="left" label="Foto anterior" onClick={() => go(-1)} />
            <ArrowButton side="right" label="Próxima foto" onClick={() => go(1)} />
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {media.map((image, position) => (
            <li key={image.id}>
              <button
                type="button"
                aria-label={`Foto ${position + 1}`}
                aria-current={position === index}
                onClick={() => setIndex(position)}
                className={cn(
                  "relative block h-16 w-16 overflow-hidden rounded-sm bg-paper ring-1 transition-colors",
                  position === index ? "ring-brand-strong" : "ring-line hover:ring-brand-strong",
                )}
              >
                <ProductPhoto
                  image={image}
                  alt=""
                  sizes="64px"
                  className="absolute inset-0 h-full w-full object-contain p-1"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        aria-label={`Fotos de ${name}`}
        className="m-auto h-[min(92dvh,56rem)] w-[min(96vw,56rem)] max-w-none overflow-hidden rounded-md bg-paper p-0 backdrop:bg-ink/80"
      >
        {current && (
          <div className="relative h-full w-full touch-pan-y" {...swipe}>
            {/* biome-ignore lint/performance/noImgElement: original em tamanho cheio, sem srcset, só na ampliação. */}
            <img
              src={current.original}
              alt={current.alt}
              className="h-full w-full object-contain p-4"
            />
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => dialog.current?.close()}
              className="absolute top-2 right-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper text-2xl leading-none text-ink shadow-md ring-1 ring-line hover:bg-brand-soft"
            >
              ×
            </button>
            {count > 1 && (
              <>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-sm bg-ink/75 px-2 py-0.5 text-sm font-semibold text-paper tabular-nums">
                  {index + 1}/{count}
                </span>
                <ArrowButton side="left" label="Foto anterior" onClick={() => go(-1)} large />
                <ArrowButton side="right" label="Próxima foto" onClick={() => go(1)} large />
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  )
}

function ArrowButton({
  side,
  label,
  onClick,
  large = false,
}: {
  side: "left" | "right"
  label: string
  onClick: () => void
  large?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-xl font-bold text-ink shadow-md ring-1 ring-line hover:bg-brand-soft",
        side === "left" ? "left-2" : "right-2",
        // Na foto da página: só do tablet para cima (no celular, arrasta). Ampliada: sempre.
        large ? "inline-flex h-11 w-11" : "hidden h-10 w-10 md:inline-flex",
      )}
    >
      <span aria-hidden="true">{side === "left" ? "‹" : "›"}</span>
    </button>
  )
}
