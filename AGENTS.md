# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Current design decisions — 2026-11-06
- MH PIPE is the English brand; English default with a complete Chinese toggle. Desktop is the priority.
- User selected material-editorial concept for implementation, with interactive architectural applications from living-section.
- Latest explicit correction: retain the homepage banner; all other areas looked cluttered and the colors were disliked. Rebuild the rest in white/deep indigo, remove large coral/lilac blocks, reduce competing titles and make image hierarchy clearer. Application exploration precedes the product range.
- Product geometry must use straight tubes with separate fittings for turns. Generated product and space imagery are illustrative, never technical proof. Do not imply unverified ring-press images are confirmed ring-press products.
- GSAP motion must be visible and purposeful: object intro, gentle scroll depth, category transitions, scene camera approach, product details, and image viewing. Honor reduced motion and keyboard use.
- Use verified company photos for manufacturing. Do not invent certifications, capacities, export claims or partners.
- Local inquiry prototype saves a draft only; no backend submission is currently configured. Label this honestly.

## Further user correction — awaiting direction
- User rejected the overall design/typography/motion as resembling a small consumer retailer rather than a large manufacturing group. This supersedes the earlier quiet editorial direction.
- Do not treat the existing implementation as the accepted design or publish it as final.
- Three questions are pending: engineering-group vs manufacturing-group vs bold-tech positioning; continuous spatial camera vs film-led vs typography-led motion; retain/rework/discard current banner.
- Root recommendation: systems and engineering applications lead, stronger typography and continuous spatial storytelling, supported by verifiable manufacturing evidence. New visual work depends on the user's answers.

## Accepted direction update
- User clarified: technology-brand visuals and typography, with manufacturing strength and products as the focus; novel, designed motion. The delicate retail/editorial direction is superseded.
- The technology-study.png image is a direction study, explicitly NOT the final design. Root stated that repeated section compositions and simple bold type in it need further development.
- Implementation now uses Archivo variable (complete verified 658596-byte file), Manrope, white / engineering blue / cold-white; product-led hero followed by verified manufacturing, interactive product focus, industrial applications and B2B enquiry.
- Each main navigation item opens an independent page. Current build is a local review prototype, not approved final or published online.

## Company content and motion — latest user requirements
- User approved adding real partner logos and more evidence of company strength and scale. Use the original brochure, real factory and testing images, and source-qualified historical figures. Do not invent current scale or global export facts.
- Motion, animation and deliberate visual design remain central acceptance criteria for every page. Content expansion must not turn the site into a static brochure.
- User explicitly finds the current scrolling stiff. Preserve native vertical continuity, avoid pinning that traps scrolling, remove abrupt resets, and test rapid interactions. Distinct product, scene, manufacturing and partner motions should share calm acceleration/deceleration.
- Avoid multiple buttons or copy blocks with the same meaning on one page. Each section gets one distinct main purpose; remove repeated slogans and generic invitations.
- Preserve the pale oversized bold PIPE / CONNECT lettering behind the product display, including gentle scroll motion. User explicitly requested restoring it. Decorative typography is part of the design and must not be removed under copy/button deduplication.
- Homepage highlights key evidence; Company and Manufacturing pages contain details. Contact uses the verified brochure email and address. Preparing a mailto draft is user-controlled; the website does not automatically send enquiries.

- User explicitly requests animated numeric data: company production figures count from 1 to their source-backed values when entering view, decelerate, and play once per page visit. Reduced-motion shows final values directly; founding year remains a factual date.

## Continuous opening revision — 2026-11-06
- User approved rebuilding the opening → applications → manufacturing as a complete motion sequence, then extending the treatment. Preserve white/silver product imagery and pale oversized lettering; page scrolling must remain uninterrupted.
- User authorizes proactively finding reliable public information and generating missing visual material. Engineering specifications, certifications, company facts and customer relationships must still have evidence.
- User re-supplied the facility rendering and permits appropriate visual optimization. The chosen ImageGen-retouched rendering improves tones and details while retaining the overall layout; it is labelled as a retouched facility rendering, never a built-factory photograph or exact plan. Original remains preserved.
- New pipeline composition is a conceptual visual asset, not a technical or pressing-process simulation.

## Homepage correction — later 2026-11-06
- User rejected the continuous-opening revision as AI-looking and lacking advanced animation/interaction. Root comparison found the earlier hero stronger. Keep its large MH PIPE word, distinct metal product and white/indigo palette; remove latest long pipe crossing the full screen and stacked repetitive title sections.
- User requests a visual mock FIRST and then direct implementation as a working site. Do not stop for another option-selection gate; the mock is shown in chat before build. Current target: outputs/precision-home/homepage-mock.png.
- Homepage is four connected subjects: product (actual interactive WebGL view), full-width applications, factory + source-backed evidence, partners/contact. Avoid duplicating product carousel, factory, standards, company, brochure as separate large homepage sections.
- WebGL assembly is an illustrative connection viewer, not a pressing-process/engineering validation. Keep nominally matching pipe/fitting sizes, straight pipes, smooth silver material; no machine or claimed press deformation.

## Rejected navigation/loading mock — 2026-11-06
- User explicitly rejected `outputs/navigation-motion/interaction-mock.png`: “不要用这个太丑了”. Do not implement this mock or treat it as approved.
- SiteNavigation.jsx/site-navigation.css and InteractionCursor.jsx/interaction-cursor.css were drafted but remain UNREFERENCED by the running app. They are not accepted design components.
- Keep the current live homepage/header unchanged while clarifying a replacement direction. Avoid the rejected navy-block logo, heavy large blue loading composition and oversized circular pointer badge.
- Original request for loading animation, cursor/scroll affordances and redesigned navigation remains active; new visual direction is pending user clarification.

## Navigation and entry motion — latest accepted direction
- User chose a thin precise white integrated navigation with hairline structure. This supersedes the pending clarification above. Do not use a filled navy logo block or opaque oversized blue cursor badge.
- Latest user explicitly says interaction effects need NOT be restrained. Deliver expressive coordinated navigation previews, word transitions, contextual pointer responses and an actual loading sequence.
- Exact primary navigation: 首页 /, 解决方案 /applications, 产品中心 /products, 服务体系 /services, 关于我们 /company, 新闻中心 /news, 联系我们 /contact. Keep Manufacturing accessible within About and service content.
- Revised visual reference: outputs/navigation-precision/interaction-mock.png. Show mock then directly implement, no further design approval gate.
- News must use evidenced records and material dates; do not invent recent company announcements.

## Service imagery — user correction
- User explicitly wants service imagery to show people and service situations: business handshakes, drawing discussions, engineers or managers coordinating on a construction site. Do not fill Services with stainless steel product closeups.
- Approved generation of suitable contextual photography. Assets in public/assets/services are AI-generated illustrative service scenarios; no claim of actual MH PIPE staff, clients or projects. Prompts and provenance are in SOURCES.json.
- AIRpipe reference https://www.airpipe.com.cn/ was reviewed for content architecture: task-specific service entries/resources, clear solution/product/service routes. Do not transfer competitors’ factual capabilities, guarantees, figures or customer claims.

## Banner simplification — latest user instruction
- Remove the persistent hero drag label/range and assembly toggle. Open directly with complete connection structure (coupling and both matching straight tubes), without needing a click.
- Keep product exploration CTA and scroll cue; retain direct model manipulation and keyboard access. Avoid adding replacement bottom copy.

## Content depth and latest banner refinement
- User requests richer substantive content across ALL pages, informed by careful review of AIRpipe product, solution, support and company pages. Expand useful customer tasks and image-led content, not repeated headings/buttons or invented claims.
- Preserve current white/navy technology identity. Services use people/context images, manufacturing uses real company photos; generated scenario images remain illustrative.
- Banner model: remove full blue focus border, lengthen both straight tube sections equally, keep matching diameter and equal connection gaps. Complete assembly remains visible immediately.

## Banner and continuous presentation refinement — 2026-11-07
- User explicitly retains the banner design and approves improving its metal lighting, visible entry sequence, pointer feedback and scroll continuity. A small secondary color and one concise bilingual phrase are acceptable; avoid filling the page with labels or slogans.
- User rejects the overall "PPT" feel: detached title/image/caption blocks and plain slide swapping. Prioritize image-led connected experiences and actual exploration over adding more text or identical sections.
- User suggests a premium image or motion at the bottom of the banner. Use the existing interactive architectural application scene as the next continuous visual, rather than a decorative unrelated picture. Keep application hotspots and product links useful.
- Loading must finish before the visible hero sequence starts. Constrain product manipulation to useful views and keep the complete straight-pipe assembly inside the canvas. Smooth metal remains silver; no invented pressing deformation.
- User repeated the request to add other colors to the banner. Make the addition visible: pale ice-blue PIPE lettering and a small amber product CTA/slogan line, retaining white, deep blue and silver as the base. Avoid introducing large multicolor blocks across the rest of the site.
- User supplied an ANUBI reference with large brand type surrounded by floating imagery. Adapt its spatial layering through two useful photo windows (building application and real manufacturing), pointer depth and hover/focus reveal; retain the existing central product instead of copying its agency artwork or decorative doodles.

## Latest correction / Papermark direction — 2026-11-07
- User rejected the two floating image windows. They have been removed from the live hero; do not reintroduce them.
- User finds the front stainless steel too pale and insufficiently metallic. Strengthen real reflection contrast and darker steel midtones while retaining a smooth surface and matching pipe/fitting assembly.
- New explicit reference: https://www.papermark.com/?ref=saaspo.com . It was actually viewed in a browser, including the image-led full-bleed hero, transparent/sticky header and compact dropdown panels.
- User clarified the redesign scope: ONLY navigation and banner. Do not redesign other sections/pages for this reference change. Keep seven established navigation destinations and bilingual behavior.
- Design direction: coherent full-bleed dynamic product scene, clear large headline, one main product CTA, integrated transparent navigation changing to a legible white surface on scroll/menu open. Keep body-readable navigation (larger than Papermark's 14px), meaningful motion, keyboard/reduced-motion functionality. No competitors' footage or factual claims.
- Current visual target is `outputs/papermark-reference/mh-pipe-nav-hero-mock.png`, shown before implementation. `CinematicHero` replaces the prior white hero; its live Three.js scene has an 18-second camera/reflection cycle, direct bounded dragging, an unobstructed headline and five application links. This latest decision supersedes the former pale background-lettering/color treatment for the banner only.
- Navigation is transparent over the scene and white after scrolling or opening a compact product/solution panel. Seven destinations, language switching and inquiry behavior are preserved.
- `public/assets/products/cinematic-assembly.webp` is a static capture of the actual WebGL scene, used only as a fallback. The normal banner is live 3D, not the generated mockup image. `outputs/papermark-reference/film/MH-PIPE-navigation-banner.mp4` records the actual running page.
- This iteration is available for local review at port 4193; it has not been published to the live domain.

## White opening restored — latest decision, 2026-11-07
- After comparing the actual white and dark versions, the user explicitly asks to return to the former white/navy design, while enriching its color and content. This supersedes the Papermark full-bleed dark Banner direction.
- Preserve the large MH PIPE lettering and complete matching straight-pipe assembly. Retain the newer compact navigation interactions, but return the homepage header to white/navy with an 84px spacer.
- Use a deliberate white/navy/ice-blue palette with a small amber product action and active indicator. Do not reintroduce the rejected two floating photographs or use a rainbow of application colors.
- `SilverHero` is the live opening. It adds one concise product-scope statement, one product CTA, and five application entry links. Hover/focus changes a shared explanation without moving the CTA; clicks retain language and selected scenario. Keep the rest of the site intact.
- The reference for restoration is the previous actual capture `outputs/banner-refinement/hero-zh.png`; added colors, CTA placement and application directory are deliberate refinements authorized by the latest request.
- Latest material correction: the user finds the stainless steel insufficiently glossy. Use a polished silver appearance with clear narrow highlights, softer broad reflection transitions and bright midtones; avoid satin/matte surfaces, black chrome, dielectric clearcoat and hard rectangular reflection blocks. The current standard model uses roughness .12/.125 and graded studio reflection cards. Keep layout and product geometry intact for this correction.

## White spatial presentation — latest instruction, 2026-11-07
- User explicitly removes the Banner's bottom application directory and approves the proposed spatial refinement. Do not replace it with a new strip of labels. The application section retains its own functional scene navigation.
- Keep white/navy/ice-blue and the amber product action, with large MH PIPE lettering and a complete matching assembly. Add shallow letter relief, a faint silver-blue environment, genuine projected product shadow, a slow reflection pass, and a small coupling-hover camera approach.
- Shorten the right-hand copy and bring manufacturing immediately after the application section, so actual factory evidence appears earlier. Do not reintroduce the rejected floating photo windows or dark hero.
- Preserve polished silver roughness .12/.125, direct bounded rotation, reduced-motion rendering, and offscreen/blur/modal pause. The scene illustrates assembly only, not pressing mechanics.
- Latest placement adjustment: move the Banner's entire stainless steel assembly down slightly (22px; 16px on desktops ≥1800px to retain hover clearance), preserving its scale, angle, lighting and surrounding typography.
- User finds the lower blue environment too faint. Increase its visible blue depth: white upper32%, pale blue #edf3fb at57%, #d5e4f5 at78%, clear cool blue #b7cfe9 at the bottom. Retain the current type, polished model and layout.

## Selected miniature neighborhood — 2026-11-07
- User selected the FIRST displayed application-scene mock, `outputs/application-scene-concepts/01-miniature-neighborhood.png`, and requested a lighter lower blue. Revised target: `01-miniature-neighborhood-light.png`.
- Preserve header, headline, large lettering and live polished product; add the unboxed lower-right miniature home, workshop and liquid-cooling building. Its contextual details cover building water/gas, fire, industry and cooling. Do not reinstate the removed bottom text directory.
- Lower blue endpoint is now #d7e6f4, matched into the next application section. Keep a visible but light blue atmosphere.
- New transparent image assets are generated illustrative scenarios, not images of MH PIPE projects. Asset source JSON files retain prompts/provenance. The cart is a separate layer with continuous travel; local image lighting animates. Five semantic hotspots link to the existing application viewer.
- Latest user correction: main assembly UP, miniature DOWN because buildings obscured the pipe. Desktop assembly moved up60px (70px at >=1800px) from the preceding placement; miniature bottom -1%, width capped by viewport height. Short desktops keep the full scene in view. This supersedes the earlier down22px/down16px decision.
- Maintain no overlap at rest or coupling hover, no crop at1440x800 /1487x1058 /1920x1080. Preserve keyboard interaction, reduced motion, offscreen/blur/dialog pause. Local review only; not published.
- Latest user asks longer tubes: white-stage left and right tube geometry now4.3 each, previously3.3 (+30.3%). Shift both centers outward0.5 to keep each mating end at±2.45; diameter, wall, coupling and connection gaps remain unchanged. Other product presentation modes retain their original tube lengths.
- Neighborhood load stability: reserve1774×887 intrinsic image dimensions, resolve visibility from current geometry at lifecycle events and resize, and do not hide art before its entry timeline actually starts. Keep IO for offscreen pausing.

## Page loading animation — latest clarification, 2026-11-07
- User explicitly corrected the scope: this request is the LOADING animation when changing pages, not application-scene/photo/product-tab transitions. All exploratory scene-transition edits from this turn were reversed. Preserve existing in-page scene behavior.
- Actual SPA navigation now uses a short full-screen white/silver-blue MH PIPE loading surface: two word groups align, light sweeps within the letters, a small amber seam and localized destination name appear, then the surface reveals the destination upward.
- Seven main navigation destinations, internal route links and browser Back/Forward share this loader. Same-page scene tabs, gallery/product filters and language-only changes do not replay it. Initial document entry retains the fuller BootSequence.
- Await only first-viewport media/fonts/WebGL readiness, with a2.4-second asset-wait cap. No fictitious percentage counter. Reduced motion uses a static cover; Escape skips visual waiting. Latest requested navigation wins; pending superseded routes do not enter browser history.
- Restore scroll, inert state and focus after completion; do not restore a dismissed modal's temporary scroll lock. Home intro starts as the loading cover reveals it.


## Unified hero opening and service road — 2026-11-07
- User reports the Banner entry/interaction is discontinuous and the lower-right miniature has no road. Preserve the accepted hero design and equal longer tubes; fix choreography, not the design direction.
- SilverHero owns one1.82s GSAP opening clock, relative to a fully cleared loading cover: title0s, MH PIPE0.08s, actual3D product0.25s, right copy/action0.65s, road/buildings0.98s, cart1.42s; complete at1.82s. Controlled WebGL progress follows this same timeline. Idle metal lighting, miniature lighting and cart travel start only after settling.
- Initial BootSequence and SPA PageLoadTransition now dispatch mh-intro-ready AFTER the cover is hidden/unlocked. This supersedes the prior instruction to start home entry during the curtain reveal. Home does not get a competing whole-page translate.
- Language changes do not replay entrance. Early scroll/pointer/keyboard action settles it; blur, hidden tabs and inquiry dialogs pause it. Reduced-motion shows settled composition immediately. Separate wrappers keep entrance and scroll transforms independent.
- New generated transparent neighborhood-road.png adds a pale silver-gray road and factory access branch, preserving the original asset. Source/provenance is neighborhood-road-source.json. Cart wheels follow the near lane from image49%,86.5% to66.4%,84.5%, with smooth outbound/return travel; no jump at repeat.
- Actual local checks:26 opening/interaction/desktop checks and29 navigation checks pass, zero browser errors;3 desktop sizes visually checked, both languages and reduced motion. Build/Sites packaging and4 worker checks pass. Actual recording: outputs/hero-entry/film/MH-PIPE-home-opening.mp4. Local preview port4193; not deployed.


## Softer background type and polished steel — 2026-11-07
- User asks for translucent, less prominent Banner background letters and more realistic stainless steel. Keep existing composition, timeline, dimensions and miniature road.
- Static .sh-wordmark wrapper opacity is now0.28. Its children retain the master entrance; reduced-motion must not restore the wrapper to full opacity.
- White-stage product now uses locally bundled Studio Small09 HDRI by Sergej Majboroda / Poly Haven(CC0), with .08 neutral linear fill. Asset/license provenance: public/assets/environments/SOURCE.json; RGBELoader r170 source/license notice retained. Other product presentation modes keep their prior environment.
- Smooth steel roughness .12/.125 and current proportions remain. Add collinear rim support vertices without altering dimensions; lighten steel mouth shading gradually toward the opening, preserving the black rubber. Matching tube length4.3 and gap.812 verified.
- Entire optional HDR+module load is bounded to1.8s and aborts on unmount. Keep a working procedural studio if either resource fails/stalls; decoded HDR supports WebGL context recovery. Static fallback is a transparent capture of the actual updated WebGL model, silver-assembly-polished.webp. No brushed/noise texture.
-17 runtime checks passed: opacity, live reflections, rotation, language/reduced motion, return route, context loss/restoration, missing/slow HDR, slow loader module, unmount during load. Zero page exceptions. Reviewed final-zh/final-en/final-rotated/short desktop captures in outputs/metal-refinement. Local preview only; not published.

- Latest approved balance: increase the Banner background wordmark wrapper opacity from0.28 to0.35. This supersedes0.28 above; retain the translucent direction, current polished metal, layout and opening choreography.


## Chinese header brand lockup — 2026-11-07
- User requests adding 四川岷河 to the upper-left logo in the Chinese version. Implemented one horizontal lockup: existing MH PIPE followed by 四川岷河, same ink color,14px separation at standard desktop size. Chinese uses PingFang SC / Microsoft YaHei,22px weight600 and normal variation settings, rather than inheriting the English condensed tracking.
- Apply on every Chinese page through shared SiteNavigation. English version continues to display MH PIPE alone. Header height remains84px. Smaller desktop sizes reduce Chinese type/gap proportionally; narrow phone fallback stacks the four-character name below the English mark.
- Preserve .sn-brand-text around English ONLY for the loading animation landing target. Hide the Chinese sibling while booting; reveal it as the mark lands. Accessible Chinese link label: 四川岷河 MH PIPE 首页.
- Actual browser review at1100,1280,1440,1920px: no header overlap or horizontal overflow. Language switch, Services header, logo return-home and initial loading visibility checked, zero page errors. Evidence: outputs/chinese-brand/review.json and screenshots. Build and Sites packaging prepared; local preview only.

## Floating exploration navigation — 2026-11-08
- User explicitly chose an independent floating navigation that contracts on scroll and expands on hover; left category list/right dynamic product or application showcase; white/deep blue with small warm accents. This supersedes the integrated full-width header, not the accepted Banner design.
- Exact seven routes and both languages remain. Chinese lockup retains MH PIPE + 四川岷河. Keep .sn-brand-text around the English mark only for BootSequence landing.
- Visual target shown before direct implementation: outputs/floating-navigation/navigation-mock.png. Prompt/tool provenance: mock-source.json. The mock uses existing hero/product references; no new product or company facts were generated.
- Header floats at14px, standard76px height; desktop scroll threshold170px with75px hysteresis contracts to690×66px. Pointer presence or keyboard focus expands it. Explicit navigation control remains in the compact state. Homepage spacer stays84px; Banner geometry,35% wordmark opacity, polished HDR and mini-road remain unchanged.
- Products, Solutions, Services, About and News have shared large showcase panels. Main route links and disclosure buttons remain separate. Left-row indicator travels; nav labels roll; panel content enters with stagger; image/title transitions decode before committing, cancel stale choices, and have a4s bounded failure state. Preview pointer depth is separate from transition transforms. Reduced motion removes movement.
- Actual existing assets are reused: transparent products, conceptual application/service imagery, real factory photos. Services destinations support stage=selection/drawings and #service-detail, with resources at #resources. About includes real /manufacturing. Do not invent product detail routes or unverified technical capabilities.
- Menu open dispatches mh-navigation-change and pauses SilverHero, PrecisionProduct and HeroNeighborhood. Closing resumes without replay or elapsed-time jump. Keyboard ArrowDown, Escape focus restoration, outside dismissal, inert closed content and narrow fallback are retained. Breakpoint changes clear hidden menu state.
- Hash navigation is aligned after the page loading cover/media settle. Numeric scroll coordinates avoid double-applying Lenis document scroll-padding and the navigation offset.
- Actual QA:35 main interaction/layout checks passed; final16 targeted checks passed after type sizing and anchor fixes;11 additional edge checks passed, with the initial anchor-offset failure fixed and verified in final-check.json. Zero page exceptions. Production build, Sites preparation and4 worker checks passed. Evidence under outputs/floating-navigation, including exact-size mock comparison, both languages, compact state, short desktop and service destination.
- Actual browser recording: outputs/floating-navigation/film/MH-PIPE-floating-navigation.mp4. Local preview remains http://127.0.0.1:4193/?lang=zh . Not published to the live domain.

## Navigation hover fill — 2026-11-08
- User clarified that the navigation labels' vertical rolling should be replaced by the homepage “Explore products” CTA interaction. Remove duplicate/rolling label text.
- Labels remain stationary. A navy fill grows upward from the bottom of each navigation item and text/chevron turn white, using the CTA's .45s cubic-bezier(.22,1,.36,1). Keep fill active while that item's showcase is open. Keyboard focus receives the same treatment; reduced motion is immediate.
- Floating collapse/expand, showcase content, seven destinations, amber indicator and Banner remain intact. Fill uses a separate pseudo-element and does not clip focus outlines.
- Actual browser verification: stationary text bounds, navy/white hover, open-menu persistence, keyboard ArrowDown/Escape, English rendering and reduced-motion0s; zero page errors. Evidence: outputs/navigation-fill/. Final build and Sites artifact preparation passed. Local only.

## Homepage body design brief — 2026-11-08
- User explicitly considers the current Banner and navigation finished for now. Freeze their design/interaction while designing the other homepage sections; do not alter them incidentally.
- Homepage must contain: Banner, Solutions/Application scenes, About us, Company strength, Partners, Product showcase, News showcase, Contact us, Footer navigation.
- Confirmed order: Banner → Solutions → Products → About → Company strength → Partners → News → Contact → Footer.
- User chose immersive chapters: selected regions unfold with scroll like a continuous brand film, preserving smooth native continuity.
- Company story emphasizes facility scale and development history. Only source-backed facts may be used; a group-like visual stature does not authorize inventing subsidiaries, global offices, area or headcount.
- Show a coherent visual mock, then directly implement, as previously authorized. Local review first; Banner and navigation remain frozen.
- User invites questions. Retain prior requirements for substantial visible motion, large intentional typography, useful interaction, smooth uninterrupted scrolling, bilingual support and factual company evidence. Avoid repetitive buttons/copy and generic PPT-like section stacks.

- Latest user refinement: each homepage chapter needs distinct breathing space, not a tightly connected uninterrupted wall of sections. Use clear white pauses (roughly90–120px), varied image scale, and purposeful additional animation. Revised top/lower mocks shown before implementation: outputs/homepage-chapters/body-top-mock.png and body-lower-mock.png.

## Homepage body implementation — 2026-11-08
- Implemented selected order with frozen Banner/navigation: PrecisionApplications → HomeProductChapter → HomeAboutChapter → HomeStrengthChapter → HomePartnersChapter → HomeNewsChapter → HomeContactChapter → HomeFooter. Existing footer is suppressed only on the homepage to avoid duplication; other routes are unchanged.
- Revised visual references are outputs/homepage-chapters/body-top-mock.png and body-lower-mock.png. Images were shown before implementation, followed by a larger-spacing revision requested by the user. They establish body art direction, not new company facts or a replacement header.
- Chapters now have deliberate white pauses: application110/90px padding, products120/110px, About/Strength104px preceding margin, editorial spacing96–110px. Native vertical continuity remains; no long scroll pinning.
- Product exhibition has three spatial cutout objects, giant pale CONNECT, scroll-arrival depth, pointer parallax, low-amplitude float, horizontal drag, keyboard tabs and real product-dialog callbacks. Company shows the unchanged real factory photograph, selectable2000/2017/2024 sourced history, source-qualified annual production figures and original production/forming/laboratory images. Partners use the20 unchanged brochure logos in two moving rows, with hover/focus/pause and static reduced-motion view.
- Main body headings enlarged to about80px at1440px wide after mock comparison; Strength has a two-line heading and410px gallery. News is an asymmetric actual manufacturing feature plus dated records and procurement guide. Contact leads to the existing draft-only inquiry workflow. Footer has grouped links and large pale MH PIPE lettering.
- Motion cleanup, reduced-motion, offscreen/hidden/overlay pauses are retained. Actual-browser journey24/24; final typography/overlap8/8 at1100/1280/1440/1920 in both languages; applications21 checks; company history/gallery/counter tests passed; zero captured page exceptions. Production build and four existing Sites tests passed. Frozen file hashes remain unchanged.
- Evidence: outputs/homepage-chapters/ including comparison images, screenshots, test JSON, mock provenance and film/MH-PIPE-home-chapters.mp4. Local preview http://127.0.0.1:4193/?lang=zh only; no publication in this task. Body design remains a user-review version, not an accepted final visual direction.

## More chapter breathing room — 2026-11-08
- User approved continuing implementation, but repeated that vertical connections remain too close. This supersedes the previous90–120px pause target. Desktop homepage rhythm now uses a190–280px chapter pause,230–340px application-to-product pause, and about300px between product controls and factory. Strength→partners and News→contact use the larger pause; contact and footer now have a110–160px white break.
- Central spacing rules live in src/homepage-rhythm.css, scoped to the homepage body. Banner/navigation remain untouched.
- Entry triggers now follow visible content rather than padded section bounds: application frame/title/hotspots/caption; product heading/stage; About heading. Product float/scene pulse observe visible artwork; counters wait until25% of the metrics are visible and pause when the metrics leave view. Partner heading has an entry reveal. No scroll locking or new filler copy was added.
- Actual-browser verification in outputs/homepage-spacing/check.json passed23/23, with six boundary screenshots visually reviewed. At1440px, main pauses measure230–288px, partners→News253px and contact→footer130px. Title timing, offscreen pauses,25%-visible counters, scene/product interactions, English and1100/1440/1920 overflow checks passed with zero page exceptions. Build/package preparation and4/4 Sites checks passed; all six frozen hashes match. Local review only.

## Expanding application gallery — 2026-11-09
- User approved replacing the homepage applications viewer with an architectural scene gallery. Latest overrides: NO large whitespace above/below this chapter; connect from the pale-blue hero into products. NO plus signs. Banner/navigation themselves stay frozen.
- Six scenes in exact order: 建筑给水 / Building water; 家庭活水 / Home water; 建筑燃气 / Building gas; 消防 / Fire protection; 工业 / Industry; 液冷数据中心 / Liquid cooling. Whole image windows are actionable, with horizontal labels and selected amber underline.
- User rejected the first water/gas/fire images as too similar. Use water-v3 (residential-building water distribution), water-v2 for home-water (cool-white/aqua bathroom with flowing tap), gas (warm kitchen), fire-v2 (concrete garage/red fire-hose cabinet), industry (CNC hall), cooling (server aisle). Generated application contexts are not actual MH projects or installation evidence. Original and superseded assets remain preserved; WebP derivatives serve the site. Provenance is in outputs/application-gallery/.
- 家庭活水 is a homepage application entry, with neutral domestic-use wording. Do not invent water-activation, purification, health or circulation performance claims. Its solution CTA links to the existing building-water solution with application=home-water; no new backend/product family was created.
- Revised visual target: outputs/application-gallery/expanded-mock.png, with the no-plus/no-gap overrides applied to overview too. Original overview-mock.png label bars and plus symbols are superseded.
- Latest user finds motion insufficiently smooth and diverse. Keep a stable selection animation when cursor crosses other windows; use hover intent and gentle preview, continuous clicked expansion, independent camera/scroll depth, source-photo pipe reveals, local water-stream motion, industrial display and alternating cooling lights. Preserve native vertical scrolling, rapid latest-choice behavior, keyboard and reduced motion. Final verification remains pending until browser QA completes.
- Further spacing correction: hero→applications still felt too close. Restore112–152px of pale-blue transition space above applications (136.8px at1440), while retaining52–72px applications→products. This supersedes the preceding compact-top rule only; do not add a large white separator or alter hero composition.
- Latest title correction: use 应用领域 / Applications. Latest color correction: replace the applications chapter's blue top with warm pearl-white #faf9f6, fading to white. Preserve hero itself. The new white top supersedes the preceding pale-blue transition color, but retains the112–152px spacing.
- User still rejects the equal-column gallery as insufficiently innovative/striking despite motion corrections. Three genuinely different layout concepts are being prepared (staggered spatial exhibition, perspective circular gallery, large scene with details). Current gallery is a working interim draft; do not claim visual acceptance or publish it as final.
- User immediately rejected the first staggered exhibition mock (generated exec-63bafa93-9538-43e8-ab91-d829742888b1.png, reattached as codex-clipboard-8f8fe5ae-b1ac-4c9b-bc65-732578d1578a.png): “太丑了”. DO NOT implement it. Gold ribbons, heavily shadowed tilted image collages and giant stacked title are rejected. Remaining conceptual generations are deferred while clarifying visual subject and whether all six scene images must be simultaneous. Existing interim website remains available; latest title and pearl-white top are already applied.

## Real architectural applications — 2026-11-09
- User chose explorable three-dimensional buildings, emphasizing camera and spatial movement; the six scenes may switch automatically. Homepage now imports SpatialApplications.jsx. The former image gallery remains in source only for rollback.
- Actual Three.js architecture replaces image-window expansion: building cutaway, bathroom, kitchen, fire-protection garage, CNC workshop and server room. Straight pipe segments meet separate elbows/collars. All environments are illustrative application models, not verified MH projects or installation drawings.
- Neutral #f7f8f7 stage, one scene at a time, large 应用领域 heading, one selected-scene sentence, one solution link and six bottom labels. No plus signs, image collage or gold ribbons. Frozen Banner/navigation hashes remain unchanged.
- Latest timing request shortens dwelling from8s to4.5s and camera flight from1.5s to1s. Actual timing measured4.527s dwelling and1.000s transition before the subsequent continuous-play refinement.
- Latest user explicitly removes the bottom-right play/pause button and requests continuous autoplay. Do not restore that control. Manual category selection, keyboard orbit and dragging must not permanently stop autoplay; the timer resets after interaction, with camera travel deferred only while the user holds a drag. Keep native vertical scrolling, hidden/offscreen/overlay rendering pauses and operating-system reduced-motion support.
- Shared geometry/material kit batches static meshes; dynamic water, burner, CNC and server nodes remain live. HDR metal reflections, VSM shadows, material contrasts and camera framing were refined after real-browser captures. Earlier captures showing a play button are superseded.
- Functional checks20/20 passed before the user removed the play control; those assertions for manual pause/play are now intentionally obsolete. Focused continuous-autoplay verification is recorded separately in outputs/application-spatial/continuous-check.json. Build and existing Sites packaging remain intact. Local review only; the generated concept uses photorealistic materials beyond the current realtime maquette detail, so do not describe it as an exact visual match or an approved final design.

## Reading hierarchy — 2026-11-10
- Latest user says many words across the website are oversized and feel AI-generated; explicitly requests smaller explanatory copy. This supersedes the earlier preference to enlarge most headings and avoid small explanatory text.
- Preserve the accepted hero/navigation composition. Ordinary homepage headings now around46px at1440px (previously73–88px), interior H1 around60px (previously up to95px), detail headings around30px, and useful introductions16–18px with1.75 line-height. These rules live in src/reading-hierarchy.css imported after styles.css. Dates, metrics and ornamental lettering are quieter; pale CONNECT remains behind the product images as previously requested.
- Use direct section names: Pipes & fittings, Manufacturing & inspection, Our partners, News & resources and Discuss your requirements. Services/News/Contact/Applications inner pages use plain titles with concise purpose descriptions. Reduce repeated from-X-to-Y slogans and forced line breaks.
- New bilingual explanations cover product selection/drawings, application differences, company identity, manufacturing/inspection photographs, available records and information to supply with an enquiry. Do not add new technical claims, capacities, certifications or relationships. Existing source-qualified company figures remain unchanged.
- All six application scenes continue4.5s dwelling +1s camera flight, automatic playback after selection/drag, and no playback button. Other animations and useful interactions remain intact. Both languages inspected on all8 routes; English checks at1100/1440px and active homepage motion evidence are under outputs/type-refinement/. Hero/navigation source hashes remain unchanged. Local preview only.

## Homepage chapter scrolling — 2026-11-13
- User requests one screen/section per scroll gesture. Desktop homepage now advances through its nine existing chapters in order, backwards on upward gestures. This supersedes previous free continuous-scrolling preferences for the desktop homepage only; inner pages and narrow/touch layouts retain ordinary scrolling.
- `useChapterScroll.js` consumes wheel input through the existing Lenis virtualScroll callback. The 1.05s eased movement uses real document scrolling, preserving ScrollTrigger and WebGL visibility logic. A 240ms quiet interval separates gestures; the whole inertial tail is consumed so it cannot jump several chapters. Keyboard page navigation is supported without taking keys from interactive controls.
- `chapter-scroll.css` gives each body chapter a viewport composition and internal header clearance. No strip of the previous section remains at the top. Long content, expanded partner lists, short windows and browser zoom are traversed before moving on; content is never clipped inside an inaccessible fixed-height container. The Banner/navigation sources and their design remain frozen.
- Modal, navigation, initial loading and page-transition locks take priority. Ctrl/Meta zoom, nested scrollers, editable fields and touch retain their normal behavior. Clear only the controller's own animation when interrupted; Lenis.reset() avoids the zero-frame scrollTo cancellation edge case without releasing external stop locks.
- Updated the strength gallery arrival reveal to finish with time in desktop chapter mode, so the clipped photo/caption does not require extra scroll past the chapter's landing point. Reduced motion shows immediate chapter changes. Existing scene autoplay, product selection, source-qualified counters and bilingual text remain unchanged.
- Local browser evidence: outputs/chapter-scroll/check.json, 46/46 assertions passed with zero page exceptions, including nine-screen forward/backward navigation, inertial tails, diagonal input, instant cancellation, modal interaction, inner-page cleanup, English, short windows and reduced motion. Final screenshots are final-1.png through final-8.png. Production build/Sites preparation and4/4 worker tests passed; all six frozen hashes match. Local review only; no deployment.

## Scrollable application scenes and pipe interaction — 2026-11-14
- User clarifies: scrolling down within Applications should change its scene. The desktop chapter controller now delegates gestures at this chapter to SpatialApplications: water → home-water → gas → fire → industry → cooling. Upward gestures reverse. At cooling, down exits to Products; at water, up returns to Banner. Camera flights consume further gestures without queuing; the existing inertia guard remains. This supersedes the earlier test assumption that the next wheel after entering Applications immediately goes to Products.
- User also requests clickable pipes with ongoing dynamic effects. Pipe runs with appropriate diameter/material retain independent geometry batches and exact straight/elbow paths. Plants, railings, door handles and structural hangers are excluded. `application-pipe-interaction.js` uses real mesh picking with8px tolerance checked against opaque scene occlusion; transparent glazing can be seen through.
- Pipes have restrained moving cyan markers; hover highlights the route, click retains a warm highlight and replaces the current description with a concise bilingual explanation. A keyboard-accessible Explore pipework / 查看管路 action selects the main run; blank click or the same action clears it. Dragging the camera does not accidentally select a pipe. The pipes and scenes remain illustrative rather than installation evidence.
- Selecting a pipe holds the current scene for7s before resuming its4.5s automatic dwell. Water, flame, machinery, server lights and pipe markers remain live throughout inspection. Scrolling or choosing another scene clears the selection immediately; closing inspection restores the usual dwell. No playback button was added. Offscreen/hidden/dialog/menu pause and reduced-motion rendering remain.
- Evidence: outputs/application-scroll-pipes/check.json (33/33 browser checks), edge-check.json (6/6), pipe-unit.json (13/13). Actual mouse picking, all six scene boundaries, inertial tails, preserved animation/autoplay, drag separation, English layout and WebGL fallback were verified with zero captured page exceptions. Final build/Sites preparation and4/4 worker checks passed; Banner/navigation hashes still match. Local preview only.

## Application clarity and connection closeups — 2026-11-14
- User approved the audit direction and asked to make Applications more obvious. Preserve the accepted Banner/navigation and existing chapter/scene scrolling; this is a refinement of the current explorable 3D spaces, not a new page design.
- Six scenes now have stronger functional identity: enlarged building risers and floor branches; household basin/shower flow; gas meter/valve/burners; red fire equipment; machine feeds/gauges; liquid-cooling CDU with paired rack supply/return routes. Pipe ends meet visible equipment/headers. All remain illustrative application scenes, not certified installations or engineering drawings.
- Pipe selection now eases the actual camera into a visible connection rather than only recoloring a run. Overview and detail use one existing render loop; selection clears on scene changes. Back to scene eases out. The approach follows the visible connection sightline and preserves opaque occlusion. Household default focus uses the exposed inlet near the basin, avoiding the shower frame.
- Selected pipework keeps silver reflections with small warm flow markers; surrounding opaque architecture is softly lightened with per-model cloned shader uniforms, not made transparent. Mirrors, glazing, selective bevels and thinner shower streams were refined after screenshots. Each scene has a tailored overview angle.
- Added a small 01–06 scene count and useful scroll/click hint. Selected views show concise scene-specific copy and three real product-detail actions (pipe/tee/elbow), using the existing product/inquiry modal. No new product suitability claims/specs were added. Autoplay, 7s inspection hold, 4.5s dwell, 1s scene flights and reduced-motion support remain.
- Browser verification: outputs/application-clarity/check.json, 40/40 passed, zero page exceptions. Covers wheel boundaries/inertia, eased closeups, real pipe picking, product modal pause, all six scenes, return/automatic continuation, reduced motion and English 1100px layout. Latest pipe-unit.json has 23/23 checks including focus visibility, environment fade, material restoration/disposal and static reduced-motion markers. Production build, Sites packaging, 4 worker checks and all six frozen-file hashes passed.
- Visual evidence: outputs/application-clarity/scene-0.png through scene-5.png; closeup captures. final-home-detail.png supersedes detail-1.png after the inlet-focus correction. Local review at http://127.0.0.1:4193/?lang=zh only; no deployment.

## Continuous scrolling restored — 2026-11-19
- User explicitly requests cancelling one-page-at-a-time scrolling. This supersedes the 2026-11-13 chapter snapping and 2026-11-14 application wheel-switching requirements.
- Homepage now uses the existing continuous Lenis scrolling. PrecisionHome no longer mounts useChapterScroll, site-motion no longer delegates wheel input, and main no longer imports chapter-scroll.css. The old controller/style files are dormant historical source only.
- Removed the Applications wheel-controller bridge. Wheel input over the 3D view scrolls the document; six scene tabs, automatic tour, drag orbit and pipe closeups remain. Bilingual hints and accessibility text now describe clicking the scene tabs.
- Hero scene shortcuts scroll through existing Lenis to Applications with header clearance. Restored the manufacturing gallery's scroll-linked reveal instead of the desktop chapter arrival animation. Natural content spacing applies; no forced full-screen sections. Banner and navigation source hashes unchanged.
- Local verification: outputs/continuous-scroll/check.json, 11/11 passed with zero browser exceptions. Real wheel inputs move the page 100px rather than one section, including over the 3D scene; scene selection, pipe closeups, autoplay, gallery reveal and reduced motion remain working. Production build/Sites preparation and 4 worker checks passed. No deployment.

## Product-led opening — 2026-11-19
- User explicitly approved the preceding Banner critique and proposed changes ("按照你的更改"). This authorizes changing SilverHero and its isolated renderer mode; the existing floating navigation remains unchanged. Other homepage chapters remain in place.
- Visual target shown before implementation: outputs/hero-connection-2026-11-19/concept.png. Consolidate title, a factual pipe/fittings manufacturing sentence, and one amber product CTA in the upper-left. A shallow diagonal stainless assembly is the main image; pale PIPE remains secondary. The generated mock's factory-looking transition is intentionally replaced by the existing interactive miniature, not claimed as a company photograph.
- New connection-stage presentation in PrecisionProduct uses a single coordinated entry timeline: text/camera reveal, equal straight tubes inserting into the matching coupling, then a joined interactive view. It shows assembly only, NOT press deformation or an engineering-validated installation process. Standard/white-stage/cinematic modes remain separate.
- Miniature buildings now live in ApplicationBridge between Banner and the existing six-scene Applications viewer. Existing lights, cart, hotspot selection and application navigation are retained. Do not reintroduce scroll snapping or wheel scene switching.
- Continue to prioritize readable medium-size copy, smooth polished silver, useful direct model interaction, keyboard access, reduced-motion behavior, and pausing offscreen/behind menus. The entry waits for renderer readiness and loading-cover completion.

- Final local verification: 29 browser checks passed (8 entry, 17 bridge/navigation/layout, 4 compatibility), no uncaught exceptions; production build/Sites preparation and 4 worker tests pass. Final screenshots and comparisons live in outputs/hero-connection-2026-11-19/. Navigation hashes unchanged. The connection-stage fallback is a capture of the actual final renderer, not the generated mock. Local preview only; no publication.


## Stable navigation and contextual interaction — 2026-11-19
- User approved the navigation/cursor audit recommendations and explicitly permits redesigning navigation. This supersedes the prior navigation freeze; keep the latest Banner and all page content in place.
- Retain all seven destinations, bilingual behavior, white/navy/small amber palette and continuous page scrolling. The new desktop bar stays full-width with stable horizontal targets; scrolling may only reduce its height. Do not restore the 690px collapsed desktop menu or shifting labels.
- Visual target shown before implementation: outputs/navigation-refresh-2026-11-19/concept.png. An attached panel uses a readable left list and a right product/photo stage with a separate caption area. Product changes have layered perspective motion, while text stays in place.
- Menu opening uses deliberate mouse movement and short intent delay; keyboard arrows/Enter and Escape remain supported. Normal navigation/text/form controls use native cursors. Model rotation, pipe inspection, product drag and photo enlargement use distinct precise contextual cues.
- Keep the initial brand entrance. Subsequent routes use a short white/silver sheet below the persistent navigation; only actual resource readiness can extend the wait. Respect reduced motion, cancellation, focus restoration and scroll release.
- Product cutouts and contextual images are reused, with no new factual claims or changed product specifications. This is a local preview iteration, not publication.

- Final navigation verification: 25 central navigation checks, 15 cursor checks, 9 route checks and 4 final visual/brand checks passed with no uncaught exceptions. Separate real-pointer intent checks passed. Production build/Sites preparation and 4 worker tests passed; all 5 Banner hashes match. Visual comparisons and evidence are in outputs/navigation-refresh-2026-11-19/. The prior Banner QA remains archived in its own output folder. Local preview only.

## Application flow emphasis — 2026-11-19
- User requested a visual mock first; the running website is not yet changed. Latest correction: remove connection inspection from the proposed Applications experience and put more emphasis on flow along the complete pipe network. This supersedes proposed click-to-zoom connection nodes for this redesign.
- Revised mock: outputs/application-concept-2026-11-19/applications-flow-concept.png. Keep architectural overview, six scene choices, polished silver pipes, and route flow from inlet/riser through branches to water-use endpoints. Remove joint-inspection labels, gold node selection and connection closeup emphasis. Flow colors are visual direction indicators, not transparent steel or verified physical simulation.
- The user has not yet requested implementation of the new mock; existing live Applications still uses its previous interactions.

## Approved application flow implementation — 2026-11-19
- User approved implementing `outputs/application-concept-2026-11-19/applications-flow-concept.png` and twice emphasized that all pipe fittings must be **double-press (双卡压)**. This supersedes the pending implementation statement above.
- Retain the existing Banner and floating navigation. Consolidate the former miniature ApplicationBridge and Applications viewer into one architectural flow chapter: upper heading and six tabs, left contextual copy/one solution link, large realtime architecture on the right. No connection-inspection mode, magnifying camera, plus signs, product shortcuts or playback button.
- Use straight stainless steel tubes, distinct double-press elbows, tees and sleeves. The formed socket has one sealing bead with clear straight pressing lands on BOTH sides, including its outer mouth. This is not two O-rings. Public primary reference notes are in `outputs/application-flow-build-2026-11-19/press-reference.json`; geometry is illustrative, not certified dimensional engineering CAD or a press deformation simulation.
- Flow follows complete 3D routes, from incoming main into branches, respects opaque architecture, and remains visible during camera movement. Silver metal stays dominant; modest cyan (water/cooling) and amber (gas/fire) cues communicate flow direction. No invented flow/pressure values. Automatic tour, mouse/keyboard overview orbit, subtle pipe hover emphasis, continuous document scrolling, offscreen/menu pauses and reduced motion remain.
- Latest user found building-water and home-water scenes too similar. Building water stays a vertical two-floor riser and branch system. Home water is now a horizontal single-storey cutaway with **kitchen, laundry and washroom**, warmer wood/tiles and a more overhead camera. Avoid another bathtub/shower room or a reduced copy of the water-building model.
- Latest explicit correction: **家庭活水管道走顶**. Home water routes must run overhead with ceiling supports, then drop alongside walls into the three water-use areas. Remove the former exposed floor-level main and its floor brackets. Use double-press connections at all route turns and tees.
- Final local verification: 28 central browser checks, additional final edge checks and 8 geometry/flow checks; production build, Sites packaging and 4 worker checks pass. All six frozen Banner/navigation hashes match. Actual scene screenshots, selected-source comparison, test evidence and primary anatomy references are archived in `outputs/application-flow-build-2026-11-19/`. The photographic source remains an art-direction reference; the live version is realtime geometry and is not an exact photorealistic replica or an engineering-validated installation. No deployment.
- Normal operation uses the single live WebGL animation loop. Only WebGL failure uses the new scene-render fallback images in `public/assets/applications/`; no competitor/project photographs are substituted. Reduced-motion mode remains static and manually selectable.


## Separated application directory and caption — 2026-11-19
- User approved the application audit, then rejected the first left accordion as crowded and its text/motion as AI-like. That accordion is archived under outputs/application-directory-2026-11-19/accordion-baseline and is NOT the current direction.
- Current layout: medium section heading, fixed six-row scene directory on the left, slightly smaller realtime architecture on the right, one short literal description and one solution link in an independent caption below the architecture. No enlarging selected labels, collapsing panels inside the list, staggered text, decorative numbers or extra repeated scene titles.
- All scene models share one world anchor. New application-ambient-renderer renderTransition supports two independent live passes; SpatialApplications uses a0.62s switch with a short eased crossfade. No added transition rotation/zoom, and no idle camera drift. Pipe flow, direct orbit, hover emphasis and automatic tour remain.
- The floor is almost-transparent white plus a light real shadow. Do not restore the broad gray floor or decorative animated window bands behind the directory.
- All six scenes and double-press geometry remain unchanged; family water stays overhead. Preserve current Banner and navigation sources, native continuous scrolling, bilingual copy and reduced motion. Caption keyboard focus pauses only the tour selection timer while flow remains live.
- Build, Sites packaging,4 worker checks,8 geometry/flow checks and9 frozen-source hashes pass. Browser evidence is under outputs/application-directory-2026-11-19/. Local preview only; no deployment.

- Final updated-layout verification:32/32 browser checks pass, zero JS/shader exceptions. Actual handoff617ms, fixed directory bounds across all six scenes, single visible caption, focused-CTA tour hold with flowing pipes, native100px scrolling and bilingual1100/1440/1920 layouts verified. Visual review: six-scenes-overview.png and layout-en-1100.png.

## Application tour — 2026-11-20
- Each visible scene photograph automatically leads into its aligned 3D pipework. The overview dissolves straight into the next photograph and the six scenes loop.
- Keep all six scene names directly selectable in a single desktop row below the picture, including during model loading and camera movement. The active name and its progress line identify the current scene. A selection starts the tour from that scene.
- Reduced-motion visitors select scenes and open the 3D view manually. Keep the ordinary page scroll and the existing hero and primary navigation.

## Product families — 2026-11-20
- The three primary series are 双卡压不锈钢管路系列, 环压不锈钢管路系列 and 厚壁不锈钢管路系列. Couplings, elbows, tees and straight pipe are forms, not peer families.
- Keep the same series across the homepage, navigation and catalogue. A series catalogue link carries the family and, where selected, the form to #product-selection. Double-press and ring-press fittings of the same form have distinct inquiry records and brochure photos.
- The cutaway for thick-wall piping is an illustration, not an individual confirmed SKU. Use the enquiry to collect actual diameter, wall thickness, material and end requirements.

## Homepage section spacing — 2026-11-20
- Leave visible space between every homepage chapter. Fade the lower edge of the banner into a short blank interval before the application photograph. Give the factory story and manufacturing evidence a longer pause, and keep the final interval before the footer shorter.

## Banner playback and application navigation — 2026-11-20
- Open the Banner on one polished coupling and two visibly separated, matching straight pipes. Both pipes then slide inward, hold the joined pose and repeat the opening and joining sequence. Keep a visible product during loading or GPU interruption. Reduced motion shows the joined pose.
- Place the six application selectors above the scene, pairing each name with a distinct icon. Show the scene caption and solution link with the photograph. The 3D model uses the full scene area. Keep the manual return control accessible for reduced-motion visitors.
- Reveal the complete homepage composition together on first entry and return. Both title lines, introductory copy and separated steel pipes must be readable in the same first frame, including when the visitor skips the brand animation. Show bright polished silver, with varied strip reflections and darker socket interiors. The opening-to-joined loop starts after the cover clears.

## Homepage application directory — 2026-11-21
- Give the application chapter a centred “应用领域” / “Applications” title and open space above and below. Place six miniature objects above their scene names. Hover or keyboard focus gently turns the object, and selecting it changes the large scene. Use colour to mark the selected scene and omit navigation connectors and progress bars.
- On desktop, distribute the six objects evenly across a centred row spanning 92% of the page, up to 1250px.

## Homepage product series — 2026-11-21
- Place short series selectors beside the chapter title, above the full-width product stage. The stage fills the space below the series heading in its viewport. Keep the full series name visible when a visitor selects a fitting.
- Double-press uses the connected pipe run and selectable silver fittings. Ring-press uses a smooth finish visualisation guided by each company product photograph. Show its source status and provide a same-angle original photo comparison. Thick-wall turns to the pipe end and identifies outside diameter and wall thickness without invented dimensions.
- Visitors choose the series. Keep a selected detail in view until another action. Fitting families link to their filtered catalogue; thick-wall links to the dimension requirements form.
- When the double-press stage comes into view, automatically show the whole run, coupling, tee, elbow and straight pipe, then loop. Clicking a part holds that view until a different part or the background is selected. Reduced-motion visitors explore manually. Automatic stops do not filter the catalogue.
- Frame each stop around the socket, tee branch, elbow bend or open pipe end. As the camera arrives, sweep a clearly visible ice-blue reflection across the selected metal and keep a coloured edge on it during the hold. Keep the neighbouring components silver and the caption readable over the pipework.

## Homepage company history and buyer journey — 2026-11-21
- Present About MH PIPE as a visitor-controlled visual history. Use the founding in Meishan in July 2000, the 2008 press-fitting registration and company name change, the 2010 gas procurement milestone, the 2017 national ring-press standard and the present workshop. Credit present-day factory photographs as such. Sources: the company's [history](https://www.scmhgd.com/col.jsp?id=130), the 2024 company brochure, and the [official drafting record](https://std.samr.gov.cn/gb/search/gbDetailedCNF?id=71F772D81B07D3A7E05397BE0A0AB82A).
- In manufacturing, let the visitor follow pipe to hydrostatic testing or a fitting to airtightness testing. Label both annual production figures with their units and the 2024 brochure attribution.
- Keep the partner logo reel and a readable bilingual directory. The Zibo thin-wall pipe supply example is documented in [Chengdu Gas's published procurement record](https://www.cdgas.com/information/zhaobiaogonggao/42845/index.html?index=498). Its adjacent image illustrates an exterior riser from the company installation archive, with no client/location attribution. New company images were proportionally resized from 安装实例精修图片(1)/燃气旧改1.jpg and 户外立管四通入户.jpg.
- The buyer section and footer link to the downloadable English selection sheet. The homepage enquiry opens the distributor form by default; report acceptance only after the configured mail gateway accepts the request.
- The homepage company chapter opens on the user's original 1448 × 1086 campus rendering and a linked detail of the same image. Credit it as a rendering in both languages. Scroll to the history and select an individual year. The photographic transition follows the parallel roof bays; reduced motion selects the record directly. Mention Meishan in the founding record. Use the company name for the heading.
- The workshop view uses a draggable boundary between an actual production line and its corresponding inspection station. The buyer journal opens a second exhibition photograph and shows two catalogue size rows beneath the downloadable sheet. End the homepage enquiry chapter with the photograph of the Meishan office entrance.

## Homepage factory and laboratory · 2026-11-22

The company-strength chapter follows the supplied workshop reference. Its upper gallery uses real workshop photographs, an overlapping blue caption and a visible preview of the next station. The lower laboratory panel pairs each named test with the matching MH PIPE equipment photograph and supports direct selection. Use the shared bilingual typography and the existing manufacturing route.

At desktop widths the factory floor and laboratory each occupy the space available below the floating navigation. Keep normal continuous scrolling. Production figures sit beneath the workshop photos within the factory panel.

## English lines below Chinese headings

Chinese page and section titles carry a small English translation directly below the Chinese text. Use the current English title for the active scene, series or record. English pages show a single title; the approved homepage banner has its own typography.
The current desktop scale uses 3vw for section headings and .73vw for their English translations, capped at 54px and 12px respectively.

The homepage Help & Support chapter pairs the drawing-review image with four service links and leads into Contact.

## Homepage after the laboratory

Use the three reference spreads in order. The strategic-partner wall shows four columns and two rows of the original brochure logos. The full-width project gallery uses named brochure images and separately captioned residential installation photographs. The newsroom is a dated lead story with an accompanying photo, four briefs and four archive cards. Continue to the distributor and project enquiry links, then the site directory and downloadable literature. Keep the established blue and bilingual heading scale.

Every homepage chapter occupies one viewport, including separate factory floor and laboratory screens. The footer follows the height of its content. Join the product stage directly to the full-width inspection photograph with a crisp edge and natural scrolling. On small screens, let longer content extend the section as needed.
