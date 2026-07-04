import { Link } from 'react-router-dom';
import { Calendar, Book, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const inviteCode = useStore((s) => s.inviteCode);

  return (
    <>
      {/* Flytande inbjudningskod i toppen av skärmen */}
      {inviteCode && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-stone-800/90 px-3 py-1.5 font-mono text-xs text-stone-300 border border-stone-700 backdrop-blur-sm shadow-md">
          Kod: <span className="text-accent font-bold select-all">{inviteCode}</span>
        </div>
      )}

      {/* Din intakta bottenmeny */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 border-t border-stone-800 pb-safe">
        <div className="max-w-2xl mx-auto flex justify-around p-3">
          <Link title="Matsedel" to="/" className="p-2 text-stone-400 hover:text-accent">
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