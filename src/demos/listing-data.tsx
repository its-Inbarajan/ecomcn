import type { ProductCardProduct } from "@/components/ecomcn/product-card";
import { ProductArt, type ArtKind } from "@/components/site/product-art";
import {
  getRange,
  getToggle,
  getValues,
  removeFilter,
  type ActiveFilter,
  type FilterFacet,
  type FilterState,
} from "@/lib/filter-params";

/**
 * Demo catalogue for the Browse previews. Site code, not registry code:
 * adopters get the blocks, never our sample data or this filtering logic —
 * in a real store the counts come from the search backend.
 */

export type DemoProduct = ProductCardProduct & {
  category: string;
  material: string;
  colorKeys: string[];
  inStock: boolean;
  added: number;
};

const COLORS = {
  black: { label: "Black", hex: "#1c1b1a" },
  oak: { label: "Oak", hex: "#c8a173" },
  sage: { label: "Sage", hex: "#7d8b7a" },
  terracotta: { label: "Terracotta", hex: "#b5563a" },
  chalk: { label: "Chalk", hex: "#e7e3da" },
  olive: { label: "Olive", hex: "#5d6446" },
  amber: { label: "Amber", hex: "#b4762f" },
  walnut: { label: "Walnut", hex: "#5b3d28" },
} as const;

type ColorKey = keyof typeof COLORS;

const art = (kind: ArtKind) => (
  <ProductArt
    kind={kind}
    className="size-full transition-transform duration-700 group-hover:scale-[1.04]"
  />
);

const CATEGORY_ART: Record<string, ArtKind> = {
  bags: "tote",
  lighting: "lamp",
  tableware: "mug",
  glassware: "bottle",
  footwear: "boot",
  furniture: "chair",
};

type Row = [
  id: string,
  name: string,
  brand: string,
  category: keyof typeof CATEGORY_ART,
  material: string,
  price: number,
  compareAt: number | undefined,
  colors: ColorKey[],
  inStock: boolean,
  rating: number,
  reviews: number,
  badge?: string,
];

const ROWS: Row[] = [
  ["p1", "Field Tote 24L", "Aarhus Supply", "bags", "canvas", 195, 240, ["olive", "black", "chalk"], true, 4.7, 1022],
  ["p2", "Ora Table Lamp", "Mensa", "lighting", "ceramic", 310, undefined, ["chalk", "sage", "black"], true, 4.4, 431, "New"],
  ["p3", "Kiln Mug, Set of 4", "Mira Studio", "tableware", "ceramic", 84, undefined, ["terracotta", "chalk"], true, 4.8, 596],
  ["p4", "Vester Chelsea Boot", "Lindqvist", "footwear", "leather", 420, undefined, ["walnut", "black"], false, 4.5, 307, "Restocked"],
  ["p5", "Bellwether Carafe", "Nordhaus", "glassware", "glass", 128, 165, ["amber", "sage"], true, 4.6, 214],
  ["p6", "Halden Lounge Chair", "Verk", "furniture", "oak", 1240, undefined, ["oak", "walnut"], true, 4.9, 88],
  ["p7", "Market Tote 12L", "Aarhus Supply", "bags", "canvas", 118, undefined, ["sage", "chalk"], true, 4.5, 402],
  ["p8", "Pleat Pendant", "Mensa", "lighting", "linen", 265, 330, ["chalk", "terracotta"], true, 4.3, 156],
  ["p9", "Stoneware Bowl, Pair", "Mira Studio", "tableware", "ceramic", 58, undefined, ["sage", "chalk", "black"], true, 4.7, 811],
  ["p10", "Tumbler, Set of 6", "Nordhaus", "glassware", "glass", 72, undefined, ["amber", "olive"], false, 4.2, 97],
  ["p11", "Arlo Desk Lamp", "Verk", "lighting", "oak", 385, undefined, ["oak", "black"], true, 4.6, 64],
  ["p12", "Trail Derby", "Lindqvist", "footwear", "leather", 360, 420, ["black", "walnut"], true, 4.4, 233],
  ["p13", "Linen Weekender", "Aarhus Supply", "bags", "linen", 245, undefined, ["olive", "terracotta"], true, 4.8, 129, "New"],
  ["p14", "Side Table No. 3", "Verk", "furniture", "walnut", 540, 620, ["walnut"], true, 4.7, 41],
  ["p15", "Pour-over Set", "Mira Studio", "tableware", "ceramic", 96, undefined, ["black", "chalk"], true, 4.5, 370],
  ["p16", "Stool, Low", "Verk", "furniture", "oak", 310, undefined, ["oak", "black"], false, 4.3, 52],
];

export const PRODUCTS: DemoProduct[] = ROWS.map(
  ([id, name, brand, category, material, price, compareAt, colors, inStock, rating, reviewCount, badge], i) => ({
    id,
    name,
    brand,
    href: "#",
    price,
    compareAt,
    badge,
    rating,
    reviewCount,
    category,
    material,
    inStock,
    added: ROWS.length - i,
    colorKeys: colors,
    colors: colors.map((key) => ({ name: COLORS[key].label, hex: COLORS[key].hex })),
    image: art(CATEGORY_ART[category]),
  }),
);

const titleCase = (s: string) => s[0].toUpperCase() + s.slice(1);
const unique = (values: string[]) => [...new Set(values)].sort();

/** Facet definitions — ids, types and bounds. Stable, so the URL hook can parse. */
export const FACETS: FilterFacet[] = [
  {
    id: "category",
    label: "Category",
    type: "list",
    options: unique(PRODUCTS.map((p) => p.category)).map((value) => ({
      value,
      label: titleCase(value),
    })),
  },
  {
    id: "color",
    label: "Colour",
    type: "swatch",
    options: (Object.keys(COLORS) as ColorKey[]).map((value) => ({
      value,
      label: COLORS[value].label,
      swatch: COLORS[value].hex,
    })),
  },
  { id: "price", label: "Price", type: "range", min: 0, max: 1300, step: 10, format: "currency" },
  {
    id: "material",
    label: "Material",
    type: "list",
    limit: 4,
    options: unique(PRODUCTS.map((p) => p.material)).map((value) => ({
      value,
      label: titleCase(value),
    })),
  },
  { id: "in_stock", label: "In stock only", type: "toggle" },
];

/** `except` skips one facet — that is what makes counts disjunctive. */
export function matches(product: DemoProduct, state: FilterState, except?: string) {
  const category = getValues(state, "category");
  if (except !== "category" && category.length && !category.includes(product.category)) return false;

  const material = getValues(state, "material");
  if (except !== "material" && material.length && !material.includes(product.material)) return false;

  const color = getValues(state, "color");
  if (except !== "color" && color.length && !product.colorKeys.some((c) => color.includes(c))) return false;

  const price = getRange(state, "price");
  if (except !== "price" && price) {
    if (price.min !== undefined && product.price < price.min) return false;
    if (price.max !== undefined && product.price > price.max) return false;
  }

  if (except !== "in_stock" && getToggle(state, "in_stock") && !product.inStock) return false;
  return true;
}

export const filterProducts = (state: FilterState) => PRODUCTS.filter((p) => matches(p, state));

/**
 * Each option's count is "results if you also picked this", computed with
 * every *other* facet applied. Selecting an option with a count never empties
 * the grid — only a range or a toggle can, which is what the empty state is for.
 */
export function withCounts(state: FilterState): FilterFacet[] {
  return FACETS.map((facet) => {
    const pool = PRODUCTS.filter((p) => matches(p, state, facet.id));
    if (facet.type === "list") {
      const key = facet.id as "category" | "material";
      return {
        ...facet,
        options: facet.options.map((o) => ({ ...o, count: pool.filter((p) => p[key] === o.value).length })),
      };
    }
    if (facet.type === "swatch") {
      return {
        ...facet,
        options: facet.options.map((o) => ({ ...o, count: pool.filter((p) => p.colorKeys.includes(o.value)).length })),
      };
    }
    if (facet.type === "toggle") {
      return { ...facet, count: pool.filter((p) => p.inStock).length };
    }
    return facet;
  });
}

export function sortProducts(products: DemoProduct[], sort: string) {
  const list = [...products];
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  if (sort === "newest") list.sort((a, b) => b.added - a.added);
  return list;
}

/**
 * The one filter whose removal brings back the most — what the empty state
 * should offer first, instead of a generic "clear all".
 */
export function bestRelaxation(state: FilterState, active: ActiveFilter[]) {
  let best: { filter: ActiveFilter; count: number } | null = null;
  for (const filter of active) {
    const count = filterProducts(removeFilter(state, filter.facetId, filter.value)).length;
    if (count > 0 && (!best || count > best.count)) best = { filter, count };
  }
  return best;
}
