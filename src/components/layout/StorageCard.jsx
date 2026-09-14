import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import Button from '../ui/Button';
import DataModal from './DataModal';
import { downloadBackup } from '../../db/backupIO';

export default function StorageCard() {
  const [mode, setMode] = useState(null);
  return (
    <div className="rounded-kpi border border-line bg-surface p-4">
      <p className="eyebrow">Armazenamento</p>
      <p className="mt-2 text-[13px] font-medium text-ink">Seus dados ficam neste navegador.</p>
      <p className="mt-0.5 text-xs text-ink-3">Sem nuvem e sem login.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" onClick={() => downloadBackup()}><Download size={14} aria-hidden />Exportar</Button>
        <Button size="sm" onClick={() => setMode('import')}><Upload size={14} aria-hidden />Importar</Button>
      </div>
      <button type="button" onClick={() => setMode('clear')} className="mt-2 w-full rounded-md py-1 text-xs text-ink-3 transition-colors duration-150 hover:text-expense">
        Limpar todos os dados
      </button>
      <DataModal open={mode !== null} mode={mode ?? 'menu'} onClose={() => setMode(null)} />
    </div>
  );
}
