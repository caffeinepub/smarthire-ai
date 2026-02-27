interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: number;
  location: string;
  expectedSalary: number;
  skills: string[];
  companies: string[];
}

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <div
      className="rounded-lg p-4 border animate-fade-up"
      style={{
        backgroundColor: "oklch(0.14 0.02 255)",
        borderColor: "oklch(0.72 0.19 200 / 0.2)",
        boxShadow: "0 0 16px oklch(0.72 0.19 200 / 0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono font-medium px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "oklch(0.72 0.19 200 / 0.12)",
                color: "oklch(0.72 0.19 200)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              CANDIDATE
            </span>
          </div>
          <h3
            className="text-foreground font-semibold mt-1.5"
            style={{ fontSize: 15 }}
          >
            {candidate.name}
          </h3>
          <p className="text-muted-foreground text-sm">{candidate.email}</p>
        </div>
        <div
          className="text-right"
          style={{ color: "oklch(0.72 0.19 200)" }}
        >
          <div
            className="font-mono font-semibold text-sm"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {candidate.experience}yr
          </div>
          <div className="text-xs text-muted-foreground">exp</div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/60">📍</span>
          <span className="text-muted-foreground truncate">{candidate.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/60">💰</span>
          <span className="text-muted-foreground font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ${candidate.expectedSalary.toLocaleString()}
          </span>
        </div>
        {candidate.phone && (
          <div className="flex items-center gap-1.5 col-span-2">
            <span className="text-muted-foreground/60">📞</span>
            <span className="text-muted-foreground text-xs">{candidate.phone}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {candidate.skills && candidate.skills.length > 0 && (
        <div className="mb-2.5">
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-1.5" style={{ fontSize: 10 }}>
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: "oklch(0.72 0.19 200 / 0.1)",
                  color: "oklch(0.82 0.12 200)",
                  border: "1px solid oklch(0.72 0.19 200 / 0.2)",
                  fontSize: 11,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Companies */}
      {candidate.companies && candidate.companies.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-1.5" style={{ fontSize: 10 }}>
            Companies
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.companies.map((co) => (
              <span
                key={co}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "oklch(0.22 0.03 255)",
                  color: "oklch(0.65 0.02 230)",
                  border: "1px solid oklch(0.28 0.04 255)",
                  fontSize: 11,
                }}
              >
                {co}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
