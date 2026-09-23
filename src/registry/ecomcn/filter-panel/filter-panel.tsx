"use client"

import * as React from "react"
import { Check, Minus, Plus, X } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  describeActiveFilters,
  formatRangeBound,
  getRange,
  getToggle,
  getValues,
  removeFilter,
  setRange,
  toggleFilterValue,
  type FilterFacet,
  type FilterState,
  type ListFacet,
  type RangeFacet,
  type SwatchFacet,
  type ToggleFacet,
} from "@/lib/filter-params"
import { cn } from "@/lib/utils"

export interface FilterPanelProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue" | "onChange"> {
  facets: FilterFacet[]
  /** Usually straight from `useFilterParams`, so the state lives in the URL. */
  value: FilterState
  onValueChange: (next: FilterState) => void
  /** ISO 4217 code for `format: "currency"` range facets. */
  currency?: string
  locale?: string
  /** Counts are stale while results load, so they render as placeholders. */
  loading?: boolean
  /** Drop the title row — e.g. inside a sheet that already has one. */
  hideHeader?: boolean
  title?: string
}

type Shared = Pick<
  FilterPanelProps,
  "value" | "onValueChange" | "currency" | "locale" | "loading"
>

export function FilterPanel({
  facets,
  value,
  onValueChange,
  currency = "USD",
  locale,
  loading,
  hideHeader,
  title = "Filters",
  className,
  ...props
}: FilterPanelProps) {
  const id = React.useId()
  const active = describeActiveFilters(value, facets, { currency, locale })
  const shared: Shared = { value, onValueChange, currency, locale, loading }

  // Removing a chip deletes the button that had focus. Put focus on the chip
  // that slid into its place — or the panel itself — instead of <body>.
  const root = React.useRef<HTMLElement>(null)
  const chips = React.useRef<(HTMLButtonElement | null)[]>([])
  const refocus = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (refocus.current === null) return
    const index = Math.min(refocus.current, active.length - 1)
    refocus.current = null
    ;(chips.current[index] ?? root.current)?.focus()
  }, [active.length])

  return (
    <section
      ref={root}
      tabIndex={-1}
      aria-labelledby={hideHeader ? undefined : `${id}-title`}
      aria-label={hideHeader ? title : undefined}
      aria-busy={loading || undefined}
      className={cn("text-sm outline-none", className)}
      {...props}
    >
      {!hideHeader && (
        <div className="flex items-baseline justify-between gap-4 pb-3">
          <h2
            id={`${id}-title`}
            className="text-xs font-medium tracking-[0.14em] uppercase"
          >
            {title}
            {active.length > 0 && (
              <span className="ml-1.5 text-muted-foreground tabular-nums">
                {active.length}
              </span>
            )}
          </h2>
          {active.length > 0 && (
            <button
              type="button"
              onClick={() => {
                refocus.current = 0
                onValueChange({})
              }}
              className="text-xs text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {active.length > 0 && (
        <ul aria-label="Applied filters" className="flex flex-wrap gap-1.5 pb-4">
          {active.map((filter, index) => (
            <li key={`${filter.facetId}:${filter.value ?? ""}`}>
              <button
                ref={(node) => {
                  chips.current[index] = node
                }}
                type="button"
                onClick={() => {
                  refocus.current = index
                  onValueChange(removeFilter(value, filter.facetId, filter.value))
                }}
                className="group inline-flex h-7 items-center gap-1.5 rounded-sm border bg-secondary/60 pr-1.5 pl-2 text-xs transition-colors outline-none hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="sr-only">Remove {filter.facetLabel}:</span>
                {filter.label}
                <X
                  className="size-3 text-muted-foreground group-hover:text-foreground"
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {facets.length === 0 ? (
        <p className="border-t py-4 text-muted-foreground">
          No filters for this collection.
        </p>
      ) : (
        facets.map((facet) =>
          facet.type === "toggle" ? (
            <ToggleRow key={facet.id} facet={facet} {...shared} />
          ) : (
            <FacetSection key={facet.id} facet={facet} {...shared} />
          )
        )
      )}
    </section>
  )
}

function FacetSection({
  facet,
  ...shared
}: Shared & { facet: ListFacet | SwatchFacet | RangeFacet }) {
  const [open, setOpen] = React.useState(true)
  const id = React.useId()

  if (facet.type !== "range" && facet.options.length === 0) return null

  const selected =
    facet.type === "range"
      ? getRange(shared.value, facet.id)
        ? 1
        : 0
      : getValues(shared.value, facet.id).length

  return (
    // Groups are separated by a top rule, not boxed: the panel reads as one
    // ruled column, the way a printed index does.
    <div className="border-t py-4">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-body`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 rounded-sm text-left font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span>
            {facet.label}
            {selected > 0 && (
              <span className="ml-1.5 font-normal text-muted-foreground tabular-nums">
                ({selected})
              </span>
            )}
          </span>
          {open ? (
            <Minus className="size-3.5 text-muted-foreground" aria-hidden />
          ) : (
            <Plus className="size-3.5 text-muted-foreground" aria-hidden />
          )}
        </button>
      </h3>
      <div id={`${id}-body`} hidden={!open} className="pt-3">
        {facet.type === "list" && <ListOptions facet={facet} {...shared} />}
        {facet.type === "swatch" && <SwatchOptions facet={facet} {...shared} />}
        {facet.type === "range" && <RangeControl facet={facet} {...shared} />}
      </div>
    </div>
  )
}

function Count({
  count,
  loading,
  locale,
}: {
  count?: number
  loading?: boolean
  locale?: string
}) {
  if (loading) {
    return (
      <span aria-hidden className="h-3 w-6 shrink-0 animate-pulse rounded-sm bg-muted" />
    )
  }
  if (count === undefined) return null
  // Tabular figures, right-aligned: a column of counts that doesn't line up
  // is the first thing that makes a filter panel look unfinished.
  return (
    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
      {new Intl.NumberFormat(locale).format(count)}
    </span>
  )
}

function ListOptions({ facet, value, onValueChange, loading, locale }: Shared & { facet: ListFacet }) {
  const [expanded, setExpanded] = React.useState(false)
  const selected = getValues(value, facet.id)
  const limit = facet.limit ?? 6

  // Selected options stay visible when the list collapses, or a shopper
  // loses sight of a filter that is still applied.
  const collapsed = facet.options.filter(
    (option, index) => index < limit || selected.includes(option.value)
  )
  const hidden = facet.options.length - collapsed.length
  const visible = expanded ? facet.options : collapsed

  return (
    <>
      <ul className="space-y-0.5">
        {visible.map((option) => {
          const checked = selected.includes(option.value)
          const disabled = option.disabled ?? (option.count === 0 && !checked)
          return (
            <li key={option.value}>
              <label
                className={cn(
                  "flex min-h-8 cursor-pointer items-center gap-3 py-1",
                  disabled && "cursor-not-allowed text-muted-foreground"
                )}
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() =>
                    onValueChange(toggleFilterValue(value, facet.id, option.value))
                  }
                />
                <span className="flex-1 leading-tight">{option.label}</span>
                <Count count={option.count} loading={loading} locale={locale} />
              </label>
            </li>
          )
        })}
      </ul>
      {(hidden > 0 || expanded) && facet.options.length > limit && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-xs underline underline-offset-4 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {expanded ? "Show fewer" : `Show ${hidden} more`}
        </button>
      )}
    </>
  )
}

function SwatchOptions({ facet, value, onValueChange, loading, locale }: Shared & { facet: SwatchFacet }) {
  const selected = getValues(value, facet.id)

  return (
    <ul className="grid grid-cols-2 gap-1.5">
      {facet.options.map((option) => {
        const checked = selected.includes(option.value)
        const disabled = option.disabled ?? (option.count === 0 && !checked)
        return (
          <li key={option.value}>
            {/* The name is always printed and the selected state carries a
                check and a heavier border — colour is never the only signal. */}
            <button
              type="button"
              aria-pressed={checked}
              disabled={disabled}
              onClick={() =>
                onValueChange(toggleFilterValue(value, facet.id, option.value))
              }
              className={cn(
                "flex w-full items-center gap-2 rounded-sm border px-2 py-1.5 text-left transition-colors outline-none hover:border-foreground/50 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45",
                checked && "border-foreground bg-secondary"
              )}
            >
              <span
                aria-hidden
                className="grid size-4 shrink-0 place-items-center rounded-full ring-1 ring-foreground/20 ring-inset"
                style={{ background: option.swatch }}
              >
                {checked && (
                  <Check className="size-3 text-white mix-blend-difference" strokeWidth={3} />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate" title={option.label}>
                {option.label}
              </span>
              <Count count={option.count} loading={loading} locale={locale} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function useAffix(facet: RangeFacet, currency?: string, locale?: string) {
  return React.useMemo(() => {
    if (facet.format !== "currency") {
      return facet.unit ? { text: facet.unit, suffix: true } : null
    }
    const parts = new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(1)
    const symbol = parts.findIndex((p) => p.type === "currency")
    const number = parts.findIndex((p) => p.type === "integer")
    return symbol === -1 ? null : { text: parts[symbol].value, suffix: symbol > number }
  }, [facet.format, facet.unit, currency, locale])
}

function RangeControl({
  facet,
  value,
  onValueChange,
  currency,
  locale,
}: Shared & { facet: RangeFacet }) {
  const id = React.useId()
  const committed = getRange(value, facet.id)
  const lo = committed?.min ?? facet.min
  const hi = committed?.max ?? facet.max
  const key = `${lo}:${hi}`

  // A draft remembers which committed value it started from. When the URL
  // catches up (instantly, or after a router round-trip) the key changes and
  // the stale draft is simply ignored — no effect needed to reset it, and no
  // flash back to the old value while a server fetch is in flight.
  const [draft, setDraft] = React.useState<{ values: [number, number]; key: string } | null>(null)
  const [text, setText] = React.useState<{ min?: string; max?: string; key: string } | null>(null)
  const pending = React.useRef<[number, number] | null>(null)

  const [shownLo, shownHi] = draft?.key === key ? draft.values : [lo, hi]
  const typed = text?.key === key ? text : null
  const affix = useAffix(facet, currency, locale)
  const format = (n: number) => formatRangeBound(facet, n, { currency, locale })

  const commit = (values: [number, number]) => {
    const clamp = (n: number) => Math.min(facet.max, Math.max(facet.min, n))
    const [a, b] = values.map(clamp)
    const next: [number, number] = a <= b ? [a, b] : [b, a]
    setDraft({ values: next, key })
    if (next[0] !== lo || next[1] !== hi) {
      onValueChange(setRange(value, facet, { min: next[0], max: next[1] }))
    }
  }

  // Commit when the thumb is released, not on every pixel of the drag: each
  // commit is a history entry and, on most stores, a request.
  const commitPending = () => {
    const values = pending.current
    pending.current = null
    if (values) commit(values)
  }

  const commitTyped = () => {
    if (!typed) return
    // Untouched field: keep what it showed. Emptied field: lift that bound.
    // Garbage: ignore the edit rather than guess.
    const parse = (raw: string | undefined, shown: number, edge: number) => {
      if (raw === undefined) return shown
      if (raw.trim() === "") return edge
      const n = Number(raw.replace(/[^\d.-]/g, ""))
      return Number.isFinite(n) ? n : shown
    }
    setText(null)
    commit([parse(typed.min, shownLo, facet.min), parse(typed.max, shownHi, facet.max)])
  }

  const field = (bound: "min" | "max") => (
    <label className="relative flex-1">
      <span className="sr-only">
        {bound === "min" ? "Minimum" : "Maximum"} {facet.label.toLowerCase()}
      </span>
      {affix && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground",
            affix.suffix ? "right-2.5" : "left-2.5"
          )}
        >
          {affix.text}
        </span>
      )}
      <Input
        inputMode="decimal"
        autoComplete="off"
        value={typed?.[bound] ?? String(bound === "min" ? shownLo : shownHi)}
        onChange={(event) =>
          setText({ ...(typed ?? { key }), [bound]: event.target.value })
        }
        onBlur={commitTyped}
        onKeyDown={(event) => {
          if (event.key === "Enter") commitTyped()
        }}
        className={cn(
          "h-9 tabular-nums",
          affix && (affix.suffix ? "pr-7" : "pl-6")
        )}
      />
    </label>
  )

  return (
    <div>
      {/* Not a live region: the thumbs already announce their own values,
          and a readout that speaks on every pixel of a drag is noise. */}
      <p id={`${id}-readout`} className="mb-3 tabular-nums">
        {shownLo <= facet.min && shownHi >= facet.max
          ? `Any ${facet.label.toLowerCase()}`
          : `${format(shownLo)} – ${format(shownHi)}`}
      </p>
      <div
        role="group"
        aria-label={`${facet.label} range`}
        aria-describedby={`${id}-readout`}
        className="px-1 py-2"
        onPointerDown={() => {
          const end = () => {
            window.removeEventListener("pointerup", end)
            window.removeEventListener("pointercancel", end)
            commitPending()
          }
          window.addEventListener("pointerup", end)
          window.addEventListener("pointercancel", end)
        }}
        onKeyUp={commitPending}
      >
        <Slider
          min={facet.min}
          max={facet.max}
          step={facet.step ?? 1}
          value={[shownLo, shownHi]}
          onValueChange={(next: number | readonly number[]) => {
            const values: [number, number] =
              typeof next === "number" ? [next, next] : [next[0], next[1]]
            pending.current = values
            setDraft({ values, key })
          }}
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        {field("min")}
        <span aria-hidden className="text-muted-foreground">
          –
        </span>
        {field("max")}
      </div>
    </div>
  )
}

function ToggleRow({
  facet,
  value,
  onValueChange,
  loading,
  locale,
}: Shared & { facet: ToggleFacet }) {
  return (
    <div className="border-t py-4">
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span className="font-medium">{facet.label}</span>
        <span className="flex items-center gap-3">
          <Count count={facet.count} loading={loading} locale={locale} />
          <Switch
            checked={getToggle(value, facet.id)}
            onCheckedChange={(on: boolean) =>
              onValueChange({ ...value, [facet.id]: on || undefined })
            }
          />
        </span>
      </label>
    </div>
  )
}
