# KabadiSetu
### कबाड़ी से Recycler तक — सीधा, साफ़ और सुरक्षित
*From scrap collector to recycler — direct, transparent and safe.*

A vernacular, offline-first prototype for connecting informal e-waste
collectors in India to authorized recyclers — with price transparency,
recycler matching, a digital handover receipt, an earnings ledger, and a
password-gated admin traceability console.

This is a standard **Vite + React + Tailwind** project. Clone it, run it,
and deploy it to GitHub Pages (workflow included) or any static host.

---

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # outputs to ./dist
npm run preview    # serve the production build locally
```

## Admin console password

The Admin console (one of the three demo roles, switchable from the
control bar at the top of the app) is gated behind a password:

```
1234
```

**This is a demo-only, client-side check** (`src/App.jsx`, search for
`ADMIN_PASSWORD`) — the password ships in the JavaScript bundle, so
anyone who reads the source can see and bypass it. It exists to keep the
admin screens out of a casual demo viewer's way, **not** as real access
control. Before any real deployment, replace it with actual
authentication (see §"Known limitations" below).

---

## Deploying to GitHub Pages

1. Create a new GitHub repository and push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: KabadiSetu prototype"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. In the repo on GitHub: **Settings → Pages → Build and deployment →
   Source → GitHub Actions**. The included workflow
   (`.github/workflows/deploy.yml`) builds and deploys automatically on
   every push to `main`.
3. **Important:** open `vite.config.js` and set `BASE_PATH` to match your
   repo name, e.g. if your repo is `github.com/you/kabadisetu`, keep
   `"/kabadisetu/"`; if you rename the repo, update this to match (project
   Pages sites are served from `https://<user>.github.io/<repo>/`, so the
   base path has to line up or assets will 404). If you deploy to a
   *user/organization* Pages site, a custom domain, or a host like
   Vercel/Netlify instead (all served from the domain root), set
   `BASE_PATH` back to `"/"`.
4. Push again after changing `BASE_PATH` (or just set it correctly
   before your first push) — the Action will rebuild and publish to
   `https://<your-username>.github.io/<your-repo>/`.

**Alternative hosts:** `npm run build` produces a normal static `dist/`
folder — it deploys unchanged to Vercel, Netlify, Cloudflare Pages, or
any static file host (set `BASE_PATH` to `"/"` for those).

## Installing it to the desktop (PWA)

This build includes `vite-plugin-pwa`, which generates a real Web App
Manifest **and** a service worker at build time — so once it's deployed
(step above) and loaded once, the installed app also works fully
offline, including the initial page load. In Chrome, Edge, or Brave:
open the deployed URL → click the install icon in the address bar (or
the in-app **Install app** button in the demo control bar) → it adds a
real desktop icon that opens KabadiSetu in its own window.

*(Running `npm run dev` locally does not register the service worker —
that's a Vite/Workbox default. Use `npm run build && npm run preview` to
test the installed/offline experience locally.)*

---

## 1. What this is, and what it honestly isn't

This is a **working, clickable prototype**, not a slide deck. Every screen
has real state behind it: creating a lot actually creates a record, matching
actually filters/sorts the recycler list by real rules, going offline
actually queues the record and a real sync pass clears the queue, and a
lot handed to a recycler in the Recycler app instantly shows up as paid in
the Collector app and in the Admin traceability timeline.

**What's real:**
- Photo capture via the device camera/file picker (`<input type="file" capture>`), shown as an actual thumbnail.
- Audio playback via the browser's built-in text-to-speech (`speechSynthesis`) — real synthesized Hindi/Marathi speech, not a canned audio file.
- All state transitions, the price-estimate formula, the recycler matching/scoring logic, the offline queue + idempotent sync, the traceability timeline, and the receipt/reference-number generation.
- The installable-app manifest and service worker (via `vite-plugin-pwa`) once deployed and built for production.
- Three linked apps (Collector, Recycler, Admin) sharing **one** in-memory data store, switchable from the demo control bar at the top of the page.

**What's simulated, and clearly labelled as such in the UI:**
- Recycler authorization records, price history, and all seed transactions — every screen that shows them carries a "Demo data" pill.
- Network connectivity — toggled by hand with the "Simulate offline" button instead of reading a real radio, so the offline/sync story can be demonstrated on demand.
- AI classification — a transparent **rule-based** suggestion (picks the most common sub-type), explicitly labelled "Prototype rule-based classifier — this is not a trained ML model." The collector can always override it.
- The Admin console password — a hardcoded client-side check, not real authentication (see above).

**What a real pilot would still need (documented, not built here):**
- A native local database (e.g. SQLite via a mobile framework) instead of in-memory React state, so data survives an app restart/refresh.
- A real backend, proper authentication for all three roles (not a shared hardcoded password), and push notifications.
- A trained image-classification model, once a pilot has produced a labelled photo dataset.
- Real recycler authorization data sourced from CPCB/SPCB registries.
- Field validation with actual collectors (see §9).

The data contracts (lot, transaction, traceability event, recycler record)
are written so any of the above could be swapped in without changing the UI.

---

## 2. Problem statement

India's informal scrap network has excellent last-mile reach but sits
mostly outside the formal recycling system: fragmented buyers, no price
transparency, undocumented transactions, and no traceability once material
leaves a collector's hands. KabadiSetu's bet is narrow and specific: make
the formal route *feel* easier than the informal one — instant price
information, a clear recycler comparison, a receipt, and an earnings
history — rather than adding paperwork on top of an already low-margin,
low-literacy, cash-first workflow.

## 3. User roles

| Role | Who | Core needs |
|---|---|---|
| **Collector** | Waste-picker, scrap dealer, small aggregator | See prices, create a lot in a few taps, compare recyclers, get paid (cash-first), keep a record |
| **Recycler** | Authorized recycler/aggregator | See incoming lots, quote, confirm final weight/value, record payment |
| **Admin** | Platform operator | Datasets, traceability lookup, anomaly review, unit economics — password-gated |

All three are reachable from the demo control bar at the top of the page —
this is a stand-in for real per-role login, clearly out of scope for a
browser prototype (see §1's known limitations).

## 4. Product story (what the demo proves)

*"I have scrap." → "I can identify it." → "I know roughly what it's
worth." → "I can see what recyclers are offering." → "I can choose a
verified one." → "I hand it over." → "I get paid." → "I have proof." →
"I can see my earnings history."*

### 5-10 minute live walkthrough
1. Onboarding: pick Hindi, pick an area (e.g. Gurgaon), see the auto-generated Collector ID (no Aadhaar/bank details asked).
2. Home → **कचरा जोड़ें** (Add scrap) → take/choose a photo → PCB → motherboard → *used* → 12 kg → shop → see the instant estimate with a confidence label.
3. Prices tab → tap PCB → see the 30-day trend and per-recycler offers.
4. From the new lot's detail screen → **Recycler खोजें** → see the matched, authorization-verified recyclers sorted by offered rate, with the match reasons spelled out.
5. Open a recycler → **पिकअप माँगें** (Request pickup).
6. Switch the demo bar to **Recycler app** (same recycler) → open the lot → **भाव दें** → accept.
7. Toggle **Simulate offline** in the demo bar, then back **online** — watch a lot created while offline show "waiting to sync," then clear automatically.
8. Still in the Recycler app → open a `PICKUP_REQUESTED` lot (a seeded one, e.g. `LOT-10022`) → **हैंडओवर की पुष्टि करें** → enter final weight/value, cash, paid → **लेन-देन पक्का करें**.
9. Switch back to **Collector app** → Earnings tab shows the payment; open the lot → receipt with its `KS-YYYYMMDD-XXXXXX` reference and QR placeholder.
10. Switch to **Admin console** → enter `1234` → Traceability tab → paste the Lot ID → see the full timeline from creation to payment. Visit the AI/ML and Unit Economics tabs.

## 5. Architecture

```
Collector / Recycler UI (React)
        |
   In-memory app state (useState) — lots[], transactions[]
        |
   Sync-status field per record: SYNCED | PENDING_SYNC
        |
   "online" toggle simulates connectivity;
   going online replays only PENDING_SYNC rows (idempotent — already-synced
   rows are never touched twice, so no duplicate handovers are possible)
        |
Admin console reads the same state — no separate export/import step
```

**Production target (documented, not built in-browser):**
```
Mobile UI → local DB (SQLite) → sync queue → connectivity detector →
backend API → central DB (Postgres) → analytics/AI layer
```
Every offline-created entity already carries the fields a real sync layer
would need: `syncStatus`, `createdAt`, and (for lots) an `offlineCreated`
flag — a real local-ID/server-ID split and conflict resolution would
layer on top of this without changing the UI contract.

## 6. Data model (as implemented)

**Lot**
`id, collectorId, category, subcategory, condition, weight, sourceType,
location, photo, estimatedValue, confidence, status, syncStatus,
offlineCreated, createdAt, recyclerId, quotedPrice, finalWeight,
finalValue, paymentMethod, paymentStatus, handoverRef, transactionId,
events[]`

Lot status: `READY → OFFER_RECEIVED / PICKUP_REQUESTED → COMPLETED`
(`CANCELLED` is modelled but not wired to a UI action in this build).

**Transaction**
`id, lotId, collectorId, recyclerId, quotedPrice, finalPrice, weight,
paymentMethod, paymentStatus, status, handoverRef, handoverAt, location,
flagged, flagReason`

**Recycler** (seed dataset, 5 demo entities)
`id, name, location, distanceKm, accepts[], auth
(VERIFIED|PENDING_VERIFICATION|EXPIRED), authType, authRef, authDate,
pickup, serviceArea, phone, rates{category: ₹/kg}`

**Price record** (seed dataset)
`id, category, location, date, price, unit, source, quality`

**Traceability** is not a separate table — each lot carries its own
`events[]` (timestamped strings), which is exactly what the Admin
traceability timeline renders. This was a deliberate simplification for
the prototype; a production system would likely externalize it into its
own append-only table for auditability.

## 7. Matching logic

```
scoreRecyclers(category) =
  RECYCLERS
    .filter(materials accepted includes category)   // mandatory gate
    .filter(authorization === VERIFIED)               // mandatory gate
    .sort(by offered rate, descending)
```
The UI never shows a made-up "match %" — it lists the actual reasons
(accepts your material, authorization verified, pickup available, serves
your area) because those are the only signals actually implemented.

## 8. AI/ML status (honest accounting)

No trained model exists in this prototype — see §1. The one AI-labelled
feature (sub-type suggestion when a collector picks "Not sure") is a
fixed rule (most common sub-type for that category) with a fixed 62%
placeholder confidence, and is explicitly labelled as a prototype
rule-based classifier, never as a trained model, in both the collector UI
and the Admin → AI/ML status tab. The valuation-confidence label ("good
estimate" vs "limited data") is a simple lookup — categories with ≥3 demo
price points are "high confidence" — not a statistical model. Anomaly
detection flags a transaction when the final value differs from the
estimate/quote by more than 40%, always as "requires review," never as
"fraudulent."

## 9. Field research

**Field validation required.** This prototype has not yet been tested
with real collectors — no interviews are claimed or fabricated anywhere
in this build (see the Admin → Overview banner). Before a pilot, the
product needs at least two structured conversations with working scrap
collectors/aggregators, covering: current workflow and buyer, price-
discovery method today, device type and connectivity, language
preference, cash vs digital preference, and reactions to this prototype's
core flow (§4). A blank template for that conversation:

```
Participant code:            Role:
General location:            Current buyer(s):
Common materials handled:    Approx. transaction frequency:
Current price-discovery method:
Device / connectivity constraints:
Preferred language:          Cash / digital preference:
Pain points with current workflow:
Concerns about formal recyclers:
Feedback after seeing the prototype:
```

## 10. Unit economics

The Admin → Unit Economics tab is a small live calculator (not a static
number) comparing an informal route (volume × price − transport) against
a platform-supported route (volume × recycler price − pickup −
platform fee), with every input editable. It does not assume the formal
route is automatically better — the panel changes color and message
depending on which route wins at the given assumptions, and invites
tuning the platform fee/price to find the breakeven point.

## 11. Design notes

- **Palette:** warm paper (`#F5F3EA`), deep teal (`#1F4D3D`) for trust/
  primary actions, marigold (`#E7A21D`) for estimates/values, clay
  (`#C1502E`) reserved for offline/danger states — chosen to read as
  Indian and grounded in recycling rather than a generic SaaS palette.
- **Type:** Noto Sans + Noto Sans Devanagari throughout, so Hindi/Marathi
  and English/numerals share the same metrics and weight — a deliberate
  choice given the vernacular-first brief, not a default pairing.
- **One decision per wizard step**, numbers shown large, icon+label on
  every primary action, 44px+ touch targets, no information conveyed by
  colour alone (every status also carries a text label).
- The monospace treatment is reserved for the one place it's earned: the
  handover reference / Collector ID, which are literally codes.

## 12. Project structure

```
kabadisetu/
├── .github/workflows/deploy.yml   # builds + deploys to GitHub Pages on push
├── public/icons/                  # app icons (192/512/apple-touch/favicon)
├── src/
│   ├── App.jsx                    # the entire application (all 3 roles)
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Tailwind directives + small globals
├── index.html                     # Vite entry HTML
├── vite.config.js                 # includes vite-plugin-pwa config
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── LICENSE                        # MIT
```

Everything — Collector app, Recycler app, and Admin console — lives in
the single `src/App.jsx` component, matching the original design (see
§5): one shared in-memory store, three views.

## 13. Known limitations

- Data resets on reload — there is no persistence layer (see §1 for the production target).
- The three roles are switched with a visible demo control bar instead of real per-user authentication; the Admin password is a single hardcoded client-side string, not real access control.
- Seed data covers 5 demo recyclers, 3 material categories with price history, and a handful of seed lots — enough to exercise every flow, not a realistic transaction volume.
- GPS/location is simulated as a locality picker rather than device geolocation.

## 14. Future improvements (P2, per the original brief's priority order)

- Real ML training pipeline once pilot photo/transaction data exists.
- Native local DB + real backend + real authentication for all three roles + push notifications.
- Connected-scale integration for exact weights.
- Richer recycler integrations and EPR/producer-ecosystem contracts.
- Advanced predictive analytics on top of real transaction volume.
