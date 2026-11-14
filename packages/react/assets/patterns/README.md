# Reference-traced pattern SVGs

These are editable/viewable vector artifacts produced by `scripts/trace-patterns.mjs`
from the user-supplied reference image. The runtime consumes the same contours from
`src/optional/pattern-traces.ts`; it does not fetch these SVGs or ship the tracing tool.

Hui and lei show the middle of three traced periods. Keeping the neighboring paths
outside the viewBox prevents a traced cut edge from becoming a rounded seam.
Yunlei retains the complete irregular cloud band, including its original ends.

Source coordinates, provenance, regeneration and visual checks:
[`docs/pattern-tracing.md`](../../../../docs/pattern-tracing.md).
