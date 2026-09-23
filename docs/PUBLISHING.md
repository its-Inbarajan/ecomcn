# Publishing ecomcn

## The mental model

**shadcn does not install packages.** When someone runs
`npx shadcn add @ecomcn/product-card`, the CLI fetches a JSON file, reads the
`files[].content` strings inside it, and writes them into their repo. Then it
installs the npm dependencies the JSON declared and recursively resolves any
registry dependencies.

Four consequences:

1. **Your source becomes their source.** No semver to hide behind, no patch
   release that reaches an existing install.
2. **Every import must resolve on their side.** If a block imports
   `@/components/ui/button`, declare `"button"` in `registryDependencies` or the
   install lands broken.
3. **No config objects, no providers, no context.** A block that needs an
   `<EcomcnProvider>` is a framework, and nobody wants your framework.
4. **Zero runtime dependencies is a selling point.**

## Item schema quick reference

```jsonc
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "product-card",
  "type": "registry:block",           // ui | component | block | hook | lib |
                                      // page | file | theme | style | base |
                                      // font | item
  "title": "Product Card",
  "description": "…",
  "author": "ecomcn <hello@ecomcn.dev>",
  "dependencies": ["lucide-react"],   // npm, optionally "pkg@1.2.3"
  "devDependencies": [],
  "registryDependencies": [
    "button",                         // bare  -> shadcn's own registry
    "@ecomcn/price-tag",              // ns    -> yours
    "owner/repo/item#tag",            // github
    "https://example.com/r/item.json" // url
  ],
  "files": [
    {
      "path": "product-card.tsx",     // relative to THIS registry.json
      "type": "registry:component",
      "target": "components/ecomcn/product-card.tsx"
    }
  ],
  "cssVars": { "light": {}, "dark": {}, "theme": {} },
  "css": { "@layer base": {} },
  "envVars": {},
  "categories": ["ecommerce", "catalog"],
  "docs": "Optional install-time message."
}
```

`target` placeholders resolve to the adopter's configured aliases: `@ui/`,
`@components/`, `@lib/`, `@hooks/`, and `~` for the project root. It is
**required** for `registry:page` and `registry:file`.

## Local loop

```bash
pnpm dlx shadcn@latest registry validate   # source-level lint, no build needed
pnpm dlx shadcn@latest build               # emits public/r/*.json
pnpm dev                                   # :3000/r/product-card.json

# in a throwaway project
pnpm dlx shadcn@latest add http://localhost:3000/r/product-card.json
pnpm dlx shadcn@latest registry add @ecomcn=http://localhost:3000/r/{name}.json
pnpm dlx shadcn@latest add @ecomcn/product-card
```

Roughly half of first-registry bugs are a missing `registryDependencies` entry
that only surfaces in a project which doesn't already have that primitive.
`pnpm test:install` exists to catch exactly that.

## Dynamic routes (optional)

If you'd rather generate items at request time than commit build output:

```ts
// src/app/r/[name].json/route.ts
import { loadRegistryItem, RegistryItemNotFoundError } from "shadcn/registry"

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params
  try {
    return Response.json(await loadRegistryItem(name))
  } catch (error) {
    if (error instanceof RegistryItemNotFoundError) {
      return Response.json({ error: `Not found: ${name}` }, { status: 404 })
    }
    return Response.json({ error: "Failed to load item." }, { status: 500 })
  }
}
```

`loadRegistry()` does the same for the catalogue route.

## Two ways to distribute

**A — GitHub registry, zero infrastructure.** A valid `registry.json` at the repo
root makes any public GitHub repo installable:

```bash
npx shadcn@latest add <owner>/ecomcn/product-card
npx shadcn@latest add <owner>/ecomcn/product-card#v1.0.0
```

Caveats: github.com only (no Enterprise hosts), 5 MiB per file, referenced source
files must exist at that ref.

**B — hosted namespace.** Deploy the Next.js app, serve `/r/*.json`, adopters
register `@ecomcn` once. You get a docs site, search, and a URL you control.

Do both: GitHub on day one, hosted the week you have a docs page worth linking.

## Getting into the official Registry Directory

shadcn maintains a directory of community registries. Getting listed is a PR
against `shadcn-ui/ui` that adds one entry to `apps/v4/registry/directory.json`.
Once merged, `npx shadcn add @ecomcn/<block>` works with **no** `registry add`
step — the CLI looks the namespace up in the directory itself.

**Requirements, and how ecomcn meets each one**

| Requirement (from the docs) | How it is met | Checked by |
| --- | --- | --- |
| 1. Open source and publicly accessible | MIT `LICENSE`; public repo named in `package.json` | `registry:check` (+ GitHub API with `--remote`) |
| 2. Valid JSON conforming to the registry schema | `shadcn build` output, parsed with `registrySchema` / `registryItemSchema` from `shadcn/schema` | `registry:validate`, `registry:check` |
| 3. Flat: `/registry.json` and `/<name>.json` at one root | Source uses `include`, but the **served** index is flattened by `shadcn build`; every item lands at `/r/<name>.json` beside `/r/registry.json` | `registry:check` |
| 4. `files` must NOT include `content` | The served `/r/registry.json` lists paths and targets only; the per-item files carry the source | `registry:check` |

`pnpm registry:check` runs all of that against `public/r` in CI.
`pnpm registry:check:live` runs it against the deployed site, the way the
directory's monitor will — including the JSON content type and the
repository's public flag.

**What happens after you are listed.** Registry Health (experimental) checks
listed registries hourly (index reachable and schema-valid), daily (a rotating
sample of items) and weekly (`shadcn add --dry-run` on one item, in a bare
project using the `radix-vega` style). `pnpm test:install` replays that dry run
for every item, so a failure shows up in our CI before it shows up in the score.

**The entry.** It lives in [`docs/directory-entry.json`](directory-entry.json)
and is validated against the directory's own strict schema by
`registry:check` — `name`, `homepage`, `url` (must contain `{name}`),
`description`, optional `author`, and an inline SVG `logo` drawn with
`var(--foreground)` so it follows the directory's theme.

**Steps**

1. Fork and clone `shadcn-ui/ui`.
2. Paste the entry from `docs/directory-entry.json` into
   `apps/v4/registry/directory.json`.
3. Run `pnpm validate:registries` there.
4. Open the PR and wait for review.

**Don't open the PR on day one.** A directory entry pointing at half the funnel
is a wasted first impression on the one audience that matters. Ship v1, get a
screenshot grid into the README, then submit — the roadmap has this as M4.

In parallel, list on `registry.directory` and the `awesome-shadcn-ui` repo — in
practice those send meaningful traffic well before an official listing does.

## Versioning

Tag releases (`v1.0.0`) so GitHub installs can pin. Keep `CHANGELOG.md` current:
since updates never reach existing installs, the changelog is the only upgrade
path an adopter has. Describe changes as "replace lines X–Y of
`product-card.tsx`", not just "fixed a bug".

## References

- Registry docs — <https://ui.shadcn.com/docs/registry>
- Getting started — <https://ui.shadcn.com/docs/registry/getting-started>
- `registry.json` schema — <https://ui.shadcn.com/docs/registry/registry-json>
- `registry-item.json` schema — <https://ui.shadcn.com/docs/registry/registry-item-json>
- GitHub registries — <https://ui.shadcn.com/docs/registry/github>
- Registry Directory — <https://ui.shadcn.com/docs/directory>
- Adding to the directory — <https://ui.shadcn.com/docs/registry/registry-index>
