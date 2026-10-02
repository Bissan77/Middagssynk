import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Book, ShoppingCart, UserPlus, Home } from 'lucide-react';
import { auth } from '../firebase';
import { generateInviteCode } from '../services/invite';
import { useStore } from '../store/useStore';

function formatInviteExpiresAt(expiresAt: Date): string {
  return expiresAt.toLocaleString('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function Navbar() {
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const householdId = useStore((s) => s.householdId);
  const ownerId = useStore((s) => s.ownerId);
  const inviteCode = useStore((s) => s.inviteCode);
  const inviteExpiresAt = useStore((s) => s.inviteExpiresAt);
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

  return (
    <>
      {/* TODO: Flytta inbjudningshanteringen till en dedikerad hushålls-inställningsvy. */}
      {(isOwner || (inviteCode && inviteExpiresAt) || inviteError) && (
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={() => void handleGenerateInvite()}
              disabled={isGeneratingInvite || !householdId}
              className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-stone-950 shadow-md transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus size={16} />
              {isGeneratingInvite ? 'Skapar kod...' : 'Bjud in'}
            </button>
          )}

          {inviteCode && inviteExpiresAt && (
            <div className="rounded-lg border border-stone-700 bg-stone-800/90 px-3 py-2 font-mono text-xs text-stone-300 backdrop-blur-sm shadow-md">
              <div>
                Kod: <span className="text-accent font-bold select-all">{inviteCode}</span>
              </div>
              <div className="mt-1 font-sans text-stone-400">
                Gäller till {formatInviteExpiresAt(inviteExpiresAt)}
              </div>
            </div>
          )}

          {inviteError && (
            <p
              role="alert"
              className="max-w-64 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 shadow-md"
            >
              {inviteError}
            </p>
          )}
        </div>
      )}

      {/* Din intakta bottenmeny */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 border-t border-stone-800 pb-safe">
        <div className="max-w-2xl mx-auto flex justify-around p-3">
          <Link title="Hem" to="/" className="p-2 text-stone-400 hover:text-accent">
            <Home />
          </Link>
          <Link title="Matsedel" to="/plan" className="p-2 text-stone-400 hover:text-accent">
            <Calendar />
          </Link>
          <Link title="Recept" to="/recipes" className="p-2 text-stone-400 hover:text-accent">
            <Book />
          </Link>
          <Link title="Inköpslista" to="/shopping-list" className="p-2 text-stone-400 hover:text-accent">
            <ShoppingCart />
          </Link>
        </div>
      </nav>
    </>
  );
}
