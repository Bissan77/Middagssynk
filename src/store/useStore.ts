import { create } from 'zustand';
import type { Recipe, MealPlanItem, ShoppingListItem } from '../types';
import { categorizeItem, type GroceryCategory } from '../data/groceries';
import { db } from '../firebase';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';

const recipesCol = () => collection(db, 'recipes');
const mealPlanCol = () => collection(db, 'mealPlan');
const shoppingListCol = () => collection(db, 'shoppingList');

type HouseholdScoped<T> = T & { householdId?: string };

const requireHouseholdId = (householdId: string | null) => {
    if (!householdId) {
        throw new Error('Inget householdId hittades.');
    }
    return householdId;
};

const belongsToHousehold = <T>(item: T, householdId: string) =>
    (item as HouseholdScoped<T>).householdId === householdId;

const resolveMealPlanDoc = async (id: string, householdId: string) => {
    const directRef = doc(mealPlanCol(), id);
    const directSnap = await getDoc(directRef);

    if (directSnap.exists()) {
        const data = directSnap.data() as HouseholdScoped<MealPlanItem>;
        if (data.householdId === householdId) return directRef;
    }

    const householdSnap = await getDocs(query(mealPlanCol(), where('householdId', '==', householdId)));
    const householdMatch = householdSnap.docs.find(d => {
        const data = d.data() as Partial<MealPlanItem>;
        return d.id === id || data.id === id;
    });

    if (!householdMatch) {
        throw new Error('Matsedelsraden hittades inte i hushallet.');
    }

    return householdMatch.ref;
};

interface AppState {
    householdId: string | null;
    inviteCode: string | null;
    categoryOverrides: Record<string, GroceryCategory>;
    recipes: Recipe[];
    mealPlan: MealPlanItem[];
    shoppingList: ShoppingListItem[];
    isLoaded: boolean;

    _setHouseholdId: (id: string) => void;
    _setInviteCode: (code: string | null) => void;
    _setCategoryOverrides: (overrides: Record<string, GroceryCategory>) => void;
    _setRecipes: (recipes: Recipe[]) => void;
    _setMealPlan: (mealPlan: MealPlanItem[]) => void;
    _setShoppingList: (shoppingList: ShoppingListItem[]) => void;
    _setLoaded: () => void;

    addRecipe: (recipe: Recipe) => Promise<void>;
    updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
    deleteRecipe: (id: string) => void;

    addMealPlanItem: (item: MealPlanItem) => Promise<void>;
    updateMealPlanItem: (id: string, item: Partial<MealPlanItem>) => Promise<void>;
    removeMealPlanItem: (id: string) => Promise<void>;
    moveMealPlanItem: (id: string, newDate: string) => Promise<void>;

    generateShoppingList: () => Promise<void>;
    toggleShoppingListItem: (id: string) => void;
    clearCheckedItems: () => Promise<void>;
    clearAllItems: () => Promise<void>;
    addStapleToShop: (id: string) => void;
    addManualItem: (item: Omit<ShoppingListItem, 'id' | 'isChecked' | 'isStaple'>) => Promise<void>;
    updateItemCategory: (id: string, newCategory: GroceryCategory) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    householdId: null,
    inviteCode: null,
    categoryOverrides: {},
    recipes: [],
    mealPlan: [],
    shoppingList: [],
    isLoaded: false,

    _setHouseholdId: (id) => set((state) => (
        state.householdId === id
            ? state
            : {
                householdId: id,
                recipes: [],
                mealPlan: [],
                shoppingList: [],
                inviteCode: null,
                categoryOverrides: {},
                isLoaded: false,
            }
    )),
    _setInviteCode: (code) => set({ inviteCode: code }),
    _setCategoryOverrides: (overrides) => set({ categoryOverrides: overrides }),
    _setRecipes: (recipes) => set({ recipes }),
    _setMealPlan: (mealPlan) => set({ mealPlan }),
    _setShoppingList: (shoppingList) => set({ shoppingList }),
    _setLoaded: () => set({ isLoaded: true }),

    addRecipe: async (recipe) => {
        const householdId = requireHouseholdId(get().householdId);
        const newRecipe: HouseholdScoped<Recipe> = { ...recipe, householdId };

        try {
            await setDoc(doc(recipesCol(), recipe.id), newRecipe);
            set((state) => {
                if (state.recipes.find(r => r.id === recipe.id)) return state;
                return { recipes: [...state.recipes, newRecipe] };
            });
        } catch (error) {
            console.error('Firebase vagrade spara receptet:', error);
            throw error;
        }
    },

    updateRecipe: (id, updatedRecipe) => {
        const householdId = requireHouseholdId(get().householdId);
        updateDoc(doc(recipesCol(), id), {
            ...updatedRecipe,
            householdId,
        } as Record<string, unknown>).catch(console.error);
    },

    deleteRecipe: (id) => {
        deleteDoc(doc(recipesCol(), id)).catch(console.error);
    },

    addMealPlanItem: async (item) => {
        const householdId = requireHouseholdId(get().householdId);
        const itemRef = doc(mealPlanCol());
        const newItem: HouseholdScoped<MealPlanItem> = {
            ...item,
            id: itemRef.id,
            householdId,
        };

        set((state) => {
            if (state.mealPlan.find(m => m.id === newItem.id)) return state;
            return { mealPlan: [...state.mealPlan, newItem] };
        });

        try {
            await setDoc(itemRef, newItem);
            await get().generateShoppingList();
        } catch (err) {
            console.error('Kunde inte lagga till i matsedel:', err);
            throw err;
        }
    },

    updateMealPlanItem: async (id, updatedItem) => {
        const householdId = requireHouseholdId(get().householdId);
        const itemRef = await resolveMealPlanDoc(id, householdId);
        const updatePayload: HouseholdScoped<Partial<MealPlanItem>> = {
            ...updatedItem,
            id: itemRef.id,
            householdId,
        };

        await updateDoc(itemRef, updatePayload as Record<string, unknown>);
        set((state) => ({
            mealPlan: state.mealPlan.map(item =>
                item.id === id || item.id === itemRef.id
                    ? { ...item, ...updatePayload }
                    : item
            ),
        }));
        await get().generateShoppingList();
    },

    removeMealPlanItem: async (id) => {
        try {
            const householdId = requireHouseholdId(get().householdId);
            const itemRef = await resolveMealPlanDoc(id, householdId);
            await deleteDoc(itemRef);
            set((state) => ({
                mealPlan: state.mealPlan.filter(item => item.id !== id && item.id !== itemRef.id),
            }));
            await get().generateShoppingList();
        } catch (err) {
            console.error('Failed to remove meal plan item:', err);
            throw err;
        }
    },

    moveMealPlanItem: async (id, newDate) => {
        const householdId = requireHouseholdId(get().householdId);
        const { mealPlan } = get();
        const householdMealPlan = mealPlan.filter(item => belongsToHousehold(item, householdId));
        const sourceItem = householdMealPlan.find(m => m.id === id);
        if (!sourceItem) return;

        const targetItem = householdMealPlan.find(m => m.date === newDate && m.id !== sourceItem.id);
        const sourceRef = await resolveMealPlanDoc(id, householdId);
        const targetRef = targetItem ? await resolveMealPlanDoc(targetItem.id, householdId) : null;
        const batch = writeBatch(db);

        batch.update(sourceRef, { date: newDate, id: sourceRef.id, householdId });
        if (targetItem) {
            batch.update(targetRef!, { date: sourceItem.date, id: targetRef!.id, householdId });
        }
        await batch.commit();
        set((state) => ({
            mealPlan: state.mealPlan.map(item => {
                if (item.id === id || item.id === sourceRef.id) {
                    return { ...item, id: sourceRef.id, date: newDate, householdId };
                }
                if (targetItem && (item.id === targetItem.id || item.id === targetRef!.id)) {
                    return { ...item, id: targetRef!.id, date: sourceItem.date, householdId };
                }
                return item;
            }),
        }));
    },

    generateShoppingList: async () => {
        const { householdId: storedHouseholdId, mealPlan, recipes, shoppingList, categoryOverrides } = get();
        const householdId = requireHouseholdId(storedHouseholdId);

        const householdMealPlan = mealPlan.filter(item => belongsToHousehold(item, householdId));
        const manualItems = shoppingList.filter(item => item.isManual && belongsToHousehold(item, householdId));
        const newItemsMap = new Map<string, ShoppingListItem>();

        manualItems.forEach(item => {
            const key = `man-${item.name.toLowerCase().trim()}`;
            newItemsMap.set(key, { ...item });
        });

        householdMealPlan.forEach(plan => {
            const recipe = recipes.find(r => r.id === plan.recipeId);
            if (!recipe) return;

            const multiplier = plan.adjustedPortions / recipe.portions;

            recipe.ingredients.forEach(ing => {
                const scaledAmount = Math.round((ing.amount * multiplier) * 10) / 10;
                const key = `auto-${ing.name.toLowerCase().trim()}-${ing.unit.toLowerCase().trim()}`;
                const category = categorizeItem(ing.name, categoryOverrides);

                if (newItemsMap.has(key)) {
                    const existing = newItemsMap.get(key)!;
                    const totalAmount = Math.round((existing.totalAmount + scaledAmount) * 10) / 10;
                    newItemsMap.set(key, { ...existing, totalAmount });
                } else {
                    newItemsMap.set(key, {
                        id: `sl-${crypto.randomUUID()}`,
                        name: ing.name.charAt(0).toUpperCase() + ing.name.slice(1),
                        totalAmount: scaledAmount,
                        unit: ing.unit,
                        isChecked: false,
                        isStaple: ing.isStaple,
                        category,
                        isManual: false,
                    });
                }
            });
        });

        const finalComputedList = Array.from(newItemsMap.values());

        try {
            const batch = writeBatch(db);
            const existingSnap = await getDocs(query(shoppingListCol(), where('householdId', '==', householdId)));

            existingSnap.docs.forEach(d => {
                if (!d.data().isManual) {
                    batch.delete(d.ref);
                }
            });

            finalComputedList.forEach(item => {
                if (!item.isManual) {
                    batch.set(doc(shoppingListCol(), item.id), { ...item, householdId });
                }
            });

            await batch.commit();
        } catch (err) {
            console.error('Ghost Data Cleanup Failed:', err);
            throw err;
        }
    },

    toggleShoppingListItem: (id) => {
        const householdId = requireHouseholdId(get().householdId);
        const { shoppingList } = get();
        const item = shoppingList.find(i => i.id === id && belongsToHousehold(i, householdId));
        if (!item) return;
        updateDoc(doc(shoppingListCol(), id), { isChecked: !item.isChecked }).catch(console.error);
    },

    clearCheckedItems: async () => {
        const householdId = requireHouseholdId(get().householdId);
        const { shoppingList } = get();
        const batch = writeBatch(db);
        shoppingList.filter(i => i.isChecked && belongsToHousehold(i, householdId)).forEach(i => {
            batch.delete(doc(shoppingListCol(), i.id));
        });
        await batch.commit();
    },

    clearAllItems: async () => {
        const householdId = requireHouseholdId(get().householdId);
        const snap = await getDocs(query(shoppingListCol(), where('householdId', '==', householdId)));
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
    },

    addStapleToShop: (id) => {
        const householdId = requireHouseholdId(get().householdId);
        const { shoppingList } = get();
        if (!shoppingList.some(i => i.id === id && belongsToHousehold(i, householdId))) return;
        updateDoc(doc(shoppingListCol(), id), { isStaple: false }).catch(console.error);
    },

    addManualItem: async (item) => {
        try {
            const householdId = requireHouseholdId(get().householdId);
            const itemRef = doc(shoppingListCol());
            const newItem: HouseholdScoped<ShoppingListItem> = {
                ...item,
                id: itemRef.id,
                category: categorizeItem(item.name, get().categoryOverrides),
                isChecked: false,
                isStaple: false,
                isManual: true,
                householdId,
            };
            await setDoc(itemRef, newItem);
        } catch (error) {
            console.error('Kunde inte lagga till manuell vara:', error);
            throw error;
        }
    },

    updateItemCategory: async (id, newCategory) => {
        const householdId = requireHouseholdId(get().householdId);
        const item = get().shoppingList.find(i => i.id === id && belongsToHousehold(i, householdId));
        if (!item) return;

        const normalizedName = item.name.toLowerCase().trim();
        const batch = writeBatch(db);

        batch.update(doc(shoppingListCol(), id), { category: newCategory });
        batch.update(doc(db, 'households', householdId), {
            [`categoryOverrides.${normalizedName}`]: newCategory,
        });

        await batch.commit();
    },
}));
