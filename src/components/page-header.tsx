export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-busy="true" aria-label="Loading">
      <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
    </div>
  );
}
