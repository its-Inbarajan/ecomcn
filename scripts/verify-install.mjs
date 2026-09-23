#!/usr/bin/env node
/**
 * The check CI usually misses: a block whose import resolves in this repo
 * because the primitive is already vendored, but which lands broken in a
 * project that has never run `shadcn add button`.
 *
 * 1. Scaffolds one throwaway Next.js app.
 * 2. For each shadcn/ui base — Base UI (what `init --defaults` picks) and
 *    Radix — copies it, runs `shadcn init`, registers the namespace, installs
 *    every item from the built registry and compiles the result. Blocks are
 *    written against the API the two bases share; this is what proves it.
 * 3. Replays the directory's weekly health check: `shadcn add --dry-run` for
 *    every item, in the same minimal project the monitor builds.
 *
 * IMPORTANT — why every child process is spawned asynchronously:
 * this script serves the registry from an in-process HTTP server. A
 * synchronous child (execFileSync/spawnSync) blocks Node's event loop, so
 * that server can never accept a connection and the installer fails with
 * ECONNREFUSED. Keep every child async, or move the server out of process.
 *
 *   node scripts/verify-install.mjs            # serve public/r, full run
 *   node scripts/verify-install.mjs http://…   # install from a live origin
 *   ECOMCN_BASES=radix node scripts/verify-install.mjs   # one base only
 */
import { spawn } from "node:child_process";
import {
  cpSync,
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";

const root = process.cwd();
const externalOrigin = process.argv[2];
const MINUTE = 60_000;
const BASES = (process.env.ECOMCN_BASES ?? "base,radix").split(",").map((b) => b.trim());

/**
 * stdin is closed on purpose: `shadcn init` prompts for a component library
 * and a preset unless --defaults is passed, and an inherited stdin turns a
 * missed flag into a hung job. With it ignored the prompt hits EOF and the
 * command fails immediately, which is what we want to find out.
 */
function run(file, args, { cwd, timeout = 6 * MINUTE, label = file, env }) {
  return new Promise((resolve_, reject) => {
    const child = spawn(file, args, {
      cwd,
      stdio: ["ignore", "inherit", "inherit"],
      timeout,
      killSignal: "SIGKILL",
      // npx/pnpm are .cmd shims on Windows; spawn cannot exec them directly.
      shell: process.platform === "win32",
      env: env ?? { ...process.env, CI: "1", NEXT_TELEMETRY_DISABLED: "1" },
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

const shadcn = (args, options) => run("npx", ["--yes", "shadcn@latest", ...args], options);

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
  await shadcn(["build"], { cwd: root, label: "shadcn build" });
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

/* ---------------------------------------------------------------- phases -- */

async function installInto(app, base, registryUrl) {
  // --defaults is what makes this non-interactive: --yes alone still prompts
  // for the component library and the preset. --base overrides the library
  // that --defaults would otherwise pick.
  console.log(`\n▸ [${base}] shadcn init --defaults --base ${base}`);
  await shadcn(["init", "--yes", "--defaults", "--base", base], {
    cwd: app,
    timeout: 10 * MINUTE,
    label: `init (${base})`,
  });

  const componentsJson = join(app, "components.json");
  if (!existsSync(componentsJson)) {
    throw new Error(`[${base}] shadcn init did not write components.json — it likely hit a prompt.`);
  }
  // Expected "base-nova" / "radix-nova". A warning rather than a failure: the
  // style name is chosen server-side, and the compile below is the real test.
  const style = String(JSON.parse(readFileSync(componentsJson, "utf8")).style ?? "");
  if (!style.startsWith(base)) {
    console.log(`::warning::[${base}] init wrote style "${style}" — check --base still selects the library.`);
  }

  // Register the namespace. The CLI never adds a registry on its own, so any
  // block with an `@ecomcn/…` dependency cannot resolve without it. Doing it
  // here means the test walks the exact steps the docs tell an adopter to walk.
  console.log(`\n▸ [${base}] registering ${namespace} -> ${registryUrl}`);
  await shadcn(["registry", "add", `${namespace}=${registryUrl}`], {
    cwd: app,
    timeout: 3 * MINUTE,
    label: `registry add (${base})`,
  });
  const registries = JSON.parse(readFileSync(componentsJson, "utf8")).registries ?? {};
  if (!registries[namespace]) {
    throw new Error(`[${base}] registry add did not write "${namespace}" into components.json.`);
  }

  for (const name of names) {
    console.log(`\n▸ [${base}] installing ${namespace}/${name}`);
    await shadcn(["add", `${namespace}/${name}`, "--yes", "--overwrite"], {
      cwd: app,
      timeout: 6 * MINUTE,
      label: `add ${name} (${base})`,
    });
  }

  // The README claims blocks with no ecomcn dependencies install straight
  // from a URL with no setup. Prove that claim on one of them.
  const standalone = names.find((name) => name === "price-tag") ?? names[0];
  console.log(`\n▸ [${base}] installing ${standalone} from a bare URL (no namespace)`);
  await shadcn(["add", registryUrl.replace("{name}", standalone), "--yes", "--overwrite"], {
    cwd: app,
    timeout: 6 * MINUTE,
    label: `add ${standalone} by url (${base})`,
  });

  console.log(`\n▸ [${base}] compiling the installed blocks`);
  await run("npx", ["tsc", "--noEmit"], { cwd: app, timeout: 10 * MINUTE, label: `tsc (${base})` });
  console.log(`✓ [${base}] all ${names.length} items install and compile`);
}

/**
 * Mirrors apps/v4/lib/registry-health/dry-run.ts in shadcn-ui/ui: a bare
 * project with this exact components.json, and `add --dry-run --yes` per item.
 * Two failed dry runs in a row mark a listed registry as Degraded.
 */
async function directoryDryRun(dir, registryUrl) {
  const project = join(dir, "dry-run");
  mkdirSync(join(project, "app"), { recursive: true });
  writeFileSync(
    join(project, "components.json"),
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "radix-vega",
        rsc: true,
        tsx: true,
        tailwind: {
          config: "",
          css: "app/globals.css",
          baseColor: "neutral",
          cssVariables: true,
          prefix: "",
        },
        iconLibrary: "lucide",
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
          ui: "@/components/ui",
          lib: "@/lib",
          hooks: "@/hooks",
        },
        registries: { [namespace]: registryUrl },
      },
      null,
      2,
    ),
  );
  writeFileSync(join(project, "app/globals.css"), "");
  writeFileSync(join(project, "package.json"), JSON.stringify({ private: true }));
  writeFileSync(
    join(project, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { baseUrl: ".", paths: { "@/*": ["./*"] }, jsx: "preserve" } }),
  );

  for (const name of names) {
    console.log(`\n▸ [dry-run] ${namespace}/${name}`);
    await shadcn(["add", `${namespace}/${name}`, "--dry-run", "--yes", "--cwd", project], {
      cwd: project,
      timeout: MINUTE,
      label: `dry-run ${name}`,
    });
  }
  console.log(`✓ [dry-run] all ${names.length} items pass the directory's CLI check`);
}

/* ------------------------------------------------------------------ run --- */

const hosted = externalOrigin ? null : await serve();
const origin = externalOrigin ?? hosted.origin;
const registryUrl = `${origin}/r/{name}.json`;

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

let failed = false;
try {
  console.log(`\n▸ scaffolding a clean Next.js app in ${dir}`);
  await run(
    "npx",
    [
      "--yes",
      "create-next-app@latest",
      "template",
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

  for (const base of BASES) {
    const app = join(dir, `app-${base}`);
    cpSync(join(dir, "template"), app, { recursive: true, verbatimSymlinks: true });
    await installInto(app, base, registryUrl);
  }

  await directoryDryRun(dir, registryUrl);

  console.log(
    `\n✓ all ${names.length} items install and compile on ${BASES.join(" + ")}, and pass the directory dry run`,
  );
} catch (error) {
  failed = true;
  console.error(`\n✗ verify-install failed: ${error.message}`);
} finally {
  hosted?.close();
  rmSync(dir, { recursive: true, force: true });
}

process.exit(failed ? 1 : 0);
