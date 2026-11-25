import { Fragment, useLayoutEffect, useRef } from 'react';
import type { Item } from '../types';
import { catOf } from '../lib/categories';
import { plural } from '../lib/text';
import { replayClass } from '../lib/motion';

type Part = string | [string];   // [text] = bold highlight

/** Date, big light headline with bold highlights, and the pills. */
export function Hero({ items, left, done }: { items: Item[]; left: number; done: number }) {
  const openAisles = new Set(items.filter(i => !i.done).map(i => i.cat)).size;
  const parts: Part[] = !items.length ? ['Hello! Your list is ', ['empty.'], ' What do we need?']
    : left ? ['You have ', [plural(left, 'product', 'products')], ' to buy in ', [plural(openAisles, 'aisle', 'aisles')], ' today.']
    : ['Everything is ', ['in the basket.'], ' Nice work!'];
  const sig = JSON.stringify(parts);

  const headRef = useRef<HTMLHeadingElement>(null);
  const prevSig = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (prevSig.current !== null && prevSig.current !== sig) replayClass(headRef.current, 'swap');
    prevSig.current = sig;
  }, [sig]);

  // Aisle with the most open products
  const sizes: Record<string, number> = {};
  items.filter(i => !i.done).forEach(i => { sizes[i.cat] = (sizes[i.cat] ?? 0) + 1; });
  const top = Object.entries(sizes).sort((a, b) => b[1] - a[1])[0];
  const topCat = top ? catOf(top[0]) : null;

  const today = 'Today, ' + new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <section className="card hero">
      <p className="label" id="today">{today}</p>
      <h2 className="headline" id="headline" ref={headRef}>
        {parts.map((p, i) => <Fragment key={i}>{Array.isArray(p) ? <b>{p[0]}</b> : p}</Fragment>)}
      </h2>
      <div className="pills" id="pills">
        {items.length > 0 && (
          <span className="pill">
            <span>🧺</span>
            <span>In basket: <b>{done}</b><span className="dim">/{items.length}</span></span>
          </span>
        )}
        {items.length > 0 && topCat && (
          <span className="pill"><span>{topCat.icon}</span><span>Most in <b>{topCat.name}</b></span></span>
        )}
      </div>
    </section>
  );
}
