import { useState, useEffect } from 'react';
import { X, Clock, Users, ChefHat, Check, PlusCircle } from 'lucide-react';
import type { Recipe } from '../types';

interface AISuggestionModalProps {
  recipes: Recipe[];
  onClose: () => void;
  onAddRecipe: (recipe: Recipe, date: string) => void;
}

export default function AISuggestionModal({ recipes, onClose, onAddRecipe }: AISuggestionModalProps) {
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const [addedRecipes, setAddedRecipes] = useState<Set<string>>(new Set());

  // 🔥 FIX 1: Lås bakgrundsscrollen (Body Scroll Lock)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

  const handleAdd = (recipe: Recipe) => {
    const date = selectedDates[recipe.id];
    if (date && typeof onAddRecipe === 'function') {
      onAddRecipe(recipe, date);
      setAddedRecipes(prev => new Set(prev).add(recipe.id));
    }
  };

  const getEmojiForCategory = (tags: string[] = []) => {
    const tagString = tags.join(' ').toLowerCase();
    if (tagString.includes('fisk') || tagString.includes('lax')) return '🐟';
    if (tagString.includes('kött') || tagString.includes('nötfärs')) return '🥩';
    if (tagString.includes('kyckling')) return '🍗';
    if (tagString.includes('vegetarisk') || tagString.includes('vegan')) return '🥦';
    if (tagString.includes('pasta')) return '🍝';
    return '🍽️';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/85 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      {/* Klick utanför stänger */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 🔥 FIX 2: Stabil Flex-behållare för mobilen */}
      <div className="relative bg-stone-900 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border-t border-stone-800 sm:border">
        
        {/* Header - Statisk */}
        <div className="flex-none px-6 py-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent/20 rounded-xl">
              <ChefHat className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-100 tracking-tight">AI-förslag</h2>
              <p className="text-xs text-stone-400">{recipes.length} recept hittade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-stone-800 text-stone-400 hover:text-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollbart innehåll - Hanterar listan med recept */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 pb-12">
          {recipes.map((recipe) => {
            const isAdded = addedRecipes.has(recipe.id);
            const isDateSelected = !!selectedDates[recipe.id];

            return (
              <div 
                key={`ai-card-${recipe.id}`}
                className={`bg-stone-800/40 rounded-2xl border transition-all duration-300 ${
                  isAdded ? 'border-accent/50 bg-accent/5' : 'border-stone-700/50'
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-bold text-stone-100 mb-1.5 leading-tight">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs font-medium text-stone-500">
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{recipe.cookingTime || 30} min</span>
                        <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{recipe.portions} port</span>
                      </div>
                    </div>
                    <div className="text-3xl grayscale-[0.2]">{getEmojiForCategory(recipe.tags)}</div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {recipe.tags?.map((tag, i) => (
                      <span key={`${recipe.id}-t-${i}`} className="px-2 py-0.5 bg-stone-900 text-[10px] font-bold uppercase tracking-widest text-accent-light/70 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-700/30">
                    <select
                      value={selectedDates[recipe.id] || ''}
                      onChange={(e) => setSelectedDates(prev => ({ ...prev, [recipe.id]: e.target.value }))}
                      disabled={isAdded}
                      className="flex-1 bg-stone-900 border border-stone-700 text-stone-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-accent disabled:opacity-50 appearance-none"
                    >
                      <option value="">Välj dag...</option>
                      {next7Days.map(day => (
                        <option key={`opt-${recipe.id}-${day.value}`} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => handleAdd(recipe)}
                      disabled={!isDateSelected || isAdded}
                      className={`flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all ${
                        isAdded
                          ? 'bg-accent/20 text-accent'
                          : isDateSelected
                          ? 'bg-accent text-white shadow-lg active:scale-95'
                          : 'bg-stone-800 text-stone-600'
                      }`}
                    >
                      {isAdded ? <><Check className="w-4 h-4 mr-2" />Tillagd</> : <><PlusCircle className="w-4 h-4 mr-2" />Välj</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* En liten gradient i botten för att signalera scroll */}
        <div className="flex-none h-6 bg-gradient-to-t from-stone-900 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}