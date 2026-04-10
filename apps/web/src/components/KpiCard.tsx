interface KpiCardProps {
  label: string;
  value: number | string;
  icon?: string;
  color?: string;
}

export function KpiCard({ label, value, icon, color = 'text-admin-accent' }: KpiCardProps) {
  return (
    <div className="p-4 bg-admin-surface rounded-lg border border-admin-border">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-base">{icon}</span>}
        <span className="text-xs text-admin-text-dim uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}