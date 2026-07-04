import { useState, useMemo, useEffect } from 'react';
import type { MealPlanItem, Recipe } from '../types';
import { X, Plus, Minus, Move, Trash2, BookOpen } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { sv } from 'date-fns/locale';

interface ActionMenuModalProps {
    mealPlanItem: MealPlanItem;
    recipe: Recipe | null | undefined;
    currentDate: Date;
    onClose: () => void;
    onUpdatePortions: (delta: number) => void;
    onRemove: () => void;
    onMove: (newDateStr: string) => void;
    onViewRecipe?: () => void;
}

export default function ActionMenuModal({ 
    mealPlanItem, 
    recipe, 
    currentDate,
    onClose, 
    onUpdatePortions, 
    onRemove, 
    onMove,
    onViewRecipe
}: ActionMenuModalProps) {
    const [mode, setMode] = useState<'menu' | 'move'>('menu');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Generate week days for moving
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
    }, [weekStart]);

    return (
        <div 
            className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4 overflow-hidden"
            onClick={onClose}
        >
            <div 
                className="bg-stone-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-y-auto overscroll-contain flex flex-col border border-stone-700/40 max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="px-4 py-3 border-b border-stone-700/40 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-stone-100">
                        {mode === 'move' ? 'Välj ny dag' : 'Hantera måltid'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-stone-700 text-stone-400 hover:text-stone-100 rounded-lg transition-all duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-4 pt-4 pb-32">
                    <div className="flex items-center mb-4 gap-3">
                        <div className="h-10 w-10 min-w-[40px] rounded-lg bg-stone-700 overflow-hidden flex-shrink-0 border border-stone-600/40">
                            {recipe?.imageUrl ? (
                                <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-stone-700 flex items-center justify-center text-lg">
                                    {mealPlanItem.isFreeText ? '📝' : '🍲'}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-stone-100 text-sm leading-snug">
                                {mealPlanItem.isFreeText ? mealPlanItem.freeText : recipe?.title}
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5 capitalize">
                                {format(currentDate, 'EEEE d/M', { locale: sv })}
                            </p>
                        </div>
                    </div>

                    {mode === 'menu' ? (
                        <div className="space-y-3">
                            {!mealPlanItem.isFreeText && (
                                <div className="flex items-center justify-between p-3 bg-stone-700/40 rounded-lg border border-stone-600/40 mb-2">
                                    <span className="font-medium text-stone-300 text-sm">Portioner</span>
                                    <div className="flex items-center gap-3 bg-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-600/50">
                                        <button onClick={() => onUpdatePortions(-1)} className="p-0.5 hover:bg-stone-700 rounded text-stone-400 transition-all duration-200">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold w-5 text-center text-stone-100">{mealPlanItem.adjustedPortions}</span>
                                        <button onClick={() => onUpdatePortions(1)} className="p-0.5 hover:bg-stone-700 rounded text-stone-400 transition-all duration-200">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {recipe && onViewRecipe && (
                                <button
                                    onClick={() => { onClose(); onViewRecipe(); }}
                                    className="w-full flex items-center gap-3 p-3 bg-stone-700/30 border border-stone-600/40 hover:border-accent/40 hover:bg-accent/5 rounded-lg transition-all duration-200"
                                >
                                    <BookOpen className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-medium text-stone-300">Visa recept</span>
                                </button>
                            )}

                            <button
                                onClick={() => setMode('move')}
                                className="w-full flex items-center gap-3 p-3 bg-stone-700/30 border border-stone-600/40 hover:border-accent/40 hover:bg-accent/5 rounded-lg transition-all duration-200"
                            >
                                <Move className="w-4 h-4 text-accent" />
                                <span className="text-sm font-medium text-stone-300">Flytta / Byt dag</span>
                            </button>

                            <button
                                onClick={() => { 
                                    console.log('Clearing day:', mealPlanItem.id);
                                    onRemove(); 
                                    onClose(); 
                                }}
                                className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 border-2 border-red-500/30 hover:bg-red-500/20 text-red-500 rounded-xl transition-all duration-200 font-bold text-sm mt-6 shadow-sm shadow-red-900/10 active:scale-[0.98]"
                            >
                                <Trash2 className="w-5 h-5" />
                                Töm denna dag (Ta bort)
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {weekDays.map(day => {
                                const isCurrent = isSameDay(day, currentDate);
                                const dateStr = format(day, 'yyyy-MM-dd');
                                return (
                                    <button
                                        key={dateStr}
                                        disabled={isCurrent}
                                        onClick={() => { onMove(dateStr); onClose(); }}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left text-sm ${
                                            isCurrent
                                                ? 'bg-stone-700/20 border-stone-700/30 opacity-30 cursor-not-allowed'
                                                : 'bg-stone-700/30 border-stone-600/40 hover:border-accent/40 hover:bg-accent/5'
                                        }`}
                                    >
                                        <span className={`font-medium capitalize ${isCurrent ? 'text-stone-500' : 'text-stone-200'}`}>
                                            {format(day, 'EEEE', { locale: sv })}
                                        </span>
                                        <span className="text-xs text-stone-500">
                                            {format(day, 'd MMM', { locale: sv })}
                                        </span>
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setMode('menu')}
                                className="w-full p-3 mt-1 text-stone-500 text-sm font-medium hover:text-stone-300 transition-all duration-200"
                            >
                                Tillbaka
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
