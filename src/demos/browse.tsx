"use client";

import * as React from "react";

import { EmptyResults } from "@/components/ecomcn/empty-results";
import {
  FilterPanel,
  FilterPanelChips,
  FilterPanelFacet,
  FilterPanelHeader,
  useFilterPanel,
} from "@/components/ecomcn/filter-panel";
import { FilterSheet } from "@/components/ecomcn/filter-sheet";
import { LoadMore } from "@/components/ecomcn/load-more";
import {
  ProductCard,
  ProductCardBadge,
  ProductCardBody,
  ProductCardImage,
  ProductCardMedia,
  ProductCardQuickAdd,
  useProductCard,
  type ProductCardProduct,
} from "@/components/ecomcn/product-card";
import { ProductGrid } from "@/components/ecomcn/product-grid";
import {
  ProductQuickView,
  ProductQuickViewImage,
  ProductQuickViewTrigger,
} from "@/components/ecomcn/product-quick-view";
import { SortToolbar } from "@/components/ecomcn/sort-toolbar";
import { ControlBar, ControlLabel, Toggle } from "@/demos/controls";
import {
  FACETS,
  LARGE_CATALOGUE,
  PRODUCTS,
  bestRelaxation,
  filterProducts,
  sortProducts,
  withCounts,
} from "@/demos/listing-data";
import { useFilterParams } from "@/hooks/use-filter-params";
import {
  describeActiveFilters,
  getRange,
  removeFilter,
  serializeFilterParams,
  setRange,
  type FilterRange,
  type FilterState,
} from "@/lib/filter-params";

/**
 * Stand-in for network latency. Results lag the URL by a beat so the loading
 * states — dimmed count, pulsing facet counts, skeleton grid — are visible.
 * The state update happens in a timer, never synchronously in the effect.
 */
function useSettled<T>(value: T, key: string, delay = 380) {
  const [settled, setSettled] = React.useState({ key, value });
  const latest = React.useRef(value);
  React.useEffect(() => {
    latest.current = value;
  });
  React.useEffect(() => {
    const timer = window.setTimeout(
      () => setSettled((prev) => (prev.key === key ? prev : { key, value: latest.current })),
      delay,
    );
    return () => window.clearTimeout(timer);
  }, [key, delay]);
  return { value: settled.key === key ? value : settled.value, loading: settled.key !== key };
}

function useEmptyState(filters: FilterState, setFilters: (next: FilterState) => void) {
  const active = describeActiveFilters(filters, FACETS);
  const best = bestRelaxation(filters, active);
  return {
    filters: active.map((f) => ({
      id: `${f.facetId}:${f.value ?? ""}`,
      label: f.label,
      onRemove: () => setFilters(removeFilter(filters, f.facetId, f.value)),
    })),
    suggestion: best
      ? {
          label: `Remove “${best.filter.label}”`,
          count: best.count,
          onApply: () => setFilters(removeFilter(filters, best.filter.facetId, best.filter.value)),
        }
      : undefined,
    onClearAll: () => setFilters({}),
  };
}

function QueryString({ filters }: { filters: FilterState }) {
  const query = serializeFilterParams(filters, FACETS).toString();
  return (
    <div className="ec-rule border bg-secondary/40 px-3 py-2">
      <p className="ec-eyebrow text-muted-foreground">The only state is the URL</p>
      <code className="mt-1 block font-mono text-[12px] break-all">
        {query ? `?${decodeURIComponent(query)}` : "(no filters — try one)"}
      </code>
    </div>
  );
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * `?page=3` means "pages 1–3 are on screen", so reload and Back restore the
 * same depth. replaceState, not pushState: loading more is not a navigation
 * a shopper expects Back to undo. useFilterParams drops `page` whenever a
 * filter changes, which is exactly when it should reset.
 */
const LOCATION_EVENT = "ecomcn:locationchange";

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(LOCATION_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(LOCATION_EVENT, onChange);
  };
}

function usePageParam() {
  const search = React.useSyncExternalStore(
    subscribeToLocation,
    () => window.location.search,
    () => "",
  );
  const page = Math.max(1, Number(new URLSearchParams(search).get("page")) || 1);
  const setPage = React.useCallback((next: number) => {
    const params = new URLSearchParams(window.location.search);
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
    );
    window.dispatchEvent(new Event(LOCATION_EVENT));
  }, []);
  return [page, setPage] as const;
}

/* Glue between two compound blocks: read the card's context, feed the quick view. */
function CardQuickViewImage() {
  const { product } = useProductCard();
  return (
    <ProductQuickViewImage product={product}>
      <ProductCardImage />
    </ProductQuickViewImage>
  );
}

function CardQuickViewTrigger() {
  const { product, colorIndex } = useProductCard();
  return <ProductQuickViewTrigger product={product} colorIndex={colorIndex} />;
}

function QuickViewCard({
  product,
  density,
  onQuickAdd,
}: {
  product: ProductCardProduct;
  density?: "comfortable" | "compact";
  onQuickAdd?: () => Promise<void>;
}) {
  return (
    <ProductCard product={product} density={density} onQuickAdd={onQuickAdd}>
      <ProductCardMedia>
        <CardQuickViewImage />
        <ProductCardBadge />
        <CardQuickViewTrigger />
        <ProductCardQuickAdd />
      </ProductCardMedia>
      <ProductCardBody />
    </ProductCard>
  );
}

/* ─── sort-toolbar ───────────────────────────────────────────────────────── */

export function SortToolbarDemo() {
  const [sort, setSort] = React.useState("featured");
  const [density, setDensity] = React.useState<"comfortable" | "compact">("comfortable");
  const [total, setTotal] = React.useState(16);
  const settled = useSettled(total, String(total), 600);
  const [log, setLog] = React.useState<string[]>([]);
  const root = React.useRef<HTMLDivElement>(null);

  // Mirror the toolbar's live region, so you can see what a screen reader hears.
  React.useEffect(() => {
    const region = root.current?.querySelector('[role="status"]');
    if (!region) return;
    const observer = new MutationObserver(() => {
      const text = region.textContent?.replace(/\u200b/g, "").trim();
      if (text) setLog((l) => [text, ...l].slice(0, 4));
    });
    observer.observe(region, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root}>
      <ControlBar>
        <ControlLabel>Results</ControlLabel>
        {[16, 7, 1, 0].map((n) => (
          <Toggle key={n} on={total === n} onClick={() => setTotal(n)}>
            {n}
          </Toggle>
        ))}
        <span className="ml-2 text-[12px] text-muted-foreground">
          Click fast — only the settled count is announced.
        </span>
      </ControlBar>

      <SortToolbar
        total={settled.value}
        loading={settled.loading}
        sort={sort}
        onSortChange={setSort}
        density={density}
        onDensityChange={setDensity}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="ec-eyebrow text-muted-foreground">State</p>
          <p className="mt-1 font-mono text-[12px]">
            sort=&quot;{sort}&quot; density=&quot;{density}&quot;
          </p>
        </div>
        <div>
          <p className="ec-eyebrow text-muted-foreground">Screen reader hears</p>
          <ul className="mt-1 space-y-0.5 font-mono text-[12px]">
            {log.length === 0 ? (
              <li className="text-muted-foreground">Nothing yet — and nothing on first render.</li>
            ) : (
              log.map((line, i) => (
                <li key={`${line}-${i}`} className={i ? "text-muted-foreground" : undefined}>
                  “{line}”
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── empty-results ──────────────────────────────────────────────────────── */

const EMPTY_CASES = {
  filters: "filters",
  search: "search",
  both: "search + filters",
} as const;

export function EmptyResultsDemo() {
  const [mode, setMode] = React.useState<keyof typeof EMPTY_CASES>("filters");
  const [log, setLog] = React.useState<string | null>(null);

  const query = mode === "search" ? "linen lampshade" : mode === "both" ? "boot" : undefined;
  const filters: FilterState =
    mode === "filters"
      ? { color: ["sage"], price: { max: 50 } }
      : mode === "both"
        ? { color: ["sage"] }
        : {};
  const active = describeActiveFilters(filters, FACETS);
  const best = mode === "filters" ? bestRelaxation(filters, active) : null;

  // The copy is the block's whole job, so each case gets its most useful escape.
  const suggestion =
    mode === "filters" && best
      ? { label: `Remove “${best.filter.label}”`, count: best.count }
      : mode === "both"
        ? { label: "Remove “Sage”", count: 2 }
        : { label: "Search “lamp” instead", count: 3 };

  return (
    <div>
      <ControlBar>
        <ControlLabel>Case</ControlLabel>
        {(Object.keys(EMPTY_CASES) as (keyof typeof EMPTY_CASES)[]).map((m) => (
          <Toggle
            key={m}
            on={mode === m}
            onClick={() => {
              setMode(m);
              setLog(null);
            }}
          >
            {EMPTY_CASES[m]}
          </Toggle>
        ))}
      </ControlBar>

      <EmptyResults
        query={query}
        filters={active.map((f) => ({
          id: `${f.facetId}:${f.value ?? ""}`,
          label: f.label,
          onRemove: () => setLog(`onRemove → ${f.label}`),
        }))}
        suggestion={{
          ...suggestion,
          onApply: () => setLog(`suggestion.onApply → ${suggestion.label}`),
        }}
        onClearAll={active.length ? () => setLog("onClearAll") : undefined}
        description={
          mode === "search"
            ? "Check the spelling, or try a broader word."
            : undefined
        }
      />

      <p className="mt-1 h-4 font-mono text-[12px] text-muted-foreground" aria-live="polite">
        {log ?? ""}
      </p>
    </div>
  );
}

/* ─── filter-panel ───────────────────────────────────────────────────────── */

const PRICE_PICKS: { label: string; range: FilterRange }[] = [
  { label: "Under $100", range: { max: 100 } },
  { label: "$100 – $400", range: { min: 100, max: 400 } },
  { label: "$400 and up", range: { min: 400 } },
];

/** A custom part: nothing but useFilterPanel(), and it sits between built-in facets. */
function QuickPicks() {
  const { value, setValue, getFacet } = useFilterPanel();
  const price = getFacet("price");
  if (price?.type !== "range") return null;
  const current = getRange(value, "price");

  return (
    <div className="border-t py-4">
      <p className="mb-2.5 font-medium">Quick picks</p>
      <div className="flex flex-wrap gap-1.5">
        {PRICE_PICKS.map((pick) => {
          const on = current?.min === pick.range.min && current?.max === pick.range.max;
          return (
            <button
              key={pick.label}
              type="button"
              aria-pressed={on}
              onClick={() => setValue(setRange(value, price, on ? {} : pick.range))}
              className={
                "rounded-sm border px-2.5 py-1 text-xs transition-colors hover:border-foreground " +
                (on ? "border-foreground bg-secondary" : "")
              }
            >
              {pick.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FilterPanelDemo() {
  const [filters, setFilters] = useFilterParams(FACETS);
  const key = serializeFilterParams(filters, FACETS).toString();
  const settled = useSettled(filters, key);
  const [loadingDemo, setLoadingDemo] = React.useState(false);
  const [layout, setLayout] = React.useState<"default" | "composed">("default");
  const results = filterProducts(settled.value);
  const panel = {
    facets: withCounts(filters),
    value: filters,
    onValueChange: setFilters,
    loading: loadingDemo || settled.loading,
  };

  return (
    <div>
      <ControlBar>
        <ControlLabel>Layout</ControlLabel>
        {(["default", "composed"] as const).map((l) => (
          <Toggle key={l} on={layout === l} onClick={() => setLayout(l)}>
            {l}
          </Toggle>
        ))}
        <span className="ml-2 text-[12px] text-muted-foreground">
          {layout === "default"
            ? "One tag: <FilterPanel facets value onValueChange />"
            : "Parts in any order, plus a custom part built on useFilterPanel()"}
        </span>
      </ControlBar>

    <div className="grid gap-8 md:grid-cols-[272px_minmax(0,1fr)]">
      {layout === "default" ? (
        <FilterPanel {...panel} />
      ) : (
        <FilterPanel {...panel}>
          <FilterPanelHeader />
          <FilterPanelFacet id="price" />
          <QuickPicks />
          <FilterPanelFacet id="color" />
          <FilterPanelFacet id="in_stock" />
          <FilterPanelChips className="border-t pt-4" />
        </FilterPanel>
      )}

      <div className="space-y-5">
        <QueryString filters={filters} />
        <div>
          <p className="ec-eyebrow text-muted-foreground">Results</p>
          <p className="ec-display ec-num mt-1 text-4xl">
            {settled.loading ? "…" : results.length}
          </p>
          <ul className="mt-3 space-y-1 text-[13px]">
            {results.slice(0, 6).map((p) => (
              <li key={p.id} className="ec-rule flex justify-between gap-3 border-b pb-1">
                <span>{p.name}</span>
                <span className="ec-num text-muted-foreground">${p.price}</span>
              </li>
            ))}
            {results.length > 6 && (
              <li className="text-muted-foreground">and {results.length - 6} more</li>
            )}
          </ul>
        </div>
        <div className="space-y-2 text-[12.5px] leading-relaxed text-muted-foreground">
          <p>
            Every change is a history entry — use the browser&apos;s Back button
            and the panel follows. Reload and the filters survive.
          </p>
          <p>
            Counts are disjunctive: each one is computed with every <em>other</em>{" "}
            facet applied, so picking an option with a count never empties the grid.
          </p>
          <Toggle on={loadingDemo} onClick={() => setLoadingDemo((v) => !v)}>
            Pin loading state
          </Toggle>
        </div>
      </div>
    </div>
    </div>
  );
}

/* ─── filter-sheet ───────────────────────────────────────────────────────── */

export function FilterSheetDemo() {
  const [filters, setFilters] = useFilterParams(FACETS);
  const [commits, setCommits] = React.useState(0);
  const [dismiss, setDismiss] = React.useState<"apply" | "discard">("apply");
  const results = filterProducts(filters);

  return (
    <div className="min-h-[600px]">
      <ControlBar>
        <ControlLabel>Escape / overlay</ControlLabel>
        {(["apply", "discard"] as const).map((d) => (
          <Toggle key={d} on={dismiss === d} onClick={() => setDismiss(d)}>
            {d}
          </Toggle>
        ))}
      </ControlBar>

      <div className="ec-rule flex items-center justify-between gap-4 border-y py-3">
        <p className="ec-num text-sm">{results.length} products</p>
        <FilterSheet
          facets={withCounts(filters)}
          value={filters}
          dismissBehavior={dismiss}
          getResultCount={(staged) => filterProducts(staged).length}
          noun={{ one: "product", other: "products" }}
          onValueChange={(next) => {
            setCommits((c) => c + 1);
            setFilters(next);
          }}
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="ec-eyebrow text-muted-foreground">onValueChange calls</p>
          <p className="ec-display ec-num mt-1 text-5xl">{commits}</p>
          <p className="mt-2 max-w-xs text-[12.5px] leading-relaxed text-muted-foreground">
            Tick six boxes inside the sheet and this still moves by one. The
            listing behind it never re-fetches mid-decision.
          </p>
        </div>
        <QueryString filters={filters} />
      </div>
    </div>
  );
}

/* ─── composed: a whole listing page ─────────────────────────────────────── */

const LISTING_PAGE = 6;

export function ListingPageDemo() {
  const [filters, setFilters] = useFilterParams(FACETS);
  const [sort, setSort] = React.useState("featured");
  const [density, setDensity] = React.useState<"comfortable" | "compact">("comfortable");
  const [page, setPage] = usePageParam();
  const [loadingMore, setLoadingMore] = React.useState(false);

  const key = `${serializeFilterParams(filters, FACETS).toString()}|${sort}`;
  const settled = useSettled({ filters, sort }, key);
  const results = sortProducts(filterProducts(settled.value.filters), settled.value.sort);
  const visible = results.slice(0, page * LISTING_PAGE);
  const facets = withCounts(filters);
  const empty = useEmptyState(filters, setFilters);

  return (
    <ProductQuickView onAddToBag={() => wait(600)}>
      <header className="mb-6">
        <p className="ec-eyebrow text-brand">Collection</p>
        <h1 className="ec-display mt-2 text-5xl sm:text-6xl">Objects for the table</h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
          Eight ecomcn blocks and nothing else: sort-toolbar, filter-panel,
          filter-sheet, product-grid, product-card, product-quick-view,
          load-more and empty-results. Filters and page depth live in this
          frame&apos;s URL.
        </p>
      </header>

      <SortToolbar
        total={results.length}
        loading={settled.loading}
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          setPage(1);
        }}
        density={density}
        onDensityChange={setDensity}
        filters={
          <FilterSheet
            facets={facets}
            value={filters}
            onValueChange={setFilters}
            getResultCount={(staged) => filterProducts(staged).length}
            noun={{ one: "product", other: "products" }}
          />
        }
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <FilterPanel
          className="hidden lg:block lg:self-start"
          facets={facets}
          value={filters}
          onValueChange={setFilters}
          loading={settled.loading}
        />
        <div>
          <ProductGrid
            id="listing-grid"
            products={visible}
            loading={settled.loading}
            loadingMore={loadingMore}
            loadingMoreCount={Math.min(LISTING_PAGE, results.length - visible.length)}
            skeletonCount={density === "compact" ? 8 : 6}
            density={density}
            empty={<EmptyResults {...empty} />}
            renderCard={(product) => (
              <QuickViewCard product={product} density={density} onQuickAdd={() => wait(600)} />
            )}
          />
          {!settled.loading && results.length > 0 ? (
            <LoadMore
              className="mt-10"
              shown={visible.length}
              total={results.length}
              loading={loadingMore}
              controls="listing-grid"
              mode="hybrid"
              onLoadMore={async () => {
                setLoadingMore(true);
                await wait(500);
                setPage(page + 1);
                setLoadingMore(false);
              }}
            />
          ) : null}
        </div>
      </div>
    </ProductQuickView>
  );
}

/* ─── load-more ──────────────────────────────────────────────────────────── */

const PAGE_SIZE = 8;

export function LoadMoreDemo() {
  const [mode, setMode] = React.useState<"button" | "hybrid" | "infinite">("button");
  const [page, setPage] = usePageParam();
  const [loading, setLoading] = React.useState(false);
  const [failNext, setFailNext] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const visible = LARGE_CATALOGUE.slice(0, page * PAGE_SIZE);

  const loadMore = async () => {
    setError(null);
    setLoading(true);
    await wait(700);
    setLoading(false);
    if (failNext) {
      setFailNext(false);
      setError("Couldn’t load more products. Check your connection.");
      return;
    }
    setPage(page + 1);
  };

  return (
    <div>
      <ControlBar>
        <ControlLabel>Mode</ControlLabel>
        {(["button", "hybrid", "infinite"] as const).map((m) => (
          <Toggle key={m} on={mode === m} onClick={() => setMode(m)}>
            {m}
          </Toggle>
        ))}
        <ControlLabel className="ml-4">Next load</ControlLabel>
        <Toggle on={failNext} onClick={() => setFailNext((f) => !f)}>
          fails
        </Toggle>
        <Toggle on={false} onClick={() => setPage(1)}>
          reset
        </Toggle>
      </ControlBar>

      <ProductGrid
        id="load-more-grid"
        density="compact"
        products={visible}
        loadingMore={loading}
        loadingMoreCount={Math.min(PAGE_SIZE, LARGE_CATALOGUE.length - visible.length)}
      />
      <LoadMore
        className="mt-10"
        shown={visible.length}
        total={LARGE_CATALOGUE.length}
        loading={loading}
        error={error}
        mode={mode}
        controls="load-more-grid"
        onLoadMore={loadMore}
      />
      <p className="mt-6 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
        The page depth is in this frame&apos;s URL as <code>?page={page}</code> —
        reload and the same products are still on screen. Load by keyboard and
        focus lands on the first new product, not back on the button.
      </p>
    </div>
  );
}

/* ─── product-quick-view ─────────────────────────────────────────────────── */

export function ProductQuickViewDemo() {
  const [log, setLog] = React.useState<string | null>(null);
  return (
    <div>
      <ProductQuickView
        onAddToBag={async (product, colorIndex) => {
          await wait(600);
          setLog(`onAddToBag → ${product.name}, ${product.colors?.[colorIndex]?.name ?? "default"}`);
        }}
        renderDetails={(product) => (
          <p className="max-w-sm leading-relaxed text-muted-foreground">
            {product.brand} makes the {product.name.toLowerCase()} in small runs. Pass
            anything here through <code>renderDetails</code> — sizes, materials, a
            size-guide link.
          </p>
        )}
      >
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3">
          {PRODUCTS.slice(0, 6).map((product) => (
            <QuickViewCard key={product.id} product={product} />
          ))}
        </div>
      </ProductQuickView>
      <p className="mt-4 h-4 font-mono text-[12px] text-muted-foreground" aria-live="polite">
        {log ?? "Hover a card and choose Quick view — or Tab to it. Escape closes."}
      </p>
    </div>
  );
}
