import { useState, useEffect } from 'react';
import { X, Clock, Users, ChefHat, Check, PlusCircle } from 'lucide-react';
import type { Recipe } from '../../../core/types';

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
      <div className="ui-sheet relative w-full max-w-2xl rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header - Statisk */}
        <div className="flex-none px-6 py-5 border-b border-border-subtle flex items-center justify-between bg-surface-raised/90 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-action-soft rounded-xl">
              <ChefHat className="w-6 h-6 text-action-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">AI-förslag</h2>
              <p className="text-xs text-text-secondary">{recipes.length} recept hittade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ui-icon-button rounded-full"
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
                className={`ui-card rounded-2xl transition-all duration-300 ${
                  isAdded ? 'border-action-primary bg-surface-selected' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-bold text-text-primary mb-1.5 leading-tight">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs font-medium text-text-muted">
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{recipe.cookingTime || 30} min</span>
                        <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{recipe.portions} port</span>
                      </div>
                    </div>
                    <div className="text-3xl grayscale-[0.2]">{getEmojiForCategory(recipe.tags)}</div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {recipe.tags?.map((tag, i) => (
                      <span key={`${recipe.id}-t-${i}`} className="px-2 py-0.5 bg-surface-sunken text-[10px] font-bold uppercase tracking-widest text-action-primary rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-subtle">
                    <select
                      value={selectedDates[recipe.id] || ''}
                      onChange={(e) => setSelectedDates(prev => ({ ...prev, [recipe.id]: e.target.value }))}
                      disabled={isAdded}
                      className="ui-input flex-1 text-sm appearance-none disabled:opacity-50"
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
                          ? 'bg-action-soft text-action-primary'
                          : isDateSelected
                          ? 'bg-action-primary text-text-inverse shadow-card active:scale-95'
                          : 'bg-surface-sunken text-text-muted'
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
        <div className="flex-none h-6 bg-gradient-to-t from-surface-raised to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
