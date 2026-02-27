interface Job {
  id: string;
  title: string;
  requiredExp: number;
  loc?: string;
  location?: string;
  salary: number;
  skills: string[];
}

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const jobLocation = job.loc ?? job.location ?? "—";

  return (
    <div
      className="rounded-lg p-4 border animate-fade-up delay-100"
      style={{
        backgroundColor: "oklch(0.14 0.02 255)",
        borderColor: "oklch(0.62 0.2 310 / 0.2)",
        boxShadow: "0 0 16px oklch(0.62 0.2 310 / 0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono font-medium px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "oklch(0.62 0.2 310 / 0.12)",
                color: "oklch(0.75 0.15 310)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              JOB POSTING
            </span>
          </div>
          <h3
            className="text-foreground font-semibold mt-1.5"
            style={{ fontSize: 15 }}
          >
            {job.title}
          </h3>
        </div>
        <div
          className="text-right"
          style={{ color: "oklch(0.75 0.15 310)" }}
        >
          <div
            className="font-mono font-semibold text-sm"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {job.requiredExp}yr
          </div>
          <div className="text-xs text-muted-foreground">req exp</div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/60">📍</span>
          <span className="text-muted-foreground truncate">{jobLocation}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/60">💼</span>
          <span className="text-muted-foreground font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ${job.salary.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Required Skills */}
      {job.skills && job.skills.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-1.5" style={{ fontSize: 10 }}>
            Required Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: "oklch(0.62 0.2 310 / 0.1)",
                  color: "oklch(0.80 0.1 310)",
                  border: "1px solid oklch(0.62 0.2 310 / 0.25)",
                  fontSize: 11,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
