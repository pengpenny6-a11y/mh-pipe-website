# MH PIPE · 四川岷河管道

Bilingual manufacturer website for Sichuan Minhe Pipeline Construction Engineering Co., Ltd. The homepage introduces the piping systems and applications, company, workshops and laboratory, projects, partners, news, services and enquiry options.

## Run locally

Use Node.js 22.13 or newer.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4193
```

Open `http://127.0.0.1:4193/?lang=zh` for Chinese or `/?lang=en` for English.

## Build and test

```sh
npm run build
npm run test:sites
```

The repository includes the React source, Vite configuration, server-side enquiry handler, fonts, photography, 3D resources and downloadable literature. Set service credentials in the hosting environment. Previous design reviews below refer to local working material.

<details>
<summary>Earlier design and implementation notes</summary>

## Current homepage revision — 2026-11-06

Local preview: http://127.0.0.1:4193/?lang=zh (English: ?lang=en).

The latest homepage follows `outputs/precision-home/homepage-mock.png`, shown before implementation. It replaces the previous long-pipe opening and stacked editorial sections with an interactive WebGL product, full-width application scene, unified factory evidence, and one scrolling partner lane.

- `src/PrecisionHome.jsx` owns homepage composition and stable rotation/structure controls.
- `src/PrecisionProduct.jsx` owns a disposable actual Three.js renderer. Smooth metal studio reflections, hollow coupling, symmetric tube sections, pointer/keyboard control, reduced-motion/offscreen behavior and static fallback. It is an illustrative model, not verified product CAD or a pressing simulation.
- `src/PrecisionApplications.jsx` owns camera, scene wipe, pan, calibrated nodes and inquiry context.
- `src/PrecisionManufacturing.jsx` owns factory/figures/real-photo filmstrip.
- Mock and asset prompts: `outputs/precision-home/design-prompt.txt` and `scene-prompt.txt`; built-in ImageGen mode.
- Actual recording: `outputs/precision-home/recording/MH-PIPE-precision-home.mp4`.
- Verification: 28 broad browser checks, 7 product checks, application checks, desktop visual comparisons, build and 4 worker tests passed. See `design-qa.md`.
- Not published. Existing inner pages remain in place and functional.

---

# MH PIPE — local website prototype

Desktop-first bilingual website prototype. Latest revision: continuous opening, 2026-11-06. This is a local preview, not a deployed replacement of the published website. Brand and aesthetic acceptance remains with the user.

## Preview

The development preview runs at http://127.0.0.1:4193/ . Use `?lang=en` for English or `?lang=zh` for Chinese.

Routes: `/`, `/products`, `/applications`, `/manufacturing`, `/company`, `/contact`.

## Continuous opening revision

The homepage now opens with a single conceptual stainless pipe/coupling composition, followed by the five-scene application explorer and a new manufacturing chapter sequence. The original product carousel, company evidence, partners, literature and contact follow. The application page uses the new scene layout; company evidence includes an official national-standard drafting reference. This is the approved first motion segment, not a claim that every inner page has been fully redesigned.

- `FlowExperience.jsx` / `flow-experience.css`: title choreography, pale wordmark, shared-product travel and guided scroll with normal document flow. The animated image is inside a stable clickable button; the detail transition originates at the coupling region.
- `ApplicationsTech.jsx` and `solution-content.js`: vertical scene controls, existing hotspot zoom/pan, application descriptions and enquiry-prefilled selection prompts. No unverified technical parameters are supplied.
- `ManufacturingStory.jsx`: a reversible master timeline reveals four real manufacturing-photo chapters; facility rendering expands with scroll. Original and retouched facility assets are preserved and labelled accurately.
- `StandardEvidence.jsx`: source-linked GB/T 33926-2017 drafting participation, verified against the national standards platform.
- `outputs/flow-upgrade/checks.json`: 6 targeted checks passed, including eased guide movement, clear application headings, application inquiry context, rendering lightbox and reduced motion. `outputs/qa-tech/report.json`: latest 28 full-site checks passed.
- `outputs/flow-upgrade/recording/MH-PIPE-flow-upgrade.mp4`: actual local-browser recording of this sequence.
- Generated asset prompts and source limits are in `outputs/flow-upgrade/`; complete lineage is in `assets-sources.txt`.

## Retained motion and interaction

- Product studio: restored pale `PIPE` / `CONNECT` background lettering, pointer drag and keyboard carousel controls, and a shared product-image transition into the detail dialog and back to its source position.
- Page travel: locally hosted Lenis 1.3.27 smooths mouse-wheel movement while retaining native vertical document scrolling. There are no pinned sections. Route changes use the browser View Transition API where supported.
- Manufacturing: real company photographs switch on a 6.2-second cycle with progress and pause controls. Playback pauses offscreen, on hover/focus, when the page loses focus, and while a dialog is open. Direct selectors remain available without moving the page.
- Applications: enlarged concept images support bounded pointer dragging and keyboard panning, followed by a staged product-card reveal and continuous camera reset.
- Partners: the original brochure logos retain their moving/static views; expanding and collapsing the complete set animates its height.
- Company figures: brochure-reported 2024 production values count from 1 to their source values over 2.25 seconds, once on entry. Reduced motion displays the final values directly.
- Reduced-motion and unsupported-browser fallbacks retain navigation, selectors, product details and inquiries without requiring the animation.

Product and application visuals are animated 2D images, not real-time 3D models or engineering simulations. Manufacturing imagery is verified company photography.

## Development

Node 22.13+ is required. Install with `npm ci`, then `npm run dev -- --host 127.0.0.1 --port 4193`. Run `npm run build` and `npm run test:sites` before packaging. This workspace's local node_modules is a symlink to an existing dependency cache; package.json and the lockfile describe the corresponding runtime versions.

## Review and validation

- `outputs/flow-upgrade/recording/MH-PIPE-flow-upgrade.mp4` — current local-browser recording: 34.1 seconds, 13.2 MB; contact sheet and final frame inspected.
- `outputs/motion-experience-v3/runtime-report.json` — six motion-specific checks passed, with no recorded errors.
- `outputs/qa-tech/report.json` — latest full-site run: 28 checks passed, zero failures, no console/page errors or failed requests; completed after the continuous-opening corrections on 2026-11-06.
- `outputs/product-motion-review/check.json`, `outputs/editorial-motion-v2/report.json`, `outputs/scene-motion-review/check.json` — successful product, manufacturing/partner and application checks.
- `design-qa.md` — scope, fixes, evidence and limitations.
- `assets-sources.txt` — asset provenance, font licenses and the locally hosted Lenis dependency.

The latest Vite production build, Sites build preparation and four Sites-worker tests passed. Build/package success does not indicate deployment.

## Content and delivery boundaries

Product inquiry selections are stored locally. The contact page keeps the editable brief in the current tab. To enable website submission, configure the server-side `RESEND_API_KEY` and `INQUIRY_FROM` (a sender on the company's verified Resend domain). Both the packaged Worker and the Vite preview support these variables. The Worker sends to the public MH PIPE business mailbox in `worker/contact-address.js`; the client-supplied email is only used for replies. A reference confirms acceptance by the sending service. Inbox delivery and bounce status are available to the business in its mail service dashboard. Without the two settings the page offers the company's direct email and a downloadable brief. Never place credentials in VITE-prefixed variables or the site bundle.

Company figures are source-qualified brochure statements from 2024, not independently measured current output. Partner logos come from the original company brochure and do not establish current or exclusive contracts. Product/application illustrations do not substitute for verified drawings, suitability data or certifications.

Earlier company evidence and review remain in `outputs/company-upgrade-20261106/`. Older recordings and reviews are historical artifacts and do not describe the current motion implementation.

</details>
