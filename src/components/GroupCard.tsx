import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import type { Category, Item } from '../types';
import { CATS, TINT, catOf } from '../lib/categories';
import { formatQty } from '../lib/text';
import { replayClass } from '../lib/motion';
import type { ShoppingActions } from '../state/useShoppingList';
import { CheckIcon, CrossIcon } from './Icons';

export interface Row { item: Item; enterDelay: number | null }

interface GroupProps {
  cat: Category;
  rows: Row[];
  open: number;          // unticked items left
  enter: boolean;        // group just appeared
  enterDelay: number;
  justToggled: string | null;
  actions: ShoppingActions;
}

/** One white card per aisle. */
export function GroupCard({ cat, rows, open, enter, enterDelay, justToggled, actions }: GroupProps) {
  const prevOpen = useRef<number | undefined>(undefined);
  const nRef = useRef<HTMLSpanElement>(null);
  const was = prevOpen.current;
  const justComplete = !open && !!was;

  useLayoutEffect(() => {
    if (was !== undefined && was !== open && open) replayClass(nRef.current, 'bump');
    prevOpen.current = open;
  });

  const cls = 'group' + (open ? '' : ' complete') + (justComplete ? ' just-complete' : '') + (enter ? ' enter' : '');
  return (
    <section className={cls} data-cat={cat.id} data-flip={'g-' + cat.id}
      style={enter ? { '--d': enterDelay + 'ms' } as CSSProperties : undefined}>
      <h2>
        <span className="gicon" aria-hidden="true" style={{ '--tint': TINT[cat.id] } as CSSProperties}>{cat.icon}</span>
        <span className="gname">{cat.name}</span>
        <span className="n" ref={nRef}>{open ? String(open) : '✓'}</span>
      </h2>
      <ul>
        {rows.map(r => (
          <ItemRow key={r.item.id} item={r.item} enterDelay={r.enterDelay}
            anim={justToggled === r.item.id ? (r.item.done ? ' just-ticked' : ' just-unticked') : ''}
            actions={actions} />
        ))}
      </ul>
    </section>
  );
}

interface ItemProps { item: Item; enterDelay: number | null; anim: string; actions: ShoppingActions }

/** Round checkbox, name + quantity, then group picker and delete. */
function ItemRow({ item: it, enterDelay, anim, actions }: ItemProps) {
  const liRef = useRef<HTMLLIElement>(null);
  const boxRef = useRef<HTMLSpanElement>(null);
  const enter = enterDelay !== null;
  return (
    <li ref={liRef} className={'item' + (it.done ? ' done' : '') + anim + (enter ? ' enter' : '')}
      data-id={it.id} data-flip={'i-' + it.id}
      style={enter ? { '--d': enterDelay + 'ms' } as CSSProperties : undefined}>
      <button className="tick" type="button" aria-pressed={it.done} onClick={() => actions.toggle(it.id, boxRef.current)}>
        <span className="box" aria-hidden="true" ref={boxRef}><CheckIcon /></span>
        <span className="txt">
          <span className="name">{it.name}</span>
          {it.qty && <span className="qty">{formatQty(it.qty)}</span>}
        </span>
      </button>
      <span className="catpick">
        <span aria-hidden="true">{catOf(it.cat).icon}</span>
        <select aria-label={`Group for ${it.name}`} title="Move to another group" value={catOf(it.cat).id}
          onChange={e => actions.setCategory(it.id, e.target.value as Category['id'])}>
          {CATS.map(c => <option key={c.id} value={c.id}>{`${c.icon}  ${c.name}`}</option>)}
        </select>
      </span>
      <button className="del" type="button" aria-label={`Remove ${it.name}`} title="Remove"
        onClick={() => actions.removeItem(it.id, liRef.current)}>
        <CrossIcon />
      </button>
    </li>
  );
}
