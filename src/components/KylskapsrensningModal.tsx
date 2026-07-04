import { useState, useEffect } from 'react';
import { X, Camera, CheckCircle2, Loader2, Leaf } from 'lucide-react';
import { generateZeroWasteRecipe } from '../services/ai';
import { useStore } from '../store/useStore';
import type { Recipe } from '../types';

interface KylskapsrensningModalProps {
    onClose: () => void;
    onRecipeGenerated: (recipe: Recipe) => void;
}

export default function KylskapsrensningModal({ onClose, onRecipeGenerated }: KylskapsrensningModalProps) {
    const addRecipe = useStore(state => state.addRecipe);
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
    const [extraIngredients, setExtraIngredients] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleScan = () => {
        setScanState('scanning');
        setTimeout(() => setScanState('done'), 1500);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const recipe = await generateZeroWasteRecipe(scanState === 'done', extraIngredients);
            addRecipe(recipe);
            onRecipeGenerated(recipe);
        } catch {
            alert('Kunde inte generera recept. Försök igen.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4 overflow-hidden"
            onClick={onClose}
        >
            <div 
                className="bg-stone-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-stone-700/40 overflow-y-auto overscroll-contain flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="px-4 py-3 border-b border-stone-700/40 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-accent/10 rounded-lg">
                            <Leaf className="w-4 h-4 text-accent-light" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-stone-100">Kylskåpsrensning</h2>
                            <p className="text-[10px] text-stone-500">AI genererar recept från dina rester</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-stone-800 text-stone-400 hover:text-stone-100 rounded-lg transition-all duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-4 pt-4 pb-32 flex flex-col gap-4">

                    {/* Camera section */}
                    <div>
                        <p className="text-xs font-medium text-stone-400 mb-2">📸 Steg 1: Scanna kylskåpet</p>

                        {scanState === 'idle' && (
                            <button
                                onClick={handleScan}
                                className="w-full bg-stone-800 border border-stone-700/60 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-stone-600 hover:bg-stone-750 transition-all duration-200 active:scale-[0.99]"
                            >
                                <div className="p-3 bg-stone-700 rounded-full">
                                    <Camera className="w-7 h-7 text-stone-300" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-stone-200 text-sm">Ta bild på kylskåpet</p>
                                    <p className="text-xs text-stone-500 mt-0.5">AI analyserar råvaror automatiskt</p>
                                </div>
                            </button>
                        )}

                        {scanState === 'scanning' && (
                            <div className="w-full bg-stone-800 border border-stone-700/40 rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                                <div className="relative w-14 h-14 flex items-center justify-center">
                                    <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" />
                                    <Camera className="w-7 h-7 text-stone-300 animate-pulse" />
                                </div>
                                <p className="text-sm font-medium text-stone-300">Analyserar bild...</p>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {scanState === 'done' && (
                            <div className="w-full bg-accent/10 border border-accent/25 rounded-xl p-3.5 flex items-center gap-3">
                                <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-stone-800 flex items-center justify-center text-3xl">
                                    🥗
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <CheckCircle2 className="w-4 h-4 text-accent-light flex-shrink-0" />
                                        <span className="text-sm font-semibold text-stone-100">Bild analyserad!</span>
                                    </div>
                                    <p className="text-xs text-stone-400">
                                        Identifierat: ägg, paprika, spenat, ost...
                                    </p>
                                    <button
                                        onClick={() => setScanState('idle')}
                                        className="mt-1.5 text-[10px] text-accent-light hover:text-accent underline"
                                    >
                                        Ta ny bild
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Text input */}
                    <div>
                        <p className="text-xs font-medium text-stone-400 mb-2">📝 Steg 2: Övriga ingredienser</p>
                        <textarea
                            value={extraIngredients}
                            onChange={e => setExtraIngredients(e.target.value)}
                            placeholder="T.ex. pasta, kokosmjölk, frysta ärtor..."
                            className="w-full bg-stone-800 border border-stone-700/60 rounded-xl py-2.5 px-3 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent transition-all duration-200 resize-none text-base h-20"
                        />
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || (scanState === 'idle' && !extraIngredients.trim())}
                        className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>AI skapar recept...</span>
                            </>
                        ) : (
                            <>
                                <Leaf className="w-4 h-4" />
                                <span>Generera recept från rester</span>
                            </>
                        )}
                    </button>

                    {scanState === 'idle' && !extraIngredients.trim() && (
                        <p className="text-center text-[11px] text-stone-600 -mt-2">
                            Ta en bild eller beskriv dina rester för att börja
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
