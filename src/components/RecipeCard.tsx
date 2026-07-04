import { Users } from 'lucide-react';
import type { Recipe } from '../types';

interface RecipeCardProps {
    recipe: Recipe;
    onClick?: () => void;
    highlight?: boolean;
}

export default function RecipeCard({ recipe, onClick, highlight }: RecipeCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-stone-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.97] border ${
                highlight
                    ? 'border-accent ring-1 ring-accent/30'
                    : 'border-stone-700/60 hover:border-stone-600'
            }`}
        >
            {/* Image */}
            <div className="h-28 w-full relative overflow-hidden">
                {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-stone-700/60 flex items-center justify-center">
                        <span className="text-3xl opacity-50">🍲</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="font-semibold text-stone-100 mb-1.5 text-sm leading-snug line-clamp-2 min-h-[2.4rem]">
                    {recipe.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2">
                    <Users className="w-3 h-3" />
                    <span>{recipe.portions} port</span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {recipe.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-accent/10 text-accent-light rounded text-[9px] uppercase font-bold tracking-wide">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
