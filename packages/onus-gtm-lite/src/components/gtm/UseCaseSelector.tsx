import { getUseCasesForDiscipline } from "@/config/use-cases";
import type { DisciplineId } from "@/config/disciplines";

export function UseCaseSelector({
  discipline,
  activeId,
  onChange,
}: {
  discipline: DisciplineId;
  activeId: string;
  onChange: (id: string) => void;
}) {
  const cases = getUseCasesForDiscipline(discipline);
  return (
    <div>
      <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
        Use case
      </div>
      <select
        value={activeId}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background border border-border h-8 px-2 text-xs w-full focus:border-[var(--studio-accent)] focus:outline-none"
      >
        {cases.map((u) => (
          <option key={u.id} value={u.id}>
            {u.title}
          </option>
        ))}
      </select>
    </div>
  );
}
