# Setting up the ecomcn site

One Next.js app doing three jobs:

1. **Marketing** — the pitch, the design rules, the block grid
2. **Docs** — one page per block with a live, isolated preview
3. **Registry host** — serves `/r/*.json`, which is what `shadcn add` actually fetches

No separate backend. Vercel (or any static host) covers all three.

---

## Step 1 — Scaffold Next.js without clobbering the repo

`create-next-app` refuses a non-empty directory. Its allowlist tolerates
`.git`, `.gitignore`, `README.md`, `LICENSE` and `docs/` — but not
`registry.json`, `src/`, `package.json`, `components.json`, `scripts/` or
`.github/`. So scaffold beside the repo and merge in.

```powershell
cd C:\Users\geniuS\Documents\Claude\Projects
npx create-next-app@latest ecomcn-site
```

Answer: TypeScript **yes**, ESLint **yes**, Tailwind **yes**, `src/` directory
**yes**, App Router **yes**, Turbopack **yes**, import alias `@/*`.

Then move the registry into it and make it the repo:

```powershell
robocopy ecomcn ecomcn-site /E /XD node_modules _to_delete .git
Remove-Item -Recurse -Force ecomcn
Rename-Item ecomcn-site ecomcn
```

`robocopy` will overwrite `README.md`, `.gitignore` and `package.json` with the
registry versions. Re-merge `package.json` by hand — keep Next's `dependencies`
and `devDependencies`, and keep these scripts:

```jsonc
"scripts": {
  "predev": "node scripts/sync-registry.mjs",
  "dev": "next dev",
  "prebuild": "node scripts/sync-registry.mjs && shadcn build",
  "build": "next build",
  "registry:validate": "shadcn registry validate",
  "registry:build": "shadcn build",
  "typecheck": "tsc --noEmit",
  "test:install": "node scripts/verify-install.mjs"
}
```

Then `git init` from a normal terminal and commit.

---

## Step 2 — shadcn init and the primitives

```bash
pnpm install
pnpm dlx shadcn@latest init
```

Style **new-york**, base colour **neutral**, CSS variables **yes**. It rewrites
`components.json`; check the aliases afterwards still read
`"components": "@/components"`, `"ui": "@/components/ui"`, `"lib": "@/lib"`,
`"hooks": "@/hooks"`.

Every primitive the v1 catalogue composes:

```bash
pnpm dlx shadcn@latest add button badge input label checkbox slider switch \
  select sheet dialog accordion progress radio-group skeleton carousel \
  scroll-area table separator popover hover-card form
```

> **Tailwind v4 note.** `create-next-app` now ships Tailwind v4, where tokens
> live in `@theme inline` as oklch, not as HSL triplets in `:root`. `shadcn init`
> writes the v4-shaped `globals.css` for you. Your custom tokens (`--sale`,
> `--success`) need a line each inside `@theme inline`:
> `--color-sale: var(--sale);` — otherwise `bg-[var(--sale)]` works but
> `bg-sale` does not.

---

## Step 3 — Apply the house theme

```bash
pnpm dlx shadcn@latest build
pnpm dev
# in a second terminal
pnpm dlx shadcn@latest add http://localhost:3000/r/theme-editorial.json
```

Installing your own theme item is the fastest way to confirm `cssVars` land
correctly. Then add the display font in `src/app/layout.tsx` (`next/font/google`
→ `Instrument_Serif`, exposed as `--font-display`) and paste the three utilities
from `docs/DESIGN.md` (`.ec-display`, `.ec-eyebrow`, `.ec-num`) into
`globals.css`.

---

## Step 4 — The sync script (the part that isn't obvious)

Registry sources import `@/components/ecomcn/price-tag` and
`@/hooks/use-order-totals` — the paths an **adopter** ends up with, not the
paths in this repo. You can't fix that with a tsconfig alias: a TS path mapping
carries only one wildcard, so `@/components/ecomcn/*` →
`src/registry/ecomcn/*/*` isn't expressible.

Mirror instead. Write `scripts/sync-registry.mjs` to read `registry.json`,
resolve each item's `include` file, and copy every `files[].path` to its
`files[].target` under `src/`. Wire it to `predev` and `prebuild` (above), and
gitignore the copies:

```gitignore
src/components/ecomcn
src/hooks/use-order-totals.ts
```

Two things fall out of this for free: the site compiles against the exact layout
adopters install, and a missing `registryDependencies` entry breaks your dev
server instead of someone else's project.

---

## Step 5 — Verify the registry serves

```bash
pnpm registry:validate
pnpm registry:build
pnpm dev
```

Open `http://localhost:3000/r/price-tag.json` and
`http://localhost:3000/r/registry.json`. Keep `public/r` gitignored — `prebuild`
regenerates it on every deploy, so committed output can only ever go stale.

---

## Step 6 — A block index for the site

`src/lib/blocks.ts` — one array, one entry per block:

```ts
{
  slug: "product-card",
  title: "Product Card",
  stage: "Browse",
  description: "…",
  designNote: "…",
  hardPart: "…",
  demo: () => import("@/demos/product-card"),
}
```

Read the source for the code tab at build time with `fs.readFileSync` in a
Server Component — don't duplicate it into a string. Keep demo data in
`src/demos/` so it never ships to adopters.

---

## Step 7 — Isolated preview routes

`src/app/preview/[slug]/page.tsx` renders **only** the block: no header, no
footer, no site padding. Give it its own minimal `layout.tsx`.

The docs page then embeds that route in an iframe. Two reasons this beats
rendering inline: site CSS can't leak into the preview, and you can set the
iframe width from a toggle to test 390 / 768 / full without devtools.

---

## Step 8 — One docs page per block

`src/app/blocks/[slug]/page.tsx`, in this order:

1. Title and one-line description
2. **The install command with a copy button, above the fold**
3. The iframe preview with the width toggle
4. Full source with a copy button (`shiki` for highlighting)
5. Props table generated from the TypeScript interface
6. The design note and the hard part — the two things that make it a library
   rather than a screenshot

`generateStaticParams` from `src/lib/blocks.ts` so every page is static.

---

## Step 9 — The marketing home

Hero, the six design rules, the block grid by funnel stage, the install command,
the GitHub link. Add `opengraph-image.tsx` — a link preview showing four real
blocks does more for adoption than any copy on the page.

---

## Step 10 — Deploy and open the namespace

Deploy to Vercel, point `ecomcn.dev` at it, confirm
`https://ecomcn.dev/r/registry.json` resolves. Then the line that goes in your
README:

```bash
npx shadcn@latest registry add @ecomcn=https://ecomcn.dev/r/{name}.json
npx shadcn@latest add @ecomcn/product-card
```

`{name}` is literal — the CLI substitutes it. No CORS config needed; the CLI
fetches server-side.

---

## Checkpoints

| After | You should be able to |
| --- | --- |
| Step 2 | `pnpm dev` renders the stock Next.js page |
| Step 4 | `pnpm typecheck` passes with registry sources importing adopter paths |
| Step 5 | `curl localhost:3000/r/price-tag.json` returns an item with `content` |
| Step 7 | `/preview/product-card` renders one bare block |
| Step 8 | `/blocks/product-card` shows preview + source + install command |
| Step 10 | A stranger can install a block in one command |

Don't open the shadcn directory PR until step 10 is done for all 29 blocks —
see `docs/PUBLISHING.md`.
