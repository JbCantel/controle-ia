import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { NAV } from './nav';
import Brand from './Brand';
import StorageCard from './StorageCard';

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-line px-4 py-6 md:flex">
      <div className="px-1"><Brand /></div>
      <nav aria-label="Principal" className="mt-8 flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `flex h-12 items-center gap-3 rounded-xl border px-3.5 text-[15px] font-medium transition-colors duration-150 ${isActive ? 'border-brand-line bg-brand-soft text-ink' : 'border-transparent text-ink-2 hover:bg-line hover:text-ink'}`}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={1.75} className={isActive ? 'text-brand' : ''} aria-hidden />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={16} className="text-brand" aria-hidden />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto"><StorageCard /></div>
    </aside>
  );
}
