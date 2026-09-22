#!/usr/bin/env node
/**
 * The check CI usually misses: a block whose import resolves in this repo
 * because the primitive is already vendored, but which lands broken in a
 * project that has never run `shadcn add button`.
 *
 * Scaffolds a throwaway Next.js app, installs every item from the built
 * registry, and compiles it.
 *
 * IMPORTANT — why every child process is spawned asynchronously:
 * this script serves the registry from an in-process HTTP server. A
 * synchronous child (execFileSync/spawnSync) blocks Node's event loop, so
 * that server can never accept a connection and the installer fails with
 * ECONNREFUSED. Keep every child async, or move the server out of process.
 *
 *   node scripts/verify-install.mjs            # serve public/r, full run
 *   node scripts/verify-install.mjs http://…   # install from a live origin
 */
import { spawn } from "node:child_process";
import { createReadStream, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";

const root = process.cwd();
const externalOrigin = process.argv[2];
const MINUTE = 60_000;

/**
 * stdin is closed on purpose: `shadcn init` prompts for a component library
 * and a preset unless --defaults is passed, and an inherited stdin turns a
 * missed flag into a hung job. With it ignored the prompt hits EOF and the
 * command fails immediately, which is what we want to find out.
 */
function run(file, args, { cwd, timeout = 6 * MINUTE, label = file }) {
  return new Promise((resolve_, reject) => {
    const child = spawn(file, args, {
      cwd,
      stdio: ["ignore", "inherit", "inherit"],
      timeout,
      killSignal: "SIGKILL",
      // npx/pnpm are .cmd shims on Windows; spawn cannot exec them directly.
      shell: process.platform === "win32",
      env: { ...process.env, CI: "1", NEXT_TELEMETRY_DISABLED: "1" },
    });

    child.on("error", (error) => reject(new Error(`${label}: ${error.message}`)));
    child.on("close", (code, signal) => {
      if (signal) {
        reject(new Error(`${label}: killed by ${signal} after ${timeout / MINUTE} min`));
      } else if (code !== 0) {
        reject(new Error(`${label}: exited with code ${code}`));
      } else {
        resolve_();
      }
    });
  });
}

/* ------------------------------------------------------------ item names -- */

const registry = JSON.parse(readFileSync(resolve(root, "registry.json"), "utf8"));

/** `@ecomcn` — derived from the registry so the test cannot drift from it. */
const namespace = `@${registry.name}`;

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
  await run("npx", ["--yes", "shadcn@latest", "build"], { cwd: root, label: "shadcn build" });
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

  server.unref();
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

/* ------------------------------------------------------------------ run --- */

const hosted = externalOrigin ? null : await serve();
const origin = externalOrigin ?? hosted.origin;

// Fail in a second with a clear reason rather than in six minutes with a
// timeout, if the origin is not actually reachable.
try {
  const probe = await fetch(`${origin}/r/${names[0]}.json`);
  if (!probe.ok) throw new Error(`HTTP ${probe.status}`);
  console.log(`▸ registry reachable at ${origin} (${names.length} items)`);
} catch (error) {
  console.error(`✗ cannot reach ${origin}/r/${names[0]}.json — ${error.message}`);
  hosted?.close();
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "ecomcn-verify-"));
const app = join(dir, "app");

let failed = false;
try {
  console.log(`\n▸ scaffolding a clean Next.js app in ${app}`);
  await run(
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
    { cwd: dir, timeout: 12 * MINUTE, label: "create-next-app" },
  );

  // --defaults is what makes this non-interactive: --yes alone still prompts
  // for the component library and the preset.
  console.log("\n▸ shadcn init");
  await run("npx", ["--yes", "shadcn@latest", "init", "--yes", "--defaults"], {
    cwd: app,
    timeout: 10 * MINUTE,
    label: "shadcn init",
  });

  const componentsJson = join(app, "components.json");
  if (!existsSync(componentsJson)) {
    throw new Error("shadcn init did not write components.json — it likely hit a prompt.");
  }

  // Register the namespace. This is not optional and not a test artifact: the
  // CLI never adds a registry on its own, so any block with an `@ecomcn/…`
  // dependency cannot resolve without it. Doing it here means the test walks
  // the exact two steps the docs tell an adopter to walk.
  console.log(`\n▸ registering ${namespace} -> ${origin}/r/{name}.json`);
  await run(
    "npx",
    ["--yes", "shadcn@latest", "registry", "add", `${namespace}=${origin}/r/{name}.json`],
    { cwd: app, timeout: 3 * MINUTE, label: "registry add" },
  );

  const registries = JSON.parse(readFileSync(componentsJson, "utf8")).registries ?? {};
  if (!registries[namespace]) {
    throw new Error(
      `registry add did not write "${namespace}" into components.json registries.`,
    );
  }

  // Install by name, exactly as the install instructions on the site do.
  for (const name of names) {
    console.log(`\n▸ installing ${namespace}/${name}`);
    await run(
      "npx",
      ["--yes", "shadcn@latest", "add", `${namespace}/${name}`, "--yes", "--overwrite"],
      { cwd: app, timeout: 6 * MINUTE, label: `add ${name}` },
    );
  }

  // The README also claims blocks with no ecomcn dependencies install straight
  // from a URL with no setup. Prove that claim on one of them.
  const standalone = names.find((name) => name === "price-tag") ?? names[0];
  console.log(`\n▸ installing ${standalone} from a bare URL (no namespace)`);
  await run(
    "npx",
    ["--yes", "shadcn@latest", "add", `${origin}/r/${standalone}.json`, "--yes", "--overwrite"],
    { cwd: app, timeout: 6 * MINUTE, label: `add ${standalone} by url` },
  );

  console.log("\n▸ compiling the installed blocks");
  await run("npx", ["tsc", "--noEmit"], { cwd: app, timeout: 10 * MINUTE, label: "tsc" });
  console.log(`\n✓ all ${names.length} items install and compile cleanly`);
} catch (error) {
  failed = true;
  console.error(`\n✗ verify-install failed: ${error.message}`);
} finally {
  hosted?.close();
  rmSync(dir, { recursive: true, force: true });
}

process.exit(failed ? 1 : 0);
