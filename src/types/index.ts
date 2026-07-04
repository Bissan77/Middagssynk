export type Unit = string; 

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: Unit;
  category: string;
  isStaple: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  portions: number;
  ingredients: Ingredient[];
  instructions: string;
  tags: string[]; 
  cookingTime?: number;
  imageUrl?: string; 
}

export interface MealPlanItem {
  id: string;
  date: string; 
  // FIX: recipeId är nu valfri för att tillåta fritext
  recipeId?: string; 
  adjustedPortions: number;
  isFreeText?: boolean;
  freeText?: string; 
  title?: string;
  customText?: string;
  name?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  totalAmount: number;
  unit: string;
  isChecked: boolean;
  isStaple: boolean;
  category: string;
  isManual?: boolean;
}

export interface AIPreferences {
  quick: boolean;
  budget: boolean;
  swedish: boolean;
  cuisine?: string;
  customPrompt?: string; 
  daysHistory?: string[]; 
}