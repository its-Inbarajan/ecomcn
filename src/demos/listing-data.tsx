import type { ProductCardProduct } from "@/components/ecomcn/product-card";
import { ProductPhoto, type Photo } from "@/components/site/product-photo";
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
  chalk: { label: "Chalk", hex: "#e7e3da" },
  sage: { label: "Sage", hex: "#7d8b7a" },
  terracotta: { label: "Terracotta", hex: "#b5563a" },
  amber: { label: "Amber", hex: "#9c5a1c" },
  tan: { label: "Tan", hex: "#a8764a" },
  oak: { label: "Oak", hex: "#cfae80" },
  walnut: { label: "Walnut", hex: "#5b3d28" },
  copper: { label: "Copper", hex: "#c48a74" },
  clear: { label: "Clear", hex: "#dfe5e3" },
} as const;

type ColorKey = keyof typeof COLORS;

/**
 * Product photography: free Unsplash photos, one per colourway, so a swatch
 * swaps the image the way it would in a real store. Stock photos don't come
 * in matching sets, so a colourway sometimes shows a sibling product —
 * close enough to show the pattern.
 */
const photo = (id: string, crop?: Photo["crop"]) => (
  <ProductPhoto
    photo={{ id, crop }}
    className="transition-transform duration-700 group-hover:scale-[1.04]"
  />
);

/** A colour and its photo: the id in images.unsplash.com/photo-<id>. */
type Colorway = [color: ColorKey, photo: string, crop?: Photo["crop"]];

type Row = [
  id: string,
  name: string,
  brand: string,
  category: "bags" | "lighting" | "tableware" | "glassware" | "footwear" | "furniture",
  material: string,
  price: number,
  compareAt: number | undefined,
  colors: Colorway[],
  inStock: boolean,
  rating: number,
  reviews: number,
  badge?: string,
];

const ROWS: Row[] = [
  ["p1", "Field Tote 24L", "Aarhus Supply", "bags", "canvas", 195, 240,
    [["chalk", "1574365569389-a10d488ca3fb"], ["black", "1578237493287-8d4d2b03591a"]], true, 4.7, 1022],
  ["p2", "Ora Table Lamp", "Mensa", "lighting", "ceramic", 310, undefined,
    [["chalk", "1580130281320-0ef0754f2bf7"], ["black", "1573676386604-78f8ed228e2b"]], true, 4.4, 431, "New"],
  ["p3", "Kiln Mug, Set of 4", "Mira Studio", "tableware", "ceramic", 84, undefined,
    [["terracotta", "1615894632464-c746c61feb6d"], ["chalk", "1570784332176-fdd73da66f03"], ["walnut", "1633677224449-7787d6ed2985"]], true, 4.8, 596],
  ["p4", "Vester Chelsea Boot", "Lindqvist", "footwear", "leather", 420, undefined,
    [["tan", "1773425975272-35f0900a9d8f"], ["walnut", "1777987601677-3059be0e1388"], ["black", "1534233812932-59b8fa1b780c"]], false, 4.5, 307, "Restocked"],
  ["p5", "Bellwether Carafe", "Nordhaus", "glassware", "glass", 128, 165,
    [["amber", "1647943746660-1640133068d5"], ["clear", "1743187360373-513ac4a7266f", "left"]], true, 4.6, 214],
  ["p6", "Halden Lounge Chair", "Verk", "furniture", "oak", 1240, undefined,
    [["oak", "1580480055273-228ff5388ef8"], ["terracotta", "1572297794908-f2ee5a2930d6"]], true, 4.9, 88],
  ["p7", "Market Tote 12L", "Aarhus Supply", "bags", "canvas", 118, undefined,
    [["tan", "1544816155-12df9643f363"]], true, 4.5, 402],
  ["p8", "Studio Pendant", "Mensa", "lighting", "metal", 265, 330,
    [["chalk", "1565814329452-e1efa11c5b89"], ["black", "1560851668-e96ae9cfe945"]], true, 4.3, 156],
  ["p9", "Stoneware Bowl, Pair", "Mira Studio", "tableware", "ceramic", 58, undefined,
    [["sage", "1587560555570-4d3f84dcee05"], ["chalk", "1530006498959-b7884e829a04"], ["black", "1622947344865-a7fcf40e88e7"]], true, 4.7, 811],
  ["p10", "Ribbed Tumbler, Set of 6", "Nordhaus", "glassware", "glass", 72, undefined,
    [["clear", "1784429611767-00e82ff939b0"]], false, 4.2, 97],
  ["p11", "Arlo Desk Lamp", "Verk", "lighting", "metal", 385, undefined,
    [["chalk", "1570974802254-4b0ad1a755f5"], ["copper", "1542728928-1413d1894ed1"]], true, 4.6, 64],
  ["p12", "Trail Derby", "Lindqvist", "footwear", "leather", 360, 420,
    [["walnut", "1625357165350-bdbcb6d7d524"], ["black", "1668069226492-508742b03147"]], true, 4.4, 233],
  ["p13", "Weekender Duffel", "Aarhus Supply", "bags", "canvas", 245, undefined,
    [["tan", "1448582649076-3981753123b5"]], true, 4.8, 129, "New"],
  ["p14", "Nesting Tables, Set of 3", "Verk", "furniture", "walnut", 540, 620,
    [["walnut", "1611486212355-d276af4581c0"]], true, 4.7, 41],
  ["p15", "Pour-over Set", "Mira Studio", "tableware", "ceramic", 96, undefined,
    [["chalk", "1610874150308-a1e6f8c905d9"], ["black", "1783206695207-aa4deabafa7b"]], true, 4.5, 370],
  ["p16", "Counter Stool", "Verk", "furniture", "oak", 310, undefined,
    [["oak", "1537468243621-d21861d29fe3"]], false, 4.3, 52],
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
    colorKeys: colors.map(([key]) => key),
    colors: colors.map(([key, id, crop]) => ({
      name: COLORS[key].label,
      hex: COLORS[key].hex,
      image: photo(id, crop),
    })),
    image: photo(colors[0][1], colors[0][2]),
  }),
);

/** 48 products for the load-more demo: the catalogue three times over. */
export const LARGE_CATALOGUE: DemoProduct[] = Array.from({ length: 48 }, (_, i) => {
  const base = PRODUCTS[i % PRODUCTS.length];
  const run = Math.floor(i / PRODUCTS.length);
  return {
    ...base,
    id: `${base.id}-${run}`,
    name: run === 0 ? base.name : `${base.name}, No. ${run + 1}`,
    price: base.price + run * 15,
    badge: run === 0 ? base.badge : undefined,
  };
});

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
