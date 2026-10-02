import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Minus, Trash2, ArrowLeft, Save, PlusCircle } from 'lucide-react';
import type { Recipe, Ingredient, Unit } from '../../../core/types';
import { useStore } from '../../../core/store/useStore';

interface RecipeFormProps {
  onCancel: () => void;
  onSave: () => void;
}

const COMMON_UNITS: Unit[] = ['g', 'kg', 'ml', 'dl', 'l', 'st', 'msk', 'tsk', 'krm', 'förp', 'klyfta'];

export default function RecipeForm({ onCancel, onSave }: RecipeFormProps) {
  const addRecipe = useStore(state => state.addRecipe);

  const [title, setTitle] = useState('');
  const [portions, setPortions] = useState(4);
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{
    id: uuidv4(),
    name: '',
    amount: 1,
    unit: 'st',
    isStaple: false,
    category: 'Övrigt'
  }]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter' && (e as React.KeyboardEvent).key !== ',') {
      return;
    }
    e.preventDefault();
    const newTag = tagsInput.trim().replace(',', '');
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagsInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const addIngredient = () => {
    setIngredients([...ingredients, {
      id: uuidv4(),
      name: '',
      amount: 1,
      unit: 'st',
      isStaple: false,
      category: 'Övrigt' // Default placeholder, will be customized in a real app or left generic
    }]);
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    }
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty ingredients
    const validIngredients = ingredients.filter(ing => ing.name.trim() !== '');

    const newRecipe: Recipe = {
      id: `r-${Date.now()}`,
      title,
      portions,
      tags,
      ingredients: validIngredients,
      instructions
    };

    addRecipe(newRecipe);
    onSave();
  };

  return (
    <div className="min-h-screen bg-surface-canvas z-50 absolute top-0 left-0 w-full h-full">
      <div className="sticky top-0 bg-surface-raised/80 backdrop-blur-md z-10 px-4 py-4 border-b border-border-subtle flex items-center justify-between">
        <button 
          type="button"
          onClick={onCancel} 
          className="ui-icon-button -ml-2 text-text-secondary"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-text-primary">Skapa Recept</h2>
        <button 
          onClick={handleSubmit}
          disabled={!title.trim() || ingredients.every(i => !i.name.trim())}
          className="flex items-center text-sm font-bold text-action-primary disabled:opacity-50 transition-opacity"
        >
          Spara
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-28 max-w-2xl mx-auto">
        
        {/* Basic Info */}
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Titel</label>
            <input 
              type="text" 
              required
              placeholder="T.ex. Lasagne"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="ui-input py-3 px-4 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Portioner (standard)</label>
            <div className="flex items-center space-x-4 bg-surface-sunken w-max rounded-xl p-1 border border-border-subtle">
              <button 
                type="button"
                onClick={() => setPortions(Math.max(1, portions - 1))}
                className="ui-icon-button bg-surface-raised shadow-card text-text-secondary"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="font-bold text-lg w-8 text-center">{portions}</span>
              <button 
                type="button"
                onClick={() => setPortions(portions + 1)}
                className="ui-icon-button bg-surface-raised shadow-card text-text-secondary"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Taggar (Tryck Enter)</label>
            <input 
              type="text" 
              placeholder="T.ex. Vegetariskt, Snabbt"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              onKeyDown={handleAddTag}
              onBlur={handleAddTag}
              className="ui-input py-3 px-4 text-base"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-action-soft border border-action-primary/20 text-action-primary rounded-full text-sm font-medium flex items-center">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 focus:outline-none opacity-60 hover:opacity-100">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Ingredients */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <h3 className="text-lg font-bold text-text-primary">Ingredienser</h3>
          </div>
          
          <div className="space-y-3">
            {ingredients.map((ing) => (
              <div key={ing.id} className="flex flex-wrap items-center gap-2 bg-surface-sunken p-3 rounded-xl border border-border-subtle relative group">
                <input 
                  type="text"
                  required
                  placeholder="Namn, t.ex. Mjölk"
                  value={ing.name}
                  onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
                  className="ui-input flex-1 min-w-[120px] py-2 px-3 text-base"
                />
                
                <input 
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Mängd"
                  value={ing.amount === 0 ? '' : ing.amount}
                  onChange={e => updateIngredient(ing.id, 'amount', parseFloat(e.target.value) || 0)}
                  className="ui-input w-20 py-2 px-3 text-base text-center"
                />
                
                <select 
                  value={ing.unit}
                  onChange={e => updateIngredient(ing.id, 'unit', e.target.value)}
                  className="ui-input w-auto py-2 px-1 text-base"
                >
                  {COMMON_UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>

                <label className="flex items-center space-x-2 text-xs font-semibold text-text-secondary bg-surface-raised border border-border-subtle px-2 py-2.5 rounded-lg whitespace-nowrap cursor-pointer hover:bg-surface-sunken">
                  <input 
                    type="checkbox"
                    checked={ing.isStaple}
                    onChange={e => updateIngredient(ing.id, 'isStaple', e.target.checked)}
                    className="rounded text-action-primary focus:ring-action-primary/50 w-4 h-4 cursor-pointer"
                  />
                  <span>Basvara</span>
                </label>

                {ingredients.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeIngredient(ing.id)}
                    className="ui-icon-button p-2 text-danger hover:text-danger-hover hover:bg-danger-soft absolute -right-2 -top-2 bg-surface-raised shadow-card border border-danger-soft opacity-0 group-hover:opacity-100 md:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button 
            type="button"
            onClick={addIngredient}
            className="ui-button ui-button-ghost w-full border-2 border-dashed border-border-strong hover:border-action-primary hover:text-action-primary"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Lägg till ingrediens</span>
          </button>
        </section>

        {/* Instructions */}
        <section className="space-y-4 pt-4 border-t border-border-subtle">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Gör så här</label>
            <textarea 
              rows={6}
              placeholder="1. Hacka löken...&#10;2. Stek på medelvärme...&#10;3. Koka pastan enl. anvisning..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="ui-input py-3 px-4 leading-relaxed resize-none text-base"
            />
          </div>
        </section>

        <button 
          type="submit"
          className="ui-button ui-button-primary w-full py-4 shadow-card active:scale-[0.98]"
        >
          <Save className="w-5 h-5" />
          <span>Spara Recept</span>
        </button>

      </form>
    </div>
  );
}
