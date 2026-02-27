import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { CircleScore } from "./components/CircleScore";
import { BreakdownBar } from "./components/BreakdownBar";
import { CandidateCard } from "./components/CandidateCard";
import { JobCard } from "./components/JobCard";
import { useActor } from "./hooks/useActor";

// ---------- Types ----------
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

interface Job {
  id: string;
  title: string;
  requiredExp: number;
  loc?: string;
  location?: string;
  salary: number;
  skills: string[];
}

interface AnalysisResult {
  fitScore: number;
  trustScore: number;
  riskLevel: "Low" | "Medium" | "High";
  breakdown: {
    skills: number;
    experience: number;
    salary: number;
    location: number;
  };
  issues: string[];
  aiRecommendation: string;
}

// ---------- Helpers ----------
const RISK_STYLES: Record<string, { label: string; bg: string; text: string; border: string; glow: string }> = {
  Low: {
    label: "Low Risk",
    bg: "oklch(0.72 0.18 150 / 0.12)",
    text: "oklch(0.82 0.15 150)",
    border: "oklch(0.72 0.18 150 / 0.4)",
    glow: "oklch(0.72 0.18 150 / 0.15)",
  },
  Medium: {
    label: "Medium Risk",
    bg: "oklch(0.78 0.2 80 / 0.12)",
    text: "oklch(0.85 0.18 80)",
    border: "oklch(0.78 0.2 80 / 0.4)",
    glow: "oklch(0.78 0.2 80 / 0.15)",
  },
  High: {
    label: "High Risk",
    bg: "oklch(0.65 0.22 25 / 0.12)",
    text: "oklch(0.78 0.2 25)",
    border: "oklch(0.65 0.22 25 / 0.4)",
    glow: "oklch(0.65 0.22 25 / 0.15)",
  },
};

// ---------- Loading Skeleton ----------
function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{ backgroundColor: "oklch(0.22 0.03 255)" }}
    />
  );
}

function DropdownSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonPulse className="h-4 w-24" />
      <SkeletonPulse className="h-11 w-full" />
    </div>
  );
}

// ---------- GeminiConfig ----------
interface GeminiConfigProps {
  onSave: (key: string) => Promise<void>;
}

function GeminiConfig({ onSave }: GeminiConfigProps) {
  const [open, setOpen] = useState(false);
  const [keyValue, setKeyValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!keyValue.trim()) return;
    setSaving(true);
    try {
      await onSave(keyValue.trim());
      toast.success("Gemini API key saved successfully");
      setKeyValue("");
      setOpen(false);
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
        style={{
          backgroundColor: open ? "oklch(0.72 0.19 200 / 0.12)" : "oklch(0.18 0.025 255)",
          color: open ? "oklch(0.72 0.19 200)" : "oklch(0.55 0.02 230)",
          border: `1px solid ${open ? "oklch(0.72 0.19 200 / 0.3)" : "oklch(0.28 0.04 255)"}`,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
        Configure AI
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-lg p-3 z-50 animate-fade-in"
          style={{
            backgroundColor: "oklch(0.16 0.025 255)",
            border: "1px solid oklch(0.28 0.04 255)",
            boxShadow: "0 8px 32px oklch(0.05 0 0 / 0.5)",
          }}
        >
          <p className="text-xs text-muted-foreground mb-2.5" style={{ lineHeight: 1.5 }}>
            Enter your{" "}
            <span style={{ color: "oklch(0.72 0.19 200)" }}>Google Gemini API key</span>{" "}
            to enable AI-powered recommendations.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="AIza..."
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="flex-1 px-3 py-2 rounded-md text-sm outline-none font-mono"
              style={{
                backgroundColor: "oklch(0.12 0.02 255)",
                border: "1px solid oklch(0.28 0.04 255)",
                color: "oklch(0.85 0.01 220)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
              }}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !keyValue.trim()}
              className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, oklch(0.65 0.19 200), oklch(0.55 0.18 195))",
                color: "oklch(0.96 0.005 220)",
              }}
            >
              {saving ? "..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- SeedButton ----------
interface SeedButtonProps {
  onSeed: () => Promise<void>;
}

function SeedButton({ onSeed }: SeedButtonProps) {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await onSeed();
      toast.success("Sample data seeded successfully");
    } catch {
      toast.error("Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSeed}
      disabled={seeding}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
      style={{
        backgroundColor: "oklch(0.18 0.025 255)",
        color: "oklch(0.55 0.02 230)",
        border: "1px solid oklch(0.28 0.04 255)",
      }}
    >
      {seeding ? (
        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      Seed Data
    </button>
  );
}

// ---------- Main App ----------
export default function App() {
  const { actor } = useActor();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultKey, setResultKey] = useState(0); // force re-mount to retrigger animations

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) ?? null;
  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;

  const loadData = useCallback(async () => {
    if (!actor) return;
    setLoadingData(true);
    setError(null);
    try {
      const [cStr, jStr] = await Promise.all([
        actor.getCandidates(),
        actor.getJobs(),
      ]);
      setCandidates(JSON.parse(cStr) as Candidate[]);
      setJobs(JSON.parse(jStr) as Job[]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load data";
      setError(msg);
      toast.error("Failed to load candidates and jobs");
    } finally {
      setLoadingData(false);
    }
  }, [actor]);

  const handleSeedData = useCallback(async () => {
    if (!actor) return;
    await actor.seedData();
    await loadData();
  }, [actor, loadData]);

  useEffect(() => {
    if (!actor) return;
    // Seed data then load
    actor
      .seedData()
      .then(() => loadData())
      .catch(() => loadData());
  }, [actor, loadData]);

  const handleAnalyze = async () => {
    if (!selectedCandidateId || !selectedJobId || !actor) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const resStr = await actor.analyze(selectedCandidateId, selectedJobId);
      const parsed = JSON.parse(resStr) as AnalysisResult;
      setResult(parsed);
      setResultKey((k) => k + 1);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Analysis failed";
      setError(msg);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSetGeminiKey = async (key: string) => {
    if (!actor) throw new Error("Not connected");
    await actor.setGeminiKey(key);
  };

  const riskStyle = result ? (RISK_STYLES[result.riskLevel] ?? RISK_STYLES["Low"]) : null;

  return (
    <div
      className="min-h-screen grid-bg"
      style={{ backgroundColor: "oklch(0.11 0.015 260)" }}
    >
      <Toaster position="top-right" theme="dark" />

      {/* ---- HEADER ---- */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: "oklch(0.12 0.018 258 / 0.95)",
          borderColor: "oklch(0.28 0.04 255)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{
                background: "linear-gradient(135deg, oklch(0.65 0.19 200), oklch(0.55 0.18 195))",
                boxShadow: "0 0 12px oklch(0.72 0.19 200 / 0.3)",
              }}
            >
              ⚡
            </div>
            <div>
              <span
                className="font-bold text-foreground tracking-tight"
                style={{ fontSize: 16, letterSpacing: "-0.02em" }}
              >
                SmartHire
              </span>
              <span
                className="font-bold ml-1"
                style={{ fontSize: 16, color: "oklch(0.72 0.19 200)", letterSpacing: "-0.02em" }}
              >
                AI
              </span>
            </div>
            <div
              className="hidden sm:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "oklch(0.28 0.04 255)",
                color: "oklch(0.55 0.02 230)",
                border: "1px solid oklch(0.33 0.05 255)",
              }}
            >
              Dual Fit &amp; Trust Engine
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <SeedButton onSeed={handleSeedData} />
            <GeminiConfig onSave={handleSetGeminiKey} />
          </div>
        </div>
      </header>

      {/* ---- MAIN ---- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1
            className="font-bold text-foreground"
            style={{ fontSize: 26, letterSpacing: "-0.03em" }}
          >
            Candidate Analysis
          </h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: 14 }}>
            Select a candidate and job posting to generate fit &amp; trust scores powered by AI.
          </p>
        </div>

        {/* ---- ANALYSIS CARD ---- */}
        <section
          className="rounded-xl border mb-6 p-6"
          style={{
            backgroundColor: "oklch(0.14 0.02 255)",
            borderColor: "oklch(0.28 0.04 255)",
            boxShadow: "0 4px 24px oklch(0.05 0 0 / 0.4)",
          }}
        >
          {/* Dropdowns + Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {loadingData ? (
              <>
                <div className="flex-1"><DropdownSkeleton /></div>
                <div className="flex-1"><DropdownSkeleton /></div>
                <SkeletonPulse className="h-11 w-32" />
              </>
            ) : (
              <>
                {/* Candidate dropdown */}
                <div className="flex-1 flex flex-col gap-2">
                  <label
                    htmlFor="candidate-select"
                    className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
                    style={{ fontSize: 10, letterSpacing: "0.1em" }}
                  >
                    Candidate
                  </label>
                  <select
                    id="candidate-select"
                    value={selectedCandidateId}
                    onChange={(e) => {
                      setSelectedCandidateId(e.target.value);
                      setResult(null);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: "oklch(0.18 0.025 255)",
                      border: `1px solid ${selectedCandidateId ? "oklch(0.72 0.19 200 / 0.35)" : "oklch(0.28 0.04 255)"}`,
                      color: selectedCandidateId ? "oklch(0.92 0.005 220)" : "oklch(0.45 0.02 230)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <option value="" disabled>
                      Select candidate...
                    </option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id} style={{ backgroundColor: "oklch(0.18 0.025 255)" }}>
                        {c.name} — {c.experience}yr exp
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job dropdown */}
                <div className="flex-1 flex flex-col gap-2">
                  <label
                    htmlFor="job-select"
                    className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
                    style={{ fontSize: 10, letterSpacing: "0.1em" }}
                  >
                    Job Posting
                  </label>
                  <select
                    id="job-select"
                    value={selectedJobId}
                    onChange={(e) => {
                      setSelectedJobId(e.target.value);
                      setResult(null);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: "oklch(0.18 0.025 255)",
                      border: `1px solid ${selectedJobId ? "oklch(0.62 0.2 310 / 0.35)" : "oklch(0.28 0.04 255)"}`,
                      color: selectedJobId ? "oklch(0.92 0.005 220)" : "oklch(0.45 0.02 230)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <option value="" disabled>
                      Select job posting...
                    </option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id} style={{ backgroundColor: "oklch(0.18 0.025 255)" }}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Analyze button */}
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!selectedCandidateId || !selectedJobId || analyzing || !actor}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  style={{
                    background:
                      !selectedCandidateId || !selectedJobId || analyzing
                        ? "oklch(0.22 0.03 255)"
                        : "linear-gradient(135deg, oklch(0.65 0.19 200), oklch(0.55 0.18 195), oklch(0.55 0.19 220))",
                    color: "oklch(0.96 0.005 220)",
                    boxShadow:
                      selectedCandidateId && selectedJobId && !analyzing
                        ? "0 0 16px oklch(0.72 0.19 200 / 0.25)"
                        : "none",
                    fontFamily: "'Space Grotesk', sans-serif",
                    height: 44,
                  }}
                >
                  {analyzing ? (
                    <>
                      <svg
                        className="animate-spin"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      Analyze
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div
              className="mt-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
              style={{
                backgroundColor: "oklch(0.65 0.22 25 / 0.1)",
                border: "1px solid oklch(0.65 0.22 25 / 0.3)",
                color: "oklch(0.78 0.2 25)",
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* ---- INFO CARDS (selected candidate & job) ---- */}
        {(selectedCandidate || selectedJob) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {selectedCandidate && <CandidateCard candidate={selectedCandidate} />}
            {selectedJob && <JobCard job={selectedJob} />}
          </div>
        )}

        {/* ---- RESULTS ---- */}
        {result && (
          <div key={resultKey} className="space-y-5">
            {/* Scores Row */}
            <div
              className="rounded-xl border p-6 animate-fade-up"
              style={{
                backgroundColor: "oklch(0.14 0.02 255)",
                borderColor: "oklch(0.28 0.04 255)",
                boxShadow: "0 4px 24px oklch(0.05 0 0 / 0.4)",
              }}
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono uppercase tracking-widest"
                    style={{ color: "oklch(0.72 0.19 200)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
                  >
                    Analysis Results
                  </span>
                </div>
                {/* Risk badge */}
                {riskStyle && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border"
                    style={{
                      backgroundColor: riskStyle.bg,
                      color: riskStyle.text,
                      borderColor: riskStyle.border,
                      boxShadow: `0 0 12px ${riskStyle.glow}`,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: riskStyle.text }}
                    />
                    {riskStyle.label}
                  </div>
                )}
              </div>

              {/* Circles */}
              <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
                <CircleScore score={result.fitScore} label="Fit Score" size={160} />
                <div
                  className="w-px h-24 hidden sm:block"
                  style={{ backgroundColor: "oklch(0.28 0.04 255)" }}
                />
                <CircleScore score={result.trustScore} label="Trust Score" size={160} />
              </div>
            </div>

            {/* Breakdown + Issues 2-col grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Breakdown bars */}
              <div
                className="rounded-xl border p-6 animate-fade-up delay-200"
                style={{
                  backgroundColor: "oklch(0.14 0.02 255)",
                  borderColor: "oklch(0.28 0.04 255)",
                  boxShadow: "0 4px 24px oklch(0.05 0 0 / 0.4)",
                }}
              >
                <h2
                  className="text-sm font-semibold uppercase tracking-widest mb-5"
                  style={{ color: "oklch(0.72 0.19 200)", fontSize: 10, letterSpacing: "0.12em", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Score Breakdown
                </h2>
                <div className="space-y-4">
                  <BreakdownBar label="Skills" score={result.breakdown.skills} icon="🎯" delay={0} />
                  <BreakdownBar label="Experience" score={result.breakdown.experience} icon="📅" delay={100} />
                  <BreakdownBar label="Salary" score={result.breakdown.salary} icon="💰" delay={200} />
                  <BreakdownBar label="Location" score={result.breakdown.location} icon="📍" delay={300} />
                </div>
              </div>

              {/* Issues list */}
              <div
                className="rounded-xl border p-6 animate-fade-up delay-300"
                style={{
                  backgroundColor: "oklch(0.14 0.02 255)",
                  borderColor: "oklch(0.28 0.04 255)",
                  boxShadow: "0 4px 24px oklch(0.05 0 0 / 0.4)",
                }}
              >
                <h2
                  className="text-sm font-semibold uppercase tracking-widest mb-5"
                  style={{ color: "oklch(0.72 0.19 200)", fontSize: 10, letterSpacing: "0.12em", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Trust Signals
                </h2>

                {result.issues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{
                        backgroundColor: "oklch(0.72 0.18 150 / 0.12)",
                        border: "1px solid oklch(0.72 0.18 150 / 0.3)",
                      }}
                    >
                      ✓
                    </div>
                    <p
                      className="text-sm font-medium text-center"
                      style={{ color: "oklch(0.82 0.15 150)" }}
                    >
                      No trust issues detected
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Candidate profile looks clean
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {result.issues.map((issue) => (
                      <li
                        key={issue}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg"
                        style={{
                          backgroundColor: "oklch(0.65 0.22 25 / 0.07)",
                          border: "1px solid oklch(0.65 0.22 25 / 0.2)",
                        }}
                      >
                        <span className="text-base shrink-0 mt-0.5">⚠️</span>
                        <span className="text-sm" style={{ color: "oklch(0.82 0.15 25)" }}>
                          {issue}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* AI Recommendation */}
            {result.aiRecommendation && (
              <div
                className="rounded-xl border p-6 animate-fade-up delay-400"
                style={{
                  backgroundColor: "oklch(0.14 0.02 255)",
                  borderColor: "oklch(0.72 0.19 200 / 0.2)",
                  boxShadow: "0 0 24px oklch(0.72 0.19 200 / 0.06), 0 4px 24px oklch(0.05 0 0 / 0.4)",
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.65 0.19 200), oklch(0.55 0.18 195))",
                      boxShadow: "0 0 12px oklch(0.72 0.19 200 / 0.3)",
                    }}
                  >
                    🤖
                  </div>
                  <div>
                    <h2
                      className="font-semibold text-foreground"
                      style={{ fontSize: 14 }}
                    >
                      AI Recommendation
                    </h2>
                    <p className="text-xs text-muted-foreground">Powered by Google Gemini</p>
                  </div>
                  <div
                    className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "oklch(0.72 0.19 200 / 0.1)",
                      color: "oklch(0.72 0.19 200)",
                      border: "1px solid oklch(0.72 0.19 200 / 0.2)",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    AI Generated
                  </div>
                </div>

                {/* Recommendation text */}
                <div
                  className="px-4 py-4 rounded-lg relative"
                  style={{
                    backgroundColor: "oklch(0.12 0.018 258)",
                    border: "1px solid oklch(0.22 0.03 255)",
                  }}
                >
                  <p
                    className="text-foreground leading-relaxed italic"
                    style={{ fontSize: 14, lineHeight: 1.75, color: "oklch(0.82 0.005 220)" }}
                  >
                    "{result.aiRecommendation}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state when nothing analyzed */}
        {!result && !analyzing && !loadingData && (
          <div
            className="rounded-xl border border-dashed p-12 flex flex-col items-center justify-center gap-4 text-center"
            style={{ borderColor: "oklch(0.28 0.04 255)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                backgroundColor: "oklch(0.72 0.19 200 / 0.08)",
                border: "1px solid oklch(0.72 0.19 200 / 0.15)",
              }}
            >
              📊
            </div>
            <div>
              <p className="font-semibold text-foreground" style={{ fontSize: 15 }}>
                Ready to analyze
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Select a candidate and job posting above, then click Analyze.
              </p>
            </div>
          </div>
        )}

        {/* Loading state during analysis */}
        {analyzing && (
          <div
            className="rounded-xl border p-12 flex flex-col items-center justify-center gap-5 text-center"
            style={{
              backgroundColor: "oklch(0.14 0.02 255)",
              borderColor: "oklch(0.72 0.19 200 / 0.2)",
            }}
          >
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl animate-pulse"
                style={{
                  background: "linear-gradient(135deg, oklch(0.65 0.19 200 / 0.2), oklch(0.55 0.18 195 / 0.2))",
                  border: "1px solid oklch(0.72 0.19 200 / 0.3)",
                }}
              >
                ⚡
              </div>
            </div>
            <div>
              <p
                className="font-semibold text-foreground"
                style={{ fontSize: 15 }}
              >
                Analyzing candidate match…
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Computing fit score, trust score, and AI recommendation
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: "oklch(0.72 0.19 200)",
                    animationDelay: `${i * 200}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ---- FOOTER ---- */}
      <footer
        className="mt-12 border-t py-6"
        style={{ borderColor: "oklch(0.28 0.04 255)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2026 SmartHire AI. Built with ❤️ using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "oklch(0.72 0.19 200)" }}
            >
              caffeine.ai
            </a>
          </span>
          <span
            className="font-mono text-xs"
            style={{ color: "oklch(0.35 0.03 255)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            Dual Fit &amp; Trust Scoring Engine v1.0
          </span>
        </div>
      </footer>
    </div>
  );
}
