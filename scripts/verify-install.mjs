#!/usr/bin/env node
/**
 * The check that catches the bug CI usually misses: a block whose import
 * resolves locally because the primitive is already vendored here, but which
 * lands broken in a project that has never run `shadcn add button`.
 *
 * Spins up a throwaway Next.js app, installs every item from the built
 * registry, and compiles. Run it in CI on every PR.
 *
 *   node scripts/verify-install.mjs [http://localhost:3000]
 */
import { execSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const origin = process.argv[2] ?? "http://localhost:3000"
const root = JSON.parse(readFileSync("registry.json", "utf8"))

const names = (root.include ?? [])
  .flatMap((file) => JSON.parse(readFileSync(file, "utf8")).items ?? [])
  .concat(root.items ?? [])
  .map((item) => item.name)

if (names.length === 0) {
  console.error("No registry items found. Did you forget an include path?")
  process.exit(1)
}

const dir = mkdtempSync(join(tmpdir(), "ecomcn-verify-"))
const run = (cmd) => execSync(cmd, { cwd: dir, stdio: "inherit" })

try {
  console.log(`\n▸ scaffolding a clean app in ${dir}`)
  execSync(
    `npx --yes create-next-app@latest app --typescript --tailwind --app --eslint --no-src-dir --use-npm --yes`,
    { cwd: dir, stdio: "inherit" }
  )
  const app = join(dir, "app")
  const inApp = (cmd) => execSync(cmd, { cwd: app, stdio: "inherit" })

  inApp(`npx --yes shadcn@latest init --yes --base-color neutral`)

  for (const name of names) {
    console.log(`\n▸ installing ${name}`)
    inApp(`npx --yes shadcn@latest add ${origin}/r/${name}.json --yes --overwrite`)
  }

  console.log("\n▸ compiling")
  inApp(`npx tsc --noEmit`)
  console.log(`\n✓ all ${names.length} items install and compile cleanly`)
} finally {
  rmSync(dir, { recursive: true, force: true })
}
