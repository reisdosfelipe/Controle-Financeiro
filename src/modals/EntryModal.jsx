import { useEffect } from "react";
import { Icon } from "../components/Icon.jsx";

export function EntryModal({ theme, form, setForm, categories, newCategory, setNewCategory, newCategoryType, setNewCategoryType, addCategory, onClose, onSubmit, isEditing }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const filteredCategories = categories.filter(c => c.type === form.type);
  const inputStyle = { borderColor: theme.border, background: theme.surface, color: theme.text };

  useEffect(() => {
    if (filteredCategories.length && !filteredCategories.some(c => c.name === form.category)) {
      set("category", filteredCategories[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20 sans" onClick={onClose}>
      <div className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 max-h-[92vh] overflow-y-auto" style={{ background: theme.bg, color: theme.text }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ fontFamily: "Georgia, serif" }}>{isEditing ? "Editar lançamento" : "Novo lançamento"}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5"><Icon name="x" size={20} /></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: theme.border }}>
            <button type="button" onClick={() => set("type", "receita")} className="flex-1 py-2 text-sm font-semibold" style={form.type === "receita" ? { background: "#0f3d33", color: "#fff" } : { background: theme.surface, color: theme.text }}>Receita</button>
            <button type="button" onClick={() => set("type", "despesa")} className="flex-1 py-2 text-sm font-semibold" style={form.type === "despesa" ? { background: "#a5401f", color: "#fff" } : { background: theme.surface, color: theme.text }}>Despesa</button>
          </div>

          <div>
            <label className="text-xs" style={{ color: theme.muted }}>Descrição</label>
            <input required value={form.description} onChange={e => set("description", e.target.value)} className="w-full border rounded-lg px-3 py-2" style={inputStyle} placeholder="Ex: Internet Claro" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: theme.muted }}>Valor (R$)</label>
              <input required inputMode="decimal" value={form.amount} onChange={e => set("amount", e.target.value)} className="w-full border rounded-lg px-3 py-2 num" style={inputStyle} placeholder="0,00" />
            </div>
            <div>
              <label className="text-xs" style={{ color: theme.muted }}>Data</label>
              <input required type="date" value={form.date} onChange={e => set("date", e.target.value)} className="w-full border rounded-lg px-3 py-2" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="text-xs" style={{ color: theme.muted }}>Categoria</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full border rounded-lg px-3 py-2" style={inputStyle}>
              {filteredCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <div className="flex gap-2 mt-1.5">
              <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nova categoria" className="flex-1 border rounded-lg px-2.5 py-1.5 text-sm" style={inputStyle} />
              <select value={newCategoryType} onChange={e => setNewCategoryType(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm" style={inputStyle}>
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </select>
              <button type="button" onClick={addCategory} className="px-3 py-1.5 text-sm rounded-lg text-white" style={{ background: "#0f3d33" }}>Add</button>
            </div>
          </div>

          <div>
            <label className="text-xs" style={{ color: theme.muted }}>Status</label>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: theme.border }}>
              <button type="button" onClick={() => set("status", "pendente")} className="flex-1 py-2 text-sm font-semibold" style={form.status === "pendente" ? { background: "#8a5b12", color: "#fff" } : { background: theme.surface, color: theme.text }}>Pendente</button>
              <button type="button" onClick={() => set("status", "pago")} className="flex-1 py-2 text-sm font-semibold" style={form.status === "pago" ? { background: "#0f6b4f", color: "#fff" } : { background: theme.surface, color: theme.text }}>Pago</button>
            </div>
          </div>

          {form.status === "pago" && (
            <div>
              <label className="text-xs" style={{ color: theme.muted }}>Pago em</label>
              <input type="date" value={form.paidDate} onChange={e => set("paidDate", e.target.value)} className="w-full border rounded-lg px-3 py-2" style={inputStyle} />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm pt-1">
            <input type="checkbox" checked={!!form.recurring} onChange={e => set("recurring", e.target.checked)} />
            Marcar como despesa fixa (use "Gerenciar despesas fixas" pra repetir todo mês)
          </label>

          <button type="submit" className="w-full py-3 rounded-lg text-white font-semibold mt-2" style={{ background: theme.accent }}>
            {isEditing ? "Salvar alterações" : "Adicionar lançamento"}
          </button>
        </form>
      </div>
    </div>
  );
}

