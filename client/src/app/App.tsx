import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, ArrowRight, X, Plus, Search, User, LogOut,
  Settings, Bell, ChevronDown, Check, Star, GraduationCap,
  Zap, Clock, GitCompare, ChevronLeft, BookOpen, ExternalLink,
  Building2, MapPin,
} from "lucide-react";
import { apiPost } from "../api";

// ── Types ─────────────────────────────────────────────────────────────────────
type Screen = "login" | "profile" | "loading" | "results" | "history" | "explore" | "learning-plan";

// ── Brand palette ─────────────────────────────────────────────────────────────
const C = {
  indigo: "#4F46E5",
  indigoLight: "#EEF2FF",
  indigoMid: "#818CF8",
  amber: "#F59E0B",
  amberLight: "#FEF3C7",
  teal: "#14B8A6",
  tealLight: "#CCFBF1",
  charcoal: "#18181B",
  offWhite: "#FAFAF9",
  white: "#FFFFFF",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
} as const;

// CSS keyframes injected once — decorative blob drift and pill breathe are
// continuous and purely visual, so CSS @keyframes is lighter than JS-driven motion.
const GLOBAL_STYLES = `
@keyframes blobDrift1 {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  50%       { transform: translate(24px, -18px) scale(1.06); }
}
@keyframes blobDrift2 {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  50%       { transform: translate(-20px, 16px) scale(0.95); }
}
@keyframes blobDrift3 {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  50%       { transform: translate(14px, 22px) scale(1.04); }
}
@keyframes pillBreathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.035); opacity: 0.9; }
}
`;

// ── Mock data ─────────────────────────────────────────────────────────────────
const SKILL_OPTIONS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL",
  "Machine Learning", "Data Analysis", "Product Management", "UX Design",
  "Leadership", "Communication", "Project Management", "Agile", "Git",
  "AWS", "Docker", "TensorFlow", "Figma", "Marketing", "Finance",
  "Excel", "Tableau", "R", "Java", "Go", "Statistics", "Rust",
];

const INTEREST_OPTIONS = [
  "Artificial Intelligence", "Sustainability", "Healthcare", "Education",
  "FinTech", "Gaming", "Social Impact", "Creative Tech", "Robotics",
  "Biotechnology", "Space", "Media", "Policy", "Law", "Real Estate",
  "Travel", "Food Tech", "Fashion", "Sports", "Architecture",
];

const ACADEMIC_OPTIONS = [
  "Computer Science", "Data Science", "Business Administration",
  "Electrical Engineering", "Mechanical Engineering", "Psychology",
  "Economics", "Mathematics", "Physics", "Biology", "Chemistry",
  "Communications", "Marketing", "Design", "Philosophy", "Law",
  "Medicine", "Architecture", "Political Science", "Sociology",
];

const CAREER_RESULTS = [
  {
    id: 1,
    title: "AI Product Manager",
    subtitle: "High-Growth · Tech",
    fit: 94,
    reasoning:
      "Your blend of Python proficiency and product instincts positions you at the intersection of AI capability and user need. Companies are paying a 40% premium for PMs who can read model outputs critically.",
    learn: ["Prompt Engineering", "A/B Testing at Scale", "LLM Evaluation"],
    salary: "$165K – $210K",
    growth: "+34% YoY",
    best: true,
  },
  {
    id: 2,
    title: "ML Engineering Lead",
    subtitle: "Senior · Infrastructure",
    fit: 81,
    reasoning:
      "Your strong data analysis foundation and Python skills create a natural stepping stone. The gap in distributed systems is bridgeable within 18 months with focused effort on MLOps tooling.",
    learn: ["MLflow", "Distributed Training", "Feature Stores"],
    salary: "$185K – $240K",
    growth: "+28% YoY",
    best: false,
  },
  {
    id: 3,
    title: "Data Strategy Consultant",
    subtitle: "Flexible · Advisory",
    fit: 73,
    reasoning:
      "Communication skills paired with technical credibility make you compelling to enterprise clients navigating data transformation — ideal if you want breadth over depth at this stage.",
    learn: ["Data Governance", "Executive Storytelling", "Cloud ROI"],
    salary: "$140K – $190K",
    growth: "+19% YoY",
    best: false,
  },
];

// Extended detail data for the ExplorePathScreen
const CAREER_EXTRAS: Record<number, {
  dayInLife: string[];
  trajectory: { title: string; salary: string }[];
  companies: string[];
}> = {
  1: {
    dayInLife: [
      "Morning: Review overnight model eval metrics and flag regressions to engineering",
      "Midday: Co-write PRD with a prompt engineer for the next LLM-powered feature",
      "Afternoon: A/B test read-out with data science — discuss confidence intervals",
      "End of day: Stakeholder sync on roadmap prioritization for Q3",
    ],
    trajectory: [
      { title: "Associate PM", salary: "$110K" },
      { title: "Product Manager", salary: "$145K" },
      { title: "Senior PM", salary: "$175K" },
      { title: "Director of Product", salary: "$220K+" },
    ],
    companies: ["OpenAI", "Anthropic", "Google DeepMind", "Cohere", "Mistral", "Perplexity"],
  },
  2: {
    dayInLife: [
      "Morning: Code review for the feature store refactor — merging 3 PRs",
      "Midday: Debug a data drift issue caught by the model monitoring pipeline",
      "Afternoon: Architect session for the new batch inference system",
      "End of day: Mentor a junior ML engineer on MLflow experiment tracking",
    ],
    trajectory: [
      { title: "ML Engineer I", salary: "$130K" },
      { title: "ML Engineer II", salary: "$160K" },
      { title: "Senior ML Engineer", salary: "$190K" },
      { title: "Staff ML Engineer", salary: "$240K+" },
    ],
    companies: ["Meta AI", "Apple ML", "Stripe", "Waymo", "Databricks", "Hugging Face"],
  },
  3: {
    dayInLife: [
      "Morning: Prepare executive briefing on data governance maturity",
      "Midday: Discovery call with a Fortune 500 CDO scoping a 6-month engagement",
      "Afternoon: Workshop with client's analytics team on cloud migration strategy",
      "End of day: Write up findings and draft next week's client agenda",
    ],
    trajectory: [
      { title: "Analyst", salary: "$95K" },
      { title: "Consultant", salary: "$125K" },
      { title: "Senior Consultant", salary: "$155K" },
      { title: "Principal", salary: "$200K+" },
    ],
    companies: ["McKinsey QuantumBlack", "BCG Gamma", "Accenture AI", "Deloitte", "KPMG", "Palantir"],
  },
};

// Module data for the LearningPlanScreen — keyed by career id
const LEARNING_MODULES: Record<number, {
  name: string;
  time: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  resources: string[];
}[]> = {
  1: [
    {
      name: "Prompt Engineering",
      time: "~3 weeks",
      difficulty: "beginner",
      resources: ["Prompt Engineering Guide (Dair.ai)", "OpenAI Cookbook", "Anthropic prompt library"],
    },
    {
      name: "A/B Testing at Scale",
      time: "~4 weeks",
      difficulty: "intermediate",
      resources: ["Trustworthy Online Controlled Experiments (O'Reilly)", "Experimentation at Airbnb (blog)", "Netflix Tech Blog: A/B Testing"],
    },
    {
      name: "LLM Evaluation",
      time: "~3 weeks",
      difficulty: "advanced",
      resources: ["LMSYS Chatbot Arena paper", "Ragas evaluation framework", "BeyondTheBenchmarks newsletter"],
    },
  ],
  2: [
    {
      name: "MLflow",
      time: "~2 weeks",
      difficulty: "beginner",
      resources: ["MLflow official docs", "MLflow on Databricks tutorial", "Practical MLOps (O'Reilly)"],
    },
    {
      name: "Distributed Training",
      time: "~5 weeks",
      difficulty: "advanced",
      resources: ["Distributed Data-Parallel in PyTorch", "Megatron-LM paper", "Horovod GitHub README"],
    },
    {
      name: "Feature Stores",
      time: "~3 weeks",
      difficulty: "intermediate",
      resources: ["Feast documentation", "Tecton feature engineering guide", "Hopsworks tutorials"],
    },
  ],
  3: [
    {
      name: "Data Governance",
      time: "~4 weeks",
      difficulty: "intermediate",
      resources: ["DAMA-DMBOK Guide", "Google Cloud Data Catalog docs", "Alation Data Intelligence blog"],
    },
    {
      name: "Executive Storytelling",
      time: "~2 weeks",
      difficulty: "beginner",
      resources: ["McKinsey Structured Communication guide", "The Pyramid Principle (Minto)", "HBR: Data Storytelling"],
    },
    {
      name: "Cloud ROI",
      time: "~3 weeks",
      difficulty: "intermediate",
      resources: ["AWS Total Cost of Ownership calculator", "FinOps Foundation primers", "Gartner Cloud Cost Optimization"],
    },
  ],
};

const HISTORY_SNAPSHOTS = [
  {
    id: "snap-1",
    date: "March 2024",
    skills: ["Python", "Data Analysis", "Communication"],
    interests: ["Artificial Intelligence", "Healthcare"],
    academic: "Computer Science",
    topResult: "Data Analyst",
    fitScore: 68,
  },
  {
    id: "snap-2",
    date: "June 2024",
    skills: ["Python", "Data Analysis", "Communication", "Machine Learning", "SQL"],
    interests: ["Artificial Intelligence", "Healthcare", "FinTech"],
    academic: "Computer Science",
    topResult: "ML Engineer",
    fitScore: 79,
  },
  {
    id: "snap-3",
    date: "October 2024",
    skills: ["Python", "Data Analysis", "Communication", "Machine Learning", "SQL", "Product Management"],
    interests: ["Artificial Intelligence", "FinTech", "Sustainability"],
    academic: "Computer Science",
    topResult: "AI Product Manager",
    fitScore: 91,
  },
];

const GROWTH_DATA = [
  { month: "Mar", score: 68 },
  { month: "Apr", score: 72 },
  { month: "May", score: 75 },
  { month: "Jun", score: 79 },
  { month: "Jul", score: 83 },
  { month: "Aug", score: 85 },
  { month: "Sep", score: 88 },
  { month: "Oct", score: 91 },
];

const MICROCOPY = [
  "Analyzing your skill graph…",
  "Matching career paths…",
  "Consulting labor market data…",
  "Calculating growth trajectories…",
  "Personalizing your results…",
];

// ── Shared components ─────────────────────────────────────────────────────────

function FitCircle({ value, size = 72 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 90 ? C.teal : value >= 75 ? C.indigo : C.amber;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.gray200} strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={4}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <span className="absolute text-xs font-black" style={{ color }}>{value}%</span>
    </div>
  );
}

function Chip({
  label,
  color = "indigo",
  onRemove,
}: {
  label: string;
  color?: "indigo" | "amber" | "teal" | "neutral";
  onRemove?: () => void;
}) {
  const styles = {
    indigo: { bg: C.indigoLight, text: C.indigo, border: "#C7D2FE" },
    amber: { bg: C.amberLight, text: "#92400E", border: "#FDE68A" },
    teal: { bg: C.tealLight, text: "#0F766E", border: "#99F6E4" },
    neutral: { bg: C.gray100, text: C.gray700, border: C.gray200 },
  }[color];

  // Spring pop-in/out for chip add/remove interactions
  return (
    <motion.span
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.75, opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: styles.bg, color: styles.text, border: `1px solid ${styles.border}` }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity leading-none"
        >
          <X size={11} />
        </button>
      )}
    </motion.span>
  );
}

function ChipInput({
  placeholder,
  options,
  value,
  onChange,
  color = "indigo",
}: {
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  color?: "indigo" | "amber";
}) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = options
    .filter((o) => o.toLowerCase().includes(input.toLowerCase()) && !value.includes(o))
    .slice(0, 6);

  const add = (item: string) => {
    onChange([...value, item]);
    setInput("");
  };

  const remove = (item: string) => onChange(value.filter((v) => v !== item));

  return (
    <div className="relative">
      <div
        className="min-h-[52px] rounded-2xl p-3 flex flex-wrap gap-2 cursor-text transition-all"
        style={{
          border: `1px solid ${focused ? C.indigo : C.gray200}`,
          backgroundColor: C.white,
          boxShadow: focused ? `0 0 0 3px ${C.indigoLight}` : "none",
        }}
        onClick={() => document.getElementById(`chip-${placeholder}`)?.focus()}
      >
        <AnimatePresence>
          {value.map((v) => (
            <Chip key={v} label={v} color={color} onRemove={() => remove(v)} />
          ))}
        </AnimatePresence>
        <input
          id={`chip-${placeholder}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 160)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered.length > 0) add(filtered[0]);
            if (e.key === "Backspace" && !input && value.length > 0) remove(value[value.length - 1]);
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="outline-none bg-transparent text-sm min-w-[140px] flex-1 placeholder:text-gray-400"
          style={{ color: C.charcoal }}
        />
      </div>
      {focused && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl overflow-hidden z-20"
          style={{ backgroundColor: C.white, borderColor: C.gray200 }}
        >
          {filtered.map((opt) => (
            <button
              key={opt}
              onMouseDown={() => add(opt)}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors hover:bg-gray-50"
              style={{ color: C.gray700 }}
            >
              <Plus size={13} style={{ color: C.gray400 }} />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ screen, onNav }: { screen: Screen; onNav: (s: Screen) => void }) {
  const [dropdown, setDropdown] = useState(false);

  // "results" is the active tab for explore and learning-plan sub-screens
  const activeTab = (screen === "explore" || screen === "learning-plan") ? "results" : screen;

  const navItems: { key: Screen; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "results", label: "Results" },
    { key: "history", label: "History" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 h-14 flex items-center justify-between px-6"
      style={{ backgroundColor: C.charcoal, borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      <button onClick={() => onNav("profile")} className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: C.indigo }}
        >
          <TrendingUp size={14} color="white" />
        </div>
        <span className="font-black text-base tracking-tight text-white">Pathforge</span>
      </button>

      <div className="flex items-center gap-1">
        {navItems.map(({ key, label }) => (
          // CSS transition-colors for the active indicator — a simple color swap, no spring needed
          <button
            key={key}
            onClick={() => onNav(key)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              color: activeTab === key ? "white" : "rgba(255,255,255,0.45)",
              backgroundColor: activeTab === key ? "rgba(255,255,255,0.1)" : "transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdown(!dropdown)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
          style={{ backgroundColor: dropdown ? "rgba(255,255,255,0.1)" : "transparent" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: C.indigo }}
          >
            AK
          </div>
          <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Aryan K.</span>
          <ChevronDown size={13} color="rgba(255,255,255,0.4)" />
        </button>

        <AnimatePresence>
          {dropdown && (
            // Dropdown panel fades+slides in from above
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl overflow-hidden"
              style={{ backgroundColor: C.white, borderColor: C.gray200 }}
            >
              {[
                { icon: User, label: "Your profile" },
                { icon: Settings, label: "Settings" },
                { icon: Bell, label: "Notifications" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
                  style={{ color: C.gray700 }}
                  onClick={() => setDropdown(false)}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
              <div className="border-t my-1" style={{ borderColor: C.gray100 }} />
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors text-left"
                style={{ color: "#DC2626" }}
                onClick={() => { localStorage.removeItem("token"); setDropdown(false); onNav("login"); }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = isSignup
        ? await apiPost("/auth/register", { name, email, password })
        : await apiPost("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formItems = [
    ...(isSignup ? [{ label: "Name", type: "text", value: name, set: setName, placeholder: "Aryan Sharma" }] : []),
    { label: "Email", type: "email", value: email, set: setEmail, placeholder: "aryan@example.com" },
    { label: "Password", type: "password", value: password, set: setPassword, placeholder: "••••••••" },
    ...(isSignup ? [{ label: "Confirm Password", type: "password", value: confirmPassword, set: setConfirmPassword, placeholder: "••••••••" }] : []),
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: C.offWhite }}>
      {/* Inject blob drift keyframes — CSS-driven since it's decorative and infinite */}
      <style>{GLOBAL_STYLES}</style>

      {/* Left — gradient hero */}
      <div
        className="hidden lg:flex flex-col justify-between flex-1 p-12 relative overflow-hidden"
        style={{ backgroundColor: C.charcoal }}
      >
        {/* Mesh blobs — drift via CSS @keyframes, not JS, for continuous decorative motion */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: 480, height: 480, top: "-20%", left: "-15%",
              backgroundColor: C.indigo, opacity: 0.28,
              animation: "blobDrift1 14s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: 360, height: 360, bottom: "-10%", right: "5%",
              backgroundColor: C.teal, opacity: 0.18,
              animation: "blobDrift2 18s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: 280, height: 280, top: "40%", right: "15%",
              backgroundColor: C.amber, opacity: 0.12,
              animation: "blobDrift3 11s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* Logo fades in first */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.indigo }}>
            <TrendingUp size={16} color="white" />
          </div>
          <span className="font-black text-lg tracking-tight text-white">Pathforge</span>
        </motion.div>

        {/* Hero copy block slides up with slight delay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-[380px]"
        >
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-5" style={{ color: C.teal }}>
            AI Career Intelligence
          </p>
          <h1 className="text-[52px] font-black leading-[1.02] tracking-tight text-white mb-6">
            Your future,<br />mapped by AI.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.52)" }}>
            Pathforge analyzes your skills, interests, and background to surface career paths that actually fit — not just what everyone else is doing.
          </p>

          <div className="mt-10 flex gap-8">
            {[["12K+", "Career paths mapped"], ["94%", "Satisfaction rate"], ["3min", "To your results"]].map(([num, label]) => (
              <div key={num}>
                <div className="text-2xl font-black text-white">{num}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Social proof fades in last */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="relative z-10"
        >
          <div
            className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex -space-x-2">
              {[C.indigo, C.teal, C.amber].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black text-white"
                  style={{ backgroundColor: c, borderColor: C.charcoal }}
                >
                  {["A", "S", "M"][i]}
                </div>
              ))}
            </div>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              Joined by{" "}
              <span className="text-white font-semibold">2,400+ professionals</span> this month
            </span>
          </div>
        </motion.div>
      </div>

      {/* Right — auth card */}
      <div className="flex-1 lg:max-w-[460px] flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.indigo }}>
              <TrendingUp size={16} color="white" />
            </div>
            <span className="font-black text-lg" style={{ color: C.charcoal }}>Pathforge</span>
          </div>

          {/* Heading fades in first on the right side */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.38 }}
          >
            <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: C.charcoal }}>Welcome back</h2>
            <p className="text-sm mb-8" style={{ color: C.gray500 }}>Sign in to continue your career exploration.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields stagger in on mount — each delayed by index × 60ms */}
            {formItems.map(({ label, type, value: val, set, placeholder }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
              >
                <label className="block text-sm font-semibold mb-1.5" style={{ color: C.charcoal }}>{label}</label>
                <input
                  type={type}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  required
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                  style={{
                    border: `1px solid ${C.gray200}`,
                    backgroundColor: C.white,
                    color: C.charcoal,
                  }}
                />
              </motion.div>
            ))}
            
            {error && <p className="text-sm text-red-500 -mt-1">{error}</p>}

            {/* Forgot password + submit stagger after fields */}
            {!isSignup && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.35 }}
                className="flex justify-end"
              >
                <button type="button" onClick={() => alert("Password reset coming soon")} className="text-xs font-semibold" style={{ color: C.indigo }}>
                  Forgot password?
                </button>
              </motion.div>
            )}

            {/* Submit button appears last in the stagger */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.35 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ backgroundColor: loading ? C.indigoMid : C.indigo }}
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>{isSignup ? "Create account" : "Sign in"} <ArrowRight size={15} /></>
                )}
              </button>
            </motion.div>
          </form>

          {/* Footer links fade in at the end */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <p className="mt-6 text-center text-sm" style={{ color: C.gray500 }}>
              {isSignup ? "Already have an account?" : "New here?"}{" "}
              <button
                className="font-semibold"
                style={{ color: C.indigo }}
                onClick={() => { setIsSignup(!isSignup); setError(""); }}
              >
                {isSignup ? "Sign in" : "Create an account"}
              </button>
            </p>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: C.gray200 }}>
              <p className="text-xs text-center mb-4" style={{ color: C.gray400 }}>Or continue with</p>
              <div className="grid grid-cols-2 gap-3">
                {["Google", "LinkedIn"].map((p) => (
                  <button
                    key={p}
                    onClick={() => alert(`${p} sign-in coming soon`)}
                    className="py-2.5 text-sm font-medium rounded-2xl border transition-colors hover:bg-gray-50"
                    style={{ borderColor: C.gray200, color: C.gray700 }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── Profile Builder ───────────────────────────────────────────────────────────

function ProfileBuilderScreen({ onSubmit }: { onSubmit: () => void }) {
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [academic, setAcademic] = useState("");
  const [academicSearch, setAcademicSearch] = useState("");
  const [academicOpen, setAcademicOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const strength = Math.min(
    100,
    (name ? 15 : 0) +
    Math.min(30, skills.length * 10) +
    Math.min(20, interests.length * 10) +
    (academic ? 25 : 0) +
    (role ? 10 : 0),
  );

  const canSubmit = strength >= 60;

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleGetPaths = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await apiPost("/career/profile", { skills, interests, background: academic }, localStorage.getItem("token") || undefined);
      onSubmit();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const strengthColor = strength < 40 ? C.amber : strength < 80 ? C.indigo : C.teal;
  const strengthLabel = strength < 40 ? "Getting started" : strength < 80 ? "Almost there" : "Profile complete";

  const filteredAcademic = ACADEMIC_OPTIONS.filter((a) =>
    a.toLowerCase().includes(academicSearch.toLowerCase())
  );

  // Stagger delays for the 4 form section cards
  const cardDelays = [0, 0.08, 0.16, 0.24];

  return (
    <div style={{ backgroundColor: C.offWhite, minHeight: "calc(100vh - 56px)" }}>
      {/* Sticky progress bar */}
      <div
        className="sticky top-14 z-40 px-6 py-3 border-b"
        style={{ backgroundColor: C.white, borderColor: C.gray200 }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <span className="text-xs font-bold shrink-0" style={{ color: C.gray400 }}>Profile Strength</span>
          <div className="flex-1 h-1.5 rounded-full max-w-xs" style={{ backgroundColor: C.gray200 }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${strength}%`, backgroundColor: strengthColor }}
            />
          </div>
          <span className="text-xs font-black shrink-0" style={{ color: strengthColor }}>{strength}%</span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0"
            style={{
              backgroundColor: strength >= 80 ? C.tealLight : C.amberLight,
              color: strength >= 80 ? "#0F766E" : "#92400E",
            }}
          >
            {strengthLabel}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Page header fades in */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black tracking-tight mb-1" style={{ color: C.charcoal }}>
            Build your profile
          </h1>
          <p className="text-base" style={{ color: C.gray500 }}>
            Tell us who you are — the more you share, the more precise your paths.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-5">
            {/* Basic info card — stagger index 0 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: cardDelays[0], duration: 0.42 }}
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: C.white, borderColor: C.gray200 }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: C.gray400 }}>
                <User size={13} style={{ color: C.indigo }} /> Basic info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Full name", value: name, set: setName, placeholder: "Aryan Kumar" },
                  { label: "Current role", value: role, set: setRole, placeholder: "Software Engineer" },
                ].map(({ label, value: val, set, placeholder }) => (
                  <div key={label}>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: C.charcoal }}>{label}</label>
                    <input
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        border: `1px solid ${C.gray200}`,
                        backgroundColor: C.offWhite,
                        color: C.charcoal,
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Skills card — stagger index 1 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: cardDelays[1], duration: 0.42 }}
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: C.white, borderColor: C.gray200 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: C.gray400 }}>
                  <Zap size={13} style={{ color: C.indigo }} /> Skills
                </h3>
                <span className="text-xs" style={{ color: skills.length >= 3 ? C.teal : C.gray400 }}>
                  {skills.length >= 3 ? `${skills.length} added ✓` : `Add at least 3 (${skills.length}/3)`}
                </span>
              </div>
              <ChipInput
                placeholder="Type to add skills — Python, React, SQL…"
                options={SKILL_OPTIONS}
                value={skills}
                onChange={setSkills}
                color="indigo"
              />
            </motion.div>

            {/* Interests card — stagger index 2 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: cardDelays[2], duration: 0.42 }}
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: C.white, borderColor: C.gray200 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: C.gray400 }}>
                  <Star size={13} style={{ color: C.amber }} /> Interests
                </h3>
                <span className="text-xs" style={{ color: interests.length >= 2 ? C.teal : C.gray400 }}>
                  {interests.length >= 2 ? `${interests.length} added ✓` : `Add at least 2 (${interests.length}/2)`}
                </span>
              </div>
              <ChipInput
                placeholder="AI, Healthcare, FinTech…"
                options={INTEREST_OPTIONS}
                value={interests}
                onChange={setInterests}
                color="amber"
              />
            </motion.div>

            {/* Academic card — stagger index 3 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: cardDelays[3], duration: 0.42 }}
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: C.white, borderColor: C.gray200 }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: C.gray400 }}>
                <GraduationCap size={13} style={{ color: C.teal }} /> Academic background
              </h3>
              <div className="relative">
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    border: `1px solid ${academicOpen ? C.indigo : C.gray200}`,
                    backgroundColor: C.offWhite,
                    boxShadow: academicOpen ? `0 0 0 3px ${C.indigoLight}` : "none",
                  }}
                  onClick={() => setAcademicOpen(!academicOpen)}
                >
                  <Search size={13} style={{ color: C.gray400 }} />
                  <input
                    value={academicSearch}
                    onChange={(e) => { setAcademicSearch(e.target.value); setAcademicOpen(true); }}
                    onFocus={() => setAcademicOpen(true)}
                    onBlur={() => setTimeout(() => setAcademicOpen(false), 160)}
                    placeholder={academic || "Search field of study…"}
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                    style={{ color: academic && !academicSearch ? C.indigo : C.charcoal }}
                  />
                  <ChevronDown
                    size={13}
                    style={{
                      color: C.gray400,
                      transform: academicOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                </div>
                <AnimatePresence>
                  {academicOpen && filteredAcademic.length > 0 && (
                    // Dropdown slides down when opened
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.14 }}
                      className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-20 overflow-hidden"
                      style={{ backgroundColor: C.white, borderColor: C.gray200 }}
                    >
                      <div className="max-h-44 overflow-y-auto">
                        {filteredAcademic.map((opt) => (
                          <button
                            key={opt}
                            className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
                            style={{ color: C.gray700 }}
                            onMouseDown={() => {
                              setAcademic(opt);
                              setAcademicSearch("");
                              setAcademicOpen(false);
                            }}
                          >
                            {opt}
                            {academic === opt && <Check size={13} style={{ color: C.indigo }} />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {academic && (
                <div className="mt-3">
                  <AnimatePresence>
                    <Chip label={academic} color="teal" onRemove={() => setAcademic("")} />
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* CTA slides up after all cards */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4 }}
            >
              <button
                onClick={canSubmit ? handleGetPaths : undefined}
                disabled={!canSubmit || saving}
                className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                style={{
                  backgroundColor: canSubmit ? C.indigo : C.gray200,
                  color: canSubmit ? C.white : C.gray400,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  boxShadow: canSubmit ? `0 8px 24px ${C.indigo}33` : "none",
                }}
              >
                {saving ? "Saving..." : "Get My Career Paths"}
                <ArrowRight size={18} />
              </button>
              {!canSubmit && (
                <p className="text-center text-xs mt-2" style={{ color: C.gray400 }}>
                  {60 - strength}% more needed to unlock
                </p>
              )}
              {saveError && (
                <p className="text-center text-sm mt-2" style={{ color: "#DC2626" }}>
                  {saveError}
                </p>
              )}
            </motion.div>
          </div>

          {/* Live preview */}
          <div className="hidden lg:block">
            <div
              className="sticky top-28 rounded-2xl p-5 border"
              style={{ backgroundColor: C.white, borderColor: C.gray200 }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.gray400 }}>
                  Live preview
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: C.indigoLight, color: C.indigo }}
                >
                  LIVE
                </span>
              </div>

              {/* Avatar + name cross-fade as user types */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={name || "__empty_name"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="mb-5"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black text-white mb-3"
                    style={{ backgroundColor: name ? C.indigo : C.gray200 }}
                  >
                    {name ? name[0].toUpperCase() : "?"}
                  </div>
                  <p className="text-sm font-black" style={{ color: name ? C.charcoal : C.gray300 }}>
                    {name || "Your name"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: role ? C.gray500 : C.gray300 }}>
                    {role || "Current role"}
                  </p>
                </motion.div>
              </AnimatePresence>

              {skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-2" style={{ color: C.gray400 }}>Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    <AnimatePresence>
                      {skills.slice(0, 5).map((s) => (
                        <Chip key={s} label={s} color="indigo" />
                      ))}
                    </AnimatePresence>
                    {skills.length > 5 && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: C.gray500, backgroundColor: C.gray100 }}>
                        +{skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {interests.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-2" style={{ color: C.gray400 }}>Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    <AnimatePresence>
                      {interests.slice(0, 4).map((s) => (
                        <Chip key={s} label={s} color="amber" />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Academic cross-fades when selection changes */}
              <AnimatePresence mode="wait">
                {academic && (
                  <motion.div
                    key={academic}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22 }}
                    className="mb-4"
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: C.gray400 }}>Background</p>
                    <Chip label={academic} color="teal" />
                  </motion.div>
                )}
              </AnimatePresence>

              {!name && skills.length === 0 && interests.length === 0 && !academic && (
                <div className="text-center py-4">
                  <p className="text-xs" style={{ color: C.gray300 }}>
                    Fill in the form to see your profile update in real time.
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t" style={{ borderColor: C.gray100 }}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-semibold" style={{ color: C.gray400 }}>Completeness</span>
                  <span className="text-xs font-black" style={{ color: strengthColor }}>{strength}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: C.gray200 }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${strength}%`, backgroundColor: strengthColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [copyIdx, setCopyIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setCopyIdx((i) => (i + 1) % MICROCOPY.length), 1300);
    const to = setTimeout(onDone, 5500);
    return () => { clearInterval(iv); clearTimeout(to); };
  }, [onDone]);

  return (
    <div
      className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: C.offWhite }}
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          {/* Pill scale-breathes to signal live activity — CSS @keyframes injected above */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: C.indigoLight }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.indigo }} />
            <span className="text-sm font-semibold" style={{ color: C.indigo }}>AI Analysis in progress</span>
          </motion.div>

          <h2 className="text-2xl font-black tracking-tight mb-3" style={{ color: C.charcoal }}>
            Building your path map
          </h2>

          {/* Microcopy swaps with slide-through — already in place */}
          <AnimatePresence mode="wait">
            <motion.p
              key={copyIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="text-base"
              style={{ color: C.gray500 }}
            >
              {MICROCOPY[copyIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border animate-pulse"
              style={{
                backgroundColor: C.white,
                borderColor: C.gray200,
                animationDelay: `${i * 180}ms`,
              }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="space-y-2.5 flex-1 pr-4">
                  <div className="h-5 rounded-full" style={{ backgroundColor: C.gray200, width: `${56 + i * 8}%` }} />
                  <div className="h-3.5 rounded-full" style={{ backgroundColor: C.gray100, width: "35%" }} />
                </div>
                <div className="w-14 h-14 rounded-full shrink-0" style={{ backgroundColor: C.gray100 }} />
              </div>
              <div className="space-y-2 mb-5">
                <div className="h-3 rounded-full w-full" style={{ backgroundColor: C.gray100 }} />
                <div className="h-3 rounded-full" style={{ backgroundColor: C.gray100, width: "88%" }} />
                <div className="h-3 rounded-full" style={{ backgroundColor: C.gray100, width: "72%" }} />
              </div>
              <div className="flex gap-2">
                {[68, 88, 56].map((w, j) => (
                  <div key={j} className="h-6 rounded-full" style={{ width: w, backgroundColor: C.gray100 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Results ───────────────────────────────────────────────────────────────────

function ResultsScreen({
  careerData,
  onSaveAndCompare,
  onExplore,
  onLearnPlan,
}: {
  careerData: typeof CAREER_RESULTS;
  onSaveAndCompare: () => void;
  onExplore: (id: number) => void;
  onLearnPlan: (id: number) => void;
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(onSaveAndCompare, 400);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] px-6 py-10" style={{ backgroundColor: C.offWhite }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: C.tealLight, color: "#0F766E" }}
            >
              3 paths found
            </span>
            <span className="text-xs" style={{ color: C.gray400 }}>Based on your profile · Just now</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1" style={{ color: C.charcoal }}>
            Your career paths
          </h1>
          <p className="text-base" style={{ color: C.gray500 }}>
            Ranked by fit with your skills, interests, and background.
          </p>
        </div>

        <div className="space-y-5 mb-8">
          {careerData.map((career, i) => (
            // Staggered fade+slide for each result card — delay scales with position
            <motion.div
              key={career.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.14, duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl p-6 border transition-shadow hover:shadow-md"
              style={{ backgroundColor: C.white, borderColor: C.gray200 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  {career.best && (
                    <span
                      className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-2"
                      style={{ backgroundColor: C.amberLight, color: "#92400E" }}
                    >
                      Best match
                    </span>
                  )}
                  <h2 className="text-xl font-black tracking-tight" style={{ color: C.charcoal }}>
                    {career.title}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: C.gray500 }}>{career.subtitle}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm font-bold" style={{ color: C.charcoal }}>{career.salary}</span>
                    <span className="text-sm font-semibold flex items-center gap-1" style={{ color: C.teal }}>
                      <TrendingUp size={12} />
                      {career.growth}
                    </span>
                  </div>
                </div>
                <FitCircle value={career.fit} size={68} />
              </div>

              <p className="text-sm leading-relaxed mb-4" style={{ color: C.gray700 }}>
                {career.reasoning}
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-xs font-semibold shrink-0" style={{ color: C.gray400 }}>Skills to learn:</span>
                {career.learn.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ border: `1px solid ${C.gray200}`, color: C.gray700 }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: C.gray100 }}>
                <button
                  onClick={() => onExplore(career.id)}
                  className="text-sm font-medium px-4 py-2 rounded-xl border transition-all hover:bg-gray-50 active:scale-95"
                  style={{ borderColor: C.gray200, color: C.gray700 }}
                >
                  Explore path
                </button>
                <button
                  onClick={() => onLearnPlan(career.id)}
                  className="text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: C.indigo }}
                >
                  View learning plan →
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Save CTA fades in after cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ backgroundColor: C.charcoal }}
        >
          <div>
            <h3 className="text-base font-black text-white mb-1">Save & track your progress</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Compare snapshots over time and watch your paths evolve.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 active:scale-95"
            style={{
              backgroundColor: saved ? C.teal : C.indigo,
              color: C.white,
              boxShadow: saved ? `0 4px 16px ${C.teal}55` : `0 4px 16px ${C.indigo}55`,
            }}
          >
            {saved ? (
              <><Check size={15} /> Saved!</>
            ) : (
              <><GitCompare size={15} /> Save &amp; Compare</>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ── History ───────────────────────────────────────────────────────────────────

function HistoryScreen({ hasHistory, historyData }: { hasHistory: boolean; historyData: typeof HISTORY_SNAPSHOTS }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSnap = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length < 2) return [...prev, id];
      return [prev[1], id];
    });
  };

  const snapA = historyData.find((s) => s.id === selected[0]);
  const snapB = historyData.find((s) => s.id === selected[1]);

  if (!hasHistory) {
    return (
      <div
        className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6"
        style={{ backgroundColor: C.offWhite }}
      >
        <div className="text-center max-w-xs">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: C.indigoLight }}
          >
            <Clock size={28} style={{ color: C.indigo }} />
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: C.charcoal }}>No history yet</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: C.gray500 }}>
            Complete your first career analysis to start tracking how your paths evolve over time.
          </p>
          <span
            className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ backgroundColor: C.amberLight, color: "#92400E" }}
          >
            First snapshot saves automatically
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] px-6 py-10" style={{ backgroundColor: C.offWhite }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-1" style={{ color: C.charcoal }}>Your history</h1>
          <p className="text-base" style={{ color: C.gray500 }}>
            Select two snapshots to compare your career paths side by side.
          </p>
        </div>

        {/* Timeline — each node has whileHover spring lift */}
        <div className="mb-8">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-start gap-0 min-w-max">
              {historyData.map((snap, i) => (
                <div key={snap.id} className="flex items-center">
                  {/* Spring lift on each timeline node signals interactivity */}
                  <motion.button
                    onClick={() => toggleSnap(snap.id)}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex flex-col items-center group"
                  >
                    <div
                      className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all mb-3"
                      style={{
                        borderColor: selected.includes(snap.id) ? C.indigo : C.gray300,
                        backgroundColor: selected.includes(snap.id) ? C.indigo : C.white,
                        color: selected.includes(snap.id) ? C.white : C.gray500,
                        boxShadow: selected.includes(snap.id) ? `0 0 0 4px ${C.indigoLight}` : "none",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="text-center" style={{ minWidth: 110 }}>
                      <p className="text-xs font-black" style={{ color: C.charcoal }}>{snap.date}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.gray500 }}>{snap.topResult}</p>
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.teal }} />
                        <span className="text-xs font-bold" style={{ color: C.teal }}>{snap.fitScore}% fit</span>
                      </div>
                    </div>
                  </motion.button>

                  {i < historyData.length - 1 && (
                    <div
                      className="w-16 h-px mx-1 self-start mt-6"
                      style={{ backgroundColor: C.gray200 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth chart */}
        <div className="rounded-2xl p-6 border mb-8" style={{ backgroundColor: C.white, borderColor: C.gray200 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black" style={{ color: C.charcoal }}>Career fit score over time</h3>
              <p className="text-sm" style={{ color: C.gray500 }}>Best match score, tracked monthly</p>
            </div>
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: C.tealLight, color: "#0F766E" }}
            >
              <TrendingUp size={12} />
              +23 pts since March
            </span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <AreaChart data={GROWTH_DATA} margin={{ top: 4, right: 0, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.gray400 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: C.gray400 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${C.gray200}`,
                  fontSize: 12,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
                formatter={(v: number) => [`${v}%`, "Fit score"]}
              />
              <Area
                type="monotone" dataKey="score"
                stroke={C.teal} strokeWidth={2.5}
                fill="url(#tealGrad)" dot={false}
                activeDot={{ r: 4, fill: C.teal }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Diff panel fades in/out as selection changes */}
        <AnimatePresence mode="wait">
          {selected.length === 2 && snapA && snapB ? (
            // Diff view slides up when two snapshots are selected
            <motion.div
              key="diff"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: C.gray200 }}
            >
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: C.gray200, backgroundColor: C.white }}
              >
                <h3 className="text-sm font-black" style={{ color: C.charcoal }}>
                  Comparing{" "}
                  <span style={{ color: C.indigo }}>{snapA.date}</span>
                  {" → "}
                  <span style={{ color: C.indigo }}>{snapB.date}</span>
                </h3>
                <button
                  onClick={() => setSelected([])}
                  className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: C.gray200, color: C.gray500 }}
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-2" style={{ backgroundColor: C.white }}>
                {[snapA, snapB].map((snap, idx) => {
                  const other = idx === 0 ? snapB : snapA;
                  const newSkills = snap.skills.filter((s) => !other.skills.includes(s));
                  const dropped = other.skills.filter((s) => !snap.skills.includes(s));
                  const shared = snap.skills.filter((s) => other.skills.includes(s));

                  return (
                    <div
                      key={snap.id}
                      className="p-6"
                      style={{ borderRight: idx === 0 ? `1px solid ${C.gray200}` : "none" }}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.gray400 }}>
                            {idx === 0 ? "Earlier" : "Latest"}
                          </p>
                          <h4 className="text-base font-black mt-0.5" style={{ color: C.charcoal }}>{snap.date}</h4>
                        </div>
                        <FitCircle value={snap.fitScore} size={52} />
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-semibold mb-1" style={{ color: C.gray400 }}>Top result</p>
                        <p className="text-sm font-black" style={{ color: C.charcoal }}>{snap.topResult}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: C.gray400 }}>Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {shared.map((s) => (
                            <span
                              key={s}
                              className="text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{ backgroundColor: C.gray100, color: C.gray700 }}
                            >
                              {s}
                            </span>
                          ))}
                          {idx === 1 && newSkills.map((s) => (
                            <span
                              key={s}
                              className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"
                              style={{ backgroundColor: C.amberLight, color: "#92400E" }}
                            >
                              {s}
                              <span
                                className="text-[9px] font-black px-1 py-0.5 rounded"
                                style={{ backgroundColor: C.amber, color: C.white }}
                              >
                                New
                              </span>
                            </span>
                          ))}
                          {idx === 0 && dropped.map((s) => (
                            <span
                              key={s}
                              className="text-xs px-2.5 py-1 rounded-full font-medium line-through"
                              style={{ backgroundColor: C.gray100, color: C.gray400 }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            // Empty prompt fades in when no selection
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border p-10 text-center"
              style={{
                backgroundColor: C.white,
                borderColor: C.gray200,
                borderStyle: "dashed",
              }}
            >
              <GitCompare size={22} className="mx-auto mb-3" style={{ color: C.gray300 }} />
              <p className="text-sm font-medium" style={{ color: C.gray400 }}>
                {selected.length === 0
                  ? "Select two snapshots above to compare them side by side"
                  : "Select one more snapshot to compare"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Explore Path ──────────────────────────────────────────────────────────────

function ExplorePathScreen({
  careerId,
  careerData,
  onBack,
  onLearnPlan,
}: {
  careerId: number;
  careerData: typeof CAREER_RESULTS;
  onBack: () => void;
  onLearnPlan: (id: number) => void;
}) {
  const career = careerData.find((c) => c.id === careerId)!;
  const extras = CAREER_EXTRAS[careerId];

  return (
    <div className="min-h-[calc(100vh-56px)] pb-28" style={{ backgroundColor: C.offWhite }}>
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Back button slides in from left */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 transition-opacity hover:opacity-60"
          style={{ color: C.gray500 }}
        >
          <ChevronLeft size={16} />
          Back to results
        </motion.button>

        {/* Header block: title, FitCircle, salary, growth — fades+slides as a unit */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-6 border mb-6"
          style={{ backgroundColor: C.white, borderColor: C.gray200 }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-1">
              {career.best && (
                <span
                  className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-2"
                  style={{ backgroundColor: C.amberLight, color: "#92400E" }}
                >
                  Best match
                </span>
              )}
              <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: C.charcoal }}>
                {career.title}
              </h1>
              <p className="text-sm mb-3" style={{ color: C.gray500 }}>{career.subtitle}</p>
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: C.gray400 }}>Salary range</p>
                  <p className="text-sm font-black" style={{ color: C.charcoal }}>{career.salary}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: C.gray400 }}>Market growth</p>
                  <p className="text-sm font-black flex items-center gap-1" style={{ color: C.teal }}>
                    <TrendingUp size={13} />{career.growth}
                  </p>
                </div>
              </div>
            </div>
            <FitCircle value={career.fit} size={80} />
          </div>
        </motion.div>

        {/* Day in the life — bullets stagger in one by one */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.42 }}
          className="rounded-2xl p-6 border mb-6"
          style={{ backgroundColor: C.white, borderColor: C.gray200 }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: C.gray400 }}>
            <Clock size={13} style={{ color: C.indigo }} /> A day in the life
          </h2>
          <div className="space-y-3">
            {extras.dayInLife.map((item, i) => (
              // Each bullet slides in left-to-right with stagger
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.35 }}
                className="flex items-start gap-3"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]"
                  style={{ backgroundColor: C.indigo }}
                />
                <p className="text-sm leading-relaxed" style={{ color: C.gray700 }}>{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why this fits */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.42 }}
          className="rounded-2xl p-6 border mb-6"
          style={{ backgroundColor: C.white, borderColor: C.gray200 }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: C.gray400 }}>
            <Star size={13} style={{ color: C.amber }} /> Why this fits you
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: C.gray700 }}>
            {career.reasoning} The skills you already hold — especially your analytical mindset and communication ability — transfer directly to the demands of this role, reducing your ramp-up time significantly compared to the average candidate.
          </p>
        </motion.div>

        {/* Career trajectory — steps fade in left-to-right */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.42 }}
          className="rounded-2xl p-6 border mb-6"
          style={{ backgroundColor: C.white, borderColor: C.gray200 }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: C.gray400 }}>
            <TrendingUp size={13} style={{ color: C.teal }} /> Career trajectory
          </h2>
          <div className="flex items-start gap-0 overflow-x-auto pb-1">
            {extras.trajectory.map((step, i) => (
              <div key={step.title} className="flex items-center shrink-0">
                {/* Each trajectory step slides in with stagger */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38 + i * 0.08, duration: 0.36 }}
                  className="flex flex-col items-center"
                  style={{ minWidth: 100 }}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-black mb-2"
                    style={{
                      borderColor: i === 0 ? C.indigo : C.gray300,
                      backgroundColor: i === 0 ? C.indigoLight : C.white,
                      color: i === 0 ? C.indigo : C.gray500,
                    }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-xs font-black text-center" style={{ color: C.charcoal }}>{step.title}</p>
                  <p className="text-xs mt-0.5 font-semibold" style={{ color: C.teal }}>{step.salary}</p>
                </motion.div>
                {i < extras.trajectory.length - 1 && (
                  <div className="w-8 h-px mx-1 shrink-0 -mt-6" style={{ backgroundColor: C.gray200 }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Companies hiring — chips stagger in */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.42 }}
          className="rounded-2xl p-6 border"
          style={{ backgroundColor: C.white, borderColor: C.gray200 }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: C.gray400 }}>
            <Building2 size={13} style={{ color: C.teal }} /> Companies hiring
          </h2>
          <div className="flex flex-wrap gap-2">
            {extras.companies.map((company, i) => (
              // Company chips pop in with spring stagger
              <motion.span
                key={company}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.06, type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: C.gray100,
                  color: C.gray700,
                  border: `1px solid ${C.gray200}`,
                }}
              >
                <MapPin size={10} style={{ color: C.gray400 }} />
                {company}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sticky bottom CTA — spring on hover/tap */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 py-4 border-t"
        style={{ backgroundColor: C.white, borderColor: C.gray200 }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black" style={{ color: C.charcoal }}>Ready to start learning?</p>
            <p className="text-xs" style={{ color: C.gray500 }}>Get a personalized roadmap for {career.title}</p>
          </div>
          {/* whileHover scale and whileTap press feedback on the primary CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => onLearnPlan(careerId)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white"
            style={{
              backgroundColor: C.indigo,
              boxShadow: `0 6px 20px ${C.indigo}40`,
            }}
          >
            View Learning Plan
            <ArrowRight size={15} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ── Learning Plan ─────────────────────────────────────────────────────────────

function LearningPlanScreen({
  careerId,
  careerData,
  onBack,
}: {
  careerId: number;
  careerData: typeof CAREER_RESULTS;
  onBack: () => void;
}) {
  const career = careerData.find((c) => c.id === careerId)!;
  const modules = LEARNING_MODULES[careerId];
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggleComplete = (i: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const progress = Math.round((completed.size / modules.length) * 100);
  const progressColor = progress === 100 ? C.teal : C.indigo;

  const difficultyConfig = {
    beginner: { label: "Beginner", bg: C.tealLight, text: "#0F766E" },
    intermediate: { label: "Intermediate", bg: C.indigoLight, text: C.indigo },
    advanced: { label: "Advanced", bg: C.amberLight, text: "#92400E" },
  };

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: C.offWhite }}>
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 transition-opacity hover:opacity-60"
          style={{ color: C.gray500 }}
        >
          <ChevronLeft size={16} />
          Back to results
        </motion.button>

        {/* Header + progress bar — fade+slide in as a unit */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={15} style={{ color: C.indigo }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.gray400 }}>
              Learning roadmap
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: C.charcoal }}>
            {career.title}
          </h1>
          <p className="text-sm mb-6" style={{ color: C.gray500 }}>Your personalized roadmap</p>

          {/* Progress bar reuses ProfileBuilder's strength-bar pattern */}
          <div className="rounded-2xl p-4 border" style={{ backgroundColor: C.white, borderColor: C.gray200 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: C.gray500 }}>
                {completed.size} of {modules.length} modules complete
              </span>
              <span className="text-xs font-black" style={{ color: progressColor }}>{progress}%</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: C.gray200 }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, backgroundColor: progressColor }}
              />
            </div>
            {progress === 100 && (
              <p className="text-xs mt-2 font-semibold" style={{ color: C.teal }}>
                All modules complete — you are ready to apply! 🎉
              </p>
            )}
          </div>
        </motion.div>

        {/* Module cards — stagger in on mount, delay i × 0.1 */}
        <div className="space-y-4">
          {modules.map((mod, i) => {
            const isDone = completed.has(i);
            const diff = difficultyConfig[mod.difficulty];

            return (
              // Each module card slides up with staggered delay
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.1, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border overflow-hidden transition-colors duration-300"
                style={{
                  backgroundColor: isDone ? C.tealLight : C.white,
                  borderColor: isDone ? "#99F6E4" : C.gray200,
                }}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Completion toggle — spring checkmark pop on activation */}
                    <motion.button
                      onClick={() => toggleComplete(i)}
                      whileTap={{ scale: 0.88 }}
                      transition={{ type: "spring", stiffness: 420, damping: 26 }}
                      className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 mt-0.5"
                      style={{
                        borderColor: isDone ? C.teal : C.gray300,
                        backgroundColor: isDone ? C.teal : "transparent",
                      }}
                    >
                      <AnimatePresence>
                        {isDone && (
                          // Checkmark pops in with spring scale when module is completed
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 420, damping: 26 }}
                          >
                            <Check size={12} color="white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3
                          className="text-base font-black tracking-tight transition-colors duration-300"
                          style={{ color: isDone ? "#0F766E" : C.charcoal }}
                        >
                          {mod.name}
                        </h3>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: diff.bg, color: diff.text }}
                        >
                          {diff.label}
                        </span>
                      </div>
                      <p className="text-xs mb-3" style={{ color: C.gray500 }}>
                        Estimated time: <span className="font-semibold">{mod.time}</span>
                      </p>

                      <div className="space-y-1">
                        {mod.resources.map((res) => (
                          <div
                            key={res}
                            className="flex items-center gap-2 text-xs"
                            style={{ color: C.gray500 }}
                          >
                            <ExternalLink size={11} style={{ color: C.gray400, shrink: 0 }} />
                            <span className="truncate">{res}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>(
    localStorage.getItem("token") ? "profile" : "login"
  );
  const [hasHistory, setHasHistory] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<number>(1);
  const [careerData, setCareerData] = useState(CAREER_RESULTS);
  const [historyData, setHistoryData] = useState(HISTORY_SNAPSHOTS);

  const nav = (s: Screen) => setScreen(s);

  const handleLoadingDone = useCallback(async () => {
    try {
      const result = await apiPost("/career/advise", {}, localStorage.getItem("token") || undefined);
      setCareerData(result.suggestions);
    } catch (err) {
      console.warn("AI advise failed, showing demo data:", err);
      setCareerData(CAREER_RESULTS); // fallback so app never breaks in demo
    }
    setScreen("results");
  }, []);

  const handleSaveAndCompare = () => {
    setHasHistory(true);
    setScreen("history");
  };

  const handleExplore = (id: number) => {
    setSelectedCareer(id);
    setScreen("explore");
  };

  const handleLearnPlan = (id: number) => {
    setSelectedCareer(id);
    setScreen("learning-plan");
  };

  const showNav = screen !== "login" && screen !== "loading";

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: C.offWhite }}
    >
      {showNav && <Navbar screen={screen} onNav={nav} />}

      <AnimatePresence mode="wait">
        {/* Screen-level fade transition wraps every screen */}
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {screen === "login" && (
            <LoginScreen onLogin={() => nav("profile")} />
          )}
          {screen === "profile" && (
            <ProfileBuilderScreen onSubmit={() => nav("loading")} />
          )}
          {screen === "loading" && (
            <LoadingScreen onDone={handleLoadingDone} />
          )}
          {screen === "results" && (
            <ResultsScreen
              careerData={careerData}
              onSaveAndCompare={handleSaveAndCompare}
              onExplore={handleExplore}
              onLearnPlan={handleLearnPlan}
            />
          )}
          {screen === "history" && (
            <HistoryScreen hasHistory={hasHistory} historyData={historyData} />
          )}
          {screen === "explore" && (
            <ExplorePathScreen
              careerId={selectedCareer}
              careerData={careerData}
              onBack={() => nav("results")}
              onLearnPlan={handleLearnPlan}
            />
          )}
          {screen === "learning-plan" && (
            <LearningPlanScreen
              careerId={selectedCareer}
              careerData={careerData}
              onBack={() => nav("results")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
