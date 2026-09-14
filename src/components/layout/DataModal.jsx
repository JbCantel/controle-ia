import { useEffect, useRef, useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Field, { inputClass } from '../ui/Field';
import { downloadBackup, replaceAllTables, clearAllTables } from '../../db/backupIO';
import { runDueRecurrences } from '../../db/recurrences';
import { parseBackup, summarizeTables } from '../../domain/backup';

const TITLES = { menu: 'Backup e dados', import: 'Importar backup', clear: 'Limpar todos os dados' };

export default function DataModal({ open, mode: initialMode = 'menu', onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [parsed, setParsed] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setParsed(null);
    setConfirmText('');
    setStatus(null);
    setBusy(false);
  }, [open, initialMode]);

  async function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setStatus(null);
    setParsed(parseBackup(await file.text()));
  }

  async function run(action, successText) {
    setBusy(true);
    try {
      await action();
      setStatus({ kind: 'ok', text: successText });
      setParsed(null);
      setConfirmText('');
    } catch (error) {
      console.error(error);
      setStatus({ kind: 'error', text: 'Não foi possível concluir. Nada foi alterado.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} title={TITLES[mode]} onClose={onClose}>
      {status && (
        <p role="status" className={`mb-4 rounded-xl border px-3 py-2 text-sm ${status.kind === 'ok' ? 'border-brand-line bg-brand-soft text-ink' : 'border-expense/40 text-expense'}`}>
          {status.text}
        </p>
      )}

      {mode === 'menu' && (
        <div className="grid gap-2">
          <Button className="justify-start" onClick={() => downloadBackup()}><Download size={16} aria-hidden />Exportar backup (JSON)</Button>
          <Button className="justify-start" onClick={() => setMode('import')}><Upload size={16} aria-hidden />Importar backup</Button>
          <Button variant="ghost" className="justify-start hover:text-expense" onClick={() => setMode('clear')}><Trash2 size={16} aria-hidden />Limpar todos os dados</Button>
          <p className="mt-2 text-xs text-ink-3">Seus dados ficam só neste navegador. Exporte um backup de vez em quando e guarde fora do computador.</p>
        </div>
      )}

      {mode === 'import' && (
        <div className="space-y-4">
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
          <Button onClick={() => fileRef.current?.click()} data-autofocus><Upload size={16} aria-hidden />Escolher arquivo</Button>
          {parsed && !parsed.ok && <p role="alert" className="text-sm text-expense">{parsed.error}</p>}
          {parsed?.ok && (
            <>
              <p className="text-sm text-ink-2">Encontrado: {summarizeTables(parsed.tables)}.</p>
              <p className="text-sm text-ink">Isto substitui todos os dados atuais deste navegador.</p>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setParsed(null)}>Cancelar</Button>
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() => run(async () => { await replaceAllTables(parsed.tables); await runDueRecurrences(); }, 'Backup importado.')}
                >
                  Substituir dados
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'clear' && (
        <form
          className="space-y-4"
          onSubmit={(event) => { event.preventDefault(); if (confirmText === 'APAGAR') run(clearAllTables, 'Todos os dados foram apagados.'); }}
        >
          <p className="text-sm text-ink-2">Apaga transações, categorias, orçamentos, metas e rotina deste navegador. Não dá para desfazer; exporte um backup antes.</p>
          <Field label="Digite APAGAR para confirmar" htmlFor="confirm-clear">
            <input id="confirm-clear" className={inputClass} autoComplete="off" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="danger" disabled={confirmText !== 'APAGAR' || busy}>Apagar tudo</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
