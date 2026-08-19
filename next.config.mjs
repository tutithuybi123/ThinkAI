/** Keep Turbopack scoped to this repository when a parent directory has another lockfile. */
const acceptanceDistDir = process.env.THINKAI_NEXT_DIST_DIR;

/**
 * `THINKAI_NEXT_DIST_DIR` is used only by the runtime-acceptance harness so it
 * can start an actual Next server alongside a developer's existing `next dev`.
 */
export default {
  ...(acceptanceDistDir ? { distDir: acceptanceDistDir } : {}),
  turbopack: { root: process.cwd() },
};
