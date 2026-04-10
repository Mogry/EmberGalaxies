interface FleetRowProps {
  fleet: {
    id: string;
    mission: string;
    originPlanet: { name: string } | null;
    targetPlanet: { name: string } | null;
    arrivesAt: string;
    returnsAt: string | null;
    ships: { type: string; count: number }[];
  };
}

export function FleetRow({ fleet }: FleetRowProps) {
  const arrivesAt = new Date(fleet.arrivesAt);
  const isArrived = Date.now() > arrivesAt.getTime();

  return (
    <tr className="border-b border-admin-border hover:bg-admin-surface-hover">
      <td className="px-4 py-3">
        <span className="text-sm text-admin-text-bright capitalize">{fleet.mission}</span>
      </td>
      <td className="px-4 py-3 text-xs text-admin-text-dim">
        {fleet.originPlanet?.name ?? '?'} → {fleet.targetPlanet?.name ?? '?'}
      </td>
      <td className="px-4 py-3 text-xs text-admin-text">
        {fleet.ships.map((s) => `${s.count}x ${s.type}`).join(', ') || '—'}
      </td>
      <td className="px-4 py-3 text-xs text-admin-text-dim">
        {isArrived ? 'Arrived' : arrivesAt.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-xs text-admin-text-dim">
        {fleet.returnsAt ? new Date(fleet.returnsAt).toLocaleString() : '—'}
      </td>
    </tr>
  );
}