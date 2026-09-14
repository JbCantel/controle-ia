import { Upload } from 'lucide-react';
import Card, { CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { startFresh } from '../../db/backupIO';

export default function WelcomeCard({ onImport }) {
  return (
    <Card className="mt-10 p-6 sm:p-8">
      <CardTitle title="Bem-vindo ao ORBE" subtitle="Seus dados ficam só neste navegador." />
      <p className="mt-4 max-w-prose text-[15px] text-ink-2">Traga um backup exportado antes ou comece do zero com as categorias padrão.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="primary" onClick={onImport}><Upload size={16} aria-hidden />Importar backup</Button>
        <Button onClick={() => startFresh()}>Começar do zero</Button>
      </div>
    </Card>
  );
}
