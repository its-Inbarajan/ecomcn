#!/usr/bin/env node
/**
 * `pnpm dev` = sync the registry mirrors, start `next dev`, and keep syncing.
 *
 * The docs pages read src/lib/registry-data.json and the demos import the
 * mirrors in src/components/ecomcn/**. Both are generated from src/registry/**
 * by scripts/sync-registry.mjs. Running the sync only once, before `next dev`,
 * meant a block added while the server was up had no data behind it: its docs
 * page 404'd and its preview failed to resolve imports. This watches the
 * registry sources and re-syncs on every change, so Next hot-reloads them.
 *
 *   pnpm dev               # any extra args go to next dev: pnpm dev -p 4000
 */
import { spawn, spawnSync } from "node:child_process";
import { watch } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function sync() {
  // Synchronous on purpose: nothing else runs in this process, and a finished
  // sync before `next dev` starts means the first request already has data.
  const result = spawnSync(process.execPath, [resolve(root, "scripts/sync-registry.mjs")], {
    stdio: "inherit",
  });
  return result.status === 0;
}

if (!sync()) process.exit(1);

let timer;
const schedule = () => {
  clearTimeout(timer);
  // Editors write a file in several events; coalesce them into one sync.
  timer = setTimeout(sync, 150);
};

const watchers = [
  watch(resolve(root, "registry.json"), schedule),
  // `recursive` works on Windows, macOS and Linux (Node 20+).
  watch(resolve(root, "src/registry"), { recursive: true }, schedule),
];

const next = spawn("next", ["dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  // pnpm puts node_modules/.bin on PATH; on Windows that bin is a .cmd shim.
  shell: process.platform === "win32",
});

const stop = () => {
  for (const w of watchers) w.close();
  next.kill();
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
next.on("exit", (code) => {
  for (const w of watchers) w.close();
  process.exit(code ?? 0);
});
