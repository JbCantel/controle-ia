import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { LayoutGrid, Upload } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import DataModal from '../components/layout/DataModal';
import Card, { CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { db } from '../db/db';
import { startFresh } from '../db/backupIO';

export default function Painel() {
  const [importOpen, setImportOpen] = useState(false);
  const counts = useLiveQuery(async () => ({
    categories: await db.categories.count(),
    transactions: await db.transactions.count(),
  }), []);
  const isEmpty = counts && counts.categories === 0 && counts.transactions === 0;

  return (
    <>
      <PageHeader title="Visão geral" subtitle="Seu dinheiro, com contexto." />
      {isEmpty ? (
        <Card className="mt-8 p-6">
          <CardTitle title="Bem-vindo ao ORBE" subtitle="Seus dados ficam só neste navegador." />
          <p className="mt-4 max-w-prose text-sm text-ink-2">Traga um backup exportado antes ou comece do zero com as categorias padrão.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => setImportOpen(true)}><Upload size={16} aria-hidden />Importar backup</Button>
            <Button onClick={() => startFresh()}>Começar do zero</Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-8 min-h-[240px]">
          {counts && <EmptyState icon={LayoutGrid} title="Painel em construção" text="Os indicadores e gráficos chegam na etapa 7. Suas transações já estão na aba Transações." />}
        </Card>
      )}
      {/* Fora do cartão: a importação preenche o banco e o cartão some, mas o modal precisa continuar aberto. */}
      <DataModal open={importOpen} mode="import" onClose={() => setImportOpen(false)} />
    </>
  );
}
