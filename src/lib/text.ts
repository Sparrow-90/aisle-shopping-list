/** Lowercase, strip diacritics (ł by hand), collapse non-alphanumerics to single spaces. */
export const norm = (s: string): string => s.toLowerCase()
  .replace(/ł/g, 'l')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, ' ').trim();

export const keyOf = (name: string): string => norm(name);

export const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

// "2 milk", "milk 2l", "3x eggs", "1,5 kg potatoes" -> { name, qty }
const UNIT = '(?:x|kg|dag|dkg|g|l|ml|szt\\.?|pcs|pc|packs?|op\\.?|bottles?|cans?|bags?)';
const LEAD = new RegExp('^((?:\\d+(?:[.,]\\d+)?\\s*' + UNIT + '?)|(?:x\\s*\\d+))\\s+(.+)$', 'i');
const TRAIL = new RegExp('^(.+?)\\s+((?:x\\s*)?\\d+(?:[.,]\\d+)?\\s*' + UNIT + '?)$', 'i');

export function parseEntry(raw: string): { name: string; qty: string } {
  let s = raw.trim().replace(/\s+/g, ' ');
  let qty = '';
  let m = s.match(LEAD);
  if (m) { qty = m[1]; s = m[2]; }
  else if ((m = s.match(TRAIL))) { s = m[1]; qty = m[2]; }
  return { name: cap(s), qty: qty.replace(/\s+/g, ' ') };
}

/** Split typed input on commas (but not a decimal comma like "1,5"), semicolons and newlines. */
export const splitEntries = (text: string): string[] =>
  text.split(/\s*(?:[;\n]|,(?!\d))\s*/).map(p => p.trim()).filter(Boolean);

/** A bare number shows as "× 2"; units show as typed. */
export const formatQty = (qty: string): string => /^\d+([.,]\d+)?$/.test(qty) ? '× ' + qty : qty;
