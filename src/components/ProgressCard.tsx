import { useLayoutEffect, useRef } from 'react';
import { REDUCE } from '../lib/motion';
import { TrendIcon } from './Icons';

/** Yellow card: mood line, the big % (counts up/down) and the bar. */
export function ProgressCard({ total, done, first }: { total: number; done: number; first: boolean }) {
  const pct = total ? Math.round(done / total * 100) : 0;
  const mood = pct === 100 ? 'All done, well shopped 🎉' : pct >= 50 ? 'You are doing great 😇'
    : pct > 0 ? 'Good start, keep going 🙂' : 'Ready when you are 🛒';
  const hidden = !total;

  // The % is written straight to the DOM so counting doesn't re-render React.
  const pctRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  const raf = useRef(0);
  useLayoutEffect(() => {
    const node = pctRef.current!;
    cancelAnimationFrame(raf.current);
    if (first || hidden || REDUCE.matches || shown.current === pct) {
      shown.current = pct; node.textContent = String(pct); return;
    }
    const from = shown.current, t0 = performance.now(), dur = 420;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      shown.current = Math.round(from + (pct - from) * e);
      node.textContent = String(shown.current);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [pct, first, hidden]);
  useLayoutEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <section className="card progress-card" id="progressCard" hidden={hidden}>
      <div className="pc-top">
        <span className="circle light" aria-hidden="true"><TrendIcon /></span>
        <span className="label">Your progress</span>
      </div>
      <div className="pc-main">
        <p id="mood">{mood}</p>
        <p className="pct"><span id="pct" ref={pctRef} /><small>%</small></p>
      </div>
      <div className="bar" aria-hidden="true"><i id="barFill" style={{ transform: `scaleX(${pct / 100})` }} /></div>
    </section>
  );
}
