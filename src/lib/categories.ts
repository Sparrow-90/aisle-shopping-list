import type { Category, CatId } from '../types';
import { keyOf } from './text';

// Groups, in the order you typically walk through a shop.
// Keywords are lowercase without diacritics (English + Polish).
// Plain keyword = prefix of a word; "=word" = exact word; "two words" = phrase.
export const CATS: Category[] = [
  { id: 'produce', name: 'Fruit & vegetables', icon: '🥕', kw: [
    'apple','banana','orange','lemon','lime','grape','pear','peach','nectarine','plum','cherr','berr','strawberr','blueberr','raspberr',
    'melon','watermelon','kiwi','mango','pineapple','avocado','tomato','potato','sweet potato','onion','garlic','carrot','cucumber',
    'lettuce','salad','spinach','cabbage','broccoli','cauliflower','pepper','zucchini','courgette','aubergine','eggplant','mushroom',
    'celery','leek','beetroot','beet','radish','parsley','dill','basil','coriander','cilantro','herb','ginger','pumpkin','squash',
    'asparagus','kale','rocket','arugula','sprout','fruit','veg','corn','sweetcorn','grapefruit','pomegranate','chive','fennel',
    'jablk','jablek','banan','pomarancz','mandaryn','cytryn','limonk','winogron','grusz','gruszk','brzoskwin','sliwk','wisni','czeresn',
    'truskaw','borowk','malin','arbuz','ananas','awokado','pomidor','ziemniak','kartofl','cebul','czosn','marchew','marchw','ogor',
    'salat','szpinak','kapust','brokul','kalafior','papryk','cukini','baklazan','pieczark','grzyb','seler','=por','=pory','burak',
    'rzodkiew','pietruszk','koperek','=koper','natk','bazyli','imbir','dyni','szparag','jarmuz','rukol','owoc','warzyw','kukurydz','szczypior'
  ]},
  { id: 'bakery', name: 'Bread & bakery', icon: '🥖', kw: [
    'bread','loaf','baguette','=roll','=rolls','bun','bagel','croissant','pita','tortilla','=wrap','=wraps','muffin','cake','donut',
    'doughnut','pastry','pastries','brioche','sourdough','=rye','ciabatta','chleb','bulk','bagiet','rogal','rogalik','drozdzowk',
    'paczek','paczki','ciast','chalk','=tost','tostow','bajgiel','pieczyw','sernik','szarlotk','=babka','pita'
  ]},
  { id: 'dairy', name: 'Dairy & eggs', icon: '🧀', kw: [
    'milk','butter','cheese','yogurt','yoghurt','cream','sour cream','=egg','=eggs','kefir','cottage','mozzarella','cheddar','parmesan',
    'feta','ricotta','mascarpone','margarine','halloumi','buttermilk','brie','camembert','gouda',
    'mlek','mleko','=maslo','masla','=ser','sera','sery','serek','serki','jogurt','smietan','jaj','twarog','maslank','margaryn','mozzarell','feta'
  ]},
  { id: 'meat', name: 'Meat & fish', icon: '🥩', kw: [
    'chicken','beef','pork','=ham','bacon','sausage','mince','steak','turkey','lamb','salami','fish','salmon','tuna','shrimp','prawn',
    'cod','meat','chorizo','pepperoni','duck','fillet','hot dog',
    'mies','kurczak','kurcz','wolow','wieprz','szynk','boczek','boczku','kielbas','parow','mielon','indyk','ryb','losos','tunczyk',
    'dorsz','krewetk','schab','filet','piers','udk','udziec','kabanos','pasztet','karkow','zeberk','=kaczka','sledz','makrel','pstrag'
  ]},
  { id: 'frozen', name: 'Frozen', icon: '🧊', kw: [
    'frozen','ice cream','=ice','ice cubes','pizza','frozen chips','fish fingers','mrozon','=lody','=lod','lodow','pierog','paluszki rybne'
  ]},
  { id: 'pantry', name: 'Pantry', icon: '🥫', kw: [
    'rice','pasta','spaghetti','penne','noodle','flour','sugar','salt','black pepper','oil','olive oil','vinegar','cereal','oat',
    'muesli','granola','cornflakes','corn flakes','jam','honey','peanut butter','sauce','ketchup','mayo','mustard','spice','=tea',
    'teabag','tea bags','coffee','canned','tinned','bean','lentil','chickpea','soup','stock','yeast','baking','nutmeg','cinnamon',
    'paprika powder','oregano','curry','pesto','passata','tomato paste','chopped tomatoes','couscous','quinoa','=tuna can',
    '=ryz','ryzu','makaron','=maka','=maki','cukier','cukru','=sol','=soli','pieprz','olej','oliw','ocet','platk','owsian','musli',
    'dzem','miod','=sos','sosu','ketchup','majonez','musztard','przypraw','herbat','=kawa','=kawy','=kawe','fasol','soczewic',
    'ciecierzyc','=zupa','zupk','bulion','drozdz','konserw','kasz','puszk','maslo orzechowe','koncentrat','passat','cynamon','kakao'
  ]},
  { id: 'snacks', name: 'Snacks & sweets', icon: '🍫', kw: [
    'chocolate','chips','crisps','cookie','biscuit','candy','candies','sweets','=nuts','peanut','almond','cashew','walnut','popcorn',
    'cracker','pretzel','=gum','chewing gum','snack','nutella','marshmallow','jelly','gummy','wafer',
    'czekolad','chrupk','ciastk','cukierk','baton','orzech','orzesz','migdal','paluszk','slodycz','zelk','=guma','wafl','krakers','precl'
  ]},
  { id: 'drinks', name: 'Drinks', icon: '🧃', kw: [
    'water','juice','soda','cola','lemonade','beer','wine','vodka','whisky','whiskey','gin','=rum','drink','sparkling','tonic','smoothie',
    'energy drink','=wod','woda','wody','wode','=sok','soki','soku','napoj','napoi','piwo','piwa','=wino','=wina','wodk','lemoniad','oranzad'
  ]},
  { id: 'household', name: 'Household', icon: '🧽', kw: [
    'toilet paper','toilet roll','kitchen roll','paper towel','paper','detergent','washing','dish soap','dishwasher','sponge','bin bag',
    'bin liner','trash bag','foil','cling film','cling wrap','battery','batteries','bulb','candle','cleaner','bleach','softener',
    'napkin','tissue','laundry','baking paper','zip bag','freezer bag','=matches','lighter',
    'papier','recznik papier','recznik','=plyn','plynu','proszek','kapsulk','gabk','=worki','workow','folia','folie','bateri','zarowk',
    'swiecz','serwetk','chusteczk','wybielacz','zmywark','do naczyn','do prania','zapalk','zapalniczk','odswiezacz','domestos','ludwik'
  ]},
  { id: 'care', name: 'Personal care', icon: '🧴', kw: [
    'shampoo','conditioner','soap','toothpaste','toothbrush','deodorant','shower gel','razor','lotion','hand cream','face cream',
    'sunscreen','cotton','diaper','nappy','nappies','tampon','=pads','floss','mouthwash','vitamin','plaster','painkiller','ibuprofen','paracetamol',
    'szampon','odzywk','mydl','pasta do zebow','szczoteczk','dezodorant','antyperspirant','=zel','zel pod prysznic','maszynk','krem',
    'pielusz','wacik','patyczk','podpask','=nic dentystyczna','plyn do plukania','witamin','plaster','tabletk','apap'
  ]},
  { id: 'other', name: 'Other', icon: '🛒', kw: [] }
];

export const CAT_BY_ID = Object.fromEntries(CATS.map(c => [c.id, c])) as Record<CatId, Category>;

/** Unknown ids (e.g. from an older save) fall back to "other". */
export const catOf = (id: string): Category => CAT_BY_ID[id as CatId] ?? CAT_BY_ID.other;

// Pastel tint behind each aisle's icon
export const TINT: Record<CatId, string> = {
  produce: '#d3ecc9', bakery: '#f6e1b8', dairy: '#f7efb5', meat: '#f6cdc4', frozen: '#cde8f3', pantry: '#ecdcc8',
  snacks: '#eed3ec', drinks: '#cfdbf7', household: '#d6eedf', care: '#f4d6e1', other: '#e6e6ea'
};

// "Form" words say what kind of product it is, so they beat ingredient words:
// "orange juice" -> Drinks, "strawberry jam" -> Pantry, "chicken soup" -> Pantry.
const FORM_WORDS = new Set([
  'juice','=sok','soki','soku','smoothie','lemonade','lemoniad','jam','dzem','soup','=zupa','zupk','sauce','=sos','sosu','passata','passat','stock','bulion',
  'chips','crisps','cookie','biscuit','ciastk','wafer','wafl','cake','ciast','muffin','yogurt','yoghurt','jogurt','kefir',
  'ice cream','=lody','lodow','frozen','mrozon','oil','olej','=tea','herbat','canned','tinned','konserw','puszk','bread','chleb'
]);

interface Matcher { cat: CatId; type: 'exact' | 'phrase' | 'prefix'; k: string; len: number }

// Pre-split keywords by type. Score = keyword length, +100 for form words.
const MATCHERS: Matcher[] = [];
for (const c of CATS) for (const k of c.kw) {
  const bonus = FORM_WORDS.has(k) ? 100 : 0;
  if (k.startsWith('=')) MATCHERS.push({ cat: c.id, type: 'exact', k: k.slice(1), len: k.length - 1 + bonus });
  else if (k.includes(' ')) MATCHERS.push({ cat: c.id, type: 'phrase', k, len: k.length + bonus });
  else MATCHERS.push({ cat: c.id, type: 'prefix', k, len: k.length + bonus });
}

/** A learned override wins; otherwise the highest-scoring keyword. */
export function guessCategory(name: string, learned: Record<string, CatId>): CatId {
  const key = keyOf(name);
  if (learned[key]) return learned[key];
  const words = key.split(' ').filter(w => w && !/^\d+$/.test(w));
  const padded = ' ' + key + ' ';
  let best: CatId | null = null, bestLen = 0;
  for (const m of MATCHERS) {
    if (m.len <= bestLen) continue;
    let hit = false;
    if (m.type === 'phrase') hit = padded.includes(' ' + m.k);
    else if (m.type === 'exact') hit = words.includes(m.k);
    else hit = words.some(w => w.startsWith(m.k));
    if (hit) { best = m.cat; bestLen = m.len; }
  }
  return best ?? 'other';
}
