import type { Agreement, ActivityEvent, TemplateDef, Block } from "./types";

const b = (type: Block["type"], title: string, subtitle?: string, config?: Record<string, unknown>): Block => ({
  id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  title,
  subtitle,
  config,
});

export const familyBlocks: Block[] = [
  b("WHEN", "Salary received", "Trigger on deposit", { source: "Payroll" }),
  b("CONVERT", "USD → INR", "Stellar DEX best rate", { from: "USD", to: "INR" }),
  b("SPLIT", "Distribute funds", "4 recipients", {
    parts: [
      { label: "Parents", pct: 35 },
      { label: "Education", pct: 25 },
      { label: "Emergency", pct: 20 },
      { label: "Savings", pct: 20 },
    ],
  }),
  b("IF", "Not claimed in 7 days", "Fallback rule", { days: 7 }),
  b("RETURN", "Return unclaimed funds", "Back to sender"),
];

export const mockUser = {
  name: "Aditya",
  handle: "@aditya",
  email: "aditya@flowledger.app",
  initials: "AD",
};

export const mockAgreements: Agreement[] = [
  {
    id: "family",
    emoji: "🏠",
    name: "Family Agreement",
    description: "Auto-split monthly salary to parents, education, and savings.",
    status: "active",
    cadence: "Monthly",
    monthlyBudget: 1200,
    currency: "USD",
    nextRun: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    createdAt: "2025-02-11T09:00:00Z",
    progress: 72,
    recipients: [
      { id: "r1", name: "Parents", role: "Family", share: 35, avatarColor: "var(--chart-1)", currency: "INR" },
      { id: "r2", name: "Education", role: "Tuition", share: 25, avatarColor: "var(--chart-2)", currency: "INR" },
      { id: "r3", name: "Emergency", role: "Reserve", share: 20, avatarColor: "var(--chart-3)", currency: "INR" },
      { id: "r4", name: "Savings", role: "Wealth", share: 20, avatarColor: "var(--chart-4)", currency: "INR" },
    ],
    blocks: familyBlocks,
  },
  {
    id: "hackathon",
    emoji: "🏆",
    name: "Hackathon Prize Split",
    description: "One-time split of $5,000 prize between 3 teammates.",
    status: "completed",
    cadence: "One-time",
    monthlyBudget: 5000,
    currency: "USDC",
    createdAt: "2025-06-02T14:00:00Z",
    progress: 100,
    recipients: [
      { id: "h1", name: "Ravi", role: "Backend", share: 34, avatarColor: "var(--chart-1)", currency: "USDC" },
      { id: "h2", name: "Meera", role: "Design", share: 33, avatarColor: "var(--chart-2)", currency: "USDC" },
      { id: "h3", name: "Sam", role: "Frontend", share: 33, avatarColor: "var(--chart-4)", currency: "USDC" },
    ],
    blocks: [
      b("WHEN", "Prize deposit received"),
      b("SPLIT", "Split evenly", "3 recipients"),
      b("THEN", "Notify team"),
    ],
  },
  {
    id: "scholarship",
    emoji: "🎓",
    name: "Scholarship",
    description: "Quarterly scholarship pool for engineering students.",
    status: "waiting",
    cadence: "Quarterly",
    monthlyBudget: 8000,
    currency: "USD",
    createdAt: "2025-07-10T10:00:00Z",
    progress: 0,
    recipients: [
      { id: "s1", name: "Cohort A", role: "12 students", share: 60, avatarColor: "var(--chart-2)", currency: "USD" },
      { id: "s2", name: "Cohort B", role: "8 students", share: 40, avatarColor: "var(--chart-3)", currency: "USD" },
    ],
    blocks: [
      b("WHEN", "Sponsor deposit"),
      b("APPROVE", "Committee sign-off", "2 of 3"),
      b("SPLIT", "Distribute by cohort"),
    ],
  },
  {
    id: "freelance",
    emoji: "💼",
    name: "Freelance Escrow — Acme",
    description: "Milestone-based release on client sign-off.",
    status: "active",
    cadence: "Milestone",
    monthlyBudget: 4500,
    currency: "USDC",
    nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdAt: "2025-05-20T11:00:00Z",
    progress: 45,
    recipients: [
      { id: "f1", name: "You", role: "Contractor", share: 100, avatarColor: "var(--chart-1)", currency: "USDC" },
    ],
    blocks: [
      b("ESCROW", "Client funds locked"),
      b("APPROVE", "Milestone approved"),
      b("THEN", "Release payment"),
    ],
  },
];

export const mockActivity: ActivityEvent[] = [
  { id: "a1", kind: "payout", title: "Parents received ₹8,000", subtitle: "Family Agreement · INR", amount: "₹8,000", status: "completed", time: new Date(Date.now() - 1000 * 60 * 2).toISOString(), agreementId: "family" },
  { id: "a2", kind: "payout", title: "Education Fund updated", subtitle: "Family Agreement · INR", amount: "₹5,700", status: "completed", time: new Date(Date.now() - 1000 * 60 * 3).toISOString(), agreementId: "family" },
  { id: "a3", kind: "payout", title: "Emergency Reserve credited", subtitle: "Family Agreement · INR", amount: "₹4,600", status: "completed", time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), agreementId: "family" },
  { id: "a4", kind: "conversion", title: "Converted USD → INR", subtitle: "Stellar DEX · rate 83.14", amount: "$1,200", status: "completed", time: new Date(Date.now() - 1000 * 60 * 6).toISOString(), agreementId: "family" },
  { id: "a5", kind: "deposit", title: "Salary deposited", subtitle: "Payroll · Acme Corp", amount: "$1,200", status: "completed", time: new Date(Date.now() - 1000 * 60 * 8).toISOString(), agreementId: "family" },
  { id: "a6", kind: "execution", title: "Family Agreement executed", subtitle: "4 recipients · 3 conversions", status: "completed", time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), agreementId: "family" },
  { id: "a7", kind: "return", title: "Unclaimed funds returned", subtitle: "Scholarship · Cohort B", amount: "$320", status: "completed", time: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), agreementId: "scholarship" },
  { id: "a8", kind: "execution", title: "Hackathon Prize distributed", subtitle: "3 recipients · USDC", status: "completed", time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), agreementId: "hackathon" },
];

export const mockTemplates: TemplateDef[] = [
  { id: "family-remit", name: "Family Remittance", description: "Monthly salary auto-split across recipients back home.", emoji: "🏠", category: "Personal", accent: "var(--chart-1)", blocks: familyBlocks },
  { id: "freelancer", name: "Freelancer Escrow", description: "Client funds released on milestone approval.", emoji: "💼", category: "Business", accent: "var(--chart-2)", blocks: [b("ESCROW","Client deposit"), b("APPROVE","Milestone sign-off"), b("THEN","Release funds")] },
  { id: "payroll", name: "Startup Payroll", description: "Bi-weekly team payroll with tax withholding.", emoji: "🏢", category: "Business", accent: "var(--chart-3)", blocks: [b("WHEN","Payroll day"), b("SPLIT","Team split"), b("THEN","Notify team")] },
  { id: "scholarship", name: "Scholarship", description: "Committee-approved quarterly disbursements.", emoji: "🎓", category: "Nonprofit", accent: "var(--chart-4)", blocks: [b("WHEN","Sponsor deposit"), b("APPROVE","Committee 2/3"), b("SPLIT","By cohort")] },
  { id: "ngo", name: "NGO Aid", description: "Cross-border aid disbursement with on-ground verification.", emoji: "🌍", category: "Nonprofit", accent: "var(--chart-2)", blocks: [b("WHEN","Donation received"), b("APPROVE","Verify recipient"), b("THEN","Distribute")] },
  { id: "emergency", name: "Emergency Fund", description: "Save automatically. Withdraw only on approval.", emoji: "🛡️", category: "Personal", accent: "var(--chart-3)", blocks: [b("WHEN","Paycheck"), b("SPLIT","10% to reserve"), b("APPROVE","Withdrawal request")] },
  { id: "prize", name: "Hackathon Prize Split", description: "Even split of a prize pool to a small team.", emoji: "🏆", category: "One-time", accent: "var(--chart-1)", blocks: [b("WHEN","Prize deposit"), b("SPLIT","Even split"), b("THEN","Notify")] },
];

export const monthlyVolume = [
  { m: "Jan", v: 3200 }, { m: "Feb", v: 4100 }, { m: "Mar", v: 3900 },
  { m: "Apr", v: 5200 }, { m: "May", v: 6100 }, { m: "Jun", v: 7300 },
  { m: "Jul", v: 8100 }, { m: "Aug", v: 9200 }, { m: "Sep", v: 8800 },
  { m: "Oct", v: 11200 }, { m: "Nov", v: 12800 }, { m: "Dec", v: 14200 },
];

export const currencyDistribution = [
  { name: "USD", value: 42 },
  { name: "INR", value: 28 },
  { name: "USDC", value: 18 },
  { name: "EUR", value: 8 },
  { name: "XLM", value: 4 },
];

export const successRateSeries = [
  { d: "W1", rate: 96 }, { d: "W2", rate: 97 }, { d: "W3", rate: 99 },
  { d: "W4", rate: 98 }, { d: "W5", rate: 99.4 }, { d: "W6", rate: 99.7 },
  { d: "W7", rate: 99.5 }, { d: "W8", rate: 99.8 },
];

export const topTemplates = [
  { name: "Family Remittance", uses: 42 },
  { name: "Freelancer Escrow", uses: 31 },
  { name: "Startup Payroll", uses: 24 },
  { name: "Scholarship", uses: 18 },
  { name: "NGO Aid", uses: 12 },
];

export const recipientBreakdown = [
  { m: "Jul", parents: 420, education: 300, emergency: 240, savings: 240 },
  { m: "Aug", parents: 440, education: 315, emergency: 250, savings: 260 },
  { m: "Sep", parents: 460, education: 328, emergency: 260, savings: 270 },
  { m: "Oct", parents: 480, education: 340, emergency: 275, savings: 285 },
  { m: "Nov", parents: 500, education: 360, emergency: 290, savings: 300 },
  { m: "Dec", parents: 520, education: 380, emergency: 305, savings: 315 },
];

export function findAgreement(id: string) {
  return mockAgreements.find((a) => a.id === id);
}