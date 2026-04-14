"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import type { Product } from "@/lib/supabase/types";

interface Props { initialProducts: Product[]; barbershopId: string; demoMode?: boolean; }
const emptyForm = { name: "", category: "", purchase_price: "", sale_price: "", stock: "", min_stock: "3" };

export default function InventoryManager({ initialProducts, barbershopId, demoMode }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const margin = (p: Product) => p.sale_price > 0
    ? Math.round(((p.sale_price - p.purchase_price) / p.sale_price) * 100)
    : 0;

  function openNew() { setEditing(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name, category: p.category ?? "", purchase_price: String(p.purchase_price),
      sale_price: String(p.sale_price), stock: String(p.stock), min_stock: String(p.min_stock),
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      name: form.name, category: form.category || null,
      purchase_price: parseFloat(form.purchase_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      stock: parseInt(form.stock) || 0,
      min_stock: parseInt(form.min_stock) || 1,
      barbershop_id: barbershopId,
    };
    if (demoMode) {
      const fakeId = editing?.id ?? `p-${Date.now()}`;
      const record: Product = { id: fakeId, created_at: new Date().toISOString(), ...payload };
      if (editing) setProducts(prev => prev.map(p => p.id === editing.id ? record : p));
      else setProducts(prev => [...prev, record]);
    } else {
      const supabase = createClient();
      if (editing) {
        const { data } = await supabase.from("products").update(payload).eq("id", editing.id).select().single();
        if (data) setProducts(prev => prev.map(p => p.id === editing.id ? data as Product : p));
      } else {
        const { data } = await supabase.from("products").insert(payload).select().single();
        if (data) setProducts(prev => [...prev, data as Product]);
      }
    }
    setSaving(false); setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    if (!demoMode) {
      const supabase = createClient();
      await supabase.from("products").delete().eq("id", id);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  return (
    <>
      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#555" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto o categoría..." style={{ paddingLeft: "2.2rem" }} />
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={openNew}>
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>P. Compra</th>
              <th>P. Venta</th>
              <th>Margen</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#555", padding: "2rem" }}>
                {search ? "Sin resultados" : "No hay productos. ¡Agrega el primero!"}
              </td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <span className="font-medium">{p.name}</span>
                  {p.stock <= p.min_stock && (
                    <span className="ml-2"><AlertTriangle size={13} color="#fbbf24" style={{ display: "inline" }} /></span>
                  )}
                </td>
                <td style={{ color: "#888" }}>{p.category ?? "—"}</td>
                <td style={{ color: "#888" }}>{formatCurrency(p.purchase_price)}</td>
                <td>{formatCurrency(p.sale_price)}</td>
                <td><span className={`badge ${margin(p) >= 30 ? "badge-green" : margin(p) >= 10 ? "badge-yellow" : "badge-red"}`}>{margin(p)}%</span></td>
                <td>
                  <span className={`badge ${p.stock <= p.min_stock ? "badge-red" : "badge-green"}`}>{p.stock}</span>
                </td>
                <td>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(p)} style={{ color: "#555", background: "none", border: "none", cursor: "pointer", padding: 4 }}><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(p.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={15} /></button>
                  </div>
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
              <h2 className="text-lg font-bold">{editing ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "#555", background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label>Nombre *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Pomada para cabello" />
              </div>
              <div>
                <label>Categoría</label>
                <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Ceras, Shampoos, Navajas..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Precio compra (Bs)</label>
                  <input type="number" value={form.purchase_price} onChange={e => setForm(p => ({ ...p, purchase_price: e.target.value }))} placeholder="0.00" min={0} step={0.01} />
                </div>
                <div>
                  <label>Precio venta (Bs)</label>
                  <input type="number" value={form.sale_price} onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))} placeholder="0.00" min={0} step={0.01} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Stock actual</label>
                  <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} placeholder="0" min={0} />
                </div>
                <div>
                  <label>Stock mínimo</label>
                  <input type="number" value={form.min_stock} onChange={e => setForm(p => ({ ...p, min_stock: e.target.value }))} placeholder="3" min={0} />
                </div>
              </div>
              {form.purchase_price && form.sale_price && (
                <div className="p-3 rounded-lg" style={{ background: "#1e1e1e" }}>
                  <p style={{ fontSize: "0.8rem", color: "#888" }}>Margen estimado:</p>
                  <p className="font-bold" style={{ color: "#22c55e" }}>
                    {Math.round(((parseFloat(form.sale_price) - parseFloat(form.purchase_price)) / parseFloat(form.sale_price || "1")) * 100)}%
                    {" "}(Bs {(parseFloat(form.sale_price) - parseFloat(form.purchase_price)).toFixed(2)})
                  </p>
                </div>
              )}
              <div className="flex gap-2 justify-end mt-2">
                <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave} disabled={!form.name || saving}>
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
