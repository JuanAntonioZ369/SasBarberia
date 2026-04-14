"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, today } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import type { Membership, MembershipPlan, MembershipStatus } from "@/lib/supabase/types";
import { addMonths, addYears, format } from "date-fns";

interface Client { id: string; full_name: string; }
interface Props { initialMemberships: Membership[]; clients: Client[]; barbershopId: string; demoMode?: boolean; }

const PLANS: { value: MembershipPlan; label: string; months: number }[] = [
  { value: "monthly", label: "Mensual", months: 1 },
  { value: "quarterly", label: "Trimestral", months: 3 },
  { value: "annual", label: "Anual", months: 12 },
];

const STATUS_LABELS: Record<MembershipStatus, string> = {
  active: "Activa", expired: "Vencida", cancelled: "Cancelada"
};
const STATUS_BADGE: Record<MembershipStatus, string> = {
  active: "badge-green", expired: "badge-red", cancelled: "badge-yellow"
};

const emptyForm = { client_id: "", plan: "monthly" as MembershipPlan, price: "", start_date: today() };

export default function MembershipsManager({ initialMemberships, clients, barbershopId, demoMode }: Props) {
  const [memberships, setMemberships] = useState(initialMemberships);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function getEndDate(startDate: string, plan: MembershipPlan) {
    const start = new Date(startDate);
    const end = plan === "annual" ? addYears(start, 1) : addMonths(start, PLANS.find(p => p.value === plan)!.months);
    return format(end, "yyyy-MM-dd");
  }

  async function handleSave() {
    setSaving(true);
    const endDate = getEndDate(form.start_date, form.plan);
    const payload = {
      barbershop_id: barbershopId,
      client_id: form.client_id,
      plan: form.plan,
      price: parseFloat(form.price) || 0,
      start_date: form.start_date,
      end_date: endDate,
      status: "active" as MembershipStatus,
    };
    if (demoMode) {
      const record: Membership = { id: `m-${Date.now()}`, created_at: new Date().toISOString(), ...payload };
      setMemberships(prev => [record, ...prev]);
    } else {
      const supabase = createClient();
      const { data } = await supabase.from("memberships").insert(payload).select().single();
      if (data) setMemberships(prev => [data as Membership, ...prev]);
    }
    setSaving(false);
    setShowModal(false);
    setForm(emptyForm);
  }

  async function updateStatus(id: string, status: MembershipStatus) {
    if (!demoMode) {
      const supabase = createClient();
      await supabase.from("memberships").update({ status }).eq("id", id);
    }
    setMemberships(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  }

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.full_name]));

  const activeCount = memberships.filter(m => m.status === "active").length;
  const activeRevenue = memberships
    .filter(m => m.status === "active")
    .reduce((s, m) => s + m.price, 0);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="card text-center">
          <p className="text-2xl font-bold">{activeCount}</p>
          <p style={{ color: "#555", fontSize: "0.8rem" }}>Membresías activas</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>{formatCurrency(activeRevenue)}</p>
          <p style={{ color: "#555", fontSize: "0.8rem" }}>Ingresos por membresías</p>
        </div>
        <div className="card text-center col-span-2 md:col-span-1">
          <p className="text-2xl font-bold">{memberships.filter(m => m.status === "expired").length}</p>
          <p style={{ color: "#555", fontSize: "0.8rem" }}>Vencidas</p>
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nueva membresía
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Plan</th>
              <th>Precio</th>
              <th>Inicio</th>
              <th>Vence</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {memberships.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#555", padding: "2rem" }}>No hay membresías aún</td></tr>
            )}
            {memberships.map(m => (
              <tr key={m.id}>
                <td className="font-medium">{clientMap[m.client_id] ?? "Cliente eliminado"}</td>
                <td style={{ color: "#888" }}>{PLANS.find(p => p.value === m.plan)?.label}</td>
                <td>{formatCurrency(m.price)}</td>
                <td style={{ color: "#888" }}>{formatDate(m.start_date)}</td>
                <td style={{ color: "#888" }}>{formatDate(m.end_date)}</td>
                <td><span className={`badge ${STATUS_BADGE[m.status]}`}>{STATUS_LABELS[m.status]}</span></td>
                <td>
                  {m.status === "active" && (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => updateStatus(m.id, "expired")}
                        style={{ fontSize: "0.75rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
                        Vencer
                      </button>
                      <button onClick={() => updateStatus(m.id, "cancelled")}
                        style={{ fontSize: "0.75rem", color: "#666", background: "none", border: "none", cursor: "pointer" }}>
                        Cancelar
                      </button>
                    </div>
                  )}
                  {m.status !== "active" && (
                    <button onClick={() => updateStatus(m.id, "active")}
                      style={{ fontSize: "0.75rem", color: "#22c55e", background: "none", border: "none", cursor: "pointer" }}>
                      Reactivar
                    </button>
                  )}
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
              <h2 className="text-lg font-bold">Nueva membresía</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "#555", background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label>Cliente *</label>
                <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}>
                  <option value="">Seleccionar cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label>Plan</label>
                <div className="flex gap-2">
                  {PLANS.map(p => (
                    <button key={p.value}
                      onClick={() => setForm(f => ({ ...f, plan: p.value }))}
                      className={form.plan === p.value ? "btn-primary" : "btn-ghost"}
                      style={{ flex: 1, fontSize: "0.85rem" }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Precio (Bs) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" min={0} step={0.01} />
                </div>
                <div>
                  <label>Fecha inicio</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                </div>
              </div>
              {form.start_date && (
                <div className="p-3 rounded-lg" style={{ background: "#1e1e1e" }}>
                  <p style={{ fontSize: "0.8rem", color: "#888" }}>Vence el:</p>
                  <p className="font-bold" style={{ color: "#d4a843" }}>{formatDate(getEndDate(form.start_date, form.plan))}</p>
                </div>
              )}
              <div className="flex gap-2 justify-end mt-2">
                <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave} disabled={!form.client_id || !form.price || saving}>
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
