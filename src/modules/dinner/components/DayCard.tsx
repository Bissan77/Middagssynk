import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Search, Type } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { MealPlanItem, Recipe } from '../../../core/types';
import { useStore } from '../../../core/store/useStore';
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
    const [freeTextDraft, setFreeTextDraft] = useState<string | null>(null);
    const [freeTextError, setFreeTextError] = useState<string | null>(null);
    const [isSavingFreeText, setIsSavingFreeText] = useState(false);

    const handlePortionChange = async (delta: number) => {
        if (mealPlanItem && mealPlanItem.adjustedPortions + delta > 0) {
            await updateMealPlanItem(mealPlanItem.id, { adjustedPortions: mealPlanItem.adjustedPortions + delta });
        }
    };

    const handleAddFreeText = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const text = freeTextDraft?.trim();
        if (!text || isSavingFreeText) return;

        setFreeTextError(null);
        setIsSavingFreeText(true);
        try {
            await addMealPlanItem({
                id: `mp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                date: format(date, 'yyyy-MM-dd'),
                adjustedPortions: 4,
                isFreeText: true,
                freeText: text
            });
            setFreeTextDraft(null);
        } catch (error) {
            console.error("Kunde inte spara fritext till databasen:", error);
            setFreeTextError('Något gick fel vid sparningen. Försök igen.');
        } finally {
            setIsSavingFreeText(false);
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
        <div className="ui-card p-3 mb-3">
            {/* Day label */}
            <p className="text-sm font-semibold text-text-secondary capitalize mb-2">
                {format(date, 'EEEE d/M', { locale: sv })}
            </p>

            {mealPlanItem && (recipe || mealPlanItem.isFreeText) ? (
                /* Filled meal slot */
                <button
                    onClick={() => setIsActionMenuOpen(true)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-action-primary/25 bg-action-soft hover:border-action-primary hover:bg-surface-selected transition-all duration-200 active:scale-[0.99] text-left"
                >
                    <div className="h-10 w-10 min-w-[40px] rounded-lg bg-surface-raised overflow-hidden flex-shrink-0 border border-border-subtle">
                        {recipe?.imageUrl ? (
                            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                                {mealPlanItem.isFreeText ? '📝' : '🍲'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm leading-snug truncate">
                            {mealPlanItem.isFreeText ? mealPlanItem.freeText : recipe?.title}
                        </p>
                        {!mealPlanItem.isFreeText && (
                            <p className="text-xs text-text-muted mt-0.5">{mealPlanItem.adjustedPortions} portioner</p>
                        )}
                    </div>
                    <span className="text-text-muted text-xs flex-shrink-0">›</span>
                </button>
            ) : (
                /* Empty slot */
                freeTextDraft !== null ? (
                    <form onSubmit={(event) => void handleAddFreeText(event)} className="space-y-2">
                        <label htmlFor={`free-text-${format(date, 'yyyy-MM-dd')}`} className="block text-sm font-medium text-text-secondary">
                            Vad vill du äta?
                        </label>
                        <input
                            id={`free-text-${format(date, 'yyyy-MM-dd')}`}
                            type="text"
                            value={freeTextDraft}
                            onChange={(event) => setFreeTextDraft(event.target.value)}
                            placeholder="T.ex. Pannkakor eller utemat"
                            className="ui-input w-full px-3 py-2 text-base"
                            autoFocus
                        />
                        {freeTextError && <p role="alert" className="text-sm text-danger">{freeTextError}</p>}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => { setFreeTextDraft(null); setFreeTextError(null); }}
                                disabled={isSavingFreeText}
                                className="ui-button ui-button-secondary flex-1 text-sm"
                            >
                                Avbryt
                            </button>
                            <button
                                type="submit"
                                disabled={!freeTextDraft.trim() || isSavingFreeText}
                                className="ui-button ui-button-primary flex-1 text-sm"
                            >
                                {isSavingFreeText ? 'Sparar…' : 'Spara middag'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="ui-button ui-button-ghost border border-dashed border-border-strong flex-1 text-xs hover:border-action-primary hover:text-action-primary"
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>Välj recept</span>
                        </button>
                        <button
                            onClick={() => { setFreeTextDraft(''); setFreeTextError(null); }}
                            className="ui-button ui-button-ghost border border-dashed border-border-strong flex-1 text-xs"
                        >
                            <Type className="w-3.5 h-3.5" />
                            <span>Fritext</span>
                        </button>
                    </div>
                )
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
