import { useState, useEffect } from 'react';
import { X, Users, Plus, Minus, Trash2 } from 'lucide-react';
import type { Recipe } from '../types';
import { useStore } from '../store/useStore';

interface RecipeDetailsModalProps {
    recipe: Recipe;
    onClose: () => void;
}

export default function RecipeDetailsModal({ recipe, onClose }: RecipeDetailsModalProps) {
    const deleteRecipe = useStore(state => state.deleteRecipe);
    const [currentPortions, setCurrentPortions] = useState(recipe.portions);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const steps = recipe.instructions
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

    const handleUpdatePortions = (delta: number) => {
        if (currentPortions + delta > 0) {
            setCurrentPortions(prev => prev + delta);
        }
    };

    const handleDelete = () => {
        if (window.confirm("Är du säker på att du vill radera receptet helt?")) {
            deleteRecipe(recipe.id);
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4 overflow-hidden"
            onClick={onClose}
        >
            <div 
                className="bg-stone-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[80vh] overflow-y-auto overscroll-contain border border-stone-700/40"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Hero */}
                <div className="relative h-44 sm:h-52 flex-shrink-0 bg-stone-800 overflow-hidden">
                    {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-7xl opacity-30">🍲</span>
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-stone-900 to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 bg-stone-900/70 backdrop-blur-sm text-stone-300 hover:text-stone-100 rounded-lg transition-all duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-4 pb-32">
                    <h1 className="text-xl font-bold text-stone-100 tracking-tight mt-3 mb0.5-sm leading-snug">
                        {recipe.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-4">
                        <div className="flex items-center gap-3 bg-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-700/60">
                            <button 
                                onClick={() => handleUpdatePortions(-1)} 
                                className="p-0.5 hover:bg-stone-700 rounded text-stone-400 transition-all duration-200"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-accent-light" />
                                <span className="font-bold text-stone-100 text-sm w-4 text-center">{currentPortions}</span>
                            </div>
                            <button 
                                onClick={() => handleUpdatePortions(1)} 
                                className="p-0.5 hover:bg-stone-700 rounded text-stone-400 transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                            {recipe.tags.map(tag => (
                                <span key={tag} className="px-2.5 py-1 bg-stone-800 text-stone-400 rounded-lg text-[10px] font-semibold border border-stone-700 uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Ingredients */}
                    <section className="mb-5">
                        <h2 className="text-sm font-bold text-stone-200 mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-accent rounded-full" />
                            Ingredienser
                        </h2>
                        <div className="bg-stone-800 rounded-xl border border-stone-700/40 overflow-hidden divide-y divide-stone-700/30">
                            {recipe.ingredients.map((ing, idx) => {
                                const scaledAmount = Math.round((ing.amount * (currentPortions / recipe.portions)) * 10) / 10;
                                return (
                                    <div key={ing.id ?? idx} className="flex items-center justify-between px-3 py-2.5">
                                        <span className="text-stone-200 text-sm">{ing.name}</span>
                                        <span className="text-stone-500 text-xs font-semibold ml-3 flex-shrink-0 bg-stone-700/50 px-2 py-0.5 rounded">
                                            {scaledAmount} {ing.unit}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Instructions */}
                    <section>
                        <h2 className="text-sm font-bold text-stone-200 mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-accent rounded-full" />
                            Gör så här
                        </h2>
                        <div className="space-y-2.5">
                            {steps.map((step, idx) => {
                                const content = step.replace(/^\d+\.\s*/, '');
                                return (
                                    <div key={idx} className="flex items-start gap-2.5">
                                        <div className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent-light rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                            {idx + 1}
                                        </div>
                                        <p className="text-stone-400 text-sm leading-relaxed flex-1 pt-0.5">{content}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Danger zone */}
                    <div className="mt-10 pt-6 border-t border-stone-800/60">
                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center justify-center gap-2 p-3 text-red-500/60 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all duration-200 text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Radera recept helt</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
