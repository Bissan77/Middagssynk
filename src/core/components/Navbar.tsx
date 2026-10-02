import { NavLink } from 'react-router-dom';
import { Calendar, Book, ShoppingCart, Home } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-surface-raised pb-safe shadow-floating">
      <div className="mx-auto flex max-w-2xl justify-around p-2">
        {[
          { to: '/', label: 'Hem', icon: Home, end: true },
          { to: '/plan', label: 'Matsedel', icon: Calendar },
          { to: '/recipes', label: 'Recept', icon: Book },
          { to: '/shopping-list', label: 'Inköpslista', icon: ShoppingCart },
        ].map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `ui-nav-item flex-col gap-0.5 px-3 py-1 text-[10px] ${isActive ? 'ui-nav-item-active' : ''}`}>
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
