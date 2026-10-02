/** Normaliserar även äldre recept som redan sparats med ofullständiga AI-fält. */
export function normalizePortions(value: unknown): number {
    const portions = typeof value === 'number' ? value :
        typeof value === 'string' && value.trim() ? Number(value) : NaN;
    return Number.isFinite(portions) && portions > 0 ? portions : 4;
}

export function normalizeInstructions(value: unknown): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.every(step => typeof step === 'string')) {
        return value.join('\n');
    }
    throw new Error('Receptets instruktioner måste vara text eller en lista med textsteg.');
}
import type { Ingredient, Recipe } from '../../../core/types';


/** Acceptera bara ett komplett kontrakt innan importerade data sparas. */
export function normalizeImportedRecipe(value: unknown): Recipe {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Importen innehöll inget giltigt recept.');
    }
    const raw = value as Record<string, unknown>;
    if (typeof raw.title !== 'string' || !raw.title.trim()) {
        throw new Error('Receptet saknar titel.');
    }
    if (!Array.isArray(raw.ingredients) || raw.ingredients.length === 0) {
        throw new Error('Receptet saknar ingredienser.');
    }
    const ingredients: Ingredient[] = raw.ingredients.map((value, index) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new Error(`Ingrediens ${index + 1} har ogiltigt format.`);
        }
        const ingredient = value as Record<string, unknown>;
        const amount = typeof ingredient.amount === 'number' ? ingredient.amount :
            typeof ingredient.amount === 'string' && ingredient.amount.trim() ?
                Number(ingredient.amount.replace(',', '.')) : NaN;
        if (typeof ingredient.name !== 'string' || !ingredient.name.trim() ||
            !Number.isFinite(amount) || amount < 0 ||
            typeof ingredient.unit !== 'string') {
            throw new Error(`Ingrediens ${index + 1} saknar giltigt namn, mängd eller enhet.`);
        }
        return {
            id: `url-ing-${crypto.randomUUID()}`,
            name: ingredient.name.trim(),
            amount,
            unit: ingredient.unit.trim(),
            category: typeof ingredient.category === 'string' ? ingredient.category : 'Övrigt',
            isStaple: ingredient.isStaple === true,
        };
    });
    return {
        id: `url-rec-${crypto.randomUUID()}`,
        title: raw.title.trim(),
        portions: normalizePortions(raw.portions),
        instructions: normalizeInstructions(raw.instructions),
        ingredients,
        tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === 'string') : [],
        cookingTime: typeof raw.cookingTime === 'number' && Number.isFinite(raw.cookingTime) && raw.cookingTime > 0 ? raw.cookingTime : 30,
        ...(typeof raw.imageUrl === 'string' && raw.imageUrl.trim() ? { imageUrl: raw.imageUrl } : {}),
    };
}
