# ecomcn design rules

A component registry lives or dies on whether the screenshots look like
something a person decided. These constraints apply to every block without
exception. They're the house style, and they're cheap to hold.

## The six rules

**01 — Radius 2px, not 12.** Uniform pill-rounding is the loudest tell of a
generated interface. `--radius: 0.125rem`; rules and edges do the work instead.

**02 — Rules over cards.** Sections are separated by 1px hairlines and the
occasional heavy rule, not by stacked drop-shadow boxes. A page reads as one
ruled object, the way a printed catalogue does.

**03 — One display serif, one grotesque.** Product names, prices and section
heads in a high-contrast serif; everything functional in a neutral sans. Two
faces, no third.

**04 — Asymmetry on purpose.** 1.05fr / 0.95fr splits, 7/5 grids, left-aligned
empty states. Nothing is centred unless centring is the point.

**05 — One accent, used sparingly.** A single vermilion carries sale states, the
active step, the live tracking node. No gradient, anywhere, ever.

**06 — Tabular numerals everywhere.** Prices, counts, sizes, order numbers. A
column of prices that doesn't align is the fastest way to look unfinished.

## Tokens

Ship as `@ecomcn/theme-editorial`. Values are HSL triplets so they drop straight
into a shadcn `globals.css`.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--background` | `40 30% 97%` | `30 8% 7%` | page ground |
| `--foreground` | `30 9% 9%` | `40 22% 94%` | ink |
| `--secondary` | `38 20% 92%` | `30 6% 16%` | image grounds, inset panels |
| `--muted-foreground` | `32 6% 42%` | `36 8% 62%` | body copy, metadata |
| `--border` | `34 14% 85%` | `30 6% 20%` | hairlines |
| `--ring` | `12 76% 50%` | `14 82% 58%` | focus, accent |
| `--sale` | `0 72% 42%` | `4 74% 58%` | markdowns, destructive |
| `--success` | `138 30% 34%` | `138 26% 52%` | in-bag, free shipping, verified |
| `--radius` | `0.125rem` | — | everything |

Neutrals are warm-biased (hue 30–40) rather than pure grey, so the accent sits
in the same family as the ground rather than on top of it.

## Type

```css
--font-display: "Instrument Serif", "Iowan Old Style", Palatino, Georgia, serif;
--font-sans:    ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-mono:    ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

Three utilities carry most of the look:

```css
.ec-display { font-family: var(--font-display); letter-spacing: -0.02em; line-height: 0.94; }
.ec-eyebrow { font-size: 0.6875rem; letter-spacing: 0.18em; text-transform: uppercase; }
.ec-num     { font-variant-numeric: tabular-nums; }
```

## Accessibility floor

Non-negotiable for every block:

- No state signalled by colour alone. Out-of-stock gets a strike rule; sale gets
  a "Save 22%" label as well as red.
- Every hover affordance has a `focus-visible` equivalent and a touch path.
- Result counts and cart mutations go through an `aria-live` region.
- Disabled options stay in the tab order where a screen reader needs to hear
  they're unavailable.
- `prefers-reduced-motion` kills marquees, auto-advancing carousels and slide
  transitions.

## Class-name rule

Never invent Tailwind config colours (`bg-brand-500`). Adopters have their own
config and the class renders as nothing. Use shadcn tokens (`bg-primary`,
`text-muted-foreground`) or CSS variables shipped in the item's `cssVars`
(`bg-[hsl(var(--sale))]`).
