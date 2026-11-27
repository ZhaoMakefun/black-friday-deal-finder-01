// Black Friday Beacon — the hand-in program for the black-friday-deal-finder-01
// bounty. It is a plain Node 22 program, standard library only, no network:
// it copies this repository's app/ and screenshots/ into the output directory
// and writes the dossier.json the judge reads, using the vendored make.fun
// library (vendor/makefun-frontend.ts, the kit's copy, unchanged).
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program runs twice in the grader and both runs must write the same
// bytes, so it writes nothing with a timestamp or a random value.
//
// The output directory itself is never removed: in the grader /output is a
// mounted volume, and deleting a mount point throws EBUSY, which used to
// fail the graded run with exit code 1. Only the directory's contents are
// cleared, so a stale file can never survive from an earlier run and make
// the two grader runs differ. The repository itself is never touched.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const appDir = join(outDir, "app");
const shotsDir = join(outDir, "screenshots");

// Start from a clean output directory: clear every entry inside it, but
// leave the directory itself standing — the grader mounts /output as a
// volume, so removing the directory itself would throw EBUSY and fail the
// run with exit code 1. Clearing contents is enough: nothing stale can
// survive into the next run.
if (existsSync(outDir)) {
  for (const entry of readdirSync(outDir)) {
    rmSync(join(outDir, entry), { recursive: true, force: true });
  }
}
mkdirSync(appDir, { recursive: true });
cpSync(join(repoRoot, "app"), appDir, { recursive: true });

mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoRoot, "screenshots"))) {
  cpSync(join(repoRoot, "screenshots"), shotsDir, { recursive: true });
}

// The caps are the scorer's own: the dossier text is capped at 160 KiB, at
// most 4 screenshots of at most 256 KiB each, app/ at most 993 files and
// directories and 16 MiB in all.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, "dossier.json"), dossier);
console.log(`wrote ${outDir}/dossier.json (${dossier.length} bytes)`);
