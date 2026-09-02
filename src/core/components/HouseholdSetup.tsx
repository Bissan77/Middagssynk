import { useState, type FormEvent } from 'react';
import { signOut } from 'firebase/auth';
import {
    FieldPath,
    collection,
    doc,
    getDoc,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

type HouseholdSetupProps = {
    uid: string;
};

const INVITE_CODE_LENGTH = 6;

export default function HouseholdSetup({ uid }: HouseholdSetupProps) {
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const isBusy = isCreating || isJoining;

    const handleCreateHousehold = async () => {
        setError(null);
        setIsCreating(true);

        try {
            const newHouseholdRef = doc(collection(db, 'households'));
            const userRef = doc(db, 'users', uid);
            const batch = writeBatch(db);

            batch.set(newHouseholdRef, {
                name: '',
                ownerId: uid,
                members: { [uid]: 'owner' },
                inviteCode: null,
                inviteExpiresAt: null,
                createdAt: serverTimestamp(),
            });
            batch.set(userRef, { householdId: newHouseholdRef.id }, { merge: true });

            await batch.commit();
        } catch (err) {
            console.error('Kunde inte skapa hushall:', err);
            setError('Kunde inte skapa hushall. Forsok igen.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinHousehold = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsJoining(true);

        try {
            const normalizedCode = inviteCode.trim().toUpperCase();

            if (normalizedCode.length !== INVITE_CODE_LENGTH) {
                setError('Ange en 6-tecken kod.');
                return;
            }

            const inviteCodeRef = doc(db, 'inviteCodes', normalizedCode);
            const inviteCodeSnap = await getDoc(inviteCodeRef);

            if (!inviteCodeSnap.exists()) {
                setError('Koden har gått ut eller redan använts.');
                return;
            }

            const householdId = inviteCodeSnap.data().householdId;

            if (typeof householdId !== 'string') {
                setError('Koden har gått ut eller redan använts.');
                return;
            }

            const householdRef = doc(db, 'households', householdId);
            const userRef = doc(db, 'users', uid);
            const batch = writeBatch(db);

            batch.update(
                householdRef,
                new FieldPath('members', uid),
                'member',
                'inviteCode',
                null,
                'inviteExpiresAt',
                null,
            );
            batch.delete(inviteCodeRef);
            batch.set(userRef, { householdId }, { merge: true });

            await batch.commit();
        } catch (err) {
            console.error('Kunde inte ga med i hushall:', err);
            setError('Koden har gått ut eller redan använts.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center px-4">
            <section className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold tracking-normal">
                        Skapa eller ga med i hushall
                    </h1>
                    <p className="mt-3 text-stone-400">
                        Ditt konto behover kopplas till ett hushall innan appen kan starta.
                    </p>
                </div>

                {error && (
                    <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleCreateHousehold}
                    disabled={isBusy}
                    className="w-full rounded-lg bg-accent px-4 py-3 font-semibold text-stone-950 transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isCreating ? 'Skapar hushall...' : 'Skapa nytt hushall'}
                </button>

                <div className="my-6 flex items-center gap-3 text-xs uppercase text-stone-500">
                    <div className="h-px flex-1 bg-stone-800"></div>
                    <span>eller</span>
                    <div className="h-px flex-1 bg-stone-800"></div>
                </div>

                <form onSubmit={handleJoinHousehold} className="space-y-4">
                    <label className="block">
                        <span className="block text-sm font-medium text-stone-300 mb-2">
                            Inbjudningskod
                        </span>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(event) =>
                                setInviteCode(event.target.value.toUpperCase().slice(0, INVITE_CODE_LENGTH))
                            }
                            autoComplete="off"
                            inputMode="text"
                            maxLength={INVITE_CODE_LENGTH}
                            placeholder="ABC123"
                            required
                            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-3 text-center font-mono text-lg uppercase tracking-widest text-stone-100 outline-none transition focus:border-accent"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={isBusy}
                        className="w-full rounded-lg border border-stone-700 px-4 py-3 font-semibold text-stone-200 transition hover:border-stone-500 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isJoining ? 'Gar med...' : 'Ga med via kod'}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => void signOut(auth)}
                    disabled={isBusy}
                    className="mt-8 w-full text-sm font-medium text-stone-400 transition hover:text-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Logga ut
                </button>
            </section>
        </div>
    );
}
