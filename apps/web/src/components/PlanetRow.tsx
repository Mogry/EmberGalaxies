interface PlanetRowProps {
  planet: {
    id: string;
    name: string;
    slot: number;
    system: { index: number; galaxyIndex?: number };
    iron: number;
    silver: number;
    ember: number;
    h2: number;
    energy: number;
    fieldsUsed: number;
    fieldsMax: number;
    buildings: { type: string; level: number }[];
  };
}

export function PlanetRow({ planet }: PlanetRowProps) {
  return (
    <tr className="border-b border-admin-border hover:bg-admin-surface-hover">
      <td className="px-4 py-3 text-sm text-admin-text-bright">{planet.name}</td>
      <td className="px-4 py-3 text-xs text-admin-text-dim">
        G{planet.system.galaxyIndex ?? '?'} S{planet.system.index} P{planet.slot}
      </td>
      <td className="px-4 py-3 text-xs text-admin-text">
        {Math.floor(planet.iron).toLocaleString()} / {Math.floor(planet.silver).toLocaleString()} / {Math.floor(planet.ember).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-xs text-admin-text">
        {Math.floor(planet.h2).toLocaleString()} / {Math.floor(planet.energy).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-xs text-admin-text-dim">{planet.fieldsUsed}/{planet.fieldsMax}</td>
      <td className="px-4 py-3 text-xs text-admin-text-dim">
        {planet.buildings.filter((b) => b.level > 0).length} buildings
      </td>
    </tr>
  );
}