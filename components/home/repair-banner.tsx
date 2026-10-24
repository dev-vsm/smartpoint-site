"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { REPAIR_SLIDES, type RepairSlide } from "@/lib/repair-slides"
import { cn, isSvgUrl } from "@/lib/utils"

const INTERVAL = 7000

/** Faixa de ponta a ponta; textos e ações continuam legíveis em qualquer largura. */
export function RepairBanner({
  whatsapp,
  slides = REPAIR_SLIDES,
}: {
  whatsapp: string
  slides?: RepairSlide[]
}) {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [visible, setVisible] = useState(true)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateMotion = () => setReducedMotion(media.matches)
    const updateVisibility = () => setVisible(!document.hidden)
    updateMotion()
    updateVisibility()
    media.addEventListener("change", updateMotion)
    document.addEventListener("visibilitychange", updateVisibility)
    return () => {
      media.removeEventListener("change", updateMotion)
      document.removeEventListener("visibilitychange", updateVisibility)
    }
  }, [])

  const rotating = playing && !hovered && !reducedMotion && visible
  useEffect(() => {
    if (!rotating) return
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % slides.length),
      INTERVAL,
    )
    return () => window.clearInterval(timer)
  }, [rotating, slides.length])

  function select(index: number) {
    setPlaying(false)
    setActive((index + slides.length) % slides.length)
  }

  return (
    <section
      aria-label="Destaques da loja"
      aria-roledescription="carrossel"
      className="relative w-full overflow-hidden bg-brand-soft"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        if (!(event.target as HTMLElement).closest("[data-carousel-rotation]")) setPlaying(false)
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault()
          select(active + 1)
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          select(active - 1)
        }
      }}
      onTouchStart={(event) => {
        const touch = event.touches[0]
        touchStart.current = { x: touch.clientX, y: touch.clientY }
        setPlaying(false)
      }}
      onTouchEnd={(event) => {
        if (!touchStart.current) return
        const touch = event.changedTouches[0]
        const dx = touch.clientX - touchStart.current.x
        const dy = touch.clientY - touchStart.current.y
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) select(active + (dx < 0 ? 1 : -1))
        touchStart.current = null
      }}
      onTouchCancel={() => {
        touchStart.current = null
      }}
    >
      <div className="grid touch-pan-y" aria-live={rotating ? "off" : "polite"} aria-atomic="false">
        {slides.map((slide, index) => (
          <section
            key={slide.id}
            id={`repair-slide-${slide.id}`}
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${slides.length}: ${slide.label}`}
            aria-hidden={active !== index}
            inert={active !== index}
            className={cn(
              "relative col-start-1 row-start-1 transition-opacity duration-500 motion-reduce:transition-none",
              active === index ? "z-10 opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {slide.image && (
              <>
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  sizes="100vw"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  className="object-cover object-right"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-r from-brand-soft via-brand-soft/95 to-brand-soft/35 sm:via-brand-soft/65 sm:to-transparent lg:via-brand-soft/20"
                />
              </>
            )}
            {slide.logo && (
              // Slide da loja: a logo ocupa o lado da foto, sobre um círculo claro.
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-[40%] items-center justify-center sm:flex"
              >
                <span className="absolute h-[130%] aspect-square rounded-full bg-paper/70" />
                <Image
                  src={slide.logo.url}
                  alt=""
                  width={420}
                  height={252}
                  unoptimized={isSvgUrl(slide.logo.url)}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="relative h-auto w-[min(26rem,80%)]"
                />
              </div>
            )}
            <div className="relative mx-auto flex min-h-[340px] max-w-site items-center px-4 pt-6 pb-16 sm:min-h-[300px] sm:px-8 lg:min-h-[320px]">
              <div className="w-full max-w-lg sm:w-[60%] lg:max-w-2xl">
                {slide.logo && (
                  <Image
                    src={slide.logo.url}
                    alt={slide.logo.alt}
                    width={160}
                    height={96}
                    unoptimized={isSvgUrl(slide.logo.url)}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="mb-3 h-16 w-auto sm:hidden"
                  />
                )}
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-strong">
                  {slide.label}
                </p>
                <h2 className="mt-2 text-3xl leading-[1.08] lg:text-4xl">
                  {slide.title}
                  {slide.brandName && (
                    // Mesmo desenho da marca no cabeçalho (`Brand` sem logo): ciano com ponto laranja.
                    <>
                      {" "}
                      <span className="text-brand-strong">
                        {slide.brandName}
                        <span className="text-tag">.</span>
                      </span>
                    </>
                  )}
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
                  {slide.description}
                </p>
                {slide.benefit && (
                  <p
                    className={cn(
                      "mt-3 inline-flex items-center gap-2 text-xs font-bold",
                      slide.id === "tela" ? "text-tag-strong" : "text-brand-strong",
                    )}
                  >
                    <span aria-hidden="true">✓</span> {slide.benefit}
                  </p>
                )}
                <div className="mt-4">
                  <WhatsAppCta
                    number={whatsapp}
                    message={slide.message}
                    label={slide.cta}
                    source={`carrossel_${slide.id}`}
                    className="w-auto! max-w-full px-3 text-xs sm:px-4 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-2 z-20 mx-auto flex max-w-site justify-center px-4 sm:px-8">
        <nav className="flex items-center gap-1" aria-label="Escolher serviço ou oferta">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Ver banner: ${slide.label}`}
              aria-current={index === active ? "true" : undefined}
              aria-controls={`repair-slide-${slide.id}`}
              onClick={() => select(index)}
              className="flex h-11 min-w-8 items-center justify-center rounded-sm px-1"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all motion-reduce:transition-none",
                  index === active ? "w-8 bg-brand-strong" : "w-2 bg-ink/25",
                )}
              />
            </button>
          ))}
        </nav>
      </div>
    </section>
  )
}
