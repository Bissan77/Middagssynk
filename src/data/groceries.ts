/**
 * Swedish Supermarket Item Dictionary
 * Maps item names/keywords to store categories.
 * Categories match the "Butiksvarvet" (store route) order used in the app.
 */

export type GroceryCategory =
    | 'Frukt & Grönt'
    | 'Bröd & Bageri'
    | 'Skafferi'
    | 'Kött & Fågel'
    | 'Chark & Färdigmat'
    | 'Mejeri & Ägg'
    | 'Fisk & Skaldjur'
    | 'Frysvaror'
    | 'Hygien & Städ'
    | 'Övrigt';

// Ordered for the "store route" display
export const STORE_CATEGORY_ORDER: GroceryCategory[] = [
    'Frukt & Grönt',
    'Bröd & Bageri',
    'Skafferi',
    'Kött & Fågel',
    'Chark & Färdigmat',
    'Mejeri & Ägg',
    'Fisk & Skaldjur',
    'Frysvaror',
    'Hygien & Städ',
    'Övrigt',
];

// Exact-match dictionary: lowercase item name -> category
const EXACT_MAP: Record<string, GroceryCategory> = {
    // Frukt & Grönt
    'tomat': 'Frukt & Grönt',
    'tomater': 'Frukt & Grönt',
    'körsbärstomater': 'Frukt & Grönt',
    'cocktailtomater': 'Frukt & Grönt',
    'gurka': 'Frukt & Grönt',
    'sallad': 'Frukt & Grönt',
    'isbergssallad': 'Frukt & Grönt',
    'ruccola': 'Frukt & Grönt',
    'spenat': 'Frukt & Grönt',
    'lök': 'Frukt & Grönt',
    'rödlök': 'Frukt & Grönt',
    'gul lök': 'Frukt & Grönt',
    'purjolök': 'Frukt & Grönt',
    'salladslök': 'Frukt & Grönt',
    'gräslök': 'Frukt & Grönt',
    'vitlök': 'Frukt & Grönt',
    'schalottenlök': 'Frukt & Grönt',
    'paprika': 'Frukt & Grönt',
    'röd paprika': 'Frukt & Grönt',
    'grön paprika': 'Frukt & Grönt',
    'gul paprika': 'Frukt & Grönt',
    'potatis': 'Frukt & Grönt',
    'sötpotatis': 'Frukt & Grönt',
    'morot': 'Frukt & Grönt',
    'morötter': 'Frukt & Grönt',
    'broccoli': 'Frukt & Grönt',
    'blomkål': 'Frukt & Grönt',
    'vitkål': 'Frukt & Grönt',
    'rödkål': 'Frukt & Grönt',
    'grönkål': 'Frukt & Grönt',
    'kålrot': 'Frukt & Grönt',
    'rotselleri': 'Frukt & Grönt',
    'selleri': 'Frukt & Grönt',
    'fänkål': 'Frukt & Grönt',
    'zucchini': 'Frukt & Grönt',
    'aubergine': 'Frukt & Grönt',
    'champinjoner': 'Frukt & Grönt',
    'svamp': 'Frukt & Grönt',
    'majs': 'Frukt & Grönt',
    'ärtor': 'Frukt & Grönt',
    'haricots verts': 'Frukt & Grönt',
    'bönor': 'Frukt & Grönt',
    'avokado': 'Frukt & Grönt',
    'citron': 'Frukt & Grönt',
    'lime': 'Frukt & Grönt',
    'apelsin': 'Frukt & Grönt',
    'mandarin': 'Frukt & Grönt',
    'grapefrukt': 'Frukt & Grönt',
    'äpple': 'Frukt & Grönt',
    'päron': 'Frukt & Grönt',
    'banan': 'Frukt & Grönt',
    'druvor': 'Frukt & Grönt',
    'jordgubbar': 'Frukt & Grönt',
    'hallon': 'Frukt & Grönt',
    'blåbär': 'Frukt & Grönt',
    'björnbär': 'Frukt & Grönt',
    'mango': 'Frukt & Grönt',
    'ananas': 'Frukt & Grönt',
    'vattenmelon': 'Frukt & Grönt',
    'melon': 'Frukt & Grönt',
    'kiwi': 'Frukt & Grönt',
    'dill': 'Frukt & Grönt',
    'persilja': 'Frukt & Grönt',
    'basilika': 'Frukt & Grönt',
    'koriander': 'Frukt & Grönt',
    'mynta': 'Frukt & Grönt',
    'timjan': 'Frukt & Grönt',
    'rosmarin': 'Frukt & Grönt',
    'ingefära': 'Frukt & Grönt',
    'chili': 'Frukt & Grönt',
    'jalapeño': 'Frukt & Grönt',
    'rättika': 'Frukt & Grönt',
    'rödbetor': 'Frukt & Grönt',
    'sparris': 'Frukt & Grönt',
    'primörer': 'Frukt & Grönt',
    'rädisor': 'Frukt & Grönt',
    'kronärtskocka': 'Frukt & Grönt',

    // Bröd & Bageri
    'bröd': 'Bröd & Bageri',
    'knäckebröd': 'Bröd & Bageri',
    'frallor': 'Bröd & Bageri',
    'baguette': 'Bröd & Bageri',
    'ciabatta': 'Bröd & Bageri',
    'levain': 'Bröd & Bageri',
    'surdegsbröd': 'Bröd & Bageri',
    'tortillabröd': 'Bröd & Bageri',
    'pitabröd': 'Bröd & Bageri',
    'naan': 'Bröd & Bageri',
    'hamburgarebröd': 'Bröd & Bageri',
    'kanelbullar': 'Bröd & Bageri',
    'croissant': 'Bröd & Bageri',
    'bagel': 'Bröd & Bageri',
    'wienerbröd': 'Bröd & Bageri',
    'mjukbröd': 'Bröd & Bageri',
    'formfranska': 'Bröd & Bageri',
    'kex': 'Bröd & Bageri',
    'crackers': 'Bröd & Bageri',

    // Skafferi - pasta, ris, konserver, kryddor, etc.
    'pasta': 'Skafferi',
    'spaghetti': 'Skafferi',
    'penne': 'Skafferi',
    'rigatoni': 'Skafferi',
    'fusilli': 'Skafferi',
    'tagliatelle': 'Skafferi',
    'lasagneplattor': 'Skafferi',
    'ris': 'Skafferi',
    'basmatiris': 'Skafferi',
    'jasminris': 'Skafferi',
    'bulgur': 'Skafferi',
    'couscous': 'Skafferi',
    'quinoa': 'Skafferi',
    'linser': 'Skafferi',
    'kikärtor': 'Skafferi',
    'svarta bönor': 'Skafferi',
    'vita bönor': 'Skafferi',
    'kidneybönor': 'Skafferi',
    'havregryn': 'Skafferi',
    'mjöl': 'Skafferi',
    'vetemjöl': 'Skafferi',
    'rågsikt': 'Skafferi',
    'mandelmjöl': 'Skafferi',
    'socker': 'Skafferi',
    'strösocker': 'Skafferi',
    'florsocker': 'Skafferi',
    'farinsocker': 'Skafferi',
    'vaniljsocker': 'Skafferi',
    'bakpulver': 'Skafferi',
    'bikarbonat': 'Skafferi',
    'torrjäst': 'Skafferi',
    'salt': 'Skafferi',
    'svartpeppar': 'Skafferi',
    'vitpeppar': 'Skafferi',
    'chiliflakes': 'Skafferi',
    'paprikapulver': 'Skafferi',
    'spiskummin': 'Skafferi',
    'korianderpulver': 'Skafferi',
    'gurkmeja': 'Skafferi',
    'kanel': 'Skafferi',
    'kardemumma': 'Skafferi',
    'muskotnöt': 'Skafferi',
    'lagerblad': 'Skafferi',
    'oregano': 'Skafferi',
    'basilika torkad': 'Skafferi',
    'tacokrydda': 'Skafferi',
    'currypulver': 'Skafferi',
    'cajunkrydda': 'Skafferi',
    'olivolja': 'Skafferi',
    'rapsolja': 'Skafferi',
    'kokosolja': 'Skafferi',
    'sesamolja': 'Skafferi',
    'solrosolja': 'Skafferi',
    'balsamvinäger': 'Skafferi',
    'vitvinsvinäger': 'Skafferi',
    'rödvinsvinäger': 'Skafferi',
    'soja': 'Skafferi',
    'sojasås': 'Skafferi',
    'worcestershiresås': 'Skafferi',
    'fisksås': 'Skafferi',
    'tabasco': 'Skafferi',
    'sriracha': 'Skafferi',
    'ketchup': 'Skafferi',
    'senap': 'Skafferi',
    'dijonsenap': 'Skafferi',
    'majonnäs': 'Skafferi',
    'aioli': 'Skafferi',
    'pesto': 'Skafferi',
    'tomatpuré': 'Skafferi',
    'krossade tomater': 'Skafferi',
    'hela plommontomater': 'Skafferi',
    'passerade tomater': 'Skafferi',
    'kokosmjölk': 'Skafferi',
    'kokosgrädde': 'Skafferi',
    'hönsbuljong': 'Skafferi',
    'kycklingbuljong': 'Skafferi',
    'köttbuljong': 'Skafferi',
    'grönsaksbuljong': 'Skafferi',
    'buljong': 'Skafferi',
    'buljongtärning': 'Skafferi',
    'sirap': 'Skafferi',
    'honung': 'Skafferi',
    'lönnsirap': 'Skafferi',
    'majsstärkelse': 'Skafferi',
    'potatismjöl': 'Skafferi',
    'ströbröd': 'Skafferi',
    'panko': 'Skafferi',
    'nötter': 'Skafferi',
    'mandel': 'Skafferi',
    'valnötter': 'Skafferi',
    'cashewnötter': 'Skafferi',
    'jordnötter': 'Skafferi',
    'pistagenötter': 'Skafferi',
    'solrosfrön': 'Skafferi',
    'pumpafrön': 'Skafferi',
    'sesamfrön': 'Skafferi',
    'linfrön': 'Skafferi',
    'chiafrön': 'Skafferi',
    'russin': 'Skafferi',
    'torkade dadlar': 'Skafferi',
    'torkade aprikoser': 'Skafferi',
    'choklad': 'Skafferi',
    'mörk choklad': 'Skafferi',
    'mjölkchoklad': 'Skafferi',
    'kakao': 'Skafferi',
    'kaffe': 'Skafferi',
    'te': 'Skafferi',
    'cornflakes': 'Skafferi',
    'musli': 'Skafferi',
    'granola': 'Skafferi',
    'konserverad tonfisk': 'Skafferi',
    'sardin': 'Skafferi',
    'ansjovis': 'Skafferi',
    'konserverade kikärtor': 'Skafferi',

    // Kött & Fågel
    'kycklingfilé': 'Kött & Fågel',
    'kycklinglår': 'Kött & Fågel',
    'kycklingvinge': 'Kött & Fågel',
    'hel kyckling': 'Kött & Fågel',
    'kyckling': 'Kött & Fågel',
    'köttfärs': 'Kött & Fågel',
    'nötfärs': 'Kött & Fågel',
    'fläskfärs': 'Kött & Fågel',
    'kycklingfärs': 'Kött & Fågel',
    'kalvfärs': 'Kött & Fågel',
    'biff': 'Kött & Fågel',
    'entrecôte': 'Kött & Fågel',
    'ryggbiff': 'Kött & Fågel',
    'oxfilé': 'Kött & Fågel',
    'fläskkotlett': 'Kött & Fågel',
    'fläskfilé': 'Kött & Fågel',
    'fläskkarré': 'Kött & Fågel',
    'fläsklägg': 'Kött & Fågel',
    'revbensspjäll': 'Kött & Fågel',
    'lammkotlett': 'Kött & Fågel',
    'lammbog': 'Kött & Fågel',
    'lammfärs': 'Kött & Fågel',
    'kalkon': 'Kött & Fågel',
    'anka': 'Kött & Fågel',
    'vilt': 'Kött & Fågel',
    'rådjur': 'Kött & Fågel',
    'älg': 'Kött & Fågel',
    'hjort': 'Kött & Fågel',

    // Chark & Färdigmat
    'bacon': 'Chark & Färdigmat',
    'pancetta': 'Chark & Färdigmat',
    'skinka': 'Chark & Färdigmat',
    'rökt skinka': 'Chark & Färdigmat',
    'kassler': 'Chark & Färdigmat',
    'salami': 'Chark & Färdigmat',
    'pepperoni': 'Chark & Färdigmat',
    'korv': 'Chark & Färdigmat',
    'prinskorv': 'Chark & Färdigmat',
    'falukorv': 'Chark & Färdigmat',
    'wienerkorv': 'Chark & Färdigmat',
    'chorizo': 'Chark & Färdigmat',
    'leverpastej': 'Chark & Färdigmat',
    'köttbullar': 'Chark & Färdigmat',
    'laxpastej': 'Chark & Färdigmat',
    'paté': 'Chark & Färdigmat',
    'rökt lax': 'Chark & Färdigmat',
    'gravlax': 'Chark & Färdigmat',
    'kebabkött': 'Chark & Färdigmat',
    'färdig köttbullar': 'Chark & Färdigmat',
    'julskinka': 'Chark & Färdigmat',

    // Mejeri & Ägg
    'mjölk': 'Mejeri & Ägg',
    'lättmjölk': 'Mejeri & Ägg',
    'mellanmjölk': 'Mejeri & Ägg',
    'standardmjölk': 'Mejeri & Ägg',
    'havremjölk': 'Mejeri & Ägg',
    'sojamjölk': 'Mejeri & Ägg',
    'mandelmjölk': 'Mejeri & Ägg',
    'ägg': 'Mejeri & Ägg',
    'äggulor': 'Mejeri & Ägg',
    'äggvitor': 'Mejeri & Ägg',
    'smör': 'Mejeri & Ägg',
    'bregott': 'Mejeri & Ägg',
    'margarin': 'Mejeri & Ägg',
    'grädde': 'Mejeri & Ägg',
    'vispgrädde': 'Mejeri & Ägg',
    'matlagningsgrädde': 'Mejeri & Ägg',
    'crème fraîche': 'Mejeri & Ägg',
    'creme fraiche': 'Mejeri & Ägg',
    'gräddfil': 'Mejeri & Ägg',
    'filmjölk': 'Mejeri & Ägg',
    'yoghurt': 'Mejeri & Ägg',
    'kvarg': 'Mejeri & Ägg',
    'kesella': 'Mejeri & Ägg',
    'ost': 'Mejeri & Ägg',
    'riven ost': 'Mejeri & Ägg',
    'parmesan': 'Mejeri & Ägg',
    'parmigiano': 'Mejeri & Ägg',
    'mozzarella': 'Mejeri & Ägg',
    'brie': 'Mejeri & Ägg',
    'camembert': 'Mejeri & Ägg',
    'fetaost': 'Mejeri & Ägg',
    'cheddar': 'Mejeri & Ägg',
    'gouda': 'Mejeri & Ägg',
    'emmentaler': 'Mejeri & Ägg',
    'boursin': 'Mejeri & Ägg',
    'cream cheese': 'Mejeri & Ägg',
    'philadelphiaost': 'Mejeri & Ägg',
    'halloumi': 'Mejeri & Ägg',
    'ricotta': 'Mejeri & Ägg',
    'mascarpone': 'Mejeri & Ägg',
    'kesslergrill': 'Mejeri & Ägg',
    'fromage frais': 'Mejeri & Ägg',

    // Fisk & Skaldjur
    'lax': 'Fisk & Skaldjur',
    'laxfilé': 'Fisk & Skaldjur',
    'laxbiff': 'Fisk & Skaldjur',
    'torsk': 'Fisk & Skaldjur',
    'torskfilé': 'Fisk & Skaldjur',
    'tonfisk': 'Fisk & Skaldjur',
    'räkor': 'Fisk & Skaldjur',
    'pilgrimsmussla': 'Fisk & Skaldjur',
    'musslor': 'Fisk & Skaldjur',
    'hummer': 'Fisk & Skaldjur',
    'kräftor': 'Fisk & Skaldjur',
    'tilapia': 'Fisk & Skaldjur',
    'havsabborre': 'Fisk & Skaldjur',
    'dorade': 'Fisk & Skaldjur',
    'makrill': 'Fisk & Skaldjur',
    'sill': 'Fisk & Skaldjur',
    'strömming': 'Fisk & Skaldjur',
    'bläckfisk': 'Fisk & Skaldjur',
    'krabba': 'Fisk & Skaldjur',
    'räkpasta': 'Fisk & Skaldjur',

    // Frysvaror
    'fryst': 'Frysvaror',
    'frysta ärtor': 'Frysvaror',
    'fryst spenat': 'Frysvaror',
    'fryst broccoli': 'Frysvaror',
    'fryst blandgrönsaker': 'Frysvaror',
    'fryst fisk': 'Frysvaror',
    'fryst kyckling': 'Frysvaror',
    'glass': 'Frysvaror',
    'fryspizza': 'Frysvaror',
    'fryst räkor': 'Frysvaror',

    // Hygien & Städ
    'diskmedel': 'Hygien & Städ',
    'diskmaskinspulver': 'Hygien & Städ',
    'diskmaskinspads': 'Hygien & Städ',
    'tvättmedel': 'Hygien & Städ',
    'sköljmedel': 'Hygien & Städ',
    'toalettpapper': 'Hygien & Städ',
    'hushållspapper': 'Hygien & Städ',
    'tvål': 'Hygien & Städ',
    'handtvål': 'Hygien & Städ',
    'shampoo': 'Hygien & Städ',
    'balsam': 'Hygien & Städ',
    'tandkräm': 'Hygien & Städ',
    'tandborste': 'Hygien & Städ',
    'rakblad': 'Hygien & Städ',
    'rakkräm': 'Hygien & Städ',
    'deodorant': 'Hygien & Städ',
    'blöjor': 'Hygien & Städ',
    'tamponger': 'Hygien & Städ',
    'mens': 'Hygien & Städ',
    'skurmedel': 'Hygien & Städ',
    'allrengöring': 'Hygien & Städ',
    'badrumsnedel': 'Hygien & Städ',
    'wc-rengöring': 'Hygien & Städ',
    'plastpåsar': 'Hygien & Städ',
    'soppåsar': 'Hygien & Städ',
    'folie': 'Hygien & Städ',
    'plastfolie': 'Hygien & Städ',
    'smörpapper': 'Hygien & Städ',
    'bakplåtspapper': 'Hygien & Städ',
    'vattenflaska': 'Hygien & Städ',
};

// Keyword-based fallback patterns (checked in order, first match wins)
const KEYWORD_RULES: Array<{ pattern: RegExp; category: GroceryCategory }> = [
    // Must come before generic 'tomat' match
    { pattern: /krossade?\s*tomat|passerade?\s*tomat|hela\s*plommon|tomatpuré|tomatsås|tomatjuice/, category: 'Skafferi' },
    { pattern: /konserverade?|konserv/, category: 'Skafferi' },
    
    // Frukt & Grönt
    { pattern: /tomat|gurka|paprika|lök|vitlök|potatis|morot|broccoli|blomkål|kål|spenat|sallad|avokado|citron|lime|apelsin|banan|äpple|päron|bär|svamp|champinjon|dill|persilja|basilika|koriander|ingefära|chili|sparris|rättika|rödbeta|purjo/, category: 'Frukt & Grönt' },
    
    // Bröd & Bageri
    { pattern: /bröd|frall|baguett|ciabatt|tortilla|pita|naan|knäcke|bulle|kex|cracker/, category: 'Bröd & Bageri' },
    
    // Kött & Fågel  
    { pattern: /kyckling(?!buljong|fond|krydda)|kycklingfilé|kycklinglår|köttfärs|nötfärs|fläskfärs|entrecôte|biff|fläsk(?!ost)|lammfärs|lammkotlett|kalkon|anka|vilt|rådjur|älg/, category: 'Kött & Fågel' },
    
    // Chark & Färdigmat
    { pattern: /bacon|pancetta|skinka|kassler|salami|pepperoni|korv|chorizo|leverpastej|köttbullar|gravlax|kebab/, category: 'Chark & Färdigmat' },
    
    // Fisk & Skaldjur (fresh)
    { pattern: /lax(?!pastej)|torsk|tonfisk(?!\s*konserv)|räkor?|pilgrimsmusslor?|musslor?|hummer|kräftor?|makrill|sill|strömming|bläckfisk|dorade|havsabborre/, category: 'Fisk & Skaldjur' },
    
    // Frysvaror
    { pattern: /fryst|frys|glass/, category: 'Frysvaror' },
    
    // Mejeri & Ägg
    { pattern: /mjölk|ägg|smör|bregott|margarin|grädde|crème fraîche|creme fraiche|gräddfil|filmjölk|yoghurt|kvarg|kesella|ost|mozzarella|parmesan|fetaost|cheddar|halloumi|ricotta|mascarpone/, category: 'Mejeri & Ägg' },
    
    // Skafferi
    { pattern: /pasta|spaghett|penne|rigatoni|fusilli|tagliatelle|lasagne|ris(?!\s*grädde)|\bris\b|bulgur|couscous|quinoa|linser|kikärt|mjöl|socker|bakpulver|bikarbonat|jäst|salt|peppar|krydda|olja|vinäger|soja|ketchup|senap|majonnäs|pesto|buljong|sirap|honung|nötter|mandel|frön|russin|torkade|choklad|kakao|kaffe|te|müsli|granola|havregryn|konserverad|ansjovis/, category: 'Skafferi' },
    
    // Hygien & Städ
    { pattern: /diskmedel|tvättmedel|sköljmedel|toalettpapper|hushållspapper|tvål|shampoo|balsam|tandkräm|deodorant|blöjor?|tamponger?|rengöring|städmedel|wc-|plastpåse|soppåsar?|folie|bakplåtspapper/, category: 'Hygien & Städ' },
];

/**
 * Given an ingredient name, returns the best-matching GroceryCategory.
 * Tries exact match first, then keyword patterns, returns 'Övrigt' as fallback.
 */
export function categorizeItem(name: string, overrides?: Record<string, GroceryCategory>): GroceryCategory {
    const lower = name.toLowerCase().trim();

    // 1. Household-specific override
    if (overrides?.[lower]) return overrides[lower];
    
    // 2. Exact match
    if (EXACT_MAP[lower]) return EXACT_MAP[lower];
    
    // 3. Keyword pattern match  
    for (const rule of KEYWORD_RULES) {
        if (rule.pattern.test(lower)) return rule.category;
    }
    
    return 'Övrigt';
}

/**
 * Returns an array of all items in the dictionary, sorted alphabetically.
 * Used for autocomplete suggestions.
 */
export function getAllGroceryNames(): string[] {
    return Object.keys(EXACT_MAP)
        .map(k => k.charAt(0).toUpperCase() + k.slice(1))
        .sort();
}
