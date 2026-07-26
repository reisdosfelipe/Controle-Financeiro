import { useState, useMemo } from "react";
import { Icon } from "../components/Icon.jsx";
import { ChartBar, ChartBarHorizontal, ChartLine, ChartPie } from "../components/Charts.jsx";
import { EntryCard } from "./LancarView.jsx";
import { MONTHS_PT, MONTHS_SHORT, fmtBRL, fmtBRLShort, pad2, categoryColor, budgetBucketOf } from "../lib.js";

export function PainelView({ theme, year, setYear, loading, monthlyChart, yearTotals, pieData, pieScope, setPieScope, openNew, painelSubTab, setPainelSubTab, monthDetail, categories, openEdit, onDeleteInMonth, onTogglePaidInMonth, allEntries, onDeleteEntry, onTogglePaidEntry, onRefresh, onReimport, yearData }) {
  const totalDespesaAno = pieData.reduce((s, d) => s + d.value, 0);
  const gridStroke = theme.border;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16 pt-4 sans">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-full hover:bg-black/5" aria-label="Ano anterior"><Icon name="chevron-left" size={20} /></button>
        <div className="text-lg font-semibold" style={{ fontFamily: "Georgia, serif" }}>Ano de {year}</div>
        <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-full hover:bg-black/5" aria-label="Próximo ano"><Icon name="chevron-right" size={20} /></button>
      </div>

      <div className="flex items-center justify-end gap-2 mb-3 text-xs">
        <button onClick={onRefresh} className="px-2.5 py-1 rounded-full border" style={{ borderColor: theme.border, color: theme.muted }}>Atualizar</button>
        <button onClick={onReimport} className="px-2.5 py-1 rounded-full border" style={{ borderColor: theme.border, color: theme.muted }}>Reimportar histórico</button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
        <button
          onClick={() => setPainelSubTab("ano")}
          className="shrink-0 px-3 py-1.5 rounded-full text-sm border"
          style={painelSubTab === "ano" ? { background: theme.accent, color: "#fff", borderColor: theme.accent } : { borderColor: theme.border, color: theme.muted }}
        >Ano todo</button>
        <button
          onClick={() => setPainelSubTab("orcamento")}
          className="shrink-0 px-3 py-1.5 rounded-full text-sm border"
          style={painelSubTab === "orcamento" ? { background: theme.accent, color: "#fff", borderColor: theme.accent } : { borderColor: theme.border, color: theme.muted }}
        >50/30/20</button>
        {MONTHS_PT.map((m, i) => {
          const mk = `${year}-${pad2(i + 1)}`;
          return (
            <button
              key={mk}
              onClick={() => setPainelSubTab(mk)}
              className="shrink-0 px-3 py-1.5 rounded-full text-sm border"
              style={painelSubTab === mk ? { background: theme.accent, color: "#fff", borderColor: theme.accent } : { borderColor: theme.border, color: theme.muted }}
            >{MONTHS_SHORT[i]}</button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-16 opacity-60">Carregando o ano...</div>
      ) : painelSubTab === "ano" ? (
        <AnoOverview
          theme={theme} monthlyChart={monthlyChart} yearTotals={yearTotals}
          pieData={pieData} pieScope={pieScope} setPieScope={setPieScope} year={year}
          totalDespesaAno={totalDespesaAno} gridStroke={gridStroke}
          categories={categories} openEdit={openEdit} allEntries={allEntries}
          onDeleteEntry={onDeleteEntry} onTogglePaidEntry={onTogglePaidEntry}
        />
      ) : painelSubTab === "orcamento" ? (
        <Budget5030View theme={theme} year={year} yearData={yearData} />
      ) : (
        <MonthDetailView
          theme={theme} monthDetail={monthDetail} monthLabel={MONTHS_PT[Number(painelSubTab.slice(5, 7)) - 1]}
          gridStroke={gridStroke} categories={categories} openEdit={openEdit}
          onDelete={onDeleteInMonth} onTogglePaid={onTogglePaidInMonth}
        />
      )}

      <button
        onClick={openNew}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center active:scale-95 transition"
        style={{ background: theme.accent }}
        aria-label="Adicionar lançamento"
      >
        <Icon name="plus" size={26} />
      </button>
    </div>
  );
}

function AnoOverview({ theme, monthlyChart, yearTotals, pieData, pieScope, setPieScope, year, totalDespesaAno, gridStroke, categories, openEdit, allEntries, onDeleteEntry, onTogglePaidEntry }) {
  const [listMonthFilter, setListMonthFilter] = useState("todos");
  const [listCatFilter, setListCatFilter] = useState("todas");

  const filteredEntries = useMemo(() => {
    let list = allEntries;
    if (listMonthFilter !== "todos") list = list.filter(e => (e._mk || e.date.slice(0, 7)) === listMonthFilter);
    if (listCatFilter !== "todas") list = list.filter(e => e.category === listCatFilter);
    return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [allEntries, listMonthFilter, listCatFilter]);

  const categoryOptions = useMemo(() => {
    const names = new Set(categories.map(c => c.name));
    allEntries.forEach(e => names.add(e.category));
    return [...names].sort();
  }, [categories, allEntries]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <KpiCard theme={theme} icon={<Icon name="wallet" size={16} />} label="Total recebido" value={yearTotals.receitas} bg={theme.cardIncome} fg={theme.cardIncomeText} />
        <KpiCard theme={theme} icon={<Icon name="trend-down" size={16} />} label="Total gasto" value={yearTotals.despesas} bg={theme.cardExpense} fg={theme.cardExpenseText} />
        <KpiCard theme={theme} icon={<Icon name="piggy" size={16} />} label="Saldo do ano" value={yearTotals.saldo} bg={theme.surfaceAlt} fg={theme.text} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl border p-4" style={{ background: theme.surface, borderColor: theme.border }}>
          <div className="font-semibold mb-3" style={{ fontFamily: "Georgia, serif" }}>Receita x Despesa por mês</div>
          <ChartBar theme={theme} data={monthlyChart} xKey="mes" height={260} valueFormatter={fmtBRLShort}
            bars={[{ key: "receita", name: "Receita", color: "#1d4ed8" }, { key: "despesa", name: "Despesa", color: "#a5401f" }]} />
          <div className="flex gap-4 mt-2 text-xs" style={{ color: theme.muted }}>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#1d4ed8" }}></span>Receita</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#a5401f" }}></span>Despesa</span>
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ background: theme.surface, borderColor: theme.border }}>
          <div className="font-semibold mb-3" style={{ fontFamily: "Georgia, serif" }}>Saldo do mês</div>
          <div className="text-xs mb-2" style={{ color: theme.muted }}>O que sobrou (ou faltou) em cada mês — sem acumular de um mês pro outro.</div>
          <ChartLine theme={theme} data={monthlyChart} xKey="mes" yKey="saldo" height={240} color={theme.accent} valueFormatter={fmtBRLShort} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl border p-4" style={{ background: theme.surface, borderColor: theme.border }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="font-semibold" style={{ fontFamily: "Georgia, serif" }}>Despesas por categoria</div>
            <select value={pieScope} onChange={e => setPieScope(e.target.value)} className="text-sm border rounded-lg px-2 py-1" style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}>
              <option value="ano">Ano todo</option>
              {MONTHS_PT.map((m, i) => <option key={m} value={`${year}-${pad2(i + 1)}`}>{m}</option>)}
            </select>
          </div>
          {pieData.length === 0 ? (
            <div className="text-center py-12 opacity-60 text-sm">Sem despesas nesse período.</div>
          ) : (
            <ChartPie theme={theme} data={pieData} height={220} colorFor={categoryColor} />
          )}
        </div>

        <div className="rounded-xl border p-4" style={{ background: theme.surface, borderColor: theme.border }}>
          <div className="font-semibold mb-3" style={{ fontFamily: "Georgia, serif" }}>Ranking de categorias</div>
          {pieData.length === 0 ? (
            <div className="text-center py-12 opacity-60 text-sm">Sem despesas nesse período.</div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: categoryColor(d.name) }} />
                  <span className="flex-1 text-sm truncate">{d.name}</span>
                  <span className="num text-sm font-semibold">{fmtBRL(d.value)}</span>
                  <span className="text-xs opacity-60 w-10 text-right">{totalDespesaAno ? Math.round((d.value / totalDespesaAno) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border p-4" style={{ background: theme.surface, borderColor: theme.border }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="font-semibold" style={{ fontFamily: "Georgia, serif" }}>Todos os lançamentos do ano</div>
          <div className="flex gap-2 flex-wrap">
            <select value={listMonthFilter} onChange={e => setListMonthFilter(e.target.value)} className="text-sm border rounded-lg px-2 py-1" style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}>
              <option value="todos">Todos os meses</option>
              {MONTHS_PT.map((m, i) => <option key={m} value={`${year}-${pad2(i + 1)}`}>{m}</option>)}
            </select>
            <select value={listCatFilter} onChange={e => setListCatFilter(e.target.value)} className="text-sm border rounded-lg px-2 py-1" style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}>
              <option value="todas">Todas as categorias</option>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 opacity-60 text-sm">Nenhum lançamento com esse filtro.</div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredEntries.map(e => (
              <EntryCard key={e.id} theme={theme} entry={e} onEdit={() => openEdit(e)} onDelete={() => onDeleteEntry(e)} onTogglePaid={() => onTogglePaidEntry(e)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function MonthDetailView({ theme, monthDetail, monthLabel, gridStroke, categories, openEdit, onDelete, onTogglePaid }) {
  const [catFilter, setCatFilter] = useState("todas");
  if (!monthDetail) return null;
  const { receita, despesa, saldo, catBars, list } = monthDetail;
  const filteredList = catFilter === "todas" ? list : list.filter(e => e.category === catFilter);
  const categoriesInMonth = [...new Set(list.map(e => e.category))].sort();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <KpiCard theme={theme} icon={<Icon name="wallet" size={16} />} label={`Receita em ${monthLabel}`} value={receita} bg={theme.cardIncome} fg={theme.cardIncomeText} />
        <KpiCard theme={theme} icon={<Icon name="trend-down" size={16} />} label={`Despesa em ${monthLabel}`} value={despesa} bg={theme.cardExpense} fg={theme.cardExpenseText} />
        <KpiCard theme={theme} icon={<Icon name="piggy" size={16} />} label="Saldo do mês" value={saldo} bg={theme.surfaceAlt} fg={theme.text} />
      </div>

      {catBars.length === 0 ? (
        <div className="text-center py-12 opacity-60 text-sm">Sem despesas em {monthLabel}.</div>
      ) : (
        <div className="rounded-xl border p-4 mb-6" style={{ background: theme.surface, borderColor: theme.border }}>
          <div className="font-semibold mb-3" style={{ fontFamily: "Georgia, serif" }}>Gastos por categoria — {monthLabel}</div>
          <ChartBarHorizontal theme={theme} data={catBars.map(d => ({ ...d, color: categoryColor(d.name) }))} height={Math.max(220, catBars.length * 32)} valueFormatter={fmtBRLShort} />
        </div>
      )}

      <div className="rounded-xl border p-4" style={{ background: theme.surface, borderColor: theme.border }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="font-semibold" style={{ fontFamily: "Georgia, serif" }}>Lançamentos de {monthLabel}</div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="text-sm border rounded-lg px-2 py-1" style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}>
            <option value="todas">Todas as categorias</option>
            {categoriesInMonth.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {filteredList.length === 0 ? (
          <div className="text-center py-8 opacity-60 text-sm">Nenhum lançamento{catFilter !== "todas" ? " nessa categoria" : ""}.</div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredList.map(e => (
              <EntryCard key={e.id} theme={theme} entry={e} onEdit={() => openEdit(e)} onDelete={() => onDelete(e.id)} onTogglePaid={() => onTogglePaid(e)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Budget5030View({ theme, year, yearData }) {
  const [scope, setScope] = useState("ano");
  const list = scope === "ano" ? Object.values(yearData).flat() : (yearData[scope] || []);
  const receita = list.filter(e => e.type === "receita").reduce((s, e) => s + Number(e.amount || 0), 0);
  const buckets = { necessidades: 0, investimento: 0, livre: 0 };
  list.filter(e => e.type === "despesa").forEach(e => { buckets[budgetBucketOf(e.category)] += Number(e.amount || 0); });

  const rows = [
    { key: "necessidades", label: "Necessidades", target: 0.5, better: "under", desc: "Aluguel, contas, transporte, mercado — o que você não escolhe, precisa pagar pra viver." },
    { key: "investimento", label: "Investimento", target: 0.2, better: "over", desc: "Reserva de emergência, investimentos, quitação de dívida — o que constrói patrimônio. Lance como categoria \"Investimentos\"." },
    { key: "livre", label: "Livre", target: 0.3, better: "under", desc: "Lazer, roupa, saída com amigos — não essencial, mas faz parte da vida." },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="font-semibold text-lg" style={{ fontFamily: "Georgia, serif" }}>Sua regra 50/30/20</div>
          <div className="text-xs" style={{ color: theme.muted }}>50% Necessidades · 20% Investimento · 30% Livre — calculado em cima da sua receita do período.</div>
        </div>
        <select value={scope} onChange={e => setScope(e.target.value)} className="text-sm border rounded-lg px-2 py-1" style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}>
          <option value="ano">Ano todo</option>
          {MONTHS_PT.map((m, i) => <option key={m} value={`${year}-${pad2(i + 1)}`}>{m}</option>)}
        </select>
      </div>

      <div className="rounded-xl border p-4 mb-5" style={{ background: theme.surfaceAlt, borderColor: theme.border }}>
        <div className="text-xs uppercase tracking-wide opacity-80 mb-1" style={{ color: theme.muted }}>Receita no período</div>
        <div className="num text-2xl font-bold">{fmtBRL(receita)}</div>
      </div>

      {receita === 0 ? (
        <div className="text-center py-12 opacity-60 text-sm">Sem receita lançada nesse período pra calcular a regra.</div>
      ) : (
        <div className="space-y-4">
          {rows.map(r => {
            const value = buckets[r.key];
            const pct = receita > 0 ? value / receita : 0;
            const isGood = r.better === "under" ? pct <= r.target + 0.02 : pct >= r.target - 0.02;
            const barColor = isGood ? "#0f6b4f" : "#a5401f";
            const widthPct = Math.min(100, pct * 100);
            const targetPct = r.target * 100;
            const targetValue = receita * r.target;
            const remaining = targetValue - value;
            let statusMsg;
            if (r.better === "under") {
              statusMsg = remaining >= 0
                ? `Ainda pode gastar ${fmtBRL(remaining)} nessa fatia`
                : `Estourou a meta em ${fmtBRL(Math.abs(remaining))}`;
            } else {
              statusMsg = remaining <= 0
                ? `Meta batida — investiu ${fmtBRL(Math.abs(remaining))} a mais`
                : `Faltam ${fmtBRL(remaining)} pra bater a meta de investimento`;
            }
            return (
              <div key={r.key} className="rounded-xl border p-4" style={{ background: theme.surface, borderColor: theme.border }}>
                <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                  <div className="font-semibold">{r.label} <span className="text-xs font-normal" style={{ color: theme.muted }}>· meta {Math.round(r.target * 100)}% ({fmtBRL(targetValue)})</span></div>
                  <div className="num font-bold" style={{ color: barColor }}>{fmtBRL(value)} <span className="text-xs">({Math.round(pct * 100)}%)</span></div>
                </div>
                <div className="text-xs mb-2" style={{ color: theme.muted }}>{r.desc}</div>
                <div style={{ position: "relative", height: 10, background: theme.border, borderRadius: 999, overflow: "visible" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${widthPct}%`, background: barColor, borderRadius: 999, transition: "width .2s" }} />
                  <div style={{ position: "absolute", left: `${targetPct}%`, top: -3, bottom: -3, width: 2, background: theme.text, opacity: 0.6 }} title={`Meta: ${Math.round(r.target * 100)}%`} />
                </div>
                <div className="text-xs font-semibold mt-2" style={{ color: barColor }}>{statusMsg}</div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function KpiCard({ icon, label, value, bg, fg }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: bg, color: fg }}>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide opacity-90 mb-1">{icon}<span>{label}</span></div>
      <div className="num text-xl font-bold">{fmtBRL(value)}</div>
    </div>
  );
}
