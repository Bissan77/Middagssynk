import { useMemo, useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useStore } from '../../../core/store/useStore';
import DayCard from '../components/DayCard';
import { Sparkles, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import AIPreferencesModal from '../components/AIPreferencesModal';
import AISuggestionModal from '../components/AISuggestionModal';
import { generateAIRecipes } from '../services/ai';
import type { Recipe, AIPreferences } from '../../../core/types';
import { DINNER_WEEK_STARTS_ON } from '../lib/week';

export default function MealPlan() {
    const mealPlan = useStore(state => state.mealPlan);
    const recipes = useStore(state => state.recipes);
    const addMealPlanItem = useStore(state => state.addMealPlanItem);
    // NYTT: Vi måste kunna spara AI:ns recept till din bank, inte bara till kalendern!
    const addRecipe = useStore(state => state.addRecipe); 
    const generateShoppingListFn = useStore(state => state.generateShoppingList);

    const [weekOffset, setWeekOffset] = useState(0);
    const [modalStage, setModalStage] = useState<'closed' | 'prefs' | 'results'>('closed');
    const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
    const [isAILoading, setIsAILoading] = useState(false);

    const weekStart = useMemo(
        () => addDays(startOfWeek(new Date(), { weekStartsOn: DINNER_WEEK_STARTS_ON }), weekOffset * 7),
        [weekOffset]
    );
    const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

    const handleOpenPrefs = () => setModalStage('prefs');
    const handleCloseAll = () => { setModalStage('closed'); setAiRecipes([]); };

    const handleGenerate = async (prefs: AIPreferences) => {
        setModalStage('results');
        setIsAILoading(true);
        try {
            const generatedRecipes = await generateAIRecipes(prefs);
            setAiRecipes(generatedRecipes);
        } catch {
            alert('Kunde inte hämta AI-recept. Försök igen.');
            setModalStage('prefs');
        } finally {
            setIsAILoading(false);
        }
    };

    // FIXAD: Nu sparar vi faktiskt receptet innan vi lägger det i kalendern
    const handleAssignAIRecipe = (recipe: Recipe, dateStr: string) => {
        // 1. Kolla om receptet redan finns i banken (om du klickar på samma flera gånger)
        const recipeExists = recipes.some(r => r.id === recipe.id);
        
        // 2. Om det är nytt, spara ner det i din lokala receptbank!
        if (!recipeExists) {
            addRecipe(recipe);
        }

        // 3. Lägg in det på valt datum i kalendern
        addMealPlanItem({
            id: `mp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            date: dateStr,
            recipeId: recipe.id,
            adjustedPortions: recipe.portions
        });
    };

    const handleGenerateShoppingList = () => {
        generateShoppingListFn();
    };

    return (
        <div className="app-page min-h-screen">
            <header className="mb-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Matsedel</h1>
                    <button
                        onClick={handleOpenPrefs}
                        className="ui-icon-button bg-action-soft text-action-primary active:scale-95"
                        aria-label="Föreslå hela veckan"
                    >
                        <Sparkles className="w-4 h-4" />
                    </button>
                </div>

                {/* Week nav */}
                <div className="ui-card flex items-center justify-between p-1.5">
                    <button
                        onClick={() => setWeekOffset(prev => prev - 1)}
                        className="ui-icon-button"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <p className="font-semibold text-text-primary text-sm capitalize">
                            {format(weekDays[0], 'MMMM', { locale: sv })}
                        </p>
                        <p className="text-[10px] font-bold text-action-primary uppercase tracking-wider">
                            Vecka {format(weekStart, 'w', { locale: sv })}
                            {weekOffset === 0 && <span className="ml-1 text-text-muted font-medium normal-case">(nuv.)</span>}
                        </p>
                    </div>
                    <button
                        onClick={() => setWeekOffset(prev => prev + 1)}
                        className="ui-icon-button"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Day cards */}
            <div className="mb-28">
                {weekDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayPlan = mealPlan.find(m => 
                        m.date === dateStr && (m.isFreeText || recipes.some(r => r.id === m.recipeId))
                    );
                    
                    return <DayCard key={dateStr} date={day} mealPlanItem={dayPlan} />;
                })}
            </div>

            {/* Generate shopping list button */}
            <div className="fixed bottom-16 left-0 z-40 w-full bg-gradient-to-t from-surface-canvas via-surface-canvas/80 to-transparent px-4 pb-2 pt-6 md:left-1/2 md:max-w-2xl md:-translate-x-1/2">
                <button
                    onClick={handleGenerateShoppingList}
                    className="ui-button ui-button-primary w-full active:scale-[0.99]"
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Generera inköpslista</span>
                </button>
            </div>

            {modalStage === 'prefs' && (
                <AIPreferencesModal
                    onClose={handleCloseAll}
                    onGenerate={handleGenerate}
                    isLoading={isAILoading}
                />
            )}

            {modalStage === 'results' && (
                <AISuggestionModal
                    recipes={aiRecipes}
                    onClose={handleCloseAll}
                    onAddRecipe={handleAssignAIRecipe} // FIXAD: Matchar nu props i modalen!
                />
            )}
        </div>
    );
}
