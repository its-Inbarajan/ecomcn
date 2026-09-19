/**
 * The v1 catalogue. Blocks are organised by the decision a buyer is making,
 * not by widget type — that is why an adopter can find one by the problem
 * they have. `status: "shipped"` means it exists in src/registry/ecomcn.
 */

export type Stage =
  | "Discover"
  | "Browse"
  | "Product"
  | "Cart & checkout"
  | "Post-purchase";

export type Block = {
  slug: string;
  title: string;
  stage: Stage;
  kind: "ui" | "component" | "block" | "theme";
  summary: string;
  status: "shipped" | "planned";
  /** The decision that keeps this block from looking generated. */
  designNote?: string;
  /** What most component kits get wrong here. */
  hardPart?: string;
};

export const STAGES: { name: Stage; blurb: string }[] = [
  {
    name: "Discover",
    blurb: "Landing surfaces. Their only job is to make one thing look worth clicking.",
  },
  {
    name: "Browse",
    blurb: "The listing page. Where most of a store's revenue is actually decided.",
  },
  {
    name: "Product",
    blurb: "Every objection a buyer has gets answered here or nowhere.",
  },
  {
    name: "Cart & checkout",
    blurb: "Pure friction removal. Every element either reduces doubt or gets cut.",
  },
  {
    name: "Post-purchase",
    blurb: "The part most component kits skip — and the part that drives repeat orders.",
  },
];

export const BLOCKS: Block[] = [
  // Discover
  { slug: "announcement-bar", title: "Announcement bar", stage: "Discover", kind: "component", status: "planned", summary: "Dismissible ticker for shipping thresholds, sale windows and drops." },
  { slug: "hero-editorial", title: "Editorial hero", stage: "Discover", kind: "block", status: "planned", summary: "Asymmetric split hero with an overlaid product caption." },
  { slug: "category-rail", title: "Category rail", stage: "Discover", kind: "block", status: "planned", summary: "Snap-aligned category tiles with a numbered index and counts." },
  { slug: "collection-grid", title: "Collection grid", stage: "Discover", kind: "block", status: "planned", summary: "Magazine grid — one dominant tile, two supporting." },
  { slug: "lookbook-strip", title: "Shoppable lookbook", stage: "Discover", kind: "block", status: "planned", summary: "Full-bleed campaign image with product hotspots." },

  // Browse
  { slug: "product-card", title: "Product card", stage: "Browse", kind: "block", status: "shipped", summary: "Badges, compare-at pricing, colour swatches and a keyboard-reachable quick-add.", designNote: "Quick-add slides up from the bottom edge of the image rather than floating over it, so it never covers the product. One link target for the whole card via an ::after overlay on the title anchor — no nested anchors.", hardPart: "Quick-add has to be reachable without a pointer, so it carries focus-visible:translate-y-0 alongside the hover rule. The image arrives as a ReactNode, which is what keeps the block free of next/image."},
  { slug: "product-grid", title: "Product grid", stage: "Browse", kind: "block", status: "shipped", summary: "Responsive grid with box-matched skeletons, a density switch and an empty state.", designNote: "Column gap is tighter than row gap (20px / 36px), so products group by row the way they do on a page of a printed catalogue rather than reading as a uniform mesh.", hardPart: "Skeletons must match the real card's box exactly or the grid jumps on load — same aspect ratio, same four text bars. A spinner here is always the wrong answer."},
  { slug: "filter-panel", title: "Faceted filter panel", stage: "Browse", kind: "block", status: "planned", summary: "Applied chips, counts, dual-handle price slider, colour swatches." },
  { slug: "filter-sheet", title: "Filter sheet", stage: "Browse", kind: "block", status: "planned", summary: "The same facets in a slide-over with a sticky Clear / Show N footer." },
  { slug: "sort-toolbar", title: "Sort toolbar", stage: "Browse", kind: "component", status: "planned", summary: "Result count, sort select, density toggle, mobile filter trigger." },
  { slug: "empty-results", title: "Empty results", stage: "Browse", kind: "component", status: "planned", summary: "Names the offending filter and offers the one useful escape." },

  // Product
  { slug: "product-gallery", title: "Product gallery", stage: "Product", kind: "block", status: "planned", summary: "Thumbnail rail, counter overlay, swipe on mobile." },
  { slug: "price-tag", title: "Price tag", stage: "Product", kind: "ui", status: "shipped", summary: "Locale-aware price with compare-at strike and a computed discount badge.", designNote: "Tabular numerals throughout, so a column of prices aligns. A discounted price turns sale-red and gains a computed percentage; a regular price stays ink and stays quiet.", hardPart: "Intl.NumberFormat with currency and locale as props. Hardcoding a dollar sign is the single most common bug in component kits, and the one an adopter in the eurozone hits on day one."},
  { slug: "variant-swatches", title: "Variant swatches", stage: "Product", kind: "block", status: "planned", summary: "Colour swatches and a size grid with out-of-stock strike-through." },
  { slug: "size-guide-dialog", title: "Size guide dialog", stage: "Product", kind: "component", status: "planned", summary: "Measurement table plus a fit note, opened from the size label." },
  { slug: "product-buy-box", title: "Buy box", stage: "Product", kind: "block", status: "planned", summary: "Variants, quantity, add-to-bag carrying the live total, delivery promise." },
  { slug: "product-details-accordion", title: "Details accordion", stage: "Product", kind: "component", status: "planned", summary: "Materials, care, shipping and maker sections." },
  { slug: "review-summary", title: "Review summary", stage: "Product", kind: "block", status: "planned", summary: "Star histogram that filters the list, fit slider, verified badges." },
  { slug: "related-products", title: "Related products", stage: "Product", kind: "block", status: "planned", summary: "Snap-scrolling rail built from the same product card." },

  // Cart & checkout
  { slug: "cart-line-item", title: "Cart line item", stage: "Cart & checkout", kind: "component", status: "planned", summary: "Quantity stepper, line total, save-for-later, remove-with-undo." },
  { slug: "cart-sheet", title: "Cart sheet", stage: "Cart & checkout", kind: "block", status: "planned", summary: "Slide-over mini cart with a sticky subtotal footer." },
  { slug: "order-summary", title: "Order summary", stage: "Cart & checkout", kind: "block", status: "shipped", summary: "Free-shipping meter, promo code, itemised totals and a testable totals hook.", designNote: "The total is set in the display serif against a heavy rule — the only thing in the panel that shouts. Everything above it is 13px and tabular.", hardPart: "Tax and shipping are estimates until an address exists, and the block says so. Totals live in a separate hook so they can be unit-tested without rendering anything."},
  { slug: "checkout-stepper", title: "Checkout stepper", stage: "Cart & checkout", kind: "component", status: "planned", summary: "Four-step rail with done / active / pending states." },
  { slug: "payment-selector", title: "Payment selector", stage: "Cart & checkout", kind: "block", status: "planned", summary: "Radio cards for card / wallet / pay-in-3 that expand to their fields." },
  { slug: "address-form", title: "Address form", stage: "Cart & checkout", kind: "block", status: "planned", summary: "Country-aware fields with correct autocomplete tokens." },

  // Post-purchase
  { slug: "order-confirmation", title: "Order confirmation", stage: "Post-purchase", kind: "block", status: "planned", summary: "The receipt people screenshot — printable, permalinked." },
  { slug: "order-tracking", title: "Order tracking", stage: "Post-purchase", kind: "block", status: "planned", summary: "Shipment timeline with a live node and carrier status." },
];

export const shipped = BLOCKS.filter((b) => b.status === "shipped");
export const byStage = (stage: Stage) => BLOCKS.filter((b) => b.stage === stage);

export const DESIGN_RULES = [
  { n: "01", title: "Radius 2px, not 12", body: "Uniform pill-rounding is the loudest tell of a generated interface. --radius is 0.125rem; rules and edges do the work." },
  { n: "02", title: "Rules over cards", body: "Sections are separated by hairlines, not stacked shadow boxes. A page reads as one ruled object, the way a printed catalogue does." },
  { n: "03", title: "One serif, one grotesque", body: "Names, prices and section heads in a high-contrast serif. Everything functional in a neutral sans. Two faces, no third." },
  { n: "04", title: "Asymmetry on purpose", body: "1.05fr / 0.95fr splits, 7/5 grids, left-aligned empty states. Nothing is centred unless centring is the point." },
  { n: "05", title: "One accent, used sparingly", body: "A single vermilion carries sale states, the active step and the live tracking node. No gradient, anywhere." },
  { n: "06", title: "Tabular numerals everywhere", body: "Prices, counts, sizes, order numbers. A column of prices that doesn't align is the fastest way to look unfinished." },
];
