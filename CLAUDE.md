# Shopping list app (PWA)

A shopping list built with React + TypeScript + Vite and installable as a PWA. The user types products, the app sorts them into shop-aisle groups, the user ticks them off in the shop, and frequently bought products come back as quick-add suggestions.

The original single-file version (vanilla JS) is kept in `legacy/index.html` for reference. It still opens by double-click, and its saved list lives in the `file://` origin's localStorage, which the new app (served from `localhost`) can't see.

## Constraints (from the user)

- **No backend, accounts or network calls:** no CDN scripts, fonts or analytics. The service worker only caches the app's own files.
- **Source is public on GitHub:** the repo is https://github.com/Sparrow-90/aisle-shopping-list (public, branch `main`).
- **Hosting target is Vercel.** The user plans to connect the repo at vercel.com themselves. `vercel.json` sets the Vite build and output, no-cache headers for `sw.js` and `manifest.webmanifest` (so installed PWAs pick up updates), and immutable caching for `/assets/*`. Don't deploy anywhere else (no artifacts or gists). `base: './'` keeps the build path-independent.
- **README screenshots** are in `docs/screenshots/` (390×844 at 2× for phone, 1100px wide for desktop), made from demo data with a Playwright script. Retake them when the look changes.
- **Data lives only in `localStorage`** under the key `dp-aisle-sorted-shopping-list.v1`. Don't rename it: that would orphan the user's saved list. If the data shape changes, migrate inside `loadState()`.
- **No longer opens from `file://`:** service workers need http(s), so the app must be served (dev server, preview, or hosting).

## Run, build, test

Node 26 is at `C:\Program Files\nodejs` and may not be on PATH in tool shells; prefix commands with `$env:Path = "C:\Program Files\nodejs;$env:Path";`.

- `npm run dev`: dev server with hot reload. The service worker is **not** active in dev.
- `npm run build`: `tsc --noEmit`, then `vite build` into `dist/`. vite-plugin-pwa generates `sw.js` and the manifest.
- `npm run preview`: serves `dist/` at `http://localhost:4173`. Use this to test PWA behaviour. Chrome/Edge show an "Install" icon in the address bar.
- Installing on a phone needs an HTTPS URL, so it waits until the user decides to host it.

### Tests

Playwright is installed globally with npm, not in this folder. Build, start `npm run preview` in the background, then run:

```powershell
$env:NODE_PATH = (& "C:\Program Files\nodejs\npm.cmd" root -g); node path\to\test.js
```

Write test scripts to the session scratchpad, not this folder. The last suite (47 checks) covered parsing, sorting, tick hold, undo, learned groups, suggestions, menu actions, persistence, confetti, manifest, service worker and offline reload.

Gotchas when writing tests:
- **Selectors:** select rows with `.item:has(.name:text-is("Bread"))`, not `:has-text("Bread")`. Each row's hidden group `<select>` contains every group name, e.g. "Bread & bakery", so a text match hits the wrong row.
- **Exit animations:** delete, remove-ticked, clear-all and forget-suggestion animate before the state changes. Wait ~350–600 ms before checking the result.
- **Tick hold:** a ticked item moves to the bottom of its group only after ~650 ms.
- **Group picker:** target `.catpick select`.
- **Bare quantities:** a numeric-only quantity renders as `× 2` in `.qty`. Units render as typed (`2 kg`).
- **Offline check:** reload once after `navigator.serviceWorker.ready` so the SW controls the page, then `context.setOffline(true)` and reload.
- **Fresh state:** `browser.newPage()` makes a new context with empty localStorage. Use `context.newPage()` to share the list.
- **Screenshots:** take them at 390×844 (phone) and ~1000px wide (desktop frame + dock).

## Structure

```
index.html              Vite entry: meta tags, manifest/icon links, #root
vite.config.ts          React plugin + VitePWA (manifest, workbox precache, autoUpdate)
public/                 icon.svg + generated PNGs (192, 512, maskable 512, apple-touch 180)
src/main.tsx            mounts <App/> in StrictMode, registers the service worker
src/App.tsx             builds the aisle groups (sorting, stagger delays) and lays out the page
src/types.ts            AppState, Item, CatId, Category
src/lib/text.ts         norm/keyOf, parseEntry, splitEntries, formatQty
src/lib/categories.ts   CATS, TINT, FORM_WORDS, guessCategory(name, learned)
src/lib/storage.ts      STORE_KEY, loadState/saveState
src/lib/motion.ts       measure/flip (FLIP), animateOut, confetti, replayClass, REDUCE
src/state/useShoppingList.ts   state, all actions, one-render flags
src/components/         Header (+ menu), Hero, ProgressCard, GroupCard (+ ItemRow), Dock, Toast, Icons
src/styles.css          the original CSS, ported nearly verbatim
```

### Icons

The icon shows a black shell with three stacked pill cards in paper white, yellow and periwinkle. The top two cards have black ticked checkboxes and the bottom one is still open, echoing the app's aisle cards.

- **`public/icon.svg`** is the master (512 viewBox, `rx` 112). It's used for the 192/512 manifest icons and the README.
- **`public/favicon.svg`** is a simplified version for browser tabs: bigger cards with no text bars. At 16px the full icon turns to mush. `favicon-32.png` is its PNG fallback.
- **`apple-touch-icon.png`** (180) is full-bleed `#161616` and unscaled. iOS rounds the corners itself and would show transparency as black.
- **`icon-maskable-512.png`** is full-bleed, with the art scaled to 0.82 so it stays inside Android's 80% safe circle.

The PNGs are rendered from the SVGs with a Playwright script: screenshot each SVG at each size. Regenerate them whenever the SVGs change, and check a preview of the iOS mask, the Android circle and the favicon at 16px.

## Data model

```ts
state = {
  v: 1,
  items:   [{ id, name, qty, cat, done, added }],   // the current list
  history: { [normKey]: { label, count, last } },  // feeds suggestions; count++ on each add
  learned: { [normKey]: catId }                    // user's manual group choices, override guessing
}
```

`normKey` = `keyOf(name)`: lowercase, diacritics stripped (`ł`→`l` done by hand), non-alphanumerics collapsed to spaces.

## How sorting works

- **Groups:** `CATS` lists them in shop-walk order: produce, bakery, dairy, meat, frozen, pantry, snacks, drinks, household, care, other. Each has English + Polish keywords, written without diacritics.
- **Keyword syntax:** a plain keyword matches the start of a word; `=word` must match the whole word; a keyword with spaces is a phrase match.
- **`guessCategory()`:**
  1. A user override in `learned` wins.
  2. Otherwise the highest-scoring keyword wins; score = keyword length.
  3. Keywords in `FORM_WORDS` (juice, jam, soup, sauce, yogurt, chips, cake, bread, oil, …) get +100, so "orange juice" → drinks, not produce.
- **`parseEntry()`:** splits a quantity off the start or end of the name (`2 milk`, `butter 250g`, `3x eggs`, `1,5 l cola`).
- **Comma splitting:** input splits on commas, except a comma followed by a digit, so the decimal comma in `1,5` survives.

## State and rendering (React)

- **Updates:** `update(fn)` in `useShoppingList` clones the state (`structuredClone`), applies `fn`, and commits. `commit()` measures FLIP positions first, then sets state and saves. `stateRef` mirrors the latest state, so actions read it synchronously and never run inside a React updater. That keeps StrictMode's double-invoked updaters from creating duplicate items.
- **One-render flags:** `flags` (`first`, `enterIds`, `justToggled`, `settling`, `knownGroups`) are refs that are read during render and cleared in the hook's layout effect after commit. They decide which CSS classes (`enter`, `just-ticked`, `just-complete`) a render gets. A class only animates when React adds it to a node.
- **Typed text lives in `Dock`,** so typing re-renders only the dock and never the list. A list re-render would change `className`s and cut running animations short.
- **Untrusted text:** product names are rendered as React text, never with `dangerouslySetInnerHTML`.

## Visual design

The look follows a reference UI the user supplied: stacked pastel cards inside a black, rounded "device" shell on a periwinkle page.

- **Colours:** set as CSS variables in `:root`: `--page` periwinkle, `--shell` black, `--paper`/`--white` cards, `--yellow` progress card. Accents are black, not a brand colour. The manifest's theme and background colours are `#161616`, matching the shell.
- **Font:** a Helvetica/Arial stack. No web fonts are allowed.
- **Type:** big light-weight headlines with `<b>` highlights (`#headline`) and a huge light `%` number (`#pct`). `ProgressCard` writes the count-up straight to the DOM, so counting doesn't re-render React.
- **Top to bottom:**
  1. A black top area with the title, `#progress` ("x of y left") and the ⋯ menu as a white circle button.
  2. The hero card: date, headline and pills.
  3. The yellow progress card: mood line, %, and a bar in `#barFill`.
  4. One white card per aisle: a pastel icon circle from `TINT`, the title, and a count circle that turns black ✓ when the aisle is complete.
  5. The "Remove ticked" white pill.
- **Product rows:** round checkbox (black when done), name with the quantity as a grey subtitle, then outline circle buttons for group and delete.
- **Bottom dock:** `.dock` is fixed and holds suggestion chips and the add input. A ResizeObserver publishes its height as `--dock-h`, so the list padding and the toast keep clear of it.
- **Phones (≤520px):** the shell fills the screen, the page background turns black, and `.top` pads for `env(safe-area-inset-top)` when installed.

## Motion

- **FLIP:** `measure()` runs before a state change, and `flip()` runs in the layout effect after it. Elements are keyed by `data-flip` (`g-<cat>`, `i-<id>`). An item's glide subtracts its parent group's glide.
- **Hold after ticking:** `toggle()` keeps a ticked item in place for ~650 ms (`flags.settling`), then a forced re-render slides it to the bottom of its group.
- **Exits:** `animateOut()` animates DOM nodes first (WAAPI, `fill: forwards`); the state change is committed afterwards. `isBusy()` blocks double actions during an exit.
- **Restarting one-shot animations:** the count bump, `#progress` bump and headline swap use `replayClass()` in layout effects, only on elements whose `className` prop never changes (React would wipe the class otherwise). The item flash after re-adding or regrouping is a WAAPI animation for the same reason.
- **"Remove ticked" cleanup:** the layout effect cancels leftover exit animations on it, but not CSS animations, so its entrance still plays.
- **Confetti:** `confetti()` fires only when every item becomes ticked.
- **Rules followed:** animate only transform and opacity, under ~300 ms, using `--ease-out` and `--ease-in-out`. Hover styles sit inside `@media (hover: hover) and (pointer: fine)`. With `prefers-reduced-motion`, the app uses fades only, with no movement and no confetti.

## Known issues

- `npm audit` reports 4 moderate issues in `glob`/`minimatch` via `workbox-build`. They're build-time only and nothing ships to the browser. The suggested fix downgrades vite-plugin-pwa, so it was left alone.
