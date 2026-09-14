import { Sparkles } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

export default function EmBreve({ title, etapa, eyebrow }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <Card className="mt-8">
        <EmptyState icon={Sparkles} title="Em construção" text={`Esta tela chega na etapa ${etapa} da reconstrução.`} />
      </Card>
    </>
  );
}
