import { useEffect, useLayoutEffect, useRef } from 'react';
import { replayClass } from '../lib/motion';
import { LayersIcon } from './Icons';

interface Props {
  total: number;
  left: number;
  onClearDone: () => void;
  onUntick: () => void;
  onClearAll: () => void;
  onForget: () => void;
}

/** Black top area: title, "x of y left" and the ⋯ menu. */
export function Header({ total, left, onClearDone, onUntick, onClearAll, onForget }: Props) {
  const text = total ? (left ? `${left} of ${total} left` : 'All done ✓') : 'Welcome back';
  const progRef = useRef<HTMLParagraphElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const prev = useRef<{ text: string; left: number } | null>(null);

  useLayoutEffect(() => {
    const p = prev.current;
    if (p && p.text !== text && p.left !== left) replayClass(progRef.current, 'bump');
    prev.current = { text, left };
  }, [text, left]);

  // Close the menu on any click outside it
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) menuRef.current.removeAttribute('open');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const pick = (fn: () => void) => () => { menuRef.current?.removeAttribute('open'); fn(); };

  return (
    <header className="top">
      <div className="hello">
        <h1>Shopping list <span className="wave" aria-hidden="true">👋</span></h1>
        <p id="progress" ref={progRef}>{text}</p>
      </div>
      <details className="menu" id="menu" ref={menuRef}>
        <summary className="circle light" aria-label="More options" title="More options"><LayersIcon /></summary>
        <div className="menu-pop">
          <button id="mClearDone" onClick={pick(onClearDone)}>Remove ticked items</button>
          <button id="mUntick" onClick={pick(onUntick)}>Untick everything</button>
          <button id="mClearAll" className="danger" onClick={pick(onClearAll)}>Clear whole list</button>
          <button id="mForget" className="danger" onClick={pick(onForget)}>Forget all suggestions</button>
        </div>
      </details>
    </header>
  );
}
