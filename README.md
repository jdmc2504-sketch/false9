# False9 — The Football Imposter Game ⚽🕵️

A mobile-first, pass-the-phone party game for football fans. One secret player
(the **False9**) only gets a vague hint while everyone else gets the same
player, club, or manager. Discuss, vote, and try to catch the imposter.

Built with Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion.
No backend, no database — everything runs from bundled JSON data and the
browser's local storage. Installable as a PWA on iPhone/iPad.

---

## 1. What's included

- **Full pass-the-phone game loop**: Home → Create Game → Mode → Filters →
  Difficulty → Players → Reveal (per player) → Discussion → Voting (per
  player) → Results.
- **9 game modes**: Player, Club, Manager, Mixed, Chaos, Double False9, Hard,
  Impossible, Tournament (replay loop via "Play Again").
- **Starter dataset**: 110 players, 67 clubs/national teams, 43 managers —
  spanning the Premier League, La Liga, Bundesliga, Serie A, Ligue 1,
  Champions League clubs, World Cup nations, and legends from past eras. This
  is a strong, fully-playable starting point. The spec's ambitious target
  (300/100/50) is best reached incrementally with new data packs (see below)
  rather than hand-written in one pass — the pack system makes that a
  copy-paste exercise, not a refactor.
- **Data pack system** (`/src/data-packs`): drop in a new folder with
  `manifest.json` + `players.json` + `clubs.json` + `managers.json` and
  register it in `src/lib/data-pack-loader.ts`. Two example bonus packs
  (`legends-pack`, `world-cup-pack`) are included to show the pattern.
- **Admin panel** (`/admin`, password protected): add/edit/delete/search
  custom entities and import/export JSON. Custom entries are merged into
  every game automatically (see "How admin data works" below).
- **Dark/light theme**, glassmorphism cards, animated reveals, persisted
  locally.
- **PWA**: manifest, hand-written service worker, home-screen install on iOS.

---

## 2. Project structure

```
src/
  app/                 Next.js routes (/, /create, /play, /admin)
  components/          UI primitives + game-specific components
  data-packs/          Content packs (players/clubs/managers JSON)
  game-logic/engine.ts Pure game logic (role assignment, voting, hints)
  lib/                 Storage helpers, data-pack loader, utils
  types/               Shared TypeScript types
scripts/               One-off generator scripts used to build the
                        starter dataset (gen-players.js, gen-clubs.js,
                        gen-managers.js) — keep these around as a template
                        for generating future packs in bulk.
public/
  manifest.json, sw.js, icons/   PWA assets
```

---

## 3. Running locally (assumes zero experience)

1. Install [Node.js](https://nodejs.org) (LTS version, 18+).
2. Open a terminal in this project folder.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the dev server:
   ```
   npm run dev
   ```
5. Open **http://localhost:3000** in your browser.

---

## 4. Testing on your iPhone/iPad over local WiFi

1. Make sure your computer and your phone are on the **same WiFi network**.
2. Find your computer's local IP address:
   - **Mac**: System Settings → Wi-Fi → Details → IP Address (usually starts
     with `192.168.` or `10.`).
   - **Windows**: open Command Prompt, run `ipconfig`, look for "IPv4
     Address".
3. Start the dev server so it's reachable on the network:
   ```
   npm run dev -- -H 0.0.0.0
   ```
4. On your iPhone/iPad, open Safari and go to:
   ```
   http://YOUR_COMPUTER_IP:3000
   ```
   e.g. `http://192.168.1.42:3000`
5. You should see the False9 home screen.

---

## 5. Installing as a PWA on iOS

1. Open the deployed (or local-network) URL in **Safari** on your iPhone/iPad.
2. Tap the **Share** icon (square with an arrow).
3. Tap **"Add to Home Screen"**.
4. Tap **Add**.
5. Launch False9 from your home screen — it opens full-screen, no browser
   chrome, like a native app.

> Note: PWA install only works reliably over **HTTPS** (or `localhost`). For
> a real install test, deploy to Vercel first (see below) and install from
> the live URL.

---

## 6. Deploying to Vercel

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), sign in, and click **"Add New →
   Project"**.
3. Import your GitHub repo. Vercel auto-detects Next.js — no config needed.
4. Click **Deploy**.
5. Once deployed, open the live URL on your iPhone and install it as a PWA
   (step 5 above).

Every time you push to your main branch, Vercel redeploys automatically.

---

## 7. Editing JSON data safely

Each pack's content lives in three files:
`src/data-packs/<pack-name>/{players,clubs,managers}.json`

Each entry looks like:

```json
{
  "id": "player-1",
  "name": "Harry Kane",
  "type": "player",
  "hintEasy": "England's record goalscorer",
  "hintMedium": "Moved to Bavaria in 2023",
  "hintHard": "Tottenham legend turned Bayern striker",
  "categories": ["Premier League", "Bundesliga", "Current Players", "England"]
}
```

Tips:
- `id` must be unique across the whole pack.
- `categories` controls which filters this entry shows up under — match the
  labels in `src/lib/mode-meta.ts` (`FILTER_GROUPS`) or add your own and the
  UI will pick them up automatically.
- Keep hints short (under ~8 words) so they fit nicely on a phone screen.
- After editing, save the file and refresh — no rebuild needed in dev mode.

### Adding a whole new pack (e.g. "Add a Bundesliga pack")

1. Create `src/data-packs/bundesliga-pack/` with `manifest.json`,
   `players.json`, `clubs.json`, `managers.json` (empty arrays `[]` are fine
   for files you don't need).
2. Open `src/lib/data-pack-loader.ts`, import the four new files the same
   way the existing packs are imported, and add the pack object to
   `ALL_PACKS`.
3. That's it — the new content is now in every filter, search, and game
   mode automatically.

### How admin data works

Since this is a static, backend-free app, the `/admin` panel can't write to
the JSON files on disk (the browser has no access to your file system).
Instead, admin edits are stored in the browser's `localStorage` as a
"custom pack" and merged into every game at generation time. Use the
**Export JSON** button in `/admin` to download your custom entries, then
paste them into a real data-pack file (per the steps above) to ship them to
everyone, not just your device.

Default admin password: `false9admin` — change it in
`src/app/admin/page.tsx` (`ADMIN_PASSWORD`) before sharing the link.

---

## 8. Troubleshooting

- **"command not found: npm"** → Node.js isn't installed. Install it from
  nodejs.org and restart your terminal.
- **Phone can't reach `http://YOUR_IP:3000`** → Check both devices are on
  the same WiFi network, and that your computer's firewall isn't blocking
  incoming connections on port 3000.
- **PWA "Add to Home Screen" doesn't show "standalone" launch** → Make sure
  you're using Safari (not Chrome) on iOS, and that you're loading the app
  over HTTPS (a Vercel deployment) rather than local HTTP.
- **Admin changes disappeared** → Custom entities are stored per-browser in
  `localStorage`. Clearing site data, using a different browser, or a
  different device will not show the same custom entries. Export/import
  JSON to move data between devices.

---

## 9. Roadmap notes (for future AI-assisted work)

This codebase is intentionally modular so future prompts can extend it
without refactoring:

- **More content**: add data packs (see §7) — no core code changes needed.
- **Multiplayer / QR rooms / live play**: `src/game-logic/engine.ts` is pure
  and framework-free, so it can be reused as-is inside an API route or
  WebSocket server. Swap `src/lib/game-session.ts`'s sessionStorage calls
  for a fetch to a backend room API.
- **Accounts / leaderboards**: would slot in alongside the existing local
  flow; nothing here assumes a single-device session beyond
  `game-session.ts`.
- **Tournament Mode scoring**: currently loops back to `/create`; a future
  iteration can track cumulative scores across rounds in
  `sessionStorage`/a new `tournament-session.ts` module following the same
  pattern as `game-session.ts`.
