import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient.js";
import {
  MONTHS_PT, MONTHS_SHORT, DEFAULT_CATEGORIES, THEMES,
  fmtBRL, pad2, monthKeyOf, todayISO, rowToEntry, entryToRow,
  rowToTemplate, templateToRow, computeMissingRecurring, lastDayOfMonth,
} from "./lib.js";
import { HISTORICAL_ENTRIES } from "./historicalData.js";
import { Icon } from "./components/Icon.jsx";
import { LancarView } from "./views/LancarView.jsx";
import { PainelView } from "./views/PainelView.jsx";
import { EntryModal } from "./modals/EntryModal.jsx";
import { RecurringModal } from "./modals/RecurringModal.jsx";

const emptyForm = {
  description: "", amount: "", type: "despesa", category: "Outros",
  date: todayISO(), status: "pendente", paidDate: "", recurring: false, notes: "",
};
const emptyTemplateForm = { description: "", amount: "", type: "despesa", category: "Outros", day: "5" };

function uid() { return crypto.randomUUID(); }

export default function FinanceApp({ user }) {
  const [tab, setTab] = useState("lancar");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [themeName, setThemeName] = useState("light");
  const theme = THEMES[themeName];

  const [cursor, setCursor] = useState(new Date());
  const monthKey = monthKeyOf(cursor);
  const [entries, setEntries] = useState([]);
  const [loadingMonth, setLoadingMonth] = useState(true);

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [templates, setTemplates] = useState([]);

  const [year, setYear] = useState(new Date().getFullYear());
  const [yearData, setYearData] = useState({});
  const [loadingYear, setLoadingYear] = useState(true);
  const [pieScope, setPieScope] = useState("ano");
  const [painelSubTab, setPainelSubTab] = useState("ano");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("despesa");

  const [recurringOpen, setRecurringOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm);

  // ---------- initial load: categories, templates, theme, one-time defaults ----------
  useEffect(() => {
    (async () => {
      try {
        let { data: catRows, error: catErr } = await supabase.from("categories").select("*").order("name");
        if (catErr) throw catErr;
        if (!catRows || catRows.length === 0) {
          const inserts = DEFAULT_CATEGORIES.map(c => ({ id: uid(), user_id: user.id, name: c.name, type: c.type }));
          const { data: inserted, error: insErr } = await supabase.from("categories").insert(inserts).select();
          if (insErr) throw insErr;
          catRows = inserted;
        }
        setCategories(catRows.map(r => ({ name: r.name, type: r.type })));
      } catch (e) {
        setError("Não consegui carregar as categorias.");
      }

      try {
        const { data: tplRows, error: tplErr } = await supabase.from("templates").select("*");
        if (tplErr) throw tplErr;
        setTemplates((tplRows || []).map(rowToTemplate));
      } catch (e) { /* fine, starts empty */ }

      try {
        const { data: settingsRow } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle();
        if (settingsRow) {
          if (settingsRow.theme === "light" || settingsRow.theme === "dark") setThemeName(settingsRow.theme);
        } else {
          await supabase.from("user_settings").insert({ user_id: user.id, theme: "light" });
        }
      } catch (e) { /* keep default theme */ }

      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const toggleTheme = async () => {
    const next = themeName === "light" ? "dark" : "light";
    setThemeName(next);
    try { await supabase.from("user_settings").upsert({ user_id: user.id, theme: next }); } catch (e) {}
  };

  // ---------- entries: month + year loading, with recurring auto-generation ----------
  const loadMonthNow = useCallback(async () => {
    setLoadingMonth(true);
    const start = `${monthKey}-01`;
    const end = `${monthKey}-${pad2(lastDayOfMonth(monthKey))}`;
    try {
      const { data, error: qErr } = await supabase.from("entries").select("*").gte("date", start).lte("date", end).order("date", { ascending: false });
      if (qErr) throw qErr;
      let list = (data || []).map(rowToEntry);
      const toInsert = computeMissingRecurring(monthKey, list, templates);
      if (toInsert.length) {
        const { data: inserted, error: insErr } = await supabase.from("entries").insert(toInsert.map(e => entryToRow(e, user.id))).select();
        if (!insErr && inserted) list = [...list, ...inserted.map(rowToEntry)];
      }
      setEntries(list);
    } catch (e) {
      setError("Não consegui carregar os lançamentos desse mês.");
      setEntries([]);
    }
    setLoadingMonth(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, templates, user.id]);

  useEffect(() => { if (ready) loadMonthNow(); }, [ready, loadMonthNow]);

  const loadYearNow = useCallback(async (y) => {
    setLoadingYear(true);
    try {
      const { data, error: qErr } = await supabase.from("entries").select("*").gte("date", `${y}-01-01`).lte("date", `${y}-12-31`).order("date");
      if (qErr) throw qErr;
      const all = (data || []).map(rowToEntry);
      const byMonth = {};
      for (let m = 1; m <= 12; m++) byMonth[`${y}-${pad2(m)}`] = [];
      for (const e of all) {
        const mk = e.date.slice(0, 7);
        if (byMonth[mk]) byMonth[mk].push(e);
      }
      const toInsertAll = [];
      for (let m = 1; m <= 12; m++) {
        const mk = `${y}-${pad2(m)}`;
        const missing = computeMissingRecurring(mk, byMonth[mk], templates);
        toInsertAll.push(...missing);
      }
      if (toInsertAll.length) {
        const { data: inserted } = await supabase.from("entries").insert(toInsertAll.map(e => entryToRow(e, user.id))).select();
        if (inserted) for (const row of inserted.map(rowToEntry)) {
          const mk = row.date.slice(0, 7);
          if (byMonth[mk]) byMonth[mk].push(row);
        }
      }
      setYearData(byMonth);
    } catch (e) {
      setError("Não consegui carregar o ano.");
    }
    setLoadingYear(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, user.id]);

  useEffect(() => { if (ready && tab === "painel") loadYearNow(year); }, [ready, tab, year, loadYearNow]);

  // ---------- mutations ----------
  async function refreshAfterMutation(targetMk) {
    if (targetMk === monthKey) loadMonthNow();
    if (yearData[targetMk]) loadYearNow(year);
  }

  async function handleDelete(id) {
    const entry = entries.find(e => e.id === id);
    setEntries(prev => prev.filter(e => e.id !== id));
    try { await supabase.from("entries").delete().eq("id", id); } catch (e) { setError("Não consegui excluir."); }
    if (entry) refreshAfterMutation(entry.date.slice(0, 7));
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.description || !form.description.trim() || !form.amount || !form.date) {
      setError("Preenche descrição, valor e data pra lançar.");
      return;
    }
    setError("");
    const amountNum = Number(String(form.amount).replace(",", "."));
    if (!isFinite(amountNum) || amountNum <= 0) {
      setError("Valor inválido.");
      return;
    }
    const targetMk = form.date.slice(0, 7);
    const payload = {
      id: editingId || uid(),
      templateId: form.templateId || null,
      description: form.description.trim(),
      amount: amountNum,
      type: form.type,
      category: form.category,
      date: form.date,
      status: form.status,
      paidDate: form.status === "pago" ? (form.paidDate || form.date) : "",
      recurring: !!form.recurring,
      notes: form.notes || "",
    };
    try {
      if (editingId) {
        await supabase.from("entries").update(entryToRow(payload, user.id)).eq("id", editingId);
      } else {
        await supabase.from("entries").insert(entryToRow(payload, user.id));
      }
    } catch (e2) {
      setError("Não consegui salvar o lançamento.");
    }
    setModalOpen(false);
    refreshAfterMutation(targetMk);
    if (form._origMonthKey && form._origMonthKey !== targetMk) refreshAfterMutation(form._origMonthKey);
  }

  async function togglePaidEntry(entry) {
    const nextStatus = entry.status === "pago" ? "pendente" : "pago";
    const nextPaidDate = nextStatus === "pago" ? todayISO() : "";
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: nextStatus, paidDate: nextPaidDate } : e));
    try {
      await supabase.from("entries").update({ status: nextStatus, paid_date: nextPaidDate || null }).eq("id", entry.id);
    } catch (e) { setError("Não consegui atualizar o status."); }
    refreshAfterMutation(entry.date.slice(0, 7));
  }

  async function deleteEntryAnywhere(entry) {
    try { await supabase.from("entries").delete().eq("id", entry.id); } catch (e) {}
    refreshAfterMutation(entry.date.slice(0, 7));
  }

  const totals = useMemo(() => {
    const receitas = entries.filter(e => e.type === "receita").reduce((s, e) => s + Number(e.amount || 0), 0);
    const despesasTotal = entries.filter(e => e.type === "despesa").reduce((s, e) => s + Number(e.amount || 0), 0);
    const despesasPagas = entries.filter(e => e.type === "despesa" && e.status === "pago").reduce((s, e) => s + Number(e.amount || 0), 0);
    const faltaPagar = despesasTotal - despesasPagas;
    const receitaDisponivel = receitas - despesasPagas;
    const saldoSeguro = receitaDisponivel - faltaPagar;
    return { receitas, despesasTotal, despesasPagas, faltaPagar, receitaDisponivel, saldoSeguro };
  }, [entries]);

  const sorted = useMemo(() => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)), [entries]);

  function openNew() {
    setForm({ ...emptyForm, date: `${monthKey}-${pad2(Math.min(28, new Date().getDate()))}` });
    setEditingId(null);
    setModalOpen(true);
  }
  function openEdit(entry) {
    setForm({ ...emptyForm, ...entry, amount: String(entry.amount), _origMonthKey: entry.date ? entry.date.slice(0, 7) : monthKey });
    setEditingId(entry.id);
    setModalOpen(true);
  }
  function changeMonth(delta) {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + delta);
    setCursor(d);
  }

  async function addCategory() {
    const c = newCategory.trim();
    if (!c || categories.some(cat => cat.name === c)) return;
    const next = [...categories, { name: c, type: newCategoryType }];
    setCategories(next);
    try { await supabase.from("categories").insert({ id: uid(), user_id: user.id, name: c, type: newCategoryType }); } catch (e) {}
    setForm(f => ({ ...f, category: c, type: newCategoryType }));
    setNewCategory("");
  }

  async function addTemplate(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!templateForm.description.trim() || !templateForm.amount) return;
    const t = {
      id: uid(), description: templateForm.description.trim(),
      amount: Number(String(templateForm.amount).replace(",", ".")),
      type: templateForm.type, category: templateForm.category,
      day: Number(templateForm.day) || 5, active: true, startMonth: monthKey,
    };
    setTemplates(prev => [...prev, t]);
    try { await supabase.from("templates").insert(templateToRow(t, user.id)); } catch (e2) {}
    setTemplateForm(emptyTemplateForm);
  }
  async function toggleTemplate(id) {
    const t = templates.find(x => x.id === id);
    if (!t) return;
    const next = { ...t, active: !t.active };
    setTemplates(prev => prev.map(x => x.id === id ? next : x));
    try { await supabase.from("templates").update({ active: next.active }).eq("id", id); } catch (e) {}
  }
  async function removeTemplate(id) {
    setTemplates(prev => prev.filter(x => x.id !== id));
    try { await supabase.from("templates").delete().eq("id", id); } catch (e) {}
  }

  const reimportHistory = useCallback(async () => {
    setError("");
    try {
      const { data: settingsRow } = await supabase.from("user_settings").select("history_imported").eq("user_id", user.id).maybeSingle();
      if (settingsRow && settingsRow.history_imported) {
        const confirmReimport = window.confirm("O histórico já foi importado antes. Importar de novo pode duplicar lançamentos. Continuar mesmo assim?");
        if (!confirmReimport) return;
      }
      const rows = HISTORICAL_ENTRIES.map(e => entryToRow({ ...e, id: uid() }, user.id));
      const { error: insErr } = await supabase.from("entries").insert(rows);
      if (insErr) throw insErr;
      await supabase.from("user_settings").upsert({ user_id: user.id, theme: themeName, history_imported: true });
      await loadYearNow(year);
      await loadMonthNow();
    } catch (e) {
      setError("Não consegui reimportar o histórico. Tenta de novo em instantes.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, themeName]);

  const monthlyChart = useMemo(() => {
    return MONTHS_SHORT.map((label, i) => {
      const mk = `${year}-${pad2(i + 1)}`;
      const list = yearData[mk] || [];
      const receita = list.filter(e => e.type === "receita").reduce((s, e) => s + Number(e.amount || 0), 0);
      const despesa = list.filter(e => e.type === "despesa").reduce((s, e) => s + Number(e.amount || 0), 0);
      return { mes: label, mk, receita, despesa, saldo: receita - despesa };
    });
  }, [yearData, year]);

  const yearTotals = useMemo(() => {
    const receitas = monthlyChart.reduce((s, m) => s + m.receita, 0);
    const despesas = monthlyChart.reduce((s, m) => s + m.despesa, 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [monthlyChart]);

  const pieData = useMemo(() => {
    const pool = pieScope === "ano" ? Object.values(yearData).flat() : (yearData[pieScope] || []);
    const byCat = {};
    pool.filter(e => e.type === "despesa").forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount || 0); });
    return Object.entries(byCat).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value);
  }, [yearData, pieScope]);

  const monthDetail = useMemo(() => {
    if (painelSubTab === "ano" || painelSubTab === "orcamento") return null;
    const list = yearData[painelSubTab] || [];
    const receita = list.filter(e => e.type === "receita").reduce((s, e) => s + Number(e.amount || 0), 0);
    const despesa = list.filter(e => e.type === "despesa").reduce((s, e) => s + Number(e.amount || 0), 0);
    const byCat = {};
    list.filter(e => e.type === "despesa").forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount || 0); });
    const catBars = Object.entries(byCat).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value);
    return { list: [...list].sort((a, b) => (a.date < b.date ? 1 : -1)), receita, despesa, saldo: receita - despesa, catBars };
  }, [painelSubTab, yearData]);

  const allYearEntries = useMemo(() => Object.entries(yearData).flatMap(([mk, list]) => list.map(e => ({ ...e, _mk: mk }))), [yearData]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.bg, color: theme.text, fontFamily: "Georgia, serif" }}>
        Carregando seu controle financeiro...
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors" style={{ background: theme.bg, color: theme.text, fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="sticky top-0 z-10 shadow-md" style={{ background: theme.headerBg, color: theme.headerText }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase opacity-70 sans">Controle financeiro</div>
            <div className="text-lg font-semibold">{user.user_metadata?.user_name || user.email || "Você"}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-white/20 sans text-sm">
              <button onClick={() => setTab("lancar")} className="flex items-center gap-1.5 px-3 py-1.5" style={tab === "lancar" ? { background: theme.accent } : {}}>
                <Icon name="list-plus" size={15} /> Lançar
              </button>
              <button onClick={() => setTab("painel")} className="flex items-center gap-1.5 px-3 py-1.5" style={tab === "painel" ? { background: theme.accent } : {}}>
                <Icon name="grid" size={15} /> Painel
              </button>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10" aria-label="Alternar tema">
              {themeName === "light" ? <Icon name="moon" size={17} /> : <Icon name="sun" size={17} />}
            </button>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-white/10 text-xs sans" aria-label="Sair">Sair</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto px-4 pt-3">
          <div className="text-sm rounded-lg px-3 py-2 sans" style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}>{error}</div>
        </div>
      )}

      {tab === "lancar" && (
        <LancarView
          theme={theme} cursor={cursor} changeMonth={changeMonth} totals={totals} sorted={sorted} loading={loadingMonth}
          openEdit={openEdit} handleDelete={handleDelete} togglePaid={togglePaidEntry} openNew={openNew}
          onOpenRecurring={() => setRecurringOpen(true)}
        />
      )}

      {tab === "painel" && (
        <PainelView
          theme={theme} year={year} setYear={setYear} loading={loadingYear} monthlyChart={monthlyChart}
          yearTotals={yearTotals} pieData={pieData} pieScope={pieScope} setPieScope={setPieScope} openNew={openNew}
          painelSubTab={painelSubTab} setPainelSubTab={setPainelSubTab} monthDetail={monthDetail}
          categories={categories} openEdit={openEdit}
          onDeleteInMonth={(id) => { const e = monthDetail?.list.find(x => x.id === id); if (e) deleteEntryAnywhere(e); }}
          onTogglePaidInMonth={togglePaidEntry}
          allEntries={allYearEntries}
          onDeleteEntry={deleteEntryAnywhere}
          onTogglePaidEntry={togglePaidEntry}
          onRefresh={() => loadYearNow(year)}
          onReimport={reimportHistory}
          yearData={yearData}
        />
      )}

      {modalOpen && (
        <EntryModal
          theme={theme} form={form} setForm={setForm} categories={categories}
          newCategory={newCategory} setNewCategory={setNewCategory}
          newCategoryType={newCategoryType} setNewCategoryType={setNewCategoryType}
          addCategory={addCategory} onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit} isEditing={!!editingId}
        />
      )}

      {recurringOpen && (
        <RecurringModal
          theme={theme} templates={templates} categories={categories}
          templateForm={templateForm} setTemplateForm={setTemplateForm}
          onAdd={addTemplate} onToggle={toggleTemplate} onRemove={removeTemplate}
          onClose={() => setRecurringOpen(false)}
        />
      )}
    </div>
  );
}
