import Card from '../../components/ui/Card';

function Bone({ className }) {
  return <span aria-hidden className={`block animate-pulse rounded-full bg-surface-2 ${className}`} />;
}

export default function DashboardSkeleton() {
  return (
    <div className="mt-10" role="status" aria-live="polite">
      <span className="sr-only">Carregando painel</span>
      <div className="@container">
        <div className="grid gap-5 @lg:grid-cols-2 @5xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Card key={item} className="rounded-kpi p-4 sm:p-6">
              <div className="flex items-center gap-3"><Bone className="h-9 w-9" /><Bone className="h-3 w-24" /></div>
              <Bone className="mt-4 h-8 w-36" />
              <Bone className="mt-2 h-3 w-28" />
            </Card>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {[0, 1].map((item) => (
          <Card key={item} className="p-5 sm:p-6">
            <Bone className="h-5 w-44" />
            <Bone className="mt-2 h-3 w-28" />
            <Bone className="mt-8 h-[200px] w-full rounded-card md:h-[260px]" />
          </Card>
        ))}
      </div>
    </div>
  );
}
