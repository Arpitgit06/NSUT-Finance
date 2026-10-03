# KAVACH Risk Command Center — implementation plan

## Product scope

A working synthetic-data prototype that unifies scam detection and repayment distress so analysts can protect customers before collecting. The prototype covers the roadmap's “Now” scope: twin fraud/repayment scores, tiered explainable alerts, the victim-to-default bridge, a mule network view, evaluation sliders, cases workflow, loans/customers context, and fairness signals. Every interaction is synthetic and local to the browser.

## Design direction

- **Design movement:** cinematic data observatory / editorial fintech control room.
- **Core principles:** signal over noise; explain every score; protect first, collect second; let the operator move from pattern to action without losing context.
- **Color philosophy:** near-black navy creates a calm, high-focus operating environment; warm ivory typography keeps the dashboard humane; cyan is reserved for trustworthy system flow; amber marks attention; coral marks intervention risk; violet marks analytical discovery.
- **Layout paradigm:** a persistent left command rail with a wide asymmetric stage; the Overview is a vertical narrative rather than a dense grid, with a 3D “risk core” anchoring the first viewport and data surfaces orbiting it.
- **Signature elements:** a CSS 3D DNA helix with paired backbones, signal rungs, glowing nodes, expanding energy waves, a shader-driven fresnel core, clearcoat strand highlights, and a scanned K risk core; thin “signal trace” lines; pill-shaped score chips that read like instrument labels.
- **Interaction philosophy:** clicking a signal reveals its plain-language reason; every high-risk path ends in a protective next action; navigation changes workspace context without a full page reload.
- **Animation:** slow ambient ring rotation; data dots travel along trace lines; the viewport carries a scroll-linked orbital field; the DNA camera uses a continuous eased macro-to-micro path with a push-in, node lock, pull-back/flip, and side-profile settle, while tethered cards drift with the focal node; a three-layer 3D signal deck travels between the twin scores and queue; cards use subtle depth tilt on hover; hero elements enter on scroll using IntersectionObserver; charts use animated stroke/width transitions; respect reduced-motion preferences.
- **Typography system:** `DM Sans`-style geometric sans treatment using system fallbacks for UI; a compact mono treatment for scores and timestamps; large tight headlines with generous line height below.
- **Brand essence:** KAVACH is the operator’s risk co-pilot for financial institutions that want to protect vulnerable borrowers before collections harden into default. Personality: vigilant, humane, decisive.
- **Brand voice:** direct, calm, plain-language. Example lines: “Protect the customer first.” / “A scam loss is a repayment signal, not a collections failure.”
- **Wordmark & logo:** a compact “K” shield built from two intersecting signal traces, rendered as a cyan/amber mark beside the wordmark.
- **Signature brand color:** `#8DE8D0`, a mint-cyan “guardrail” color that signals safety without looking like a generic bank blue.

## Implementation

- `client/src/pages/Home.tsx`: the complete single-page dashboard shell, synthetic data, workspace views, interactive controls, scroll reveal hooks, the layered WebGL DNA risk helix and energy field, built from procedural tubes, base-pair cylinders, molecular satellite spheres, ACES filmic tone mapping, physically based clearcoat materials, and a custom fresnel/pulse shader, SVG/canvas-free network, and local action state.
- `client/src/index.css`: the dark observatory visual system, responsive layout, CSS 3D core, orbital ambient field, signal deck depth stack, charts, animation, and reduced-motion behavior.
- `client/public/manus-routes.json`: route manifest for the single `/` experience.
- `app.config.ts`: project logo metadata for checkpoint validation.

No server or database is needed for this prototype. The frontend is served with `pnpm dev:static` and built with `pnpm build:static`.
