type Props = {
  done: number;
  total: number;
  className?: string;
};

export function ProgressBar({ done, total, className = "" }: Props) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done === total;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-hover">
        <div
          className={`h-full rounded-full transition-all duration-300 ${complete ? "bg-ok" : "bg-accent"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="shrink-0 font-mono text-[11.5px] text-faint tabular-nums">
        {done}/{total}
      </span>
    </div>
  );
}
