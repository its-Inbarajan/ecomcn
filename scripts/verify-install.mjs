#!/usr/bin/env node
/**
 * The check CI usually misses: a block whose import resolves in this repo
 * because the primitive is already vendored, but which lands broken in a
 * project that has never run `shadcn add button`.
 *
 * Scaffolds a throwaway Next.js app, installs every item from the built
 * registry, and compiles it.
 *
 * Two things make it safe to run unattended:
 *   - it serves public/r itself on an ephemeral port, so it does not care
 *     whether `next dev` is running and cannot race the rest of the workflow;
 *   - every child process runs with stdin closed and a timeout, so an
 *     unexpected CLI prompt fails the job in seconds instead of hanging it.
 *
 *   node scripts/verify-install.mjs            # serve public/r, full run
 *   node scripts/verify-install.mjs http://…   # install from a live origin
 */
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";

const root = process.cwd();
const externalOrigin = process.argv[2];

const MINUTE = 60_000;

/**
 * stdin is closed on purpose. `shadcn init` prompts for a component library
 * and a preset unless --defaults is passed; with stdin inherited a missed
 * flag hangs CI until the job times out. With it ignored the prompt hits EOF
 * and the command fails immediately, which is what we want to find out.
 */
function run(file, args, { cwd, timeout = 5 * MINUTE }) {
  return execFileSync(file, args, {
    cwd,
    stdio: ["ignore", "inherit", "inherit"],
    timeout,
    env: { ...process.env, CI: "1", ADBLOCK: "1", NEXT_TELEMETRY_DISABLED: "1" },
  });
}

/* ------------------------------------------------------------ item names -- */

const registry = JSON.parse(readFileSync(resolve(root, "registry.json"), "utf8"));
const names = [
  ...(registry.items ?? []),
  ...(registry.include ?? []).flatMap(
    (file) => JSON.parse(readFileSync(resolve(root, file), "utf8")).items ?? [],
  ),
].map((item) => item.name);

if (names.length === 0) {
  console.error("verify-install: no registry items found — check the include paths.");
  process.exit(1);
}

/* ------------------------------------------------------------ built JSON -- */

const publicDir = resolve(root, "public");

if (!externalOrigin && !existsSync(join(publicDir, "r", "registry.json"))) {
  console.log("▸ public/r is missing — running shadcn build");
  run("npx", ["--yes", "shadcn@latest", "build"], { cwd: root });
}

const TYPES = { ".json": "application/json", ".txt": "text/plain" };

/** Static server over public/, so items resolve at /r/<name>.json. */
async function serve() {
  const server = createServer((req, res) => {
    const rel = normalize(decodeURIComponent((req.url ?? "/").split("?")[0])).replace(
      /^(\.\.[/\\])+/,
      "",
    );
    const file = join(publicDir, rel);
    if (!file.startsWith(publicDir) || !existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
  });

  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

/* ------------------------------------------------------------------ run --- */

const hosted = externalOrigin ? null : await serve();
const origin = externalOrigin ?? hosted.origin;
const dir = mkdtempSync(join(tmpdir(), "ecomcn-verify-"));
const app = join(dir, "app");

let failed = false;
try {
  console.log(`\n▸ scaffolding a clean Next.js app in ${app}`);
  run(
    "npx",
    [
      "--yes",
      "create-next-app@latest",
      "app",
      "--typescript",
      "--tailwind",
      "--app",
      "--eslint",
      "--no-src-dir",
      "--import-alias", "@/*",
      "--use-npm",
      "--disable-git",
      "--yes",
    ],
    { cwd: dir, timeout: 10 * MINUTE },
  );

  // --defaults is what makes this non-interactive: --yes alone still prompts
  // for the component library and the preset. It resolves to
  // --template=next --preset=base-nova, which is what a fresh adopter gets.
  console.log("\n▸ shadcn init");
  run("npx", ["--yes", "shadcn@latest", "init", "--yes", "--defaults"], {
    cwd: app,
    timeout: 8 * MINUTE,
  });

  if (!existsSync(join(app, "components.json"))) {
    throw new Error("shadcn init did not write components.json — it likely hit a prompt.");
  }

  for (const name of names) {
    console.log(`\n▸ installing ${name}`);
    run(
      "npx",
      ["--yes", "shadcn@latest", "add", `${origin}/r/${name}.json`, "--yes", "--overwrite"],
      { cwd: app, timeout: 5 * MINUTE },
    );
  }

  console.log("\n▸ compiling the installed blocks");
  run("npx", ["tsc", "--noEmit"], { cwd: app, timeout: 8 * MINUTE });
  console.log(`\n✓ all ${names.length} items install and compile cleanly`);
} catch (error) {
  failed = true;
  console.error(`\n✗ verify-install failed: ${error.message}`);
} finally {
  hosted?.close();
  rmSync(dir, { recursive: true, force: true });
}

process.exit(failed ? 1 : 0);
