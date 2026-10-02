import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../core/store/useStore';
import { Search, X, Users } from 'lucide-react';
import type { Recipe } from '../../../core/types';

interface RecipeSelectionModalProps {
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  activeDateStr: string;
}

export default function RecipeSelectionModal({ onClose, onSelect, activeDateStr }: RecipeSelectionModalProps) {
  const recipes = useStore(state => state.recipes);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
          document.body.style.overflow = 'unset';
      };
  }, []);

  const filteredRecipes = useMemo(() =>
    recipes.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [recipes, searchQuery]
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div 
        className="ui-sheet w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-y-auto overscroll-contain flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-border-subtle flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Välj recept</h2>
            <p className="text-[10px] text-action-primary capitalize">{activeDateStr}</p>
          </div>
          <button
            onClick={onClose}
            className="ui-icon-button h-8 w-8"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 border-b border-border-subtle flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Sök bland dina recept..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="ui-input py-2 pl-9 pr-3 text-base"
              autoFocus
            />
          </div>
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto px-2 pt-2 pb-32">
          {filteredRecipes.length > 0 ? (
            <div className="space-y-1">
              {filteredRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => onSelect(recipe)}
                  className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-sunken border border-transparent hover:border-border-subtle transition-all duration-200"
                >
                  <div className="h-11 w-11 min-w-[44px] rounded-lg bg-surface-sunken overflow-hidden flex-shrink-0 border border-border-subtle">
                    {recipe.imageUrl ? (
                      <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl opacity-50">🍲</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate leading-snug">{recipe.title}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5">
                      <Users className="w-3 h-3" />
                      <span>{recipe.portions} port</span>
                      {recipe.tags.length > 0 && (
                        <span className="text-border-strong">•</span>
                      )}
                      <span className="truncate">{recipe.tags.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-text-muted">
              <p className="text-xs">Inga recept hittades.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
