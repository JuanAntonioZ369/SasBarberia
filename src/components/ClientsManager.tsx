"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, isUpcomingBirthday } from "@/lib/utils";
import { Plus, Search, Gift, Pencil, Trash2, X } from "lucide-react";
import type { Client } from "@/lib/supabase/types";

interface Props {
  initialClients: Client[];
  barbershopId: string;
  demoMode?: boolean;
}

const emptyForm = { full_name: "", phone: "", age: "", birthday: "", notes: "" };

export default function ClientsManager({ initialClients, barbershopId, demoMode }: Props) {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm({
      full_name: client.full_name,
      phone: client.phone ?? "",
      age: client.age?.toString() ?? "",
      birthday: client.birthday ?? "",
      notes: client.notes ?? "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      full_name: form.full_name,
      phone: form.phone || null,
      age: form.age ? parseInt(form.age) : null,
      birthday: form.birthday || null,
      notes: form.notes || null,
      barbershop_id: barbershopId,
    };

    if (demoMode) {
      const fakeId = editing?.id ?? `c-${Date.now()}`;
      const record: Client = { id: fakeId, created_at: new Date().toISOString(), ...payload };
      if (editing) setClients(prev => prev.map(c => c.id === editing.id ? record : c));
      else setClients(prev => [...prev, record]);
    } else {
      const supabase = createClient();
      if (editing) {
        const { data } = await supabase.from("clients").update(payload).eq("id", editing.id).select().single();
        if (data) setClients(prev => prev.map(c => c.id === editing.id ? data as Client : c));
      } else {
        const { data } = await supabase.from("clients").insert(payload).select().single();
        if (data) setClients(prev => [...prev, data as Client]);
      }
    }
    setSaving(false);
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return;
    if (!demoMode) {
      const supabase = createClient();
      await supabase.from("clients").delete().eq("id", id);
    }
    setClients(prev => prev.filter(c => c.id !== id));
  }

  return (
    <>
      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#555" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o teléfono..." style={{ paddingLeft: "2.2rem" }} />
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={openNew}>
            <Plus size={16} /> Nuevo cliente
          </button>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Edad</th>
              <th>Cumpleaños</th>
              <th>Notas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#555", padding: "2rem" }}>
                {search ? "No se encontraron clientes" : "Aún no hay clientes. ¡Agrega el primero!"}
              </td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <span className="font-medium">{c.full_name}</span>
                  {c.birthday && isUpcomingBirthday(c.birthday) && (
                    <span className="ml-2"><Gift size={13} color="#d4a843" style={{ display: "inline" }} /></span>
                  )}
                </td>
                <td style={{ color: "#888" }}>{c.phone ?? "—"}</td>
                <td style={{ color: "#888" }}>{c.age ?? "—"}</td>
                <td style={{ color: "#888" }}>{c.birthday ? formatDate(c.birthday) : "—"}</td>
                <td style={{ color: "#888", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.notes ?? "—"}</td>
                <td>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(c)} style={{ color: "#555", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="card w-full max-w-md" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editing ? "Editar cliente" : "Nuevo cliente"}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "#555", background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label>Nombre completo *</label>
                <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Juan Pérez" />
              </div>
              <div>
                <label>Teléfono</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="77712345" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Edad</label>
                  <input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} placeholder="25" min={0} max={120} />
                </div>
                <div>
                  <label>Cumpleaños</label>
                  <input type="date" value={form.birthday} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} />
                </div>
              </div>
              <div>
                <label>Notas</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Preferencias, alergias, etc." rows={2} style={{ resize: "vertical" }} />
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave} disabled={!form.full_name || saving}>
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
