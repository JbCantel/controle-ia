import { LayoutGrid, ArrowDownUp, Wallet, Target, Tag, ListChecks } from 'lucide-react';

export const NAV = [
  { to: '/', label: 'Painel', icon: LayoutGrid },
  { to: '/transacoes', label: 'Transações', icon: ArrowDownUp },
  { to: '/orcamento', label: 'Orçamento', icon: Wallet },
  { to: '/metas', label: 'Metas', icon: Target },
  { to: '/categorias', label: 'Categorias', icon: Tag },
  { to: '/habitos', label: 'Hábitos', icon: ListChecks },
];
