# Pattern reference masks

The PNGs are cleaned monochrome crops of the supplied reference, **not rasterizations
of our SVGs**. `tests/patterns.e2e.test.ts` compares the rendered vector contours
against these independent masks and checks repeated tile boundaries.

Do not update these masks merely to accept a changed vector. Regenerate only when
the reference or explicitly approved crop changes. The authoring command and source
hash are documented in [`docs/pattern-tracing.md`](../../../../../docs/pattern-tracing.md).
