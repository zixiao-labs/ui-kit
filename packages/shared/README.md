# Framework-neutral sources

`theme.ts` is shared by the React and Solid theme entry points and bundled into each
library by tsdown. It contains no framework types, DOM access or runtime adapter.

`styles.mjs` bundles the same canonical CSS sources for both libraries. Each build
reads source files directly, so concurrent React/Solid builds never race on another
package's generated output.

The existing neutral CSS and SVG trace data in `packages/react/src` are still the
canonical style assets. Solid's `styles:generate` copies them without importing any
React JavaScript. The generated Solid styles are ignored by Git and regenerated on
install, before development, and before packaging.
