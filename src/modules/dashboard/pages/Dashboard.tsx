import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { auth } from '../../../core/firebase';
import { generateInviteCode } from '../../../core/services/invite';
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
      <p className="text-sm font-medium tracking-wide text-text-secondary">
        {format(now, 'EEEE', { locale: sv })}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">
        {format(now, 'd MMMM', { locale: sv })}
      </h1>
    </header>
  );
}

function TodaySection({ meal }: { meal: DashboardMeal | null }) {
  return (
    <section className="mb-12">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-medium text-text-secondary">Idag</h2>
        <Link
          to="/plan"
          className="text-sm text-text-secondary underline-offset-4 transition hover:text-text-primary hover:underline"
        >
          Öppna matsedel
        </Link>
      </div>

      <Link
        to="/plan"
        className="ui-card block rounded-3xl px-6 py-7 transition hover:border-border-strong"
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
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-surface-sunken text-text-muted">
                <span className="text-lg" aria-hidden="true">
                  {meal.kind === 'freeText' ? '·' : '○'}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xl font-medium leading-snug text-text-primary">
                {meal.title}
              </p>
              {meal.portions !== null && (
                <p className="mt-1 text-sm text-text-secondary">
                  {meal.portions} portioner
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xl font-medium text-text-primary">
              Ingen middag planerad idag
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
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

function HouseholdSection() {
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const householdId = useStore((state) => state.householdId);
  const ownerId = useStore((state) => state.ownerId);
  const inviteCode = useStore((state) => state.inviteCode);
  const inviteExpiresAt = useStore((state) => state.inviteExpiresAt);
  const isOwner = auth.currentUser?.uid === ownerId;

  const handleGenerateInvite = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !householdId) return;

    setInviteError(null);
    setIsGeneratingInvite(true);
    try {
      await generateInviteCode(householdId, currentUser.uid);
    } catch (error) {
      console.error('Kunde inte skapa inbjudningskod:', error);
      setInviteError('Kunde inte skapa en inbjudningskod. Försök igen.');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  if (!isOwner && !inviteCode && !inviteError) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-medium text-text-secondary">Hushåll</h2>
      <div className="ui-card p-card">
        <p className="text-sm leading-relaxed text-text-secondary">
          Bjud in en familjemedlem med en tidsbegränsad kod.
        </p>
        {isOwner && (
          <button
            type="button"
            onClick={() => void handleGenerateInvite()}
            disabled={isGeneratingInvite || !householdId}
            className="ui-button ui-button-primary mt-4"
          >
            <UserPlus size={16} />
            {isGeneratingInvite ? 'Skapar kod...' : 'Bjud in'}
          </button>
        )}
        {inviteCode && inviteExpiresAt && (
          <div className="mt-4 rounded-control border border-border-subtle bg-surface-sunken px-3 py-3 font-mono text-xs text-text-primary">
            <div>Kod: <span className="font-bold select-all">{inviteCode}</span></div>
            <div className="mt-1 font-sans text-text-secondary">
              Gäller till {inviteExpiresAt.toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          </div>
        )}
        {inviteError && <p role="alert" className="mt-3 text-sm text-danger">{inviteError}</p>}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const mealPlan = useStore((state) => state.mealPlan);
  const recipes = useStore((state) => state.recipes);
  const isLoaded = useStore((state) => state.isLoaded);
  const now = new Date();

  const surfaceClassName = '-mx-4 -mt-4 -mb-24 min-h-screen bg-surface-canvas px-6 pb-24 pt-10 text-text-primary';

  if (!isLoaded) {
    return (
      <div className={surfaceClassName}>
        <p className="text-sm text-text-secondary">Hämtar översikten…</p>
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
      <HouseholdSection />
    </div>
  );
}
