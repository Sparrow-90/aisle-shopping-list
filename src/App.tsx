import { memo } from 'react';
import { CATS, catOf } from './lib/categories';
import { useShoppingList } from './state/useShoppingList';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProgressCard } from './components/ProgressCard';
import { GroupCard, type Row } from './components/GroupCard';
import { Dock } from './components/Dock';
import { Toast, useToast } from './components/Toast';

export function App() {
  const toast = useToast();
  const { state, storageOk, flags, inList, actions } = useShoppingList(toast.show);
  const { items } = state;
  const left = items.filter(i => !i.done).length;
  const done = items.length - left;

  // Build the aisle groups in shop-walk order, with stagger delays for entering things.
  const sortDone = (id: string, isDone: boolean) => Number(flags.settling.get(id) ?? isDone);
  let k = 0;
  const groups = CATS.flatMap(c => {
    const inCat = items.filter(i => catOf(i.cat).id === c.id);
    if (!inCat.length) return [];
    inCat.sort((a, b) => (sortDone(a.id, a.done) - sortDone(b.id, b.done)) || (a.added - b.added));
    const isNew = !flags.knownGroups.has(c.id);
    let groupDelay: number | null = null;
    const rows: Row[] = inCat.map(item => {
      let enterDelay: number | null = null;
      if (flags.first || flags.enterIds.has(item.id)) {
        const d = Math.min(k++ * 35, 280);
        if (groupDelay === null) groupDelay = d;
        if (!isNew) enterDelay = d;
      }
      return { item, enterDelay };
    });
    return [{ cat: c, rows, isNew, groupDelay: groupDelay ?? 0, open: inCat.filter(i => !i.done).length }];
  });

  return (
    <>
      <div className="shell">
        <Header total={items.length} left={left}
          onClearDone={actions.clearDone} onUntick={actions.untickAll}
          onClearAll={actions.clearAll} onForget={actions.forgetAll} />
        <Hero items={items} left={left} done={done} />
        <ProgressCard total={items.length} done={done} first={flags.first} />
        {!storageOk && (
          <div id="storageWarn" className="card banner">
            This browser is blocking local storage, so your list won't be saved after you close the page.
          </div>
        )}
        <main id="list">
          {!items.length && <EmptyState enter={!flags.first} />}
          {groups.map(g => (
            <GroupCard key={g.cat.id} cat={g.cat} rows={g.rows} open={g.open}
              enter={g.isNew} enterDelay={g.groupDelay} justToggled={flags.justToggled} actions={actions} />
          ))}
        </main>
        {done > 0 && (
          <button id="clearDone" className={flags.first ? '' : 'enter'} onClick={actions.clearDone}>
            {`Remove ${done} ticked item${done === 1 ? '' : 's'}`}
          </button>
        )}
      </div>
      <Dock state={state} inList={inList} actions={actions} />
      <Toast msg={toast.msg} onHide={toast.hide} />
    </>
  );
}

const EmptyState = memo(({ enter }: { enter: boolean }) => (
  <div className={'empty' + (enter ? ' enter' : '')}>
    <b>🧺</b>
    <p>Nothing here yet. <span>Type products below and they will be sorted into shop aisles for you. Tap a product's icon to move it to another aisle.</span></p>
  </div>
));
