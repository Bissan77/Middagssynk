import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { auth } from '../../../core/firebase';
import { generateInviteCode } from '../../../core/services/invite';
import { useStore } from '../../../core/store/useStore';
import DinnerWeekOverview from '../../dinner/components/DinnerWeekOverview';
import { useDinnerDashboardCard } from '../../dinner/hooks/useDinnerDashboardCard';
import DashboardCard from '../components/DashboardCard';

// TODO(design): AuthenticatedApp och vissa inloggningsvyer har fortfarande mörka skal.

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
  const now = new Date();
  const dinnerCard = useDinnerDashboardCard(now);

  const surfaceClassName = '-mx-4 -mt-4 -mb-24 min-h-screen bg-surface-canvas px-6 pb-24 pt-10 text-text-primary';

  return (
    <div className={surfaceClassName}>
      <DashboardHeader now={now} />
      <DashboardCard state={dinnerCard} />
      <DinnerWeekOverview now={now} />
      <HouseholdSection />
    </div>
  );
}
