import { Icon } from "../components/Icon.jsx";
import { fmtBRL } from "../lib.js";

export function RecurringModal({ theme, templates, categories, templateForm, setTemplateForm, onAdd, onToggle, onRemove, onClose }) {
  const set = (k, v) => setTemplateForm(f => ({ ...f, [k]: v }));
  const inputStyle = { borderColor: theme.border, background: theme.surface, color: theme.text };
  const filteredCategories = categories.filter(c => c.type === templateForm.type);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20 sans" onClick={onClose}>
      <div className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 max-h-[92vh] overflow-y-auto" style={{ background: theme.bg, color: theme.text }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}><Icon name="repeat" size={18} /> Despesas fixas</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5"><Icon name="x" size={20} /></button>
        </div>

        {templates.length === 0 ? (
          <div className="text-sm text-center py-6" style={{ color: theme.muted }}>Nenhuma despesa fixa cadastrada ainda.</div>
        ) : (
          <div className="space-y-2 mb-5">
            {templates.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2" style={{ borderColor: theme.border }}>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{t.description}</div>
                  <div className="text-xs" style={{ color: theme.muted }}>{t.category} · dia {t.day} · {fmtBRL(t.amount)}</div>
                </div>
                <button type="button" onClick={() => onToggle(t.id)} className="p-1.5 rounded-lg" style={{ color: t.active ? "#0f6b4f" : theme.muted }} aria-label={t.active ? "Desativar" : "Ativar"}>
                  {t.active ? <Icon name="power" size={16} /> : <Icon name="power-off" size={16} />}
                </button>
                <button type="button" onClick={() => onRemove(t.id)} className="p-1.5 rounded-lg hover:bg-black/5" aria-label="Remover"><Icon name="trash" size={15} /></button>
              </div>
            ))}
          </div>
        )}

        <div className="text-sm font-semibold mb-2" style={{ fontFamily: "Georgia, serif" }}>Nova despesa fixa</div>
        <form onSubmit={onAdd} className="space-y-3">
          <input required value={templateForm.description} onChange={e => set("description", e.target.value)} placeholder="Ex: Internet Fix Fibra" className="w-full border rounded-lg px-3 py-2" style={inputStyle} />
          <div className="grid grid-cols-2 gap-3">
            <input required inputMode="decimal" value={templateForm.amount} onChange={e => set("amount", e.target.value)} placeholder="Valor" className="w-full border rounded-lg px-3 py-2 num" style={inputStyle} />
            <input required type="number" min="1" max="28" value={templateForm.day} onChange={e => set("day", e.target.value)} placeholder="Dia do mês" className="w-full border rounded-lg px-3 py-2" style={inputStyle} />
          </div>
          <select value={templateForm.type} onChange={e => set("type", e.target.value)} className="w-full border rounded-lg px-3 py-2" style={inputStyle}>
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>
          <select value={templateForm.category} onChange={e => set("category", e.target.value)} className="w-full border rounded-lg px-3 py-2" style={inputStyle}>
            {filteredCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <button type="submit" className="w-full py-2.5 rounded-lg text-white font-semibold" style={{ background: theme.accent }}>Adicionar despesa fixa</button>
        </form>
      </div>
    </div>
  );
}
