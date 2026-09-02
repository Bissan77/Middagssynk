import { Outlet, NavLink } from 'react-router-dom';
import { Calendar, BookOpen, ShoppingCart, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useStore } from '../store/useStore';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function Layout() {
    const isLoaded = useStore(s => s.isLoaded);

    if (!isLoaded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-stone-900 gap-4">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-accent animate-spin" />
                </div>
                <div className="text-center">
                    <p className="font-semibold text-stone-100">Ansluter...</p>
                    <p className="text-sm text-stone-400 mt-1">Synkar med molnet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-stone-900 pb-16">
            <main className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto">
                <Outlet />
            </main>

            {/* Bottom nav */}
            <nav className="fixed bottom-0 w-full bg-stone-900/80 backdrop-blur-md border-t border-stone-700/60 z-50">
                <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 text-xs transition-colors duration-200",
                            isActive ? "text-accent font-semibold" : "text-stone-400 hover:text-stone-200"
                        )}
                    >
                        <Calendar className="w-6 h-6" />
                        <span>Matsedel</span>
                    </NavLink>

                    <NavLink
                        to="/recept"
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 text-xs transition-colors duration-200",
                            isActive ? "text-accent font-semibold" : "text-stone-400 hover:text-stone-200"
                        )}
                    >
                        <BookOpen className="w-6 h-6" />
                        <span>Recept</span>
                    </NavLink>

                    <NavLink
                        to="/inkopslista"
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 text-xs transition-colors duration-200",
                            isActive ? "text-accent font-semibold" : "text-stone-400 hover:text-stone-200"
                        )}
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <span>Inköpslista</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
}
