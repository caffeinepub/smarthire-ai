# SmartHire AI – Dual Fit & Trust Scoring Recruitment Engine

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full data model: Candidate (id, name, email, phone, experience, location, expected_salary), CandidateSkills, EmploymentHistory, Job (id, title, required_experience, location, offered_salary), JobSkills, Analysis (fit_score, trust_score, risk_level, ai_recommendation, created_at)
- Fit Score engine: weighted calculation — skills 40%, experience 30%, salary 20%, location 10%
- Trust Score engine: penalty-based (email format check, duplicate email detection, overlapping employment dates, job-hopping detection); returns trustScore, riskLevel (Low/Medium/High), issues[]
- AI integration: HTTP outcall to Google Gemini API to generate hiring recommendation paragraph given candidate + job + fit/trust context
- Backend APIs: CRUD for candidates (with skills and employment history), CRUD for jobs (with skills), POST /analyze (candidateId, jobId) → fitScore, trustScore, riskLevel, breakdown, issues, aiRecommendation
- Seed data: a few sample candidates and jobs so the UI works immediately
- Dark dashboard frontend: candidate dropdown, job dropdown, analyze button, circular fit score display, circular trust score display, color-coded risk badge, breakdown section, issues list, AI recommendation text area

### Modify
- None (new project)

### Remove
- None

## Implementation Plan
1. Write spec.md (this file)
2. Select http-outcalls component for Gemini API integration
3. Generate Motoko backend with all data models, fit score logic, trust score logic, Gemini HTTP outcall, and full API
4. Build React TypeScript frontend with dark dashboard UI using Tailwind CSS

## UX Notes
- Dark theme dashboard, modern feel
- Circular SVG-based score gauges (0-100) with color gradients (green=high, yellow=medium, red=low)
- Risk badge: green=Low, yellow=Medium, red=High
- Breakdown section shows individual score components with progress bars
- Issues list shows trust problems with icons
- AI recommendation displayed as a styled text card
- Responsive layout, works on desktop and mobile
- Dropdowns populate from backend data on load
- Loading states while analysis runs
