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
  /** Slug of a composed example this block appears in. */
  example?: string;
};

/** Whole pages built from several blocks — previewed at /examples/<slug>. */
export type Example = {
  slug: string;
  title: string;
  stage: Stage;
  summary: string;
  blocks: string[];
};

export const EXAMPLES: Example[] = [
  {
    slug: "listing-page",
    title: "Listing page",
    stage: "Browse",
    summary:
      "A collection page built from ecomcn alone: toolbar, URL-driven filters on desktop, a staged sheet on mobile, composed cards with a quick-view morph, load more, and a useful empty state.",
    blocks: ["sort-toolbar", "filter-panel", "filter-sheet", "product-grid", "product-card", "product-quick-view", "load-more", "empty-results", "price-tag"],
  },
];

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
  { slug: "product-card", title: "Product card", stage: "Browse", kind: "block", status: "shipped", summary: "Badges, compare-at pricing, colour swatches that swap the image, and a keyboard-reachable quick-add — one tag, or recomposed from its parts.", designNote: "Quick-add slides up from the bottom edge of the image rather than floating over it, so it never covers the product. One link target for the whole card via an ::after overlay on the title anchor — no nested anchors.", hardPart: "Quick-add has to be reachable without a pointer, so it carries focus-visible:translate-y-0 alongside the hover rule. The parts share one context — the selected colour, the quick-add state — so a swatch can swap the image without either part knowing the other exists."},
  { slug: "product-grid", title: "Product grid", stage: "Browse", kind: "block", status: "shipped", example: "listing-page", summary: "Responsive grid with box-matched skeletons, a density switch and an empty state.", designNote: "Column gap is tighter than row gap (20px / 36px), so products group by row the way they do on a page of a printed catalogue rather than reading as a uniform mesh.", hardPart: "Skeletons must match the real card's box exactly or the grid jumps on load — same aspect ratio, same four text bars. A spinner here is always the wrong answer."},
  { slug: "filter-panel", title: "Filter panel", stage: "Browse", kind: "block", status: "shipped", example: "listing-page", summary: "Applied chips, counts, a dual-handle range, swatches and toggles — state in the URL, layout in your hands via compound parts.", designNote: "Groups are divided by top rules, not boxed, and counts sit right-aligned in tabular figures so the column reads like an index. Swatches always print their name; the selected state adds a check and a heavier border, so colour is never the only signal.", hardPart: "The state belongs in the URL, not in React: deep links, refresh and the Back button are the point of a listing page. A pure parser runs in server components to fetch the right results; useFilterParams drives the client, commits the slider on release rather than per pixel, and never pushes a duplicate history entry." },
  { slug: "filter-sheet", title: "Filter sheet", stage: "Browse", kind: "block", status: "shipped", example: "listing-page", summary: "The same facets in a slide-over — staged, applied once, with a live “Show N” count.", designNote: "The footer sits outside the scroll area, so its rule runs edge to edge and the primary action never scrolls away. The apply button carries the staged count, so a shopper sees the outcome before committing to it.", hardPart: "Staging. Applying every tap re-fetches the listing behind the sheet; this applies once — on Show or on close — and only if something changed. And it uses a real SheetTrigger: a plain button that flips `open` leaves focus on <body> when the sheet closes." },
  { slug: "load-more", title: "Load more", stage: "Browse", kind: "component", status: "shipped", example: "listing-page", summary: "Progress rule, “Showing 24 of 312”, a Load more button and optional hybrid or infinite loading.", designNote: "The top rule is the progress bar, filled to the share already shown — the listing’s own hairline doing a second job instead of a new widget. Count on the left, action on the right, so it reads as the foot of the page rather than a floating button.", hardPart: "Baymard found a Load more button beats both pagination and pure infinite scroll. The details are what make it work: focus moves to the first new product after a click, the new count is announced, `?page=3` restores the same depth on reload, and hybrid mode only auto-loads after the shopper has asked once." },
  { slug: "product-quick-view", title: "Quick view", stage: "Browse", kind: "block", status: "shipped", example: "listing-page", summary: "The card’s image morphs into a dialog and back — a shared-element transition with Motion.", designNote: "One morph, used where it carries meaning: the image you chose is the thing that grows, so you never lose track of which product opened. No bounce — an editorial transition settles. The panel surface fades on its own layer so the moving image is never inside something that is also fading.", hardPart: "The morph is the easy part (Motion’s layoutId). The rest is the dialog: a native <dialog> for the top layer and an inert page, Escape that plays the closing morph instead of vanishing, focus returned to the trigger only after the image lands, and reduced-motion users getting no movement at all. It is the one block that depends on motion, so it is opt-in." },
  { slug: "sort-toolbar", title: "Sort toolbar", stage: "Browse", kind: "component", status: "shipped", example: "listing-page", summary: "Result count, native sort select, density switch and a slot for the mobile filter trigger.", designNote: "Hairlines above and below and nothing else — it reads as the masthead rule of the listing, not a floating control bar. Sort is a native select on purpose: on a phone the OS picker beats any popover we could draw.", hardPart: "Screen-reader users can't see the grid reflow, so the count must be announced — but announcing every intermediate count while someone clicks through filters is noise. The live region stays silent on first render and while loading, then speaks once when results settle." },
  { slug: "empty-results", title: "Empty results", stage: "Browse", kind: "component", status: "shipped", example: "listing-page", summary: "Names the filters that emptied the grid and offers the one change that brings the most back.", designNote: "Left-aligned: eyebrow, headline, one primary action, then the filters as removable chips. A centred icon-and-sentence empty state is the most reliable tell of a generated interface.", hardPart: "Being specific. “No results” is a dead end; “Nothing matches Sage and Up to $50 — remove ‘Up to $50’ to see 4” is a detour. The block takes that suggestion as data, so the count can come from your search backend." },

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
