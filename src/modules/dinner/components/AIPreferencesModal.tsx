import { useState, useEffect } from 'react';
import { X, Zap, PiggyBank, Flag, Utensils, TextCursorInput, Sparkles } from 'lucide-react';
import type { AIPreferences } from '../../../core/types';

interface AIPreferencesModalProps {
  onClose: () => void;
  onGenerate: (prefs: AIPreferences) => void;
  isLoading: boolean;
}

const CUISINES = [
  { id: 'blandat', name: 'Blandat', emoji: '🌍' },
  { id: 'italiensk', name: 'Italienskt', emoji: '🇮🇹' },
  { id: 'asiatisk', name: 'Asiatiskt', emoji: '🥢' },
  { id: 'mexikansk', name: 'Mexikanskt', emoji: '🌮' },
  { id: 'indisk', name: 'Indiskt', emoji: '🍛' },
  { id: 'nordisk', name: 'Nordiskt', emoji: '🐟' },
];

export default function AIPreferencesModal({ onClose, onGenerate, isLoading }: AIPreferencesModalProps) {
  const [prefs, setPrefs] = useState({ quick: false, budget: false, swedish: false });
  const [selectedCuisine, setSelectedCuisine] = useState('blandat');
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleGenerate = () => {
    onGenerate({
      ...prefs,
      cuisine: selectedCuisine !== 'blandat' ? selectedCuisine : undefined,
      customPrompt: customPrompt.trim() || undefined,
    });
  };

  const PreferenceButton = ({ icon: Icon, label, description, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-4 rounded-xl border transition-all duration-200 ${
        active ? 'bg-action-soft border-action-primary text-action-primary shadow-card' : 'bg-surface-raised border-border-subtle text-text-primary hover:border-border-strong'
      }`}
    >
      <div className={`p-2 rounded-lg mr-4 ${active ? 'bg-action-soft' : 'bg-surface-sunken'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-action-primary' : 'text-text-muted'}`} />
      </div>
      <div className="text-left">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="ui-sheet relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex-none px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Matinspiration</h2>
            <p className="text-xs text-text-secondary">Anpassa din veckas matsedel</p>
          </div>
          <button onClick={onClose} className="ui-icon-button rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollbart innehåll */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-8">
          <section>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 pl-1">Vardagsmat – Preferenser</h3>
            <div className="space-y-3">
              <PreferenceButton icon={Zap} label="Snabbt" description="Max 30 minuter från kyl till bord" active={prefs.quick} onClick={() => setPrefs(p => ({ ...p, quick: !p.quick }))} />
              <PreferenceButton icon={PiggyBank} label="Budget" description="Billiga och mättande råvaror" active={prefs.budget} onClick={() => setPrefs(p => ({ ...p, budget: !p.budget }))} />
              <PreferenceButton icon={Flag} label="Husman" description="Klassiska svenska vardagsrätter" active={prefs.swedish} onClick={() => setPrefs(p => ({ ...p, swedish: !p.swedish }))} />
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-4 pl-1">
              {/* 🔥 ANVÄNDER UTENSILS HÄR */}
              <Utensils className="w-4 h-4 text-text-muted" />
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Världens Kök</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CUISINES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCuisine(c.id)}
                  className={`flex items-center space-x-3 p-3.5 rounded-xl border text-sm font-medium transition-all ${
                    selectedCuisine === c.id ? 'bg-action-soft border-action-primary text-action-primary shadow-card' : 'bg-surface-raised border-border-subtle text-text-secondary hover:border-border-strong'
                  }`}
                >
                  <span className="text-lg">{c.emoji}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="pb-8">
            <div className="flex items-center space-x-2 mb-4 pl-1">
              {/* 🔥 ANVÄNDER TEXTCURSORINPUT HÄR */}
              <TextCursorInput className="w-4 h-4 text-text-muted" />
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Egna önskemål</h3>
            </div>
            <div className="bg-surface-raised border border-border-subtle rounded-xl p-1.5 focus-within:border-focus transition-all">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ex: Grekisk grillvecka, fräscha sallader..."
                rows={3}
                className="w-full bg-transparent p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none leading-relaxed"
                maxLength={200}
              />
              <div className="text-right text-[10px] text-text-muted pr-2 pb-1">
                {customPrompt.length}/200
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex-none p-4 bg-surface-raised border-t border-border-subtle">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`w-full flex items-center justify-center p-4 rounded-2xl font-bold transition-all active:scale-95 ${
              isLoading ? 'bg-surface-sunken text-text-muted cursor-not-allowed' : 'ui-button-primary'
            }`}
          >
            {isLoading ? (
              <><Zap className="w-5 h-5 animate-pulse mr-2.5" /> Skriver recept...</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-2.5" /> Generera matsedel</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
