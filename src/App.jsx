import { NavLink, Route, Routes } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Dashboard from './pages/Dashboard';
import Transacoes from './pages/Transacoes';
import Orcamento from './pages/Orcamento';
import Metas from './pages/Metas';
import Categorias from './pages/Categorias';
import Habitos from './pages/Habitos';
import Ajustes from './pages/Ajustes';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/transacoes', label: 'Transações', icon: '💸' },
  { to: '/orcamento', label: 'Orçamento', icon: '🎯' },
  { to: '/metas', label: 'Metas', icon: '🏆' },
  { to: '/categorias', label: 'Categorias', icon: '🏷️' },
  { to: '/habitos', label: 'Hábitos', icon: '✅' },
  { to: '/ajustes', label: 'Ajustes', icon: '⚙️' },
];

function linkClasses(isActive, mobile) {
  const base = mobile
    ? 'flex flex-col items-center gap-0.5 px-1 py-1.5 text-[10px] font-medium rounded-lg min-w-0 flex-1'
    : 'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium';
  const state = isActive
    ? 'bg-indigo-600 text-white'
    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';
  return `${base} ${state}`;
}

export default function App() {
  useTheme();
  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden border-r border-slate-200 bg-white p-4 md:flex md:w-60 md:flex-col md:gap-1 dark:border-slate-800 dark:bg-slate-950">
        <h1 className="mb-5 px-2 text-lg font-bold">💼 Controle Pessoal</h1>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) => linkClasses(isActive, false)}>
            <span aria-hidden>{item.icon}</span> {item.label}
          </NavLink>
        ))}
      </aside>

      {/* Conteúdo */}
      <main className="mx-auto w-full max-w-5xl flex-1 p-4 pb-24 md:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route path="/orcamento" element={<Orcamento />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/habitos" element={<Habitos />} />
          <Route path="/ajustes" element={<Ajustes />} />
        </Routes>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around gap-0.5 border-t border-slate-200 bg-white px-1 py-1 md:hidden dark:border-slate-800 dark:bg-slate-950">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) => linkClasses(isActive, true)}>
            <span className="text-base" aria-hidden>{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
