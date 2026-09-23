#!/usr/bin/env node
/**
 * The shadcn Registry Directory's requirements, checked instead of hoped for.
 * https://ui.shadcn.com/docs/registry/registry-index#requirements
 *
 *   1. Open source and publicly accessible.
 *   2. Valid JSON that conforms to the registry schema.
 *   3. Flat: /registry.json and /<name>.json at the same root.
 *   4. `files` in the index must NOT carry `content`.
 *
 * Plus what the directory's health monitor scores once you are listed
 * (apps/v4/lib/registry-health in shadcn-ui/ui): JSON content type, unique
 * item names, a registry name that matches the namespace, and items that
 * validate and match the name they were requested by. And the entry we will
 * submit to directory.json, against the same strict schema its CI runs.
 *
 *   node scripts/check-registry.mjs            # the build in public/r
 *   node scripts/check-registry.mjs --remote   # the live URL in the entry
 *   node scripts/check-registry.mjs --remote http://localhost:3000/r/{name}.json
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { registryItemSchema, registrySchema } from "shadcn/schema";
import { z } from "zod";

const root = process.cwd();
const flag = process.argv.indexOf("--remote");
const remote = flag !== -1;
const remoteOverride = remote && /^https?:\/\//.test(process.argv[flag + 1] ?? "") ? process.argv[flag + 1] : null;
const entryPath = resolve(root, "docs/directory-entry.json");

const results = [];
const check = (requirement, ok, detail) => results.push({ requirement, ok: Boolean(ok), detail });

/* ----------------------------------------------- the directory.json entry -- */

// Mirrors apps/v4/lib/registry-directory.ts — .strict(), so an extra key fails.
const entrySchema = z
  .object({
    name: z.string().regex(/^@[a-zA-Z0-9][a-zA-Z0-9_-]*$/),
    homepage: z.string().url(),
    url: z
      .string()
      .url()
      .refine((url) => url.includes("{name}"), { message: "URL must include {name} placeholder" }),
    description: z.string(),
    author: z.string().optional(),
    logo: z.string(),
  })
  .strict();

const entry = JSON.parse(readFileSync(entryPath, "utf8"));
const parsedEntry = entrySchema.safeParse(entry);
check(
  "Directory entry matches the directory.json schema",
  parsedEntry.success,
  parsedEntry.success ? entry.name : parsedEntry.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
);
check(
  "Directory entry logo is an inline SVG that follows the theme",
  /^<svg[\s>]/.test(entry.logo) && entry.logo.includes("var(--foreground)"),
  "uses var(--foreground) so it inverts in dark mode",
);
check("Registry URL is HTTPS", entry.url.startsWith("https://"), entry.url);

const normalise = (value) => value.toLowerCase().replaceAll(" ", "").replace(/^@/, "");
const registryUrl = remoteOverride ?? entry.url;
const urlFor = (name) => registryUrl.replace("{name}", name);

/* ------------------------------------------------------------- sources -- */

async function loadLocal() {
  const dir = resolve(root, "public/r");
  if (!existsSync(join(dir, "registry.json"))) {
    console.error("check-registry: public/r/registry.json is missing — run `pnpm registry:build` first.");
    process.exit(1);
  }

  // public/r is gitignored build output, so it goes stale silently. Checking a
  // stale build reports on a registry that no longer exists — refuse instead.
  const source = JSON.parse(readFileSync(resolve(root, "registry.json"), "utf8"));
  const sourceNames = [
    ...(source.items ?? []),
    ...(source.include ?? []).flatMap((file) => JSON.parse(readFileSync(resolve(root, file), "utf8")).items ?? []),
  ].map((item) => item.name);
  const built = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
  const builtNames = (built.items ?? []).map((item) => item.name);
  if (built.homepage !== source.homepage || sourceNames.join() !== builtNames.join()) {
    console.error(
      "check-registry: public/r is stale — it was built from an older registry.json.\n" +
        `  built:  ${builtNames.length} items, homepage ${built.homepage}\n` +
        `  source: ${sourceNames.length} items, homepage ${source.homepage}\n` +
        "Rebuild it first: `pnpm registry:build`, then check again.",
    );
    process.exit(1);
  }
  const read = (name) => {
    const file = join(dir, `${name}.json`);
    return existsSync(file) ? { ok: true, json: JSON.parse(readFileSync(file, "utf8")) } : { ok: false };
  };
  return {
    where: "public/r",
    index: read("registry"),
    item: async (name) => read(name),
    nested: readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name),
  };
}

async function loadRemote() {
  const get = async (name) => {
    const response = await fetch(urlFor(name), { headers: { accept: "application/json" } });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok) return { ok: false, status: response.status };
    return { ok: true, json: await response.json(), type, redirected: response.redirected };
  };
  return { where: registryUrl, index: await get("registry"), item: get, nested: [] };
}

const source = remote ? await loadRemote() : await loadLocal();

/* ---------------------------------------------------------- the index -- */

check(`Index is reachable at ${remote ? urlFor("registry") : "public/r/registry.json"}`, source.index.ok, source.index.status ?? "");
if (!source.index.ok) report();

const index = source.index.json;
const parsedIndex = registrySchema.safeParse(index);
check(
  "Requirement 2 — index conforms to the registry schema",
  parsedIndex.success,
  parsedIndex.success ? `${index.items.length} items` : parsedIndex.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
);

check(
  "Requirement 3 — flat: no `include`, items inline",
  !("include" in index) && Array.isArray(index.items),
  "include is resolved at build time; the served index lists every item",
);
check(
  "Requirement 3 — no nested folders beside the index",
  source.nested.length === 0,
  source.nested.length ? source.nested.join(", ") : remote ? registryUrl : "public/r/<name>.json",
);

const contentInIndex = index.items.flatMap((item) =>
  (item.files ?? []).filter((file) => "content" in file).map((file) => `${item.name}:${file.path}`),
);
check(
  "Requirement 4 — no `content` in the index's files arrays",
  contentInIndex.length === 0,
  contentInIndex.length ? contentInIndex.join(", ") : "paths and targets only",
);

const names = index.items.map((item) => item.name);
check("Item names are unique", new Set(names).size === names.length, names.join(", "));
check(
  "Item names are flat slugs",
  names.every((name) => /^[a-z0-9][a-z0-9-]*$/.test(name)),
  "no slashes, so /<name>.json sits at the root",
);
check(
  "Registry name matches the namespace",
  normalise(index.name ?? "") === normalise(entry.name),
  `"${index.name}" ↔ ${entry.name}`,
);
check("Index homepage matches the entry", index.homepage === entry.homepage, index.homepage);

if (remote) {
  check("Index is served as JSON", /json/.test(source.index.type), source.index.type);
}

/* ----------------------------------------------------------- the items -- */

for (const name of names) {
  const result = await source.item(name);
  if (!result.ok) {
    check(`Item ${name} is at the registry root`, false, `missing ${name}.json`);
    continue;
  }
  const parsed = registryItemSchema.safeParse(result.json);
  const files = result.json.files ?? [];
  check(
    `Item ${name} validates and matches its URL`,
    parsed.success && parsed.data.name === name,
    parsed.success ? `${files.length} file(s)` : parsed.error.issues[0]?.message,
  );
  // The inverse of requirement 4: the index must not carry source, but the
  // item file must, or `shadcn add` has nothing to write.
  check(
    `Item ${name} carries its source`,
    files.every((file) => typeof file.content === "string" && file.content.length > 0),
    "content present on every file",
  );
}

/* --------------------------------------------------- open source (1) -- */

const license = resolve(root, "LICENSE");
check(
  "Requirement 1 — open source licence in the repo",
  existsSync(license) && /MIT License|Apache License|BSD/.test(readFileSync(license, "utf8")),
  "LICENSE",
);
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const repo = /github\.com\/([^/]+\/[^/.]+)/.exec(pkg.repository?.url ?? pkg.repository ?? "")?.[1];
check("package.json names the public repository", Boolean(repo), repo ?? "add a repository field");

if (remote && repo) {
  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: { accept: "application/vnd.github+json" },
  });
  const data = response.ok ? await response.json() : {};
  check(
    "Requirement 1 — repository is public",
    response.ok && data.private === false,
    response.ok ? `github.com/${repo}` : `GitHub API ${response.status}`,
  );
}

report();

function report() {
  const width = Math.max(...results.map((r) => r.requirement.length));
  for (const r of results) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.requirement.padEnd(width)}  ${r.detail ?? ""}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(
    failed
      ? `\n✗ ${failed} of ${results.length} checks failed (${source?.where ?? "setup"})`
      : `\n✓ all ${results.length} checks pass (${remote ? "live" : "public/r"})`,
  );
  process.exit(failed ? 1 : 0);
}
