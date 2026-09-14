import { NavLink } from 'react-router-dom';
import { NAV } from './nav';

export default function BottomNav() {
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-0.5 text-[10px] transition-colors duration-150 ${isActive ? 'text-brand' : 'text-ink-2 hover:text-ink'}`}
        >
          <Icon size={20} strokeWidth={1.75} aria-hidden />
          <span className="max-w-full truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
