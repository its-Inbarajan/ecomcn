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
  /** Shown in the media frame while this colour is selected. */
  image?: React.ReactNode
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

/* ─── context ──────────────────────────────────────────────────────────────
 * Compound component: <ProductCard> holds the selected colour and the
 * quick-add state, and every part reads them through useProductCard(). That
 * is what lets a swatch change the image without either knowing the other.
 */

type QuickAddState = "idle" | "pending" | "added"

export interface ProductCardContextValue {
  product: ProductCardProduct
  currency: string
  locale?: string
  density: "comfortable" | "compact"
  colorIndex: number
  setColorIndex: (index: number) => void
  /** The selected colour, if the product has any. */
  color?: ProductCardColor
  /** The selected colour's image, falling back to the product image. */
  image: React.ReactNode
  /** Undefined when the card was given no `onQuickAdd`. */
  quickAdd?: () => void
  quickAddState: QuickAddState
}

const ProductCardContext = React.createContext<ProductCardContextValue | null>(null)

export function useProductCard() {
  const context = React.useContext(ProductCardContext)
  if (!context) {
    throw new Error("useProductCard must be used within <ProductCard>.")
  }
  return context
}

/** Controlled when `value` is passed, uncontrolled from `defaultValue` otherwise. */
function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const controlled = value !== undefined
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setUncontrolled(next)
      onChange?.(next)
    },
    [controlled, onChange]
  )
  return [controlled ? value : uncontrolled, set] as const
}

/* ─── root ─────────────────────────────────────────────────────────────── */

export interface ProductCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  product: ProductCardProduct
  currency?: string
  locale?: string
  density?: "comfortable" | "compact"
  /** Return a promise to keep the button in its pending state until settled. */
  onQuickAdd?: (product: ProductCardProduct, colorIndex: number) => void | Promise<void>
  /** Controlled selected colour. */
  colorIndex?: number
  defaultColorIndex?: number
  onColorChange?: (color: ProductCardColor, index: number) => void
  /**
   * Compose your own card from ProductCardMedia, ProductCardBody and their
   * parts. Leave empty for the default layout.
   */
  children?: React.ReactNode
}

export function ProductCard({
  product,
  currency = "USD",
  locale,
  density = "comfortable",
  onQuickAdd,
  colorIndex: colorIndexProp,
  defaultColorIndex = 0,
  onColorChange,
  className,
  children,
  ...props
}: ProductCardProps) {
  const colors = product.colors
  const handleColorChange = React.useCallback(
    (index: number) => {
      const color = colors?.[index]
      if (color) onColorChange?.(color, index)
    },
    [colors, onColorChange]
  )
  const [colorIndex, setColorIndex] = useControllableState(
    colorIndexProp,
    defaultColorIndex,
    handleColorChange
  )

  const [quickAddState, setQuickAddState] = React.useState<QuickAddState>("idle")
  const resetTimer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  const quickAdd = React.useMemo(() => {
    if (!onQuickAdd) return undefined
    return async () => {
      if (quickAddState === "pending") return
      setQuickAddState("pending")
      try {
        await onQuickAdd(product, colorIndex)
        setQuickAddState("added")
        window.clearTimeout(resetTimer.current)
        resetTimer.current = window.setTimeout(() => setQuickAddState("idle"), 2000)
      } catch {
        setQuickAddState("idle")
      }
    }
  }, [onQuickAdd, quickAddState, product, colorIndex])

  const color = product.colors?.[colorIndex]
  const context = React.useMemo<ProductCardContextValue>(
    () => ({
      product,
      currency,
      locale,
      density,
      colorIndex,
      setColorIndex,
      color,
      image: color?.image ?? product.image,
      quickAdd,
      quickAddState,
    }),
    [product, currency, locale, density, colorIndex, setColorIndex, color, quickAdd, quickAddState]
  )

  return (
    <ProductCardContext.Provider value={context}>
      <article
        data-slot="product-card"
        className={cn("group relative flex flex-col", className)}
        {...props}
      >
        {children ?? (
          <>
            <ProductCardMedia />
            <ProductCardBody />
          </>
        )}
      </article>
    </ProductCardContext.Provider>
  )
}

/* ─── media ────────────────────────────────────────────────────────────── */

/** The 4:5 frame. Defaults to image, badge and quick-add; pass children to recompose. */
export function ProductCardMedia({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  useProductCard()
  return (
    <div
      data-slot="product-card-media"
      className={cn("relative aspect-[4/5] overflow-hidden bg-secondary", className)}
      {...props}
    >
      {children ?? (
        <>
          <ProductCardImage />
          <ProductCardBadge />
          <ProductCardQuickAdd />
        </>
      )}
    </div>
  )
}

/** Fills the media frame with the selected colour's image. */
export function ProductCardImage({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { image } = useProductCard()
  return (
    <div data-slot="product-card-image" className={cn("absolute inset-0", className)} {...props}>
      {image}
    </div>
  )
}

export function ProductCardBadge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const { product } = useProductCard()
  if (!product.badge) return null
  return (
    <span
      data-slot="product-card-badge"
      className={cn(
        "absolute top-0 left-0 bg-foreground px-2.5 py-1.5 text-[11px] tracking-[0.16em] text-background uppercase",
        className
      )}
      {...props}
    >
      {product.badge}
    </span>
  )
}

export function ProductCardQuickAdd({ className }: { className?: string }) {
  const { quickAdd, quickAddState } = useProductCard()
  if (!quickAdd) return null

  return (
    // focus-visible keeps this reachable without a pointer; the card link
    // sits behind it via the ::after overlay on the title anchor.
    <Button
      type="button"
      data-slot="product-card-quick-add"
      onClick={quickAdd}
      disabled={quickAddState === "pending"}
      className={cn(
        "absolute inset-x-0 bottom-0 z-10 h-11 translate-y-full rounded-none text-[12px] tracking-[0.14em] transition-transform duration-200 motion-reduce:transition-none",
        "group-hover:translate-y-0 focus-visible:translate-y-0",
        quickAddState === "added" &&
          "translate-y-0 bg-[var(--success)] hover:bg-[var(--success)]",
        className
      )}
    >
      {quickAddState === "added" ? (
        <>
          <Check className="mr-1.5 size-3.5" aria-hidden /> IN BAG
        </>
      ) : (
        <>
          <Plus className="mr-1.5 size-3.5" aria-hidden />
          {quickAddState === "pending" ? "ADDING…" : "QUICK ADD"}
        </>
      )}
    </Button>
  )
}

/* ─── body ─────────────────────────────────────────────────────────────── */

/** The text column. Defaults to brand, title, price and meta; pass children to recompose. */
export function ProductCardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { density } = useProductCard()
  return (
    <div
      data-slot="product-card-body"
      className={cn("flex flex-1 flex-col", density === "compact" ? "pt-2.5" : "pt-3.5", className)}
      {...props}
    >
      {children ?? (
        <>
          <ProductCardBrand />
          <ProductCardTitle />
          <ProductCardPrice />
          <ProductCardMeta />
        </>
      )}
    </div>
  )
}

export function ProductCardBrand({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { product } = useProductCard()
  if (!product.brand) return null
  return (
    <p
      data-slot="product-card-brand"
      className={cn("text-[11px] tracking-[0.18em] text-muted-foreground uppercase", className)}
      {...props}
    >
      {product.brand}
    </p>
  )
}

export function ProductCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { product } = useProductCard()
  return (
    <h3 data-slot="product-card-title" className={cn("mt-1 text-xl leading-tight", className)} {...props}>
      {/* One link target for the whole card via the ::after overlay — no
          nested anchors. Anything interactive on top needs `relative z-10`. */}
      <a href={product.href} className="after:absolute after:inset-0">
        {product.name}
      </a>
    </h3>
  )
}

export function ProductCardPrice({ className }: { className?: string }) {
  const { product, currency, locale } = useProductCard()
  return (
    <PriceTag
      price={product.price}
      compareAt={product.compareAt}
      currency={currency}
      locale={locale}
      size="sm"
      className={cn("mt-1.5", className)}
    />
  )
}

/** Swatches and rating on one line. Hidden in the compact density. */
export function ProductCardMeta({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { product, density } = useProductCard()
  if (density === "compact") return null
  if (!children && !product.colors?.length && product.rating === undefined) return null
  return (
    <div
      data-slot="product-card-meta"
      className={cn("mt-3 flex items-center justify-between gap-3", className)}
      {...props}
    >
      {children ?? (
        <>
          <ProductCardSwatches />
          <ProductCardRating />
        </>
      )}
    </div>
  )
}

export function ProductCardSwatches({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { product, colorIndex, setColorIndex } = useProductCard()
  if (!product.colors?.length) return <span />
  return (
    <div
      role="group"
      aria-label="Colour"
      data-slot="product-card-swatches"
      className={cn("relative z-10 flex gap-1.5", className)}
      {...props}
    >
      {product.colors.map((color, i) => (
        <button
          key={color.name}
          type="button"
          aria-label={color.name}
          aria-pressed={i === colorIndex}
          onClick={() => setColorIndex(i)}
          className={cn(
            "size-4 border transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            i === colorIndex
              ? "border-foreground ring-1 ring-foreground ring-offset-2 ring-offset-background"
              : "border-foreground/20 hover:border-foreground/50"
          )}
          style={{ background: color.hex }}
        />
      ))}
    </div>
  )
}

export function ProductCardRating({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const { product, locale } = useProductCard()
  if (product.rating === undefined) return null
  return (
    <span
      data-slot="product-card-rating"
      className={cn("flex items-center gap-1 text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    >
      <Star className="size-3 fill-current" aria-hidden />
      <span className="sr-only">Rated</span>
      {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
        product.rating
      )}
      {product.reviewCount ? (
        <span className="opacity-60">
          ({new Intl.NumberFormat(locale).format(product.reviewCount)}
          <span className="sr-only"> reviews</span>)
        </span>
      ) : null}
    </span>
  )
}
