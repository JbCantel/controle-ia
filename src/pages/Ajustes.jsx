import { useEffect, useRef, useState } from 'react';
import { db, ALL_TABLES } from '../db/db';
import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../hooks/useTheme';
import { todayISO } from '../utils/dates';

export default function Ajustes() {
  const [theme, setTheme] = useTheme();
  const fileRef = useRef(null);
  const [importData, setImportData] = useState(null);
  const [resetStep, setResetStep] = useState(0); // 0=nada, 1=primeira confirmação, 2=segunda
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 6000);
    return () => clearTimeout(t);
  }, [message]);

  async function exportBackup() {
    const data = { exportedAt: new Date().toISOString(), version: 1 };
    for (const table of ALL_TABLES) data[table] = await db.table(table).toArray();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-controle-pessoal-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMessage('Backup exportado! Guarde o arquivo em local seguro. 💾');
  }

  function pickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.transactions) || !Array.isArray(data.categories)) {
          throw new Error('estrutura inválida');
        }
        setImportData(data);
      } catch {
        setMessage('❌ Arquivo inválido. Use um backup gerado por este app.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function doImport() {
    try {
      await db.transaction('rw', ALL_TABLES.map((t) => db.table(t)), async () => {
        for (const table of ALL_TABLES) {
          await db.table(table).clear();
          if (Array.isArray(importData[table]) && importData[table].length > 0) {
            await db.table(table).bulkAdd(importData[table]);
          }
        }
      });
      // Amendment A: keep localStorage theme consistent with imported settings
      const importedTheme = importData?.settings?.find?.((s) => s.key === 'theme')?.value;
      if (importedTheme) {
        localStorage.setItem('theme', importedTheme);
      } else {
        localStorage.removeItem('theme');
      }
      setImportData(null);
      setMessage('Backup importado com sucesso! ✅');
    } catch (err) {
      console.error('Falha ao importar backup', err);
      setImportData(null);
      setMessage('❌ Falha ao importar. Seus dados não foram alterados.');
    }
  }

  async function doReset() {
    try {
      await db.transaction('rw', ALL_TABLES.map((t) => db.table(t)), async () => {
        for (const table of ALL_TABLES) await db.table(table).clear();
      });
      // Amendment A: remove theme from localStorage so it follows system preference
      localStorage.removeItem('theme');
      setMessage('Todos os dados foram apagados. Começando do zero. 🧹');
    } catch (err) {
      console.error('Falha ao zerar dados', err);
      setMessage('❌ Falha ao zerar os dados.');
    } finally {
      setResetStep(0);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      {message && (
        <Card className="border-l-4 border-indigo-500">
          <p className="text-sm">{message}</p>
        </Card>
      )}

      <Card>
        <h2 className="mb-1 font-semibold">Aparência</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Tema atual: {theme === 'dark' ? 'escuro 🌙' : 'claro ☀️'}</p>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Alternar para tema {theme === 'dark' ? 'claro' : 'escuro'}
        </button>
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold">Backup</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Seus dados ficam apenas neste navegador. Exporte um backup de vez em quando —
          se o cache do navegador for limpo, é assim que você recupera tudo.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportBackup}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            ⬇️ Exportar backup
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
            ⬆️ Importar backup
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={pickFile} className="hidden" />
        </div>
      </Card>

      <Card className="border border-red-200 dark:border-red-900">
        <h2 className="mb-1 font-semibold text-red-600 dark:text-red-400">Zona de perigo</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Apaga todas as transações, categorias, orçamentos, metas e hábitos. Sem volta (a não ser por backup).
        </p>
        <button onClick={() => setResetStep(1)}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          🧹 Zerar todos os dados
        </button>
      </Card>

      <ConfirmDialog
        open={importData !== null}
        title="Importar backup"
        confirmLabel="Substituir tudo"
        message={`Importar este backup vai SUBSTITUIR todos os dados atuais (${importData?.transactions?.length ?? 0} transações no arquivo). Continuar?`}
        onConfirm={doImport}
        onCancel={() => setImportData(null)}
      />

      <ConfirmDialog
        open={resetStep === 1}
        title="Zerar dados — etapa 1 de 2"
        confirmLabel="Sim, quero apagar"
        message="Tem certeza? TODOS os dados serão apagados deste navegador."
        onConfirm={() => setResetStep(2)}
        onCancel={() => setResetStep(0)}
      />
      <ConfirmDialog
        open={resetStep === 2}
        title="Zerar dados — etapa 2 de 2"
        confirmLabel="Apagar tudo de vez"
        message="Última chance: você exportou um backup? Esta ação não pode ser desfeita."
        onConfirm={doReset}
        onCancel={() => setResetStep(0)}
      />
    </div>
  );
}
