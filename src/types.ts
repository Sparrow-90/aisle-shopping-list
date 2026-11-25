export type CatId =
  | 'produce' | 'bakery' | 'dairy' | 'meat' | 'frozen' | 'pantry'
  | 'snacks' | 'drinks' | 'household' | 'care' | 'other';

export interface Item {
  id: string;
  name: string;
  qty: string;
  cat: CatId;
  done: boolean;
  added: number;
}

export interface HistoryEntry {
  label: string;
  count: number;
  last: number;
}

/** Saved in localStorage. Keep the shape backwards compatible, or migrate in loadState(). */
export interface AppState {
  v: 1;
  items: Item[];
  history: Record<string, HistoryEntry>; // key = keyOf(name)
  learned: Record<string, CatId>;        // user's manual group choices
}

export interface Category {
  id: CatId;
  name: string;
  icon: string;
  kw: string[];
}
