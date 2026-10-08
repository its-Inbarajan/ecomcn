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
  /** Every block on the page, for "What it is made of". */
  blocks: string[];
  /** What to `add`: registry dependencies bring in the rest. */
  install: string[];
  /** What to try in the preview. */
  notes: string;
};

export const EXAMPLES: Example[] = [
  {
    slug: "listing-page",
    title: "Listing page",
    stage: "Browse",
    summary:
      "A collection page built from ecomcn alone: toolbar, URL-driven filters on desktop, a staged sheet on mobile, composed cards with a quick-view morph, load more, and a useful empty state.",
    blocks: ["sort-toolbar", "filter-panel", "filter-sheet", "product-grid", "product-card", "product-quick-view", "load-more", "empty-results", "price-tag"],
    // filter-sheet brings filter-panel; product-grid and product-quick-view
    // bring product-card and price-tag.
    install: ["sort-toolbar", "filter-sheet", "product-grid", "product-quick-view", "load-more", "empty-results"],
    notes:
      "Try it at the mobile width: the sidebar panel gives way to the filter sheet, which stages changes and applies them once. Every filter \u2014 and how many pages are loaded \u2014 is in the preview frame\u2019s URL, and the browser\u2019s Back button undoes filters one at a time. Open a quick view to see the card image morph into the dialog.",
  },
  {
    slug: "product-page",
    title: "Product page",
    stage: "Product",
    summary:
      "A product page built from ecomcn alone: a gallery that follows the colour you pick, the buy box with stock-aware swatches and a size guide, details, reviews that filter, and a rail of related products.",
    blocks: ["product-gallery", "product-buy-box", "variant-swatches", "size-guide-dialog", "price-tag", "product-details-accordion", "review-summary", "related-products", "product-card"],
    // product-buy-box brings variant-swatches and price-tag; related-products
    // brings product-card.
    install: ["product-gallery", "product-buy-box", "size-guide-dialog", "product-details-accordion", "review-summary", "related-products"],
    notes:
      "Pick Black: the gallery swaps to its photos, the price drops to its own, and most sizes strike through. Press add before choosing a size and the button asks. Hover the photo to zoom; press it to open full screen. The rating under the name jumps to the reviews, whose histogram filters the list.",
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
  { slug: "product-gallery", title: "Product gallery", stage: "Product", kind: "block", status: "shipped", example: "product-page", summary: "Main photo with a counter and thumbnails; swipe on a phone, hover-zoom on a desktop, full screen from the photo itself.", designNote: "The active thumbnail carries a solid frame that slides to the next; the rest drop to 60% rather than being greyed out. Thumbnails stand in a column beside the photo on a desktop and run in a row under it on a phone, scrolling without a scrollbar. Pressing the photo opens it full screen: the photo\u2019s box opens to the screen and folds back into it, the same container morph as the size guide.", hardPart: "Three ways in, one gallery. A finger swipes; a mouse zooms where it points instead of dragging, since Embla drags only for touch; and the full-screen view is the zoom for touch and the keyboard, so nothing is hover-only. Loading is rationed: the first photo has priority, the second is fetched early, and the rest wait until they are next. Images are data, rendered as <img> or through your own renderImage, so the gallery still decides what loads when \u2014 next/image included."},
  { slug: "price-tag", title: "Price tag", stage: "Product", kind: "ui", status: "shipped", summary: "Locale-aware price with compare-at strike and a computed discount badge.", designNote: "Tabular numerals throughout, so a column of prices aligns. A discounted price turns sale-red and gains a computed percentage; a regular price stays ink and stays quiet.", hardPart: "Intl.NumberFormat with currency and locale as props. Hardcoding a dollar sign is the single most common bug in component kits, and the one an adopter in the eurozone hits on day one."},
  { slug: "variant-swatches", title: "Variant swatches", stage: "Product", kind: "block", status: "shipped", summary: "Colour swatches and a ruled size grid that work out stock from your variants — sold-out options struck through, still choosable, and a line that says why.", designNote: "The size grid is one ruled block — hairlines between cells, not eight separate buttons — and the pick is a slab of ink that slides from cell to cell on the same settle curve as the other morphs. Swatches are square chips with a ruled frame for the pick. A size with a few pairs left carries “2 left” under its number; the status line underneath says the rest in a sentence.", hardPart: "Unavailable without colour alone, and without disappearing. A diagonal rule strikes a sold-out size or colour — with a halo on swatches, so it reads on black as well as chalk — and the option is never disabled: it stays in the tab order, a screen reader hears “43, sold out”, and it can still be chosen, because a shopper who wants that size wants to be told when it is back. The status line says why the pick can't be bought (“43 is sold out in Black.”) and the root reports purchasable: false for your button. Stock is worked out per option against the other picks, and the arrow keys move without choosing, so arrowing past a colour never swaps the photo on the way." },
  { slug: "size-guide-dialog", title: "Size guide dialog", stage: "Product", kind: "component", status: "shipped", summary: "Measurement table in cm or inches with the shopper's size marked, opened from a quiet link beside the size label.", designNote: "Ruled, not striped: the header row uses the tracked-out eyebrow and every row sits on one hairline, so it reads like a printed size chart. The trigger is a text link with a ruler, not a button — it answers a question beside the size label without competing with add-to-bag. The panel grows out of that link and folds back into it: a container transform in Motion, contents fading in only once the surface has landed.", hardPart: "Scroll containment. A five-column chart is wider than a phone, so the table scrolls sideways inside itself — never the page — while the size column stays pinned — with no scrollbar drawn, a soft edge says there are more columns. And conversion has to be honest: ranges round to the nearest half inch the way a tape reads, and equivalents like \u201cUK 7\u201d are text that no toggle ever touches." },
  { slug: "product-buy-box", title: "Buy box", stage: "Product", kind: "block", status: "shipped", summary: "Variants, quantity, an add-to-bag that carries the live total and rolls back if it fails, and a delivery date range.", designNote: "The button carries the price: \u201cAdd to bag \u2014 $840\u201d removes the sum a shopper would otherwise do. Quantity and add sit on one ruled line at one height, and the button gets the width \u2014 the wishlist heart lives on the product card. The label morphs between states \u2014 asking for a size, adding, added \u2014 and the price fades across when a variant has its own.", hardPart: "Optimism with a way back. The button says \u201cAdded\u201d the moment it is pressed; if your handler rejects, it rolls back and a line under it says the bag didn\u2019t take it. A missing size is asked for \u2014 focus goes to the sizes \u2014 rather than a greyed-out button nobody can explain. And delivery is a date range worked out from business days and a dispatch cut-off on the shopper\u2019s own clock, after hydration, so the server never guesses their time zone." },
  { slug: "product-details-accordion", title: "Details accordion", stage: "Product", kind: "component", status: "shipped", summary: "Materials, care, shipping and maker sections on your shadcn Accordion — each closed row carries its one-line answer.", designNote: "Triggers use the tracked-out eyebrow, with the answer set beside them in muted type: \u201cCare — Spot clean, re-wax yearly\u201d. Most shoppers only needed the one line, so most never open a panel. Body copy is 14px at a 1.7 line height, held to a readable measure. Sections open with Motion: the panel grows to its measured height on the same settle curve as the other morphs, and the chevron turns with it.", hardPart: "Two primitives whose roots disagree. shadcn's Accordion is Radix (type=\"multiple\") or Base UI (multiple), and Base UI's prop leaks into Radix's DOM and breaks hydration — so the block keeps the value controlled, toggles from each trigger, and holds a closing section open until its panel has animated shut. One file, either base. Closed content stays findable too: the summary line is always on the page, and contentProps={{ forceMount: true }} on Radix, or keepMounted on Base UI, keeps whole panels in the HTML, collapsed and inert." },
  { slug: "review-summary", title: "Review summary", stage: "Product", kind: "block", status: "shipped", summary: "The average set large, a star histogram whose rows filter the list, a fit scale in words, and verified badges.", designNote: "The average is the headline, set at 60px; everything else is small and ruled. The active histogram row carries a rule that slides between rows, and the list grows and shrinks to its measured height as it filters rather than jumping.", hardPart: "Every bar is a button, and says what it is: \u201c5 stars, 226 reviews, 72%\u201d, pressed or not. The fit marker has its reading in words on screen \u2014 \u201cRuns a little small\u201d \u2014 so it never depends on seeing the marker. And dates are calendar dates: formatted in UTC so \u201c2026-09-14\u201d never becomes the 13th west of Greenwich, or differs between server and browser." },
  { slug: "related-products", title: "Related products", stage: "Product", kind: "block", status: "shipped", summary: "A snap-scrolling rail of the same product card, mounted only when it nears the viewport.", designNote: "It reuses the exact product card \u2014 never a second, smaller one. Two and a bit cards on a phone, so the cut-off card says there are more; a progress rule under the rail does a scrollbar\u2019s job without drawing one.", hardPart: "It lives below the fold, so it must cost nothing on load: the cards and their images mount only when the rail comes within a screen of the viewport, fading in over skeletons of exactly their shape so nothing shifts. The whole section is your shadcn Carousel, so the header\u2019s arrows are the Carousel\u2019s own, with its can-scroll state." },

  // Cart & checkout
  { slug: "cart-line-item", title: "Cart line item", stage: "Cart & checkout", kind: "component", status: "shipped", summary: "Quantity stepper, a ledger-aligned line total, save-for-later, and remove with undo instead of a confirm dialog.", designNote: "The line total is right-aligned in tabular figures, so a column of lines reads as a ledger; the unit price sits under it only when there is more than one. Removing folds the row to its measured height into a quiet \\u201cRemoved \\u2014 Undo\\u201d bar instead of opening a dialog.", hardPart: "Two kinds of patience. Quantity presses show at once but reach your cart once, after the shopper settles \\u2014 not one request per press \\u2014 and roll back if the cart refuses. Removal waits out an undo window before your handler runs, flushes if the line leaves the page first, and moves focus to Undo so a keyboard is one key from reversing it." },
  { slug: "cart-sheet", title: "Cart sheet", stage: "Cart & checkout", kind: "block", status: "shipped", summary: "Mini cart on your shadcn Sheet: it grows out of the bag button, with the lines as the only scroller and the subtotal held at the bottom.", designNote: "Header, body and footer are ruled bands, and only the body scrolls \\u2014 with soft edges, not a scrollbar \\u2014 so the subtotal and checkout never leave the screen. The sheet grows out of the bag button as a circle and folds back into it, and the count on the button turns over as it changes.", hardPart: "Staying put while the cart moves. Focus is trapped while it is open and handed back to the bag button on close. Lines are keyed by id, so a cart update never remounts one mid-undo, and the subtotal follows what the shopper sees \\u2014 a quantity just pressed, a line waiting to be removed \\u2014 before your cart has caught up." },
  { slug: "order-summary", title: "Order summary", stage: "Cart & checkout", kind: "block", status: "shipped", summary: "Free-shipping meter, promo code, itemised totals and a testable totals hook.", designNote: "The total is set in the display serif against a heavy rule — the only thing in the panel that shouts. Everything above it is 13px and tabular.", hardPart: "Tax and shipping are estimates until an address exists, and the block says so. Totals live in a separate hook so they can be unit-tested without rendering anything."},
  { slug: "checkout-stepper", title: "Checkout stepper", stage: "Cart & checkout", kind: "component", status: "shipped", summary: "A rail of equal ruled cells with done, current and pending steps; done steps go back, pending ones don't.", designNote: "Equal-width ruled cells edge to edge \\u2014 a rail, not floating pills. A heavy rule marks the current step and slides to the next as the shopper moves on; on a phone the rail shows numbers and names the step underneath.", hardPart: "Only the past is clickable. Done steps are buttons back to themselves; steps still to come are plain text, so checkout can\\u2019t be skipped ahead. The current one carries aria-current=\\\"step\\\", and no state is colour alone: a check, a number and the rule carry it." },
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
