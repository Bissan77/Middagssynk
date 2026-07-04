/**
 * useFirestoreSync.ts
 * Sets up real-time onSnapshot listeners for household-scoped Firestore data.
 * Pushes updates into Zustand store via the internal _set* actions.
 */
import { useEffect, useRef } from 'react';
import {
    collection,
    doc,
    onSnapshot,
    query,
    where,
    type DocumentData,
    type QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';
import type { GroceryCategory } from '../data/groceries';
import type { MealPlanItem, Recipe, ShoppingListItem } from '../types';

export function useFirestoreSync(householdId: string) {
    const _setRecipes = useStore(s => s._setRecipes);
    const _setMealPlan = useStore(s => s._setMealPlan);
    const _setShoppingList = useStore(s => s._setShoppingList);
    const _setLoaded = useStore(s => s._setLoaded);

    const loadedCollections = useRef(new Set<string>());
    const markOne = (collectionName: string) => {
        loadedCollections.current.add(collectionName);
        if (loadedCollections.current.size >= 3) _setLoaded();
    };

    useEffect(() => {
        useStore.getState()._setHouseholdId(householdId);

        const snap2arr = <T>(snap: QuerySnapshot<DocumentData>) =>
            snap.docs.map(d => ({ ...d.data(), id: d.id }) as T);

        const recipesQuery = query(
            collection(db, 'recipes'),
            where('householdId', '==', householdId),
        );
        const mealPlanQuery = query(
            collection(db, 'mealPlan'),
            where('householdId', '==', householdId),
        );
        const shoppingListQuery = query(
            collection(db, 'shoppingList'),
            where('householdId', '==', householdId),
        );
        const householdDoc = doc(db, 'households', householdId);

        const unsubscribeRecipes = onSnapshot(
            recipesQuery,
            (snap) => {
                _setRecipes(snap2arr<Recipe>(snap));
                markOne('recipes');
            },
            (err) => console.error('recipes onSnapshot error:', err),
        );

        const unsubscribeMealPlan = onSnapshot(
            mealPlanQuery,
            (snap) => {
                _setMealPlan(snap2arr<MealPlanItem>(snap));
                markOne('mealPlan');
            },
            (err) => console.error('mealPlan onSnapshot error:', err),
        );

        const unsubscribeShoppingList = onSnapshot(
            shoppingListQuery,
            (snap) => {
                _setShoppingList(snap2arr<ShoppingListItem>(snap));
                markOne('shoppingList');
            },
            (err) => console.error('shoppingList onSnapshot error:', err),
        );

        const unsubscribeHousehold = onSnapshot(
            householdDoc,
            (snap) => {
                const data = snap.data();
                useStore.getState()._setInviteCode(data?.inviteCode || null);
                useStore.getState()._setCategoryOverrides(
                    (data?.categoryOverrides as Record<string, GroceryCategory>) || {},
                );
            },
            (err) => console.error('household onSnapshot error:', err),
        );

        return () => {
            unsubscribeRecipes();
            unsubscribeMealPlan();
            unsubscribeShoppingList();
            unsubscribeHousehold();
            loadedCollections.current.clear();
        };
    }, [householdId, _setRecipes, _setMealPlan, _setShoppingList, _setLoaded]);
}
