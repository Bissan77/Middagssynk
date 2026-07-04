import { useMemo, useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { ShoppingListItem } from '../types';
import { CheckCircle2, Circle, Trash2, Package, Plus, Trash, RefreshCw } from 'lucide-react';
import { getAllGroceryNames, STORE_CATEGORY_ORDER, type GroceryCategory } from '../data/groceries';

export default function ShoppingList() {
    const {
        shoppingList,
        generateShoppingList,
        toggleShoppingListItem,
        clearCheckedItems,
        clearAllItems,
        addStapleToShop,
        addManualItem,
        updateItemCategory
    } = useStore();

    const [manualName, setManualName] = useState('');
    const [manualAmount, setManualAmount] = useState<number | ''>('');
    const [manualUnit, setManualUnit] = useState('st');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredGroceries = useMemo(() => {
        if (!manualName || manualName.length < 2) return [];
        return getAllGroceryNames().filter(g => g.toLowerCase().startsWith(manualName.toLowerCase())).slice(0, 6);
    }, [manualName]);

    const handleAddManual = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualName.trim()) return;
        try {
            await addManualItem({
                name: manualName.charAt(0).toUpperCase() + manualName.slice(1).trim(),
                totalAmount: manualAmount === '' ? 1 : manualAmount,
                unit: manualUnit,
                category: 'Övrigt',
            });
            setManualName('');
            setManualAmount('');
            setManualUnit('st');
        } catch (error) {
            console.error('Kunde inte lägga till manuell vara:', error);
        }
    };

    const { active, staples, checked } = useMemo(() => {
        const list = { active: [] as ShoppingListItem[], staples: [] as ShoppingListItem[], checked: [] as ShoppingListItem[] };
        shoppingList.forEach(item => {
            if (item.isChecked) list.checked.push(item);
            else if (item.isStaple) list.staples.push(item);
            else list.active.push(item);
        });
        list.active.sort((a, b) => a.category.localeCompare(b.category));
        return list;
    }, [shoppingList]);

    const activeByCategory = useMemo(() => {
        const grouped: Record<string, ShoppingListItem[]> = {};
        active.forEach(item => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });
        const knownCats = new Set(STORE_CATEGORY_ORDER as string[]);
        const ordered = STORE_CATEGORY_ORDER
            .filter(cat => grouped[cat])
            .map(cat => [cat, grouped[cat]] as [string, ShoppingListItem[]]);
        Object.entries(grouped)
            .filter(([cat]) => !knownCats.has(cat))
            .forEach(entry => ordered.push(entry as [string, ShoppingListItem[]]));
        return ordered;
    }, [active]);

    const ItemRow = ({ item, isPantry }: { item: ShoppingListItem; isPantry?: boolean }) => (
        <div className={`flex items-center justify-between px-3 py-2.5 mb-1.5 rounded-lg transition-all duration-200 ${
            item.isChecked
                ? 'opacity-40'
                : 'bg-stone-800/80 border border-stone-700/50'
        }`}>
            <div className="flex items-center flex-1 cursor-pointer min-w-0" onClick={() => toggleShoppingListItem(item.id)}>
                <button className="mr-2.5 flex-shrink-0 transition-transform duration-200 active:scale-90">
                    {item.isChecked
                        ? <CheckCircle2 className="w-5 h-5 text-accent" />
                        : <Circle className="w-5 h-5 text-stone-600" />}
                </button>
                <span className={`font-medium text-sm truncate ${item.isChecked ? 'line-through text-stone-500' : 'text-stone-200'}`}>
                    {item.name}
                </span>
            </div>

            {!item.isChecked && !isPantry && (
                <span className="text-stone-500 text-xs bg-stone-700/50 px-2 py-0.5 rounded ml-2 flex-shrink-0 font-medium">
                    {item.totalAmount} {item.unit}
                </span>
            )}

            <select
                value={item.category}
                onChange={async (event) => {
                    await updateItemCategory(item.id, event.target.value as GroceryCategory);
                }}
                className="ml-2 max-w-32 flex-shrink-0 bg-stone-900/70 border border-stone-700/70 rounded-md px-2 py-1 text-xs font-medium text-stone-300 focus:outline-none focus:ring-1 focus:ring-accent/60 focus:border-accent transition-all duration-200"
            >
                {STORE_CATEGORY_ORDER.map(category => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>

            {isPantry && (
                <button
                    onClick={() => addStapleToShop(item.id)}
                    className="text-xs font-semibold text-accent-light border border-accent/30 hover:bg-accent/10 px-2.5 py-1 rounded-md transition-all duration-200 ml-2 flex-shrink-0"
                >
                    + Lägg till
                </button>
            )}
        </div>
    );

    return (
        <div className="p-4 pt-5 min-h-screen pb-32">
            {/* Header */}
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-stone-100 tracking-tight mb-3">Inköpslista</h1>

                {/* Action bar */}
                <div className="flex items-center gap-1.5 bg-stone-800/80 border border-stone-700/50 rounded-xl p-2">
                    <button
                        onClick={() => generateShoppingList()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-accent/10 text-accent-light hover:bg-accent/20 rounded-lg text-xs font-semibold transition-all duration-200"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Synka matsedel</span>
                    </button>
                    <div className="w-px h-5 bg-stone-700 flex-shrink-0" />
                    <button
                        onClick={clearCheckedItems}
                        disabled={checked.length === 0}
                        className="flex items-center gap-1 px-2.5 py-2 text-stone-500 hover:text-stone-300 hover:bg-stone-700/50 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-30"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Avbockade</span>
                    </button>
                    <button
                        onClick={clearAllItems}
                        disabled={shoppingList.length === 0}
                        className="flex items-center gap-1 px-2.5 py-2 text-red-500/70 hover:text-red-400 hover:bg-red-900/20 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-30"
                    >
                        <Trash className="w-3.5 h-3.5" />
                        <span>Rensa</span>
                    </button>
                </div>
            </header>

            {/* Add item form */}
            <form onSubmit={handleAddManual} className="mb-6 flex gap-2 relative" ref={wrapperRef}>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        required
                        placeholder="Lägg till vara..."
                        value={manualName}
                        onChange={e => { setManualName(e.target.value); setShowSuggestions(true); }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg py-2.5 px-3 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-accent/60 focus:border-accent transition-all duration-200 text-base font-medium"
                    />
                    {showSuggestions && filteredGroceries.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-stone-800 border border-stone-700 rounded-xl shadow-2xl shadow-black/50 max-h-40 overflow-y-auto">
                            {filteredGroceries.map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => { setManualName(g); setShowSuggestions(false); }}
                                    className="w-full text-left px-3 py-2 hover:bg-stone-700 text-stone-200 text-sm font-medium transition-colors border-b border-stone-700/40 last:border-0"
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Mängd"
                    value={manualAmount}
                    onChange={e => setManualAmount(parseFloat(e.target.value) || '')}
                    className="w-16 bg-stone-800 border border-stone-700 rounded-lg py-2.5 px-2 text-stone-100 focus:outline-none focus:ring-1 focus:ring-accent/60 focus:border-accent text-center text-base placeholder:text-stone-600"
                />
                <select
                    value={manualUnit}
                    onChange={e => setManualUnit(e.target.value)}
                    className="w-16 bg-stone-800 border border-stone-700 rounded-lg py-2.5 px-1 text-stone-200 focus:outline-none focus:ring-1 focus:ring-accent/60 focus:border-accent text-base"
                >
                    {['g', 'kg', 'ml', 'dl', 'l', 'st', 'msk', 'tsk', 'krm', 'förp'].map(u => (
                        <option key={u} value={u}>{u}</option>
                    ))}
                </select>
                <button
                    type="submit"
                    disabled={!manualName.trim()}
                    className="p-2.5 bg-accent hover:bg-accent-dark text-white rounded-lg transition-all duration-200 disabled:opacity-40 flex-shrink-0"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>

            <div className="space-y-5">
                {/* Active by category */}
                {activeByCategory.map(([category, items]) => (
                    <div key={category}>
                        <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1.5 px-1">
                            {category}
                        </h3>
                        {(items as ShoppingListItem[]).map(item => <ItemRow key={item.id} item={item} />)}
                    </div>
                ))}

                {/* Pantry staples */}
                {staples.length > 0 && (
                    <div className="mt-4 border border-stone-700/40 rounded-xl overflow-hidden">
                        <div className="px-3 py-2.5 border-b border-stone-700/40 flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs font-bold text-amber-400">Kolla skafferiet</span>
                        </div>
                        <div className="p-2">
                            {staples.map(item => <ItemRow key={item.id} item={item} isPantry />)}
                        </div>
                    </div>
                )}

                {/* Checked */}
                {checked.length > 0 && (
                    <div className="pt-4 border-t border-stone-800">
                        <p className="text-[10px] font-bold text-stone-700 uppercase tracking-widest mb-2">
                            Avbockat ({checked.length})
                        </p>
                        {checked.map(item => <ItemRow key={item.id} item={item} />)}
                    </div>
                )}

                {shoppingList.length === 0 && (
                    <div className="text-center py-14 text-stone-600">
                        <p className="text-3xl mb-2">🛒</p>
                        <p className="text-sm font-medium text-stone-500">Din inköpslista är tom.</p>
                        <p className="text-xs mt-1 text-stone-600">Synka från matsedeln eller lägg till manuellt.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
