import { useState, useMemo, useEffect } from 'react';
import type { MealPlanItem, Recipe } from '../../../core/types';
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
                className="ui-sheet w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-y-auto overscroll-contain flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                    <h2 className="text-base font-semibold text-text-primary">
                        {mode === 'move' ? 'Välj ny dag' : 'Hantera måltid'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="ui-icon-button h-8 w-8"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-4 pt-4 pb-32">
                    <div className="flex items-center mb-4 gap-3">
                        <div className="h-10 w-10 min-w-[40px] rounded-lg bg-surface-sunken overflow-hidden flex-shrink-0 border border-border-subtle">
                            {recipe?.imageUrl ? (
                                <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-surface-sunken flex items-center justify-center text-lg">
                                    {mealPlanItem.isFreeText ? '📝' : '🍲'}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-text-primary text-sm leading-snug">
                                {mealPlanItem.isFreeText ? mealPlanItem.freeText : recipe?.title}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5 capitalize">
                                {format(currentDate, 'EEEE d/M', { locale: sv })}
                            </p>
                        </div>
                    </div>

                    {mode === 'menu' ? (
                        <div className="space-y-3">
                            {!mealPlanItem.isFreeText && (
                                <div className="flex items-center justify-between p-3 bg-surface-sunken rounded-lg border border-border-subtle mb-2">
                                    <span className="font-medium text-text-secondary text-sm">Portioner</span>
                                    <div className="flex items-center gap-3 bg-surface-raised px-2.5 py-1.5 rounded-lg border border-border-strong">
                                        <button onClick={() => onUpdatePortions(-1)} className="ui-icon-button h-6 w-6">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold w-5 text-center text-text-primary">{mealPlanItem.adjustedPortions}</span>
                                        <button onClick={() => onUpdatePortions(1)} className="ui-icon-button h-6 w-6">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {recipe && onViewRecipe && (
                                <button
                                    onClick={() => { onClose(); onViewRecipe(); }}
                                    className="ui-button ui-button-secondary w-full justify-start"
                                >
                                    <BookOpen className="w-4 h-4 text-action-primary" />
                                    <span className="text-sm">Visa recept</span>
                                </button>
                            )}

                            <button
                                onClick={() => setMode('move')}
                                className="ui-button ui-button-secondary w-full justify-start"
                            >
                                <Move className="w-4 h-4 text-action-primary" />
                                <span className="text-sm">Flytta / Byt dag</span>
                            </button>

                            <button
                                onClick={() => { 
                                    console.log('Clearing day:', mealPlanItem.id);
                                    onRemove(); 
                                    onClose(); 
                                }}
                                className="ui-button ui-button-danger w-full mt-6"
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
                                                ? 'bg-surface-sunken border-border-subtle opacity-30 cursor-not-allowed'
                                                : 'bg-surface-raised border-border-subtle hover:border-action-primary hover:bg-surface-selected'
                                        }`}
                                    >
                                        <span className={`font-medium capitalize ${isCurrent ? 'text-text-muted' : 'text-text-primary'}`}>
                                            {format(day, 'EEEE', { locale: sv })}
                                        </span>
                                        <span className="text-xs text-text-muted">
                                            {format(day, 'd MMM', { locale: sv })}
                                        </span>
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setMode('menu')}
                                className="ui-button ui-button-ghost w-full mt-1"
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
