import { LayoutGrid, ArrowDownUp, Wallet, Target, Tag, ListChecks } from 'lucide-react';

export const NAV = [
  { to: '/', label: 'Painel', mobileLabel: 'Painel', icon: LayoutGrid },
  { to: '/transacoes', label: 'Transações', mobileLabel: 'Trans.', icon: ArrowDownUp },
  { to: '/orcamento', label: 'Orçamento', mobileLabel: 'Orçam.', icon: Wallet },
  { to: '/metas', label: 'Metas', mobileLabel: 'Metas', icon: Target },
  { to: '/categorias', label: 'Categorias', mobileLabel: 'Categ.', icon: Tag },
  { to: '/habitos', label: 'Hábitos', mobileLabel: 'Hábitos', icon: ListChecks },
];
