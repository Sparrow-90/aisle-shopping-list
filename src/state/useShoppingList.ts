import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { AppState, CatId } from '../types';
import { catOf, guessCategory } from '../lib/categories';
import { keyOf, parseEntry, splitEntries, uid } from '../lib/text';
import { emptyState, loadState, saveState, STORE_KEY } from '../lib/storage';
import { animateOut, confetti, flip, isBusy, measure, REDUCE, type FlipSnapshot } from '../lib/motion';

export type ShowToast = (text: string, onUndo?: () => void) => void;

/**
 * One-render flags: set by an action, read during the next render, cleared in the
 * layout effect right after it commits. They drive the CSS entrance/tick animations.
 */
export interface RenderFlags {
  first: boolean;                 // very first paint: gentle staggered entrance
  enterIds: Set<string>;          // items that should animate in
  justToggled: string | null;     // item whose tick animation should play
  settling: Map<string, boolean>; // id -> done-state used for sorting while the tick plays
  knownGroups: Set<CatId>;        // groups on screen in the previous render
}

export function useShoppingList(showToast: ShowToast) {
  const [initial] = useState(() => loadState());
  const [state, setState] = useState<AppState>(() => initial ?? emptyState());
  const [storageOk, setStorageOk] = useState(initial !== null);
  const stateRef = useRef(state);
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  const flags = useRef<RenderFlags>({
    first: true, enterIds: new Set(), justToggled: null, settling: new Map(), knownGroups: new Set()
  }).current;
  const pending = useRef<{ flip: FlipSnapshot | null; flashId: string | null }>({ flip: null, flashId: null }).current;
  const settleTimer = useRef<number | undefined>(undefined);

  // Measure positions *before* React touches the DOM, so the layout effect can FLIP.
  const capture = () => { if (!pending.flip) pending.flip = measure(); };

  const commit = useCallback((next: AppState) => {
    capture();
    stateRef.current = next;
    setState(next);
    setStorageOk(saveState(next));
  }, []);

  /** Apply a mutation to a copy of the current state and commit it. */
  const update = useCallback((fn: (draft: AppState) => void) => {
    const draft = structuredClone(stateRef.current);
    fn(draft);
    commit(draft);
  }, [commit]);

  useLayoutEffect(() => {
    if (pending.flip) { flip(pending.flip); pending.flip = null; }
    if (pending.flashId) {
      const n = document.querySelector(`[data-id="${pending.flashId}"]`);
      if (n) {
        n.animate([{ backgroundColor: '#e3e9fb' }, { backgroundColor: '#ffffff' }], { duration: 900, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
        n.scrollIntoView({ block: 'nearest', behavior: REDUCE.matches ? 'auto' : 'smooth' });
      }
      pending.flashId = null;
    }
    // "Remove ticked" survives renders, so drop any leftover exit animation on it
    const cd = document.getElementById('clearDone');
    if (cd) {
      cd.getAnimations().forEach(a => { if (!(a instanceof CSSAnimation)) a.cancel(); }); // keep its CSS entrance
      cd.style.pointerEvents = '';
    }

    flags.first = false;
    flags.enterIds.clear();
    flags.justToggled = null;
    flags.knownGroups = new Set(stateRef.current.items.map(i => catOf(i.cat).id));
  });

  // First save tells us whether storage works at all.
  useEffect(() => { setStorageOk(saveState(stateRef.current)); }, []);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORE_KEY) return;
      const s = loadState();
      if (s) { capture(); stateRef.current = s; setState(s); }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ---------- actions ----------
  const addOne = (d: AppState, { name, qty }: { name: string; qty: string }) => {
    const key = keyOf(name);
    if (!name || !key) return;
    const existing = d.items.find(i => keyOf(i.name) === key);
    if (existing) {
      existing.done = false;
      if (qty) existing.qty = qty;
      pending.flashId = existing.id;
      return;
    }
    const item = { id: uid(), name, qty, cat: guessCategory(name, d.learned), done: false, added: Date.now() };
    d.items.push(item);
    flags.enterIds.add(item.id);
    const h = d.history[key] ?? { label: name, count: 0, last: 0 };
    h.label = name; h.count += 1; h.last = Date.now();
    d.history[key] = h;
  };

  const restore = (snap: string) => {
    const had = new Set(stateRef.current.items.map(i => i.id));
    const s: AppState = JSON.parse(snap);
    s.items.forEach(i => { if (!had.has(i.id)) flags.enterIds.add(i.id); });
    commit(s);
  };
  const snapshot = () => JSON.stringify(stateRef.current);

  const actions = {
    addText(text: string) {
      update(d => { for (const p of splitEntries(text)) addOne(d, parseEntry(p)); });
    },

    addSuggestion(label: string) {
      update(d => addOne(d, { name: label, qty: '' }));
    },

    toggle(id: string, box: Element | null) {
      const cur = stateRef.current.items.find(i => i.id === id);
      if (!cur) return;
      if (!flags.settling.has(id)) flags.settling.set(id, cur.done);   // hold its place while the tick plays
      flags.justToggled = id;
      clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => { flags.settling.clear(); capture(); forceRender(); }, 650);
      update(d => { const it = d.items.find(i => i.id === id)!; it.done = !it.done; });
      if (!cur.done && stateRef.current.items.every(i => i.done)) confetti(box);
    },

    setCategory(id: string, cat: CatId) {
      update(d => {
        const it = d.items.find(i => i.id === id);
        if (!it) return;
        it.cat = cat;
        d.learned[keyOf(it.name)] = cat; // remember for next time
        pending.flashId = id;
      });
    },

    removeItem(id: string, row: Element | null) {
      if (isBusy() || !row) return;
      animateOut([row], { x: 28 }).then(() => {
        const it = stateRef.current.items.find(i => i.id === id);
        if (!it) return;
        const snap = snapshot();
        update(d => { d.items = d.items.filter(x => x.id !== id); });
        showToast(`Removed ${it.name}`, () => restore(snap));
      });
    },

    clearDone() {
      if (isBusy() || !stateRef.current.items.some(i => i.done)) return;
      const nodes = [...document.querySelectorAll('.item.done')];
      const cd = document.getElementById('clearDone');
      if (cd) nodes.push(cd);
      animateOut(nodes, { stagger: 30, x: 28 }).then(() => {
        const n = stateRef.current.items.filter(i => i.done).length;
        if (!n) { capture(); forceRender(); return; }
        const snap = snapshot();
        update(d => { d.items = d.items.filter(i => !i.done); });
        showToast(`Removed ${n} ticked item${n === 1 ? '' : 's'}`, () => restore(snap));
      });
    },

    untickAll() {
      const snap = snapshot();
      update(d => d.items.forEach(i => { i.done = false; }));
      showToast('Unticked everything', () => restore(snap));
    },

    clearAll() {
      if (isBusy() || !stateRef.current.items.length) return;
      animateOut([...document.querySelectorAll('.group, #clearDone')], { stagger: 25 }).then(() => {
        const snap = snapshot();
        update(d => { d.items = []; });
        showToast('List cleared', () => restore(snap));
      });
    },

    forgetAll() {
      if (!confirm('Forget all suggestions and learned groups? Your current list stays.')) return;
      update(d => { d.history = {}; d.learned = {}; });
    },

    forgetSuggestion(key: string, chip: Element) {
      if (isBusy()) return;
      animateOut([chip]).then(() => update(d => { delete d.history[key]; }));
    }
  };

  // Suggestions don't depend on the typed text here; the dock filters them.
  const inList = useMemo(() => new Set(state.items.map(i => keyOf(i.name))), [state.items]);

  return { state, storageOk, flags, inList, actions };
}

export type ShoppingActions = ReturnType<typeof useShoppingList>['actions'];
