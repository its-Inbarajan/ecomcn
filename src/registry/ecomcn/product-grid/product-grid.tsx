"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ProductCard,
  type ProductCardProduct,
  type ProductCardProps,
} from "@/components/ecomcn/product-card"
import { cn } from "@/lib/utils"

export interface ProductGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  products: ProductCardProduct[]
  loading?: boolean
  /** How many skeletons to render while `loading`. Match your page size. */
  skeletonCount?: number
  density?: "comfortable" | "compact"
  currency?: string
  locale?: string
  onQuickAdd?: ProductCardProps["onQuickAdd"]
  /** Rendered instead of the grid when `products` is empty and not loading. */
  empty?: React.ReactNode
  onResetFilters?: () => void
}

export function ProductGrid({
  products,
  loading,
  skeletonCount = 6,
  density = "comfortable",
  currency,
  locale,
  onQuickAdd,
  empty,
  onResetFilters,
  className,
  ...props
}: ProductGridProps) {
  // Column gap tighter than row gap: products group by row, like a printed page.
  const grid = cn(
    "grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-3",
    density === "compact" && "gap-y-7 lg:grid-cols-4",
    className
  )

  if (loading) {
    return (
      <div className={grid} aria-busy="true" aria-live="polite" {...props}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i}>
            {/* skeleton boxes must match the real card exactly or the grid jumps */}
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <Skeleton className="mt-3.5 h-3 w-16 rounded-none" />
            <Skeleton className="mt-2 h-5 w-3/4 rounded-none" />
            <Skeleton className="mt-2 h-3 w-14 rounded-none" />
          </div>
        ))}
        <span className="sr-only">Loading products</span>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      empty ?? (
        <div className="flex flex-col items-start gap-5 border py-14 pl-8 pr-6 sm:pl-14">
          <h3 className="text-3xl">Nothing under these filters.</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Be specific here in your own copy — naming the filter that emptied the
            grid converts far better than the words &ldquo;no results&rdquo;.
          </p>
          {onResetFilters ? (
            <Button onClick={onResetFilters} className="h-10 text-[13px]">
              Reset filters
            </Button>
          ) : null}
        </div>
      )
    )
  }

  return (
    <div className={grid} {...props}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          density={density}
          currency={currency}
          locale={locale}
          onQuickAdd={onQuickAdd}
        />
      ))}
    </div>
  )
}
