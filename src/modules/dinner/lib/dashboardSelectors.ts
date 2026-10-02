import { addDays, format, startOfWeek } from 'date-fns';
import { sv } from 'date-fns/locale';
import type { MealPlanItem, Recipe } from '../../../core/types';
import { DINNER_WEEK_STARTS_ON } from './week';

export type DashboardMealKind = 'recipe' | 'freeText';

export type DashboardMeal = {
  id: string;
  date: string;
  kind: DashboardMealKind;
  title: string;
  portions: number | null;
  imageUrl?: string;
  recipeId?: string;
};

export type DashboardWeekDay = {
  date: Date;
  dateStr: string;
  weekdayLabel: string;
  isToday: boolean;
  meal: DashboardMeal | null;
};

function isVisibleOnMealPlan(item: MealPlanItem, recipes: Recipe[]): boolean {
  return Boolean(
    item.isFreeText || (item.recipeId && recipes.some((recipe) => recipe.id === item.recipeId)),
  );
}

function firstVisibleItemForDate(
  mealPlan: MealPlanItem[],
  recipes: Recipe[],
  dateStr: string,
): MealPlanItem | undefined {
  return mealPlan.find(
    (item) => item.date === dateStr && isVisibleOnMealPlan(item, recipes),
  );
}

function toDashboardMeal(item: MealPlanItem, recipes: Recipe[]): DashboardMeal | null {
  if (item.isFreeText) {
    const title = item.freeText?.trim() ?? '';
    if (!title) return null;

    return {
      id: item.id,
      date: item.date,
      kind: 'freeText',
      title,
      portions: null,
    };
  }

  const recipe = item.recipeId
    ? recipes.find((candidate) => candidate.id === item.recipeId)
    : undefined;

  if (!recipe) return null;

  return {
    id: item.id,
    date: item.date,
    kind: 'recipe',
    title: recipe.title,
    portions: item.adjustedPortions,
    imageUrl: recipe.imageUrl,
    recipeId: recipe.id,
  };
}

export function selectMealForDate(
  mealPlan: MealPlanItem[],
  recipes: Recipe[],
  date: Date,
): DashboardMeal | null {
  const dateStr = format(date, 'yyyy-MM-dd');
  const item = firstVisibleItemForDate(mealPlan, recipes, dateStr);
  if (!item) return null;
  return toDashboardMeal(item, recipes);
}

export function selectTodayMeal(
  mealPlan: MealPlanItem[],
  recipes: Recipe[],
  now: Date = new Date(),
): DashboardMeal | null {
  return selectMealForDate(mealPlan, recipes, now);
}

export function selectDashboardWeek(
  mealPlan: MealPlanItem[],
  recipes: Recipe[],
  now: Date = new Date(),
): DashboardWeekDay[] {
  const weekStart = startOfWeek(now, { weekStartsOn: DINNER_WEEK_STARTS_ON });
  const todayStr = format(now, 'yyyy-MM-dd');

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const dateStr = format(date, 'yyyy-MM-dd');

    return {
      date,
      dateStr,
      weekdayLabel: format(date, 'EEEE', { locale: sv }),
      isToday: dateStr === todayStr,
      meal: selectMealForDate(mealPlan, recipes, date),
    };
  });
}
