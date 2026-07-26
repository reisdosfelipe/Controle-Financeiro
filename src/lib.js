export const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const MONTHS_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export const DEFAULT_CATEGORIES = [
  { name: "Salario", type: "receita" },
  { name: "Saldo Mês anterior", type: "receita" },
  { name: "Mgroup - Promoção", type: "receita" },
  { name: "Alimentação", type: "despesa" },
  { name: "Combustível", type: "despesa" },
  { name: "Despesas Periastro", type: "despesa" },
  { name: "Despesas Karfan", type: "despesa" },
  { name: "Educação e Cursos", type: "despesa" },
  { name: "Higiene Pessoal", type: "despesa" },
  { name: "Lazer e Social", type: "despesa" },
  { name: "Materiais", type: "despesa" },
  { name: "Outros", type: "despesa" },
  { name: "Investimentos", type: "despesa" },
  { name: "Saúde", type: "despesa" },
  { name: "Serviços Pessoais", type: "despesa" },
  { name: "Transporte", type: "despesa" },
  { name: "Vale Transporte", type: "despesa" },
  { name: "Veiculo-Pessoal", type: "despesa" },
  { name: "Vestuario e Compras pessoais", type: "despesa" },
];

export const PIE_COLORS = ["#0f6b4f","#c9622a","#1a3d5c","#8a5b12","#a5401f","#5c3d8a","#0f3d33","#7a2e5c","#3d5c1a","#8a1f4a","#1f6a8a","#8a7a1f","#4a1f8a","#1f8a4a"];

export const THEMES = {
  light: {
    mode: "light",
    bg: "#f6f4ef", text: "#1c2b26", muted: "#6b6558",
    surface: "#ffffff", surfaceAlt: "#faf9f5", border: "#e6e1d3",
    headerBg: "#0f3d33", headerText: "#f6f4ef",
    cardIncome: "#7c3aed", cardIncomeText: "#ffffff",
    cardSafe: "#ddd6fe", cardSafeText: "#4c1d95",
    cardExpense: "#dc2626", cardExpenseText: "#ffffff",
    cardPending: "#fca5a5", cardPendingText: "#7f1d1d",
    entryDefaultBg: "#ffffff", entryDefaultBorder: "#e6e1d3",
    entryPaidBg: "#e7f6ec", entryPaidBorder: "#86efac", entryPaidText: "#166534",
    entryOverdueBg: "#fdecec", entryOverdueBorder: "#fca5a5", entryOverdueText: "#991b1b",
    entryIncomeBg: "#d6e4ff", entryIncomeBorder: "#5b8def", entryIncomeText: "#1e40af",
    accent: "#c9622a",
  },
  dark: {
    mode: "dark",
    bg: "#14181a", text: "#eef1ee", muted: "#9aa39c",
    surface: "#1d2325", surfaceAlt: "#20272a", border: "#2c3538",
    headerBg: "#0a2119", headerText: "#eef1ee",
    cardIncome: "#8b5cf6", cardIncomeText: "#ffffff",
    cardSafe: "#3b2a63", cardSafeText: "#ddd6fe",
    cardExpense: "#b91c1c", cardExpenseText: "#ffffff",
    cardPending: "#5c2626", cardPendingText: "#fca5a5",
    entryDefaultBg: "#1d2325", entryDefaultBorder: "#2c3538",
    entryPaidBg: "#12291c", entryPaidBorder: "#22582f", entryPaidText: "#86efac",
    entryOverdueBg: "#2e1414", entryOverdueBorder: "#7a2323", entryOverdueText: "#fca5a5",
    entryIncomeBg: "#1c3a75", entryIncomeBorder: "#4d7fe0", entryIncomeText: "#bcd2ff",
    accent: "#e07a3f",
  },
};

export const BUDGET_NECESSIDADES = ["Alimentação", "Combustível", "Despesas Periastro", "Despesas Karfan", "Educação e Cursos", "Higiene Pessoal", "Saúde", "Transporte", "Vale Transporte", "Veiculo-Pessoal"];
export const BUDGET_INVESTIMENTO = ["Investimentos"];
export const BUDGET_LIVRE = ["Lazer e Social", "Vestuario e Compras pessoais", "Outros", "Materiais"];
export function budgetBucketOf(category) {
  if (BUDGET_INVESTIMENTO.includes(category)) return "investimento";
  if (BUDGET_LIVRE.includes(category)) return "livre";
  return "necessidades";
}

export function fmtBRL(v) {
  const n = Number(v) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function fmtBRLShort(v) {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1000) return `R$${(n / 1000).toFixed(1)}k`;
  return `R$${n.toFixed(0)}`;
}
export function pad2(n) { return String(n).padStart(2, "0"); }
export function monthKeyOf(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; }
export function todayISO() { return new Date().toISOString().slice(0, 10); }
export function fmtDatePt(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function categoryColor(name) {
  let hash = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return PIE_COLORS[hash % PIE_COLORS.length];
}

// Converts a DB row (snake_case) to the app's internal entry shape (camelCase).
export function rowToEntry(row) {
  return {
    id: row.id,
    templateId: row.template_id || null,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    date: row.date,
    status: row.status,
    paidDate: row.paid_date || "",
    recurring: !!row.recurring,
    notes: row.notes || "",
  };
}
// Converts an internal entry back to DB column shape for insert/update.
export function entryToRow(entry, userId) {
  return {
    id: entry.id,
    user_id: userId,
    description: entry.description,
    amount: entry.amount,
    type: entry.type,
    category: entry.category,
    date: entry.date,
    status: entry.status,
    paid_date: entry.paidDate || null,
    recurring: !!entry.recurring,
    template_id: entry.templateId || null,
    notes: entry.notes || "",
  };
}

export function rowToTemplate(row) {
  return {
    id: row.id, description: row.description, amount: Number(row.amount),
    type: row.type, category: row.category, day: row.day, active: row.active,
    startMonth: row.start_month,
  };
}
export function templateToRow(t, userId) {
  return {
    id: t.id, user_id: userId, description: t.description, amount: t.amount,
    type: t.type, category: t.category, day: t.day, active: t.active, start_month: t.startMonth,
  };
}

// Ensures every active recurring template has a generated entry for the given
// month. Returns { toInsert } — entries that still need to be created in Supabase.
export function computeMissingRecurring(monthKey, existingEntries, templates) {
  const toInsert = [];
  for (const t of templates) {
    if (!t.active) continue;
    if (t.startMonth && t.startMonth > monthKey) continue;
    const already = existingEntries.some(e => e.templateId === t.id && e.date.slice(0, 7) === monthKey);
    if (already) continue;
    const day = Math.min(28, Math.max(1, Number(t.day) || 5));
    toInsert.push({
      id: crypto.randomUUID(),
      templateId: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: `${monthKey}-${pad2(day)}`,
      status: "pendente",
      paidDate: "",
      recurring: true,
      notes: "",
    });
  }
  return toInsert;
}
