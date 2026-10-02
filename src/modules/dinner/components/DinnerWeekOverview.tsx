import { Link } from 'react-router-dom';
import { useStore } from '../../../core/store/useStore';
import { selectDashboardWeek } from '../lib/dashboardSelectors';

export default function DinnerWeekOverview({ now }: { now: Date }) {
  const mealPlan = useStore((state) => state.mealPlan);
  const recipes = useStore((state) => state.recipes);
  const isLoaded = useStore((state) => state.isLoaded);

  if (!isLoaded) {
    return (
      <section>
        <h2 className="mb-3 text-sm font-medium text-text-secondary">Denna vecka</h2>
        <div className="ui-card rounded-3xl px-6 py-4 text-sm text-text-secondary">
          Hämtar veckans middagar…
        </div>
      </section>
    );
  }

  const days = selectDashboardWeek(mealPlan, recipes, now);

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-text-secondary">Denna vecka</h2>
      <ul className="ui-card overflow-hidden rounded-3xl">
        {days.map((day) => (
          <li key={day.dateStr} className="border-b border-border-subtle last:border-b-0">
            <Link
              to="/plan"
              className="flex items-baseline justify-between gap-4 px-6 py-4 transition hover:bg-surface-sunken"
            >
              <span
                className={`w-28 flex-shrink-0 capitalize ${
                  day.isToday
                    ? 'font-medium text-text-primary'
                    : 'text-text-secondary'
                }`}
              >
                {day.weekdayLabel}
              </span>
              <span
                className={`min-w-0 truncate text-right ${
                  day.meal ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {day.meal ? day.meal.title : '—'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
