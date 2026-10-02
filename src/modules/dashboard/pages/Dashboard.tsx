import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useStore } from '../../../core/store/useStore';
import {
  selectDashboardWeek,
  selectTodayMeal,
  type DashboardMeal,
  type DashboardWeekDay,
} from '../lib/dinnerSelectors';

// TODO(design): Dashboarden är ljus medan AuthenticatedApp, Navbar och dinner-sidorna
// fortfarande är mörka. Byt skal och dinner-styling i den planerade dinner-redesignen —
// mörkt tema är hårdkodat i komponenterna, inte bara i App.tsx.

function DashboardHeader({ now }: { now: Date }) {
  return (
    <header className="mb-10">
      <p className="text-sm font-medium tracking-wide text-stone-500">
        {format(now, 'EEEE', { locale: sv })}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-800">
        {format(now, 'd MMMM', { locale: sv })}
      </h1>
    </header>
  );
}

function TodaySection({ meal }: { meal: DashboardMeal | null }) {
  return (
    <section className="mb-12">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-medium text-stone-500">Idag</h2>
        <Link
          to="/plan"
          className="text-sm text-stone-500 underline-offset-4 transition hover:text-stone-800 hover:underline"
        >
          Öppna matsedel
        </Link>
      </div>

      <Link
        to="/plan"
        className="block rounded-3xl bg-white px-6 py-7 shadow-sm ring-1 ring-stone-200/80 transition hover:ring-stone-300"
      >
        {meal ? (
          <div className="flex items-center gap-5">
            {meal.imageUrl ? (
              <img
                src={meal.imageUrl}
                alt=""
                className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                <span className="text-lg" aria-hidden="true">
                  {meal.kind === 'freeText' ? '·' : '○'}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xl font-medium leading-snug text-stone-800">
                {meal.title}
              </p>
              {meal.portions !== null && (
                <p className="mt-1 text-sm text-stone-500">
                  {meal.portions} portioner
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xl font-medium text-stone-800">
              Ingen middag planerad idag
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              När något läggs in i matsedeln syns det här.
            </p>
          </div>
        )}
      </Link>
    </section>
  );
}

function WeekSection({ days }: { days: DashboardWeekDay[] }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-stone-500">Denna vecka</h2>
      <ul className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200/80">
        {days.map((day) => (
          <li key={day.dateStr} className="border-b border-stone-100 last:border-b-0">
            <Link
              to="/plan"
              className="flex items-baseline justify-between gap-4 px-6 py-4 transition hover:bg-stone-50"
            >
              <span
                className={`w-28 flex-shrink-0 capitalize ${
                  day.isToday
                    ? 'font-medium text-stone-800'
                    : 'text-stone-500'
                }`}
              >
                {day.weekdayLabel}
              </span>
              <span
                className={`min-w-0 truncate text-right ${
                  day.meal ? 'text-stone-800' : 'text-stone-400'
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

export default function Dashboard() {
  const mealPlan = useStore((state) => state.mealPlan);
  const recipes = useStore((state) => state.recipes);
  const isLoaded = useStore((state) => state.isLoaded);
  const now = new Date();

  const surfaceClassName =
    '-mx-4 -mt-4 -mb-24 min-h-screen bg-stone-50 px-6 pb-24 pt-10 text-stone-800';

  if (!isLoaded) {
    return (
      <div className={surfaceClassName}>
        <p className="text-sm text-stone-500">Hämtar översikten…</p>
      </div>
    );
  }

  const todayMeal = selectTodayMeal(mealPlan, recipes, now);
  const weekDays = selectDashboardWeek(mealPlan, recipes, now);

  return (
    <div className={surfaceClassName}>
      <DashboardHeader now={now} />
      <TodaySection meal={todayMeal} />
      <WeekSection days={weekDays} />
    </div>
  );
}
