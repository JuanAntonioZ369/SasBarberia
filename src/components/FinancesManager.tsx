"use client";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, today } from "@/lib/utils";
import { Plus, Trash2, X, TrendingUp, TrendingDown } from "lucide-react";
import type { Transaction } from "@/lib/supabase/types";

interface Client { id: string; full_name: string; }
interface Props {
  initialTransactions: Transaction[];
  clients: Client[];
  barbershopId: string;
  userId: string;
  demoMode?: boolean;
}

const emptyForm = {
  type: "income" as "income" | "expense",
  amount: "",
  description: "",
  category: "",
  client_id: "",
  date: today(),
};

const INCOME_CATEGORIES = ["Corte", "Barba", "Tinte", "Tratamiento", "Venta producto", "Membresía", "Otro"];
const EXPENSE_CATEGORIES = ["Insumos", "Salario", "Alquiler", "Servicios", "Mantenimiento", "Publicidad", "Otro"];

export default function FinancesManager({ initialTransactions, clients, barbershopId, userId, demoMode }: Props) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filter !== "all" && t.type !== filter) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
  }, [transactions, filter, dateFrom, dateTo]);

  const totals = useMemo(() => ({
    income: filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    expenses: filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
  }), [filtered]);

  async function handleSave() {
    setSaving(true);
    const payload = {
      barbershop_id: barbershopId,
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      category: form.category || null,
      client_id: form.client_id || null,
      date: form.date,
      created_by: userId,
    };
    if (demoMode) {
      const record: Transaction = { id: `t-${Date.now()}`, created_at: new Date().toISOString(), ...payload };
      setTransactions(prev => [record, ...prev]);
    } else {
      const supabase = createClient();
      const { data } = await supabase.from("transactions").insert(payload).select().single();
      if (data) setTransactions(prev => [data as Transaction, ...prev]);
    }
    setSaving(false);
    setShowModal(false);
    setForm(emptyForm);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este registro?")) return;
    if (!demoMode) {
      const supabase = createClient();
      await supabase.from("transactions").delete().eq("id", id);
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  const cats = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card text-center">
          <p style={{ color: "#22c55e", fontSize: "1.4rem", fontWeight: 700 }}>{formatCurrency(totals.income)}</p>
          <p style={{ color: "#555", fontSize: "0.8rem" }}>Ingresos</p>
        </div>
        <div className="card text-center">
          <p style={{ color: "#ef4444", fontSize: "1.4rem", fontWeight: 700 }}>{formatCurrency(totals.expenses)}</p>
          <p style={{ color: "#555", fontSize: "0.8rem" }}>Gastos</p>
        </div>
        <div className="card text-center">
          <p style={{ fontSize: "1.4rem", fontWeight: 700, color: totals.income - totals.expenses >= 0 ? "#22c55e" : "#ef4444" }}>
            {formatCurrency(totals.income - totals.expenses)}
          </p>
          <p style={{ color: "#555", fontSize: "0.8rem" }}>Ganancia neta</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1">
            {(["all", "income", "expense"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={filter === f ? "btn-primary" : "btn-ghost"}
                style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
                {f === "all" ? "Todo" : f === "income" ? "Ingresos" : "Gastos"}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center flex-1">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 150 }} />
            <span style={{ color: "#555" }}>—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 150 }} />
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Registrar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Monto</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#555", padding: "2rem" }}>Sin registros</td></tr>
            )}
            {filtered.map(t => (
              <tr key={t.id}>
                <td style={{ color: "#888", whiteSpace: "nowrap" }}>{formatDate(t.date)}</td>
                <td>
                  <span className={`badge ${t.type === "income" ? "badge-green" : "badge-red"}`}>
                    {t.type === "income" ? <TrendingUp size={11} style={{ display: "inline", marginRight: 3 }} /> : <TrendingDown size={11} style={{ display: "inline", marginRight: 3 }} />}
                    {t.type === "income" ? "Ingreso" : "Gasto"}
                  </span>
                </td>
                <td>{t.description}</td>
                <td style={{ color: "#888" }}>{t.category ?? "—"}</td>
                <td style={{ fontWeight: 600, color: t.type === "income" ? "#22c55e" : "#ef4444" }}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                </td>
                <td>
                  <button onClick={() => handleDelete(t.id)} style={{ color: "#555", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="card w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Nuevo registro</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "#555", background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label>Tipo</label>
                <div className="flex gap-2">
                  <button onClick={() => setForm(p => ({ ...p, type: "income", category: "" }))}
                    className={form.type === "income" ? "btn-primary" : "btn-ghost"} style={{ flex: 1 }}>
                    Ingreso
                  </button>
                  <button onClick={() => setForm(p => ({ ...p, type: "expense", category: "" }))}
                    className={form.type === "expense" ? "btn-primary" : "btn-ghost"} style={{ flex: 1, background: form.type === "expense" ? "#ef4444" : undefined }}>
                    Gasto
                  </button>
                </div>
              </div>
              <div>
                <label>Descripción *</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ej: Corte de cabello" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Monto (Bs) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" min={0} step={0.01} />
                </div>
                <div>
                  <label>Fecha</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Categoría</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Sin categoría</option>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {form.type === "income" && (
                  <div>
                    <label>Cliente (opcional)</label>
                    <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}>
                      <option value="">Sin cliente</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave} disabled={!form.description || !form.amount || saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
