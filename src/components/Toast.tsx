import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EASE_OUT, REDUCE } from '../lib/motion';

export interface ToastMessage { text: string; onUndo?: () => void; seq: number }

/** Owns the toast state. `show` can be passed into actions; `node` goes in the tree. */
export function useToast() {
  const [msg, setMsg] = useState<ToastMessage | null>(null);
  const seq = useRef(0);
  const show = useCallback((text: string, onUndo?: () => void) => setMsg({ text, onUndo, seq: ++seq.current }), []);
  const hide = useCallback(() => setMsg(null), []);
  return { msg, show, hide };
}

/** White pill above the dock with an optional Undo. */
export function Toast({ msg, onHide }: { msg: ToastMessage | null; onHide: () => void }) {
  const last = useRef<ToastMessage | null>(null);   // keeps the text during the hide transition
  const wasShown = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const textRef = useRef<HTMLSpanElement>(null);
  if (msg) last.current = msg;
  const shown = msg !== null;

  const arm = useCallback((ms: number) => {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(onHide, ms);
  }, [onHide]);

  useLayoutEffect(() => {
    if (!msg) { wasShown.current = false; clearTimeout(timer.current); return; }
    // a new message replacing an old one: soft blur-crossfade instead of a hard swap
    if (wasShown.current && !REDUCE.matches) {
      textRef.current?.animate([{ opacity: 0, filter: 'blur(3px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 200, easing: EASE_OUT });
    }
    wasShown.current = true;
    arm(5000);
  }, [msg, arm]);

  // don't let the toast vanish while the tab is hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) clearTimeout(timer.current);
      else if (msg) arm(2500);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [msg, arm]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const view = last.current;
  return (
    <div id="toast" role="status" aria-live="polite" className={shown ? 'show' : ''}
      // don't let it vanish while you're reaching for Undo
      onPointerEnter={() => clearTimeout(timer.current)}
      onPointerLeave={() => { if (msg?.onUndo) arm(2500); }}>
      <span id="toastMsg" ref={textRef}>{view?.text}</span>
      <button id="toastUndo" type="button" hidden={!view?.onUndo}
        onClick={() => { const fn = msg?.onUndo; onHide(); fn?.(); }}>Undo</button>
    </div>
  );
}
