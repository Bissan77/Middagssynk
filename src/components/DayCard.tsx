import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Search, Type } from 'lucide-react';
import { useState } from 'react';
import type { MealPlanItem, Recipe } from '../types';
import { useStore } from '../store/useStore';
import RecipeSelectionModal from './RecipeSelectionModal';
import ActionMenuModal from './ActionMenuModal';
import RecipeDetailsModal from './RecipeDetailsModal';

interface DayCardProps {
    date: Date;
    mealPlanItem?: MealPlanItem;
}

export default function DayCard({ date, mealPlanItem }: DayCardProps) {
    const recipes = useStore(state => state.recipes);
    const updateMealPlanItem = useStore(state => state.updateMealPlanItem);
    const removeMealPlanItem = useStore(state => state.removeMealPlanItem);
    const addMealPlanItem = useStore(state => state.addMealPlanItem);
    const moveMealPlanItem = useStore(state => state.moveMealPlanItem);

    const recipe = mealPlanItem?.recipeId ? recipes.find(r => r.id === mealPlanItem.recipeId) : null;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);

    const handlePortionChange = async (delta: number) => {
        if (mealPlanItem && mealPlanItem.adjustedPortions + delta > 0) {
            await updateMealPlanItem(mealPlanItem.id, { adjustedPortions: mealPlanItem.adjustedPortions + delta });
        }
    };

    const handleAddFreeText = async () => {
        const text = window.prompt('Vad vill du äta? (t.ex. Pannkakor, Utemat)');
        if (!text || text.trim() === '') return;
        
        try {
            await addMealPlanItem({
                id: `mp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                date: format(date, 'yyyy-MM-dd'),
                adjustedPortions: 4,
                isFreeText: true,
                freeText: text.trim()
            });
        } catch (error) {
            console.error("Kunde inte spara fritext till databasen:", error);
            alert("Något gick fel vid sparningen. Försök igen.");
        }
    };

    const handleSelectRecipe = async (selectedRecipe: Recipe) => {
        try {
            await addMealPlanItem({
                id: `mp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                date: format(date, 'yyyy-MM-dd'),
                recipeId: selectedRecipe.id,
                adjustedPortions: selectedRecipe.portions
            });
            setIsModalOpen(false);
        } catch (error) {
            console.error("Kunde inte spara receptet till databasen:", error);
            alert("Något gick fel när maten skulle läggas till. Försök igen.");
        }
    };

    return (
        <div className="bg-stone-800/60 rounded-xl border border-stone-700/60 p-3 mb-3">
            {/* Day label */}
            <p className="text-sm font-semibold text-stone-300 capitalize mb-2">
                {format(date, 'EEEE d/M', { locale: sv })}
            </p>

            {mealPlanItem && (recipe || mealPlanItem.isFreeText) ? (
                /* Filled meal slot */
                <button
                    onClick={() => setIsActionMenuOpen(true)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-accent/25 bg-accent/5 hover:border-accent/40 hover:bg-accent/10 transition-all duration-200 active:scale-[0.99] text-left"
                >
                    <div className="h-10 w-10 min-w-[40px] rounded-lg bg-stone-700 overflow-hidden flex-shrink-0 border border-stone-600/40">
                        {recipe?.imageUrl ? (
                            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                                {mealPlanItem.isFreeText ? '📝' : '🍲'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-100 text-sm leading-snug truncate">
                            {mealPlanItem.isFreeText ? mealPlanItem.freeText : recipe?.title}
                        </p>
                        {!mealPlanItem.isFreeText && (
                            <p className="text-xs text-stone-500 mt-0.5">{mealPlanItem.adjustedPortions} portioner</p>
                        )}
                    </div>
                    <span className="text-stone-600 text-xs flex-shrink-0">›</span>
                </button>
            ) : (
                /* Empty slot — dashed two-button grid */
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-dashed border-stone-700 rounded-lg text-xs font-medium text-stone-500 hover:border-accent/50 hover:text-accent-light hover:bg-accent/5 transition-all duration-200"
                    >
                        <Search className="w-3.5 h-3.5" />
                        <span>Välj recept</span>
                    </button>
                    <button
                        onClick={handleAddFreeText}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-dashed border-stone-700 rounded-lg text-xs font-medium text-stone-500 hover:border-stone-500 hover:text-stone-300 transition-all duration-200"
                    >
                        <Type className="w-3.5 h-3.5" />
                        <span>Fritext</span>
                    </button>
                </div>
            )}

            {isModalOpen && (
                <RecipeSelectionModal
                    onClose={() => setIsModalOpen(false)}
                    onSelect={handleSelectRecipe}
                    activeDateStr={format(date, 'EEEE d/M', { locale: sv })}
                />
            )}

            {isActionMenuOpen && mealPlanItem && (
                <ActionMenuModal
                    mealPlanItem={mealPlanItem}
                    recipe={recipe}
                    currentDate={date}
                    onClose={() => setIsActionMenuOpen(false)}
                    onUpdatePortions={handlePortionChange}
                    onRemove={() => removeMealPlanItem(mealPlanItem.id)}
                    onMove={(newDate) => moveMealPlanItem(mealPlanItem.id, newDate)}
                    onViewRecipe={recipe ? () => setViewingRecipe(recipe) : undefined}
                />
            )}

            {viewingRecipe && (
                <RecipeDetailsModal
                    recipe={viewingRecipe}
                    onClose={() => setViewingRecipe(null)}
                />
            )}
        </div>
    );
}