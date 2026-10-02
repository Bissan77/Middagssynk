import { useMemo, useState } from 'react';
import { useStore } from '../../../core/store/useStore';
import RecipeCard from '../components/RecipeCard';
import { Search, Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import RecipeForm from '../components/RecipeForm';
import { importRecipeFromUrl } from '../services/ai';
import RecipeDetailsModal from '../components/RecipeDetailsModal';
import type { Recipe } from '../../../core/types';

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
            await addRecipe(newRecipe);
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
        <div className="app-page min-h-screen pb-28">
            {/* Header */}
            <header className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Receptbank</h1>
                    <p className="text-xs text-text-muted mt-0.5">{recipes.length} sparade recept</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="ui-icon-button ui-button-primary active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </header>


            {/* Import form */}
            <form onSubmit={handleImport} className="mb-4 flex gap-2">
                <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="url"
                        required
                        placeholder="Klistra in receptlänk..."
                        value={importUrl}
                        onChange={e => setImportUrl(e.target.value)}
                        className="ui-input py-2.5 pl-10 pr-3 text-base"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!importUrl.trim() || isImporting}
                    className="ui-button ui-button-secondary min-w-[88px] disabled:opacity-40"
                >
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Importera'}
                </button>
            </form>

            {/* Search + tags */}
            <div className="mb-4 space-y-2.5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Sök recept..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="ui-input py-2.5 pl-10 pr-3 text-base"
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
                                    ? 'bg-action-primary text-text-inverse border-transparent'
                                    : 'bg-surface-raised text-text-secondary border-border-subtle hover:border-border-strong'
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
                <div className="text-center py-14 text-text-muted">
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
