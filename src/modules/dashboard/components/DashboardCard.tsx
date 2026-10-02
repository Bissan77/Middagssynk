import { Link } from 'react-router-dom';
import type { DashboardCardState } from '../../../core/contracts/dashboardCard';

const alertClassName = {
  info: 'text-text-secondary',
  warning: 'text-warning',
  critical: 'text-danger',
} as const;

export default function DashboardCard({ state }: { state: DashboardCardState }) {
  if (state.status === 'loading') {
    return (
      <section className="mb-12" aria-busy="true">
        <div className="ui-card rounded-3xl px-6 py-7 text-sm text-text-secondary">
          Hämtar sammanfattning…
        </div>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="mb-12">
        <div className="ui-card rounded-3xl px-6 py-7 text-sm text-danger" role="alert">
          {state.message}
        </div>
      </section>
    );
  }

  const { card } = state;

  return (
    <section className="mb-12">
      <h2 className="mb-3 text-sm font-medium text-text-secondary">{card.title}</h2>
      <Link
        to={card.to}
        className="ui-card block rounded-3xl px-6 py-7 transition hover:border-border-strong"
      >
        <div className="flex items-center gap-5">
          {card.imageUrl && (
            <img
              src={card.imageUrl}
              alt=""
              className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="text-xl font-medium leading-snug text-text-primary">
              {card.summary}
            </p>
            {card.alert && (
              <p className={`mt-2 text-sm ${alertClassName[card.alert.level]}`}>
                {card.alert.text}
              </p>
            )}
          </div>
        </div>
      </Link>
    </section>
  );
}
