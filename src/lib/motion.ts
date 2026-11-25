export const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
export const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';

/** Positions of every [data-flip] element, keyed by its data-flip value. */
export type FlipSnapshot = Map<string, number>;

export function measure(): FlipSnapshot {
  const m: FlipSnapshot = new Map();
  document.querySelectorAll<HTMLElement>('[data-flip]').forEach(n => m.set(n.dataset.flip!, n.getBoundingClientRect().top));
  return m;
}

/** FLIP: glide elements from their old positions (prev) to where they are now. */
export function flip(prev: FlipSnapshot): void {
  if (REDUCE.matches || !prev.size) return;
  const glide = (node: HTMLElement, dy: number) => {
    if (Math.abs(dy) < 1) return;
    node.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 300, easing: EASE_IN_OUT });
  };
  const groupDy = new Map<Element, number>();
  document.querySelectorAll<HTMLElement>('.group[data-flip]').forEach(g => {
    const was = prev.get(g.dataset.flip!);
    if (was === undefined) return;
    const dy = was - g.getBoundingClientRect().top;
    groupDy.set(g, dy);
    glide(g, dy);
  });
  document.querySelectorAll<HTMLElement>('.item[data-flip]').forEach(n => {
    const was = prev.get(n.dataset.flip!);
    if (was === undefined) return;
    // subtract the parent's own glide so the item doesn't move twice
    const parent = n.closest('.group');
    glide(n, was - n.getBoundingClientRect().top - (parent ? groupDy.get(parent) ?? 0 : 0));
  });
}

let busy = false;
/** True while an exit animation runs; actions check it to avoid double removes. */
export const isBusy = () => busy;

/** Fade/slide nodes out. The caller changes state once the promise resolves. */
export function animateOut(nodes: Element[], { stagger = 0, x = 0 } = {}): Promise<void> {
  if (!nodes.length) return Promise.resolve();
  busy = true;
  return Promise.all(nodes.map((n, i) => {
    (n as HTMLElement).style.pointerEvents = 'none';
    return n.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: REDUCE.matches ? 'none' : `translateX(${x}px) scale(0.98)` }],
      { duration: 170, delay: Math.min(i * stagger, 240), easing: EASE_OUT, fill: 'forwards' }
    ).finished;
  })).then(() => {}, () => {}).finally(() => { busy = false; });
}

/** Restart a one-shot CSS animation class. */
export function replayClass(node: Element | null, cls: string): void {
  if (!node) return;
  node.classList.remove(cls);
  void (node as HTMLElement).offsetWidth;
  node.classList.add(cls);
}

export function confetti(origin: Element | null): void {
  if (REDUCE.matches || !origin) return;
  const r = origin.getBoundingClientRect();
  const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
  const colors = ['#161616', '#b8c6f3', '#f7df98', '#b5e2ea', '#f4a28c', '#ffffff'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('span');
    p.className = 'confetti';
    p.style.left = x0 + 'px';
    p.style.top = y0 + 'px';
    p.style.background = colors[i % colors.length];
    document.body.append(p);
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;   // upward cone
    const v = 90 + Math.random() * 150;
    const dx = Math.cos(a) * v, dy = Math.sin(a) * v;
    const spin = (Math.random() - 0.5) * 900;
    p.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(0.6)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${spin / 2}deg) scale(1)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${dx * 1.4}px, ${dy + 260}px) rotate(${spin}deg) scale(0.9)`, opacity: 0 }
    ], { duration: 1000 + Math.random() * 500, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)' })
      .finished.then(() => p.remove(), () => p.remove());
  }
}
