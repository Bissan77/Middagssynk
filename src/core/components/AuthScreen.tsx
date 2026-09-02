import { useState, type FormEvent } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthScreen() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('Kunde inte logga in. Kontrollera e-post och losenord.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center px-4">
            <section className="w-full max-w-sm">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-normal">
                        {isRegistering ? 'Skapa konto' : 'Logga in'}
                    </h1>
                    <p className="text-stone-400 mt-2">
                        {isRegistering
                            ? 'Registrera dig med e-post och losenord.'
                            : 'Anvand e-post och losenord for att fortsatta.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="block text-sm font-medium text-stone-300 mb-2">
                            E-post
                        </span>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            required
                            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 outline-none transition focus:border-accent"
                        />
                    </label>

                    <label className="block">
                        <span className="block text-sm font-medium text-stone-300 mb-2">
                            Losenord
                        </span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete={isRegistering ? 'new-password' : 'current-password'}
                            minLength={6}
                            required
                            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 outline-none transition focus:border-accent"
                        />
                    </label>

                    {error && (
                        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-accent px-4 py-3 font-semibold text-stone-950 transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting
                            ? 'Vantar...'
                            : isRegistering
                              ? 'Registrera'
                              : 'Logga in'}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => {
                        setIsRegistering((value) => !value);
                        setError(null);
                    }}
                    className="mt-6 w-full text-sm font-medium text-accent hover:text-accent-light"
                >
                    {isRegistering
                        ? 'Har du redan konto? Logga in'
                        : 'Inget konto? Registrera dig'}
                </button>
            </section>
        </div>
    );
}
