import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import RecipeCard from '../components/RecipeCard';
import { Search, Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import RecipeForm from '../components/RecipeForm';
import { importRecipeFromUrl } from '../services/ai';
import RecipeDetailsModal from '../components/RecipeDetailsModal';
import type { Recipe } from '../types';

export default function RecipeBank() {
    const recipes = useStore(state => state.recipes);
    const addRecipe = useStore(state => state.addRecipe);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newestRecipeId] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [importUrl, setImportUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        recipes.forEach(r => r.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [recipes]);

    const filteredRecipes = useMemo(() => {
        return recipes.filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = activeTag ? r.tags.includes(activeTag) : true;
            return matchesSearch && matchesTag;
        });
    }, [recipes, searchQuery, activeTag]);

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importUrl.trim()) return;
        setIsImporting(true);
        try {
            const newRecipe = await importRecipeFromUrl(importUrl);
            addRecipe(newRecipe);
            setImportUrl('');
            alert(`Receptet "${newRecipe.title}" har importerats!`);
        } catch {
            alert('Kunde inte importera receptet. Försök igen.');
        } finally {
            setIsImporting(false);
        }
    };

    if (isCreating) {
        return <RecipeForm onCancel={() => setIsCreating(false)} onSave={() => setIsCreating(false)} />;
    }

    return (
        <div className="p-4 pt-5 min-h-screen pb-28">
            {/* Header */}
            <header className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-stone-100 tracking-tight">Receptbank</h1>
                    <p className="text-xs text-stone-500 mt-0.5">{recipes.length} sparade recept</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-2.5 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg transition-all duration-200 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </header>


            {/* Import form */}
            <form onSubmit={handleImport} className="mb-4 flex gap-2">
                <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                        type="url"
                        required
                        placeholder="Klistra in receptlänk..."
                        value={importUrl}
                        onChange={e => setImportUrl(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg py-2.5 pl-10 pr-3 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-accent/60 focus:border-accent transition-all duration-200 text-base"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!importUrl.trim() || isImporting}
                    className="px-3 bg-stone-700 hover:bg-stone-600 text-stone-100 font-medium rounded-lg transition-all duration-200 disabled:opacity-40 flex items-center justify-center min-w-[88px]"
                >
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Importera'}
                </button>
            </form>

            {/* Search + tags */}
            <div className="mb-4 space-y-2.5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                        type="text"
                        placeholder="Sök recept..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg py-2.5 pl-10 pr-3 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-accent/60 focus:border-accent transition-all duration-200 text-base"
                    />
                </div>

                {/* Tag pills */}
                <div className="flex overflow-x-auto pb-0.5 -mx-4 px-4 gap-1.5 scrollbar-none">
                    {[{ v: null, l: 'Alla' }, ...allTags.map(t => ({ v: t, l: t }))].map(({ v, l }) => (
                        <button
                            key={l}
                            onClick={() => setActiveTag(v)}
                            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0 border ${
                                activeTag === v
                                    ? 'bg-accent text-white border-transparent'
                                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-500'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                    {filteredRecipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            highlight={recipe.id === newestRecipeId}
                            onClick={() => setSelectedRecipe(recipe)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-14 text-stone-600">
                    <p className="text-3xl mb-2">🍳</p>
                    <p className="text-sm font-medium">Inga recept hittades.</p>
                </div>
            )}

            {selectedRecipe && (
                <RecipeDetailsModal
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                />
            )}
        </div>
    );
}
