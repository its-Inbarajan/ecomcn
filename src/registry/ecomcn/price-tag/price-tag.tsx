import * as React from "react"

import { cn } from "@/lib/utils"

export interface PriceTagProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current price, in major units (e.g. 42.5 for $42.50). */
  price: number
  /** Was-price. Rendered struck through only when it is higher than `price`. */
  compareAt?: number
  /** ISO 4217 code. Never hardcode a symbol — stores are not all in the US. */
  currency?: string
  /** BCP 47 tag. `undefined` follows the visitor's locale. */
  locale?: string
  size?: "sm" | "lg"
}

/**
 * The single most-copied component in any storefront, and the one most often
 * shipped with a hardcoded dollar sign. Everything here goes through Intl.
 */
export const PriceTag = React.forwardRef<HTMLDivElement, PriceTagProps>(
  (
    { price, compareAt, currency = "USD", locale, size = "lg", className, ...props },
    ref
  ) => {
    const format = React.useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
        }),
      [locale, currency, price]
    )

    const onSale = typeof compareAt === "number" && compareAt > price
    const percentOff = onSale ? Math.round((1 - price / compareAt) * 100) : 0

    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}
        {...props}
      >
        <span
          className={cn(
            "tabular-nums",
            size === "lg" ? "text-3xl" : "text-lg",
            onSale && "text-[hsl(var(--sale))]"
          )}
        >
          {format.format(price)}
        </span>

        {onSale ? (
          <>
            <span
              aria-hidden
              className="text-sm text-muted-foreground line-through tabular-nums"
            >
              {format.format(compareAt)}
            </span>
            <span
              aria-hidden
              className="bg-[hsl(var(--sale))] px-1.5 py-0.5 text-[11px] uppercase tracking-[0.14em] text-background tabular-nums"
            >
              Save {percentOff}%
            </span>
            {/* one clean announcement instead of three fragments */}
            <span className="sr-only">
              Reduced from {format.format(compareAt)}, {percentOff} percent off
            </span>
          </>
        ) : null}
      </div>
    )
  }
)
PriceTag.displayName = "PriceTag"
