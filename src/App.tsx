import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import AuthScreen from './components/AuthScreen';
import HouseholdSetup from './components/HouseholdSetup';
import Navbar from './components/Navbar';
import MealPlan from './pages/MealPlan';
import RecipeBank from './pages/RecipeBank';
import ShoppingList from './pages/ShoppingList';
import { auth, db } from './firebase';
import { useFirestoreSync } from './hooks/useFirestoreSync';

type HouseholdStatus = 'idle' | 'checking' | 'ready' | 'missing' | 'error';
type AuthenticatedAppProps = {
  householdId: string;
};

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-100 mx-auto mb-4"></div>
        <p className="text-stone-400">Startar app...</p>
      </div>
    </div>
  );
}

function HouseholdCheckError() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center px-4">
      <section className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold">Kunde inte kontrollera hushall</h1>
        <p className="mt-3 text-stone-400">
          Forsok igen eller logga ut och logga in pa nytt.
        </p>
        <button
          type="button"
          onClick={() => void signOut(auth)}
          className="mt-8 rounded-lg border border-stone-700 px-4 py-3 text-sm font-semibold text-stone-200 transition hover:border-stone-500 hover:bg-stone-800"
        >
          Logga ut
        </button>
      </section>
    </div>
  );
}

function AuthenticatedApp({ householdId }: AuthenticatedAppProps) {
  useFirestoreSync(householdId);

  return (
    <Router>
      <div className="min-h-screen bg-stone-900 text-stone-100 selection:bg-accent/30">
        <main className="max-w-2xl mx-auto px-4 pb-24 pt-4">
          <Routes>
            <Route path="/" element={<MealPlan />} />
            <Route path="/recipes" element={<RecipeBank />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
          </Routes>
        </main>
        <Navbar />
      </div>
    </Router>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [householdStatus, setHouseholdStatus] = useState<HouseholdStatus>('idle');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setHouseholdId(null);
      setHouseholdStatus('idle');
      return;
    }

    setHouseholdStatus('checking');

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (userSnap) => {
        if (auth.currentUser?.uid !== user.uid) return;

        const userData = userSnap.exists() ? userSnap.data() : null;
        const nextHouseholdId =
          typeof userData?.householdId === 'string' ? userData.householdId : null;

        setHouseholdId(nextHouseholdId || null);

        setHouseholdStatus(
          typeof nextHouseholdId === 'string' && nextHouseholdId.trim().length > 0
            ? 'ready'
            : 'missing',
        );
      },
      (err) => {
        console.error('Kunde inte kontrollera householdId:', err);
        setHouseholdStatus('error');
      },
    );

    return () => unsubscribe();
  }, [user]);

  if (!authReady || householdStatus === 'checking') {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (householdStatus === 'error') {
    return <HouseholdCheckError />;
  }

  if (householdStatus === 'missing') {
    return <HouseholdSetup uid={user.uid} />;
  }

  if (!householdId) {
    return <LoadingScreen />;
  }

  return <AuthenticatedApp householdId={householdId} />;
}

export default App;
