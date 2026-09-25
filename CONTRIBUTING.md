# Contributing to ecomcn

Thanks for helping. The bar here is deliberately narrow: ecomcn ships blocks
that a store would otherwise have to build from scratch, and it ships them
finished.

## Before you open a PR

Use the **New block proposal** issue template first. It asks for the funnel
stage, the states the block must cover, and the hard part. If a maintainer
can't answer "what does a store have to build today without this?", the block
doesn't belong in v1.

## The rules

Every block in this registry follows all of them. A PR that breaks one gets a
review comment pointing at this section.

1. **Never hardcode currency.** Take `currency` and `locale` props and go
   through `Intl.NumberFormat`. A euro store should not have to find-and-replace
   your dollar signs.
2. **Never fetch.** Blocks take data as props. A block that calls `fetch` is
   unusable in a Server Component, in Storybook, and in every stack that isn't
   the one you wrote it in.
3. **Spread the rest props, merge the className** with `cn()`, so an adopter can
   restyle without forking.
4. **Never signal state with colour alone.** Out of stock gets a strike rule as
   well as muted text. WCAG 1.4.1, and in e-commerce it's also refund
   prevention.
5. **Hover-only is broken.** Quick-add, zoom, swatch previews — each needs a
   `focus-visible` path and a touch path.
6. **Ship the empty and loading states in the same file.** They're the states
   adopters forget, and the reason to install rather than build.
7. **Never import from the framework.** No `next/image`, no `next/link`, no
   `next/navigation` inside `src/registry/**` — a block has to compile in a
   Vite or React Router project too. Take an image or link element as a prop.
   This one is enforced by ESLint, not just asked for.
8. **Use only the primitive API that Radix and Base UI share.** shadcn/ui now
   ships both, and `shadcn init --defaults` picks Base UI. So: no `asChild`
   (style a `SheetTrigger` with `buttonVariants()` instead), no
   primitive-specific callbacks like `onValueCommit`, and handlers typed to
   accept either library's arguments. `pnpm test:install` compiles every block
   against both; React Aria is out of scope.
9. **Compound blocks own their context.** When parts of a block share state,
   the root creates the context and renders its own provider — nothing is ever
   mounted above it by the adopter. Pattern: `createContext<T | null>(null)`,
   a `useThing()` hook that throws "must be used within `<Thing>`", flat named
   exports (`ThingHeader`, not `Thing.Header` — a Server Component can't reach
   into a client module's namespace), `data-slot` on every part, a memoised
   context value, and the one-tag default layout kept working when no children
   are passed. Use `<Context.Provider>` so React 18 projects can install.
10. **Motion is opt-in.** A block may depend on `motion` only when the
    animation *is* the feature (`product-quick-view`). Everything else animates
    with CSS. Every animation respects `prefers-reduced-motion`.

## Styling

- Use shadcn tokens (`bg-primary`, `text-muted-foreground`) or CSS variables you
  ship yourself in `cssVars` (`bg-[var(--sale)]`).
- **Never** invent Tailwind config colours like `bg-brand-500`. Adopters have
  their own config; your class renders as nothing.
- Radius stays at `0.125rem`. Sections are separated by rules, not stacked
  shadow cards.
- Numbers that line up in a column get `tabular-nums`.

## Checklist for a block PR

- [ ] One folder per block, containing its own `registry.json`
- [ ] Path added to the root `registry.json` `include` array
- [ ] `registryDependencies` lists every primitive the block imports
- [ ] `target` puts files under `components/ecomcn/…`
- [ ] `pnpm registry:validate`, `pnpm registry:check` and `pnpm lint` pass
- [ ] Installed into blank Base UI and Radix apps and compiled (`pnpm test:install`)
- [ ] Keyboard path verified; no colour-only state
- [ ] Loading and empty states included
- [ ] Docs page added with a live preview, the props table and a Usage snippet
- [ ] Compound? Parts listed, strict hook exported, default layout still one tag
