# Aisle — a shopping list that sorts itself

Type what you need, and the list arranges it in the order you walk through a shop: fruit & veg first, then bakery, dairy, meat, frozen, pantry, snacks, drinks and household. Tick things off as they go into the basket. Products you buy often come back as one-tap suggestions next time.

It's an installable PWA built with React and TypeScript. It works offline and keeps everything on your device: no account, no backend, no tracking.

<p align="center">
  <img src="docs/screenshots/overview.png" width="260" alt="Overview: progress card at 40% and the first aisle">
  &nbsp;
  <img src="docs/screenshots/aisles.png" width="260" alt="Products grouped into aisles, ticked ones struck through">
  &nbsp;
  <img src="docs/screenshots/empty.png" width="260" alt="Empty list">
</p>

<p align="center">
  <img src="docs/screenshots/desktop.png" width="720" alt="Desktop view: the app in a phone-like frame">
</p>

## Features

- **Automatic aisle sorting.** 500+ English and Polish keywords. "Orange juice" goes to drinks, not fruit, and "chicken soup" goes to the pantry, not meat.
- **Quick typing.** Add several products at once with commas: `2 milk, bread, butter 250g, 1,5 l cola, 3x eggs`. Quantities are split off automatically, and decimal commas work.
- **It learns.** Move a product to another aisle once and it remembers that next time.
- **Suggestions.** Frequently bought products appear as chips. Typing filters them.
- **Undo everywhere.** Removing, clearing ticked items or clearing the whole list can be undone from a toast.
- **Careful motion.** Ticked items wait a moment, then glide to the bottom of their aisle, and the progress number counts up. Confetti plays when everything is in the basket. With *reduce motion* on, all of this becomes simple fades.
- **Offline and installable.** A service worker caches the app, so you can add it to your home screen or desktop.
- **Private.** Your list lives in your browser's `localStorage` and nothing leaves your device.

## Tech

React 19 · TypeScript · Vite · vite-plugin-pwa (Workbox) · plain CSS (no UI library, no web fonts)

```
src/
  lib/          parsing, aisle keywords + guessing, storage, motion helpers (FLIP, confetti)
  state/        useShoppingList: app state and actions
  components/   Header, Hero, ProgressCard, GroupCard, Dock, Toast
legacy/         the first version: a single dependency-free index.html
```

## Run it locally

You need Node.js 20 or newer.

```bash
npm install
npm run dev       # development server
npm run build     # type-check + production build into dist/
npm run preview   # serve the build at http://localhost:4173 (service worker on)
```

To install it as an app, open the preview in Chrome or Edge and use the install icon in the address bar. Installing on a phone requires the `dist/` folder to be served over HTTPS. Any static host works, because the build uses relative paths.
