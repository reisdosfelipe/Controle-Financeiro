import { Icon } from "../components/Icon.jsx";
import { MONTHS_PT, fmtBRL, fmtDatePt, todayISO } from "../lib.js";

export function LancarView({ theme, cursor, changeMonth, totals, sorted, loading, openEdit, handleDelete, togglePaid, openNew, onOpenRecurring }) {
  return (
    <div className="max-w-2xl mx-auto px-4 pb-28 pt-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} aria-label="Mês anterior" className="p-2 rounded-full hover:bg-black/5 active:bg-black/10">
          <Icon name="chevron-left" size={20} />
        </button>
        <div className="text-lg font-semibold">{MONTHS_PT[cursor.getMonth()]} / {cursor.getFullYear()}</div>
        <button onClick={() => changeMonth(1)} aria-label="Próximo mês" className="p-2 rounded-full hover:bg-black/5 active:bg-black/10">
          <Icon name="chevron-right" size={20} />
        </button>
      </div>

      <button
        onClick={onOpenRecurring}
        className="w-full flex items-center justify-center gap-2 text-sm rounded-lg px-3 py-2 mb-4 border sans"
        style={{ borderColor: theme.border, color: theme.muted }}
      >
        <Icon name="repeat" size={15} /> Gerenciar despesas fixas
      </button>

      <div className="grid grid-cols-2 gap-3 mb-5 sans">
        <SummaryCard theme={theme} icon={<Icon name="wallet" size={16} />} label="Receita disponível" value={totals.receitaDisponivel} bg={theme.cardIncome} fg={theme.cardIncomeText} />
        <SummaryCard theme={theme} icon={<Icon name="shield-check" size={16} />} label="Saldo seguro" value={totals.saldoSeguro} bg={theme.cardSafe} fg={theme.cardSafeText} />
        <SummaryCard theme={theme} icon={<Icon name="trend-down" size={16} />} label="Todas as despesas" value={totals.despesasTotal} bg={theme.cardExpense} fg={theme.cardExpenseText} />
        <SummaryCard theme={theme} icon={<Icon name="clock" size={16} />} label="Falta pagar" value={totals.faltaPagar} bg={theme.cardPending} fg={theme.cardPendingText} />
      </div>

      {loading ? (
        <div className="text-center py-16 opacity-60 sans">Carregando...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 opacity-60 sans">
          Nenhum lançamento neste mês.<br />Toque em + para adicionar o primeiro.
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map(entry => (
            <EntryCard key={entry.id} theme={theme} entry={entry} onEdit={() => openEdit(entry)} onDelete={() => handleDelete(entry.id)} onTogglePaid={() => togglePaid(entry)} />
          ))}
        </div>
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

function SummaryCard({ icon, label, value, bg, fg }) {
  return (
    <div className="rounded-xl px-3.5 py-3" style={{ background: bg, color: fg }}>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide opacity-90 mb-1">
        {icon}<span>{label}</span>
      </div>
      <div className="num text-lg font-bold">{fmtBRL(value)}</div>
    </div>
  );
}

function EntryCard({ theme, entry, onEdit, onDelete, onTogglePaid }) {
  const isIncome = entry.type === "receita";
  const isPaid = entry.status === "pago";
  const isOverdue = !isIncome && !isPaid && entry.date < todayISO();

  let bg = theme.entryDefaultBg, border = theme.entryDefaultBorder;
  if (isIncome) { bg = theme.entryIncomeBg; border = theme.entryIncomeBorder; }
  else if (isPaid) { bg = theme.entryPaidBg; border = theme.entryPaidBorder; }
  else if (isOverdue) { bg = theme.entryOverdueBg; border = theme.entryOverdueBorder; }

  return (
    <div className="rounded-xl p-3.5 border" style={{ background: bg, borderColor: border }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate sans flex items-center gap-1.5">
            {entry.description}
            {entry.recurring && <Icon name="repeat" size={12} style={{ color: theme.muted }} aria-label="Despesa fixa" />}
          </div>
          <div className="text-xs mt-0.5 sans" style={{ color: theme.muted }}>
            {fmtDatePt(entry.date)} · {entry.category}
            {isPaid && entry.paidDate && <> · pago em {fmtDatePt(entry.paidDate)}</>}
            {isOverdue && <> · vencido</>}
          </div>
        </div>
        <div className={`num font-bold whitespace-nowrap`} style={{ color: isIncome ? theme.entryIncomeText : "#a5401f" }}>
          {isIncome ? "+" : "-"} {fmtBRL(entry.amount)}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <button
          onClick={onTogglePaid}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full sans"
          style={{ background: isPaid ? theme.entryPaidBorder : (isOverdue ? theme.entryOverdueBorder : theme.border), color: isPaid ? theme.entryPaidText : (isOverdue ? theme.entryOverdueText : theme.muted) }}
        >
          <Icon name="check" size={12} /> {isPaid ? "Pago" : isOverdue ? "Vencido" : "Pendente"}
        </button>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-black/5" aria-label="Editar"><Icon name="pencil" size={15} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-black/5" aria-label="Excluir"><Icon name="trash" size={15} /></button>
        </div>
      </div>
    </div>
  );
}

export { SummaryCard, EntryCard };
