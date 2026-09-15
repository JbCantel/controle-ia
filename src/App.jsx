import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import MobileTopBar from './components/layout/MobileTopBar';
import { runDueRecurrences } from './db/recurrences';

const Painel = lazy(() => import('./pages/painel/Painel'));
const Transacoes = lazy(() => import('./pages/transacoes/Transacoes'));
const Categorias = lazy(() => import('./pages/categorias/Categorias'));
const Orcamento = lazy(() => import('./pages/orcamento/Orcamento'));
const Metas = lazy(() => import('./pages/metas/Metas'));
const Habitos = lazy(() => import('./pages/habitos/Habitos'));

export default function App() {
  useEffect(() => {
    runDueRecurrences().catch((error) => console.error('Falha ao gerar recorrências', error));
  }, []);

  return (
    <div className="min-h-dvh md:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileTopBar />
        <main className="mx-auto w-full max-w-[1240px] px-4 pb-28 pt-8 md:px-10 md:pb-14 md:pt-12">
          <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
            <Routes>
              <Route path="/" element={<Painel />} />
              <Route path="/transacoes" element={<Transacoes />} />
              <Route path="/orcamento" element={<Orcamento />} />
              <Route path="/metas" element={<Metas />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/habitos" element={<Habitos />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
