import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Minus, Trash2, ArrowLeft, Save, PlusCircle } from 'lucide-react';
import type { Recipe, Ingredient, Unit } from '../types';
import { useStore } from '../store/useStore';

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
    <div className="min-h-screen bg-white z-50 absolute top-0 left-0 w-full h-full">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <button 
          type="button"
          onClick={onCancel} 
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">Skapa Recept</h2>
        <button 
          onClick={handleSubmit}
          disabled={!title.trim() || ingredients.every(i => !i.name.trim())}
          className="flex items-center text-sm font-bold text-accent-dark disabled:opacity-50 transition-opacity"
        >
          Spara
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-28 max-w-2xl mx-auto">
        
        {/* Basic Info */}
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Titel</label>
            <input 
              type="text" 
              required
              placeholder="T.ex. Lasagne"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Portioner (standard)</label>
            <div className="flex items-center space-x-4 bg-gray-50 w-max rounded-xl p-1 border border-gray-200">
              <button 
                type="button"
                onClick={() => setPortions(Math.max(1, portions - 1))}
                className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-accent-dark transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="font-bold text-lg w-8 text-center">{portions}</span>
              <button 
                type="button"
                onClick={() => setPortions(portions + 1)}
                className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-accent-dark transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Taggar (Tryck Enter)</label>
            <input 
              type="text" 
              placeholder="T.ex. Vegetariskt, Snabbt"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              onKeyDown={handleAddTag}
              onBlur={handleAddTag}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-base"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent-dark rounded-full text-sm font-medium flex items-center">
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
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-lg font-bold text-gray-900">Ingredienser</h3>
          </div>
          
          <div className="space-y-3">
            {ingredients.map((ing) => (
              <div key={ing.id} className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 relative group">
                <input 
                  type="text"
                  required
                  placeholder="Namn, t.ex. Mjölk"
                  value={ing.name}
                  onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
                  className="flex-1 min-w-[120px] bg-white border border-gray-200 rounded-lg py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                />
                
                <input 
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Mängd"
                  value={ing.amount === 0 ? '' : ing.amount}
                  onChange={e => updateIngredient(ing.id, 'amount', parseFloat(e.target.value) || 0)}
                  className="w-20 bg-white border border-gray-200 rounded-lg py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-center"
                />
                
                <select 
                  value={ing.unit}
                  onChange={e => updateIngredient(ing.id, 'unit', e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg py-2 px-1 text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                >
                  {COMMON_UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>

                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2 py-2.5 rounded-lg whitespace-nowrap cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox"
                    checked={ing.isStaple}
                    onChange={e => updateIngredient(ing.id, 'isStaple', e.target.checked)}
                    className="rounded text-accent focus:ring-accent/50 w-4 h-4 cursor-pointer"
                  />
                  <span>Basvara</span>
                </label>

                {ingredients.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeIngredient(ing.id)}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors absolute -right-2 -top-2 bg-white shadow-sm border border-red-100 opacity-0 group-hover:opacity-100 md:opacity-100"
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
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-accent hover:text-accent-dark transition-colors flex items-center justify-center space-x-2 bg-gray-50/50"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Lägg till ingrediens</span>
          </button>
        </section>

        {/* Instructions */}
        <section className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Gör så här</label>
            <textarea 
              rows={6}
              placeholder="1. Hacka löken...&#10;2. Stek på medelvärme...&#10;3. Koka pastan enl. anvisning..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all leading-relaxed resize-none text-base"
            />
          </div>
        </section>

        <button 
          type="submit"
          className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-4 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-3 transition-colors active:scale-[0.98]"
        >
          <Save className="w-5 h-5" />
          <span>Spara Recept</span>
        </button>

      </form>
    </div>
  );
}
