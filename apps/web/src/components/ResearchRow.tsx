interface ResearchRowProps {
  research: {
    type: string;
    level: number;
    isResearching: boolean;
    researchFinishAt: string | null;
  };
}

export function ResearchRow({ research }: ResearchRowProps) {
  const finishAt = research.researchFinishAt ? new Date(research.researchFinishAt) : null;
  const isDone = finishAt ? Date.now() > finishAt.getTime() : false;

  return (
    <tr className="border-b border-admin-border hover:bg-admin-surface-hover">
      <td className="px-4 py-3 text-sm text-admin-text-bright">{research.type.replace(/_/g, ' ')}</td>
      <td className="px-4 py-3 text-sm text-admin-text">{research.level}</td>
      <td className="px-4 py-3 text-xs">
        {research.isResearching ? (
          <span className="text-admin-warning">
            {isDone ? 'Completing...' : finishAt?.toLocaleString()}
          </span>
        ) : (
          <span className="text-admin-text-dim">Idle</span>
        )}
      </td>
    </tr>
  );
}