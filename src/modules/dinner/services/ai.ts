import type { AIPreferences, Recipe } from '../../../core/types';
import { useStore } from '../../../core/store/useStore';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

async function callGemini(prompt: string) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json",
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.candidates[0].content.parts[0].text;
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini API failed:", error);
        throw error;
    }
}

export async function generateAIRecipes(prefs: AIPreferences): Promise<Recipe[]> {
    const today = new Date();
    const months = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
    const currentMonth = months[today.getMonth()];

    const storeState = useStore.getState();
    const mealPlan = storeState.mealPlan;
    const recipes = storeState.recipes;
    
    const recentMealNames = mealPlan
        .slice(-14)
        .map(mp => {
            const r = recipes.find(r => r.id === mp.recipeId);
            return r ? r.title : (mp as any).title || (mp as any).name || (mp as any).freeText || null;
        })
        .filter(Boolean)
        .join(', ');

    let prompt = `Du är en expertkock som skapar en veckomatsedel (7 unika middagar). 
Svara ENBART med en giltig JSON-array. Inget markdown.
Det är just nu ${currentMonth}.
`;

    if (recentMealNames) {
        prompt += `HISTORIK: Användaren har nyligen ätit: ${recentMealNames}. Repetera INTE dessa.\n`;
    }

    prompt += `PREFERENSER: Snabbt: ${prefs.quick}, Budget: ${prefs.budget}, Husman: ${prefs.swedish}, Kök: ${prefs.cuisine || 'Blandat'}.\n`;

    if (prefs.customPrompt) {
        prompt += `ÖNSKEMÅL: "${prefs.customPrompt}"\n`;
    }

    prompt += `STRUKTUR: [{"title": "Namn", "portions": 4, "ingredients": [{"name": "Råvara", "amount": 2, "unit": "st", "category": "Kategori", "isStaple": false}], "instructions": "Steg...", "tags": ["Tag"]}]`;

    const rawRecipes = await callGemini(prompt);

    return rawRecipes.map((recipe: any) => ({
        ...recipe,
        id: `ai-rec-${crypto.randomUUID()}`,
        cookingTime: recipe.cookingTime || 30,
        tags: recipe.tags || [],
        ingredients: recipe.ingredients.map((ing: any) => ({
            ...ing,
            id: `ai-ing-${crypto.randomUUID()}`
        }))
    })) as Recipe[];
}

export async function importRecipeFromUrl(url: string): Promise<Recipe> {
    const prompt = `Extrahera recept från URL: ${url}. Svara ENBART med JSON.`;
    const rawRecipe = await callGemini(prompt);

    return {
        ...rawRecipe,
        id: `url-rec-${crypto.randomUUID()}`,
        cookingTime: rawRecipe.cookingTime || 30,
        tags: rawRecipe.tags || [],
        ingredients: rawRecipe.ingredients.map((ing: any) => ({
            ...ing,
            id: `url-ing-${crypto.randomUUID()}`
        }))
    } as Recipe;
}

// FIX: Nu accepterar vi både en sträng OCH en array för ingredienser
export async function generateZeroWasteRecipe(_isDone: boolean, ingredients: string | string[]): Promise<Recipe> {
    // Om det är en array, gör om till text. Annars använd texten direkt.
    const ingredientsText = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients;
    
    const prompt = `Skapa ETT recept baserat på: ${ingredientsText}. Svara ENBART med JSON.`;
    const rawRecipe = await callGemini(prompt);

    return {
        ...rawRecipe,
        id: `zw-rec-${crypto.randomUUID()}`,
        cookingTime: rawRecipe.cookingTime || 30,
        tags: rawRecipe.tags || ["Zero Waste"],
        ingredients: rawRecipe.ingredients.map((ing: any) => ({
            ...ing,
            id: `zw-ing-${crypto.randomUUID()}`
        }))
    } as Recipe;
}
