import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { currentMonthKey } from '../domain/dates';

// Mês selecionado vive na URL (?mes=2026-06): sobrevive a recarregar a página.
export function useMonthParam() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('mes');
  const month = raw && /^\d{4}-\d{2}$/.test(raw) ? raw : currentMonthKey();
  const setMonth = useCallback((next) => {
    setParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (next === currentMonthKey()) updated.delete('mes');
      else updated.set('mes', next);
      return updated;
    }, { replace: true });
  }, [setParams]);
  return [month, setMonth];
}
