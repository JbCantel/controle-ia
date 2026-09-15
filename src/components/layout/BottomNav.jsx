import { NavLink } from 'react-router-dom';
import { NAV } from './nav';

export default function BottomNav() {
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV.map(({ to, label, mobileLabel, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-0.5 text-xs transition-colors duration-150 ${isActive ? 'text-brand' : 'text-ink-2 hover:text-ink'}`}
        >
          {({ isActive }) => (
            <>
              <span className={`flex h-7 w-9 items-center justify-center rounded-full transition-colors duration-150 ${isActive ? 'bg-brand-soft' : ''}`}>
                <Icon size={19} strokeWidth={1.8} aria-hidden />
              </span>
              {/* Abaixo de 360px os rótulos não cabem: só ícones, nome segue para leitores de tela. */}
              <span className="max-w-full truncate max-[359px]:sr-only">{mobileLabel}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
