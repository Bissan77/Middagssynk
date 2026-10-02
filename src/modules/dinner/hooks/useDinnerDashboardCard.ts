import type { DashboardCardState } from '../../../core/contracts/dashboardCard';
import { useStore } from '../../../core/store/useStore';
import { selectTodayMeal } from '../lib/dashboardSelectors';

export function useDinnerDashboardCard(now: Date): DashboardCardState {
  const mealPlan = useStore((state) => state.mealPlan);
  const recipes = useStore((state) => state.recipes);
  const isLoaded = useStore((state) => state.isLoaded);

  if (!isLoaded) return { status: 'loading' };

  const meal = selectTodayMeal(mealPlan, recipes, now);
  const summary = meal
    ? `${meal.title}${meal.portions !== null ? ` · ${meal.portions} portioner` : ''}`
    : 'Ingen middag planerad idag';

  return {
    status: 'ready',
    card: {
      id: 'dinner',
      title: 'Idag',
      summary,
      to: '/plan',
      imageUrl: meal?.imageUrl,
    },
  };
}
