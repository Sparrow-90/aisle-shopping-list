import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import type { AppState } from '../types';
import { catOf, guessCategory } from '../lib/categories';
import { keyOf, parseEntry } from '../lib/text';
import type { ShoppingActions } from '../state/useShoppingList';
import { PlusIcon } from './Icons';

interface Props { state: AppState; inList: Set<string>; actions: ShoppingActions }

/**
 * Fixed bottom bar: suggestion chips + the add input. It owns the typed text, so typing
 * re-renders only the dock and never the list (which would cut list animations short).
 */
export function Dock({ state, inList, actions }: Props) {
  const [entry, setEntry] = useState('');
  const [editingRaw, setEditing] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasHistory = Object.keys(state.history).length > 0;
  const editing = editingRaw && hasHistory;

  useEffect(() => { if (!hasHistory) setEditing(false); }, [hasHistory]);

  // Publish the dock height so the list padding and the toast keep clear of it
  useLayoutEffect(() => {
    const dock = dockRef.current!;
    const sync = () => document.documentElement.style.setProperty('--dock-h', dock.offsetHeight + 'px');
    const ro = new ResizeObserver(sync);
    ro.observe(dock);
    sync();
    return () => ro.disconnect();
  }, []);

  // Suggestions: what's typed after the last comma filters them
  const typed = entry.split(/[;,\n]/).pop() ?? '';
  const q = keyOf(parseEntry(typed).name || '');
  let list = Object.entries(state.history).filter(([k]) => !inList.has(k));
  let title: string;
  if (q && !editing) {
    list = list.filter(([k]) => k.includes(q))
      .sort(([ka, a], [kb, b]) => (Number(kb.startsWith(q)) - Number(ka.startsWith(q))) || (b.count - a.count) || (b.last - a.last));
    title = 'Matching';
  } else {
    list.sort(([, a], [, b]) => (b.count - a.count) || (b.last - a.last));
    title = editing ? 'Tap to forget' : 'Often bought';
  }
  if (!editing) list = list.slice(0, 16);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!entry.trim()) return;
    actions.addText(entry);
    setEntry('');
    inputRef.current?.focus();
  };

  const pick = (label: string) => {
    actions.addSuggestion(label);
    // clear just the partially typed product
    const cut = Math.max(entry.lastIndexOf(','), entry.lastIndexOf(';'));
    const rest = cut >= 0 ? entry.slice(0, cut + 1) + ' ' : '';
    setEntry(rest.trim().replace(/[,;]$/, '') ? rest : '');
  };

  return (
    <div className="dock" id="dock" ref={dockRef}>
      <div id="suggBox" className={editing ? 'editing' : ''} hidden={!list.length && !editing}>
        <div className="sugg-head">
          <span id="suggTitle">{title}</span>
          <button className="linkbtn" id="suggEdit" type="button" onClick={() => setEditing(!editing)}>
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
        <div id="chips">
          {list.map(([k, h]) => (
            <button key={k} className="chip" type="button" title={`Bought ${h.count}×`}
              onClick={e => editing ? actions.forgetSuggestion(k, e.currentTarget) : pick(h.label)}>
              <span aria-hidden="true">{catOf(state.learned[k] ?? guessCategory(h.label, state.learned)).icon}</span>
              <span>{h.label}</span>
              <span className="x" aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      </div>
      <form className="addrow" id="addForm" autoComplete="off" onSubmit={submit}>
        <input id="entry" ref={inputRef} type="text" placeholder="Add products, e.g. 2 milk, bread"
          aria-label="Add products" enterKeyHint="done" value={entry} onChange={e => setEntry(e.target.value)} />
        <button id="addBtn" type="submit" className={entry.trim() ? '' : 'idle'} aria-label="Add" title="Add">
          <PlusIcon />
        </button>
      </form>
    </div>
  );
}
