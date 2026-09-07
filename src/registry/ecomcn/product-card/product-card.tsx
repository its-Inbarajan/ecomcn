"use client"

import * as React from "react"
import { Check, Plus, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PriceTag } from "@/components/ecomcn/price-tag"
import { cn } from "@/lib/utils"

export interface ProductCardColor {
  name: string
  /** Any CSS colour, or a swatch image URL via `background`. */
  hex: string
}

export interface ProductCardProduct {
  id: string
  name: string
  href: string
  brand?: string
  price: number
  compareAt?: number
  /** Already-rendered image element, so this block never assumes next/image. */
  image?: React.ReactNode
  badge?: string
  colors?: ProductCardColor[]
  rating?: number
  reviewCount?: number
}

export interface ProductCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  product: ProductCardProduct
  currency?: string
  locale?: string
  density?: "comfortable" | "compact"
  /** Return a promise to keep the button in its pending state until settled. */
  onQuickAdd?: (product: ProductCardProduct, colorIndex: number) => void | Promise<void>
  onColorChange?: (color: ProductCardColor, index: number) => void
}

export function ProductCard({
  product,
  currency = "USD",
  locale,
  density = "comfortable",
  onQuickAdd,
  onColorChange,
  className,
  ...props
}: ProductCardProps) {
  const [colorIndex, setColorIndex] = React.useState(0)
  const [state, setState] = React.useState<"idle" | "pending" | "added">("idle")

  const quickAdd = async () => {
    if (state === "pending") return
    setState("pending")
    try {
      await onQuickAdd?.(product, colorIndex)
      setState("added")
      window.setTimeout(() => setState("idle"), 2000)
    } catch {
      setState("idle")
    }
  }

  return (
    <article className={cn("group relative flex flex-col", className)} {...props}>
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {product.image}

        {product.badge ? (
          <span className="absolute left-0 top-0 bg-foreground px-2.5 py-1.5 text-[11px] uppercase tracking-[0.16em] text-background">
            {product.badge}
          </span>
        ) : null}

        {onQuickAdd ? (
          // focus-visible keeps this reachable without a pointer; the card link
          // sits behind it via the ::after overlay on the title anchor.
          <Button
            type="button"
            onClick={quickAdd}
            disabled={state === "pending"}
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 h-11 translate-y-full rounded-none text-[12px] tracking-[0.14em] transition-transform duration-200 motion-reduce:transition-none",
              "group-hover:translate-y-0 focus-visible:translate-y-0",
              state === "added" &&
                "translate-y-0 bg-[var(--success)] hover:bg-[var(--success)]"
            )}
          >
            {state === "added" ? (
              <>
                <Check className="mr-1.5 size-3.5" aria-hidden /> IN BAG
              </>
            ) : (
              <>
                <Plus className="mr-1.5 size-3.5" aria-hidden />
                {state === "pending" ? "ADDING…" : "QUICK ADD"}
              </>
            )}
          </Button>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col", density === "compact" ? "pt-2.5" : "pt-3.5")}>
        {product.brand ? (
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {product.brand}
          </p>
        ) : null}

        <h3 className="mt-1 text-xl leading-tight">
          {/* one link target for the whole card, no nested anchors */}
          <a href={product.href} className="after:absolute after:inset-0">
            {product.name}
          </a>
        </h3>

        <PriceTag
          price={product.price}
          compareAt={product.compareAt}
          currency={currency}
          locale={locale}
          size="sm"
          className="mt-1.5"
        />

        {density === "comfortable" &&
        (product.colors?.length || product.rating !== undefined) ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            {product.colors?.length ? (
              <div className="relative z-10 flex gap-1.5">
                {product.colors.map((color, i) => (
                  <button
                    key={color.name}
                    type="button"
                    aria-label={color.name}
                    aria-pressed={i === colorIndex}
                    onClick={() => {
                      setColorIndex(i)
                      onColorChange?.(color, i)
                    }}
                    className={cn(
                      "size-4 border transition-all",
                      i === colorIndex
                        ? "border-foreground ring-1 ring-foreground ring-offset-2 ring-offset-background"
                        : "border-foreground/20 hover:border-foreground/50"
                    )}
                    style={{ background: color.hex }}
                  />
                ))}
              </div>
            ) : (
              <span />
            )}

            {product.rating !== undefined ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                <Star className="size-3 fill-current" aria-hidden />
                {product.rating.toFixed(1)}
                {product.reviewCount ? (
                  <span className="opacity-60">({product.reviewCount})</span>
                ) : null}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
