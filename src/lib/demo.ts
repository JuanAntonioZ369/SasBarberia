import type { Client, Product, Transaction, Membership } from "./supabase/types";

export const DEMO_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http");

export const DEMO_USER = {
  id: "demo-barbershop-id",
  email: "demo@barberia.com",
  user_metadata: {
    full_name: "Demo Admin",
    barbershop_name: "Barbería El Rey",
    barbershop_id: "demo-barbershop-id",
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00Z",
};

const DEMO_ID = "demo-barbershop-id";

export const DEMO_CLIENTS: Client[] = [
  { id: "c1", barbershop_id: DEMO_ID, full_name: "Carlos Mamani", phone: "77712345", age: 28, birthday: "1996-04-18", notes: "Prefiere corte clásico", created_at: "2024-01-10T00:00:00Z" },
  { id: "c2", barbershop_id: DEMO_ID, full_name: "Luis Quispe", phone: "70098765", age: 35, birthday: "1989-06-22", notes: null, created_at: "2024-01-12T00:00:00Z" },
  { id: "c3", barbershop_id: DEMO_ID, full_name: "Diego Flores", phone: "69954321", age: 22, birthday: "2002-04-20", notes: "Barba completa siempre", created_at: "2024-01-15T00:00:00Z" },
  { id: "c4", barbershop_id: DEMO_ID, full_name: "Marco Torrez", phone: null, age: 42, birthday: "1982-12-05", notes: null, created_at: "2024-01-20T00:00:00Z" },
  { id: "c5", barbershop_id: DEMO_ID, full_name: "Andrés Rojas", phone: "76543210", age: 19, birthday: "2005-08-14", notes: "Fade bajo", created_at: "2024-02-01T00:00:00Z" },
];

export const DEMO_PRODUCTS: Product[] = [
  { id: "p1", barbershop_id: DEMO_ID, name: "Pomada Matte", category: "Ceras", purchase_price: 35, sale_price: 60, stock: 12, min_stock: 3, created_at: "2024-01-01T00:00:00Z" },
  { id: "p2", barbershop_id: DEMO_ID, name: "Shampoo Anticaspa", category: "Shampoos", purchase_price: 18, sale_price: 35, stock: 2, min_stock: 5, created_at: "2024-01-01T00:00:00Z" },
  { id: "p3", barbershop_id: DEMO_ID, name: "Navaja Gillette Pro", category: "Navajas", purchase_price: 8, sale_price: 15, stock: 24, min_stock: 10, created_at: "2024-01-01T00:00:00Z" },
  { id: "p4", barbershop_id: DEMO_ID, name: "Aceite de Barba", category: "Tratamientos", purchase_price: 40, sale_price: 75, stock: 1, min_stock: 3, created_at: "2024-01-01T00:00:00Z" },
  { id: "p5", barbershop_id: DEMO_ID, name: "Talco de Barbería", category: "Accesorios", purchase_price: 12, sale_price: 25, stock: 8, min_stock: 5, created_at: "2024-01-01T00:00:00Z" },
];

const today = new Date();
const m = today.getMonth() + 1;
const y = today.getFullYear();
const pad = (n: number) => String(n).padStart(2, "0");
const d = (day: number) => `${y}-${pad(m)}-${pad(day)}`;

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "t1", barbershop_id: DEMO_ID, type: "income", amount: 50, description: "Corte de cabello", category: "Corte", client_id: "c1", date: d(2), created_by: DEMO_ID, created_at: d(2) + "T10:00:00Z" },
  { id: "t2", barbershop_id: DEMO_ID, type: "income", amount: 80, description: "Corte + Barba", category: "Barba", client_id: "c2", date: d(2), created_by: DEMO_ID, created_at: d(2) + "T11:00:00Z" },
  { id: "t3", barbershop_id: DEMO_ID, type: "expense", amount: 120, description: "Compra de insumos", category: "Insumos", client_id: null, date: d(3), created_by: DEMO_ID, created_at: d(3) + "T09:00:00Z" },
  { id: "t4", barbershop_id: DEMO_ID, type: "income", amount: 50, description: "Corte de cabello", category: "Corte", client_id: "c3", date: d(5), created_by: DEMO_ID, created_at: d(5) + "T14:00:00Z" },
  { id: "t5", barbershop_id: DEMO_ID, type: "income", amount: 200, description: "Membresía mensual", category: "Membresía", client_id: "c4", date: d(6), created_by: DEMO_ID, created_at: d(6) + "T10:00:00Z" },
  { id: "t6", barbershop_id: DEMO_ID, type: "expense", amount: 500, description: "Alquiler local", category: "Alquiler", client_id: null, date: d(1), created_by: DEMO_ID, created_at: d(1) + "T08:00:00Z" },
  { id: "t7", barbershop_id: DEMO_ID, type: "income", amount: 60, description: "Tinte", category: "Tinte", client_id: "c5", date: d(8), created_by: DEMO_ID, created_at: d(8) + "T15:00:00Z" },
  { id: "t8", barbershop_id: DEMO_ID, type: "income", amount: 50, description: "Corte de cabello", category: "Corte", client_id: "c1", date: d(10), created_by: DEMO_ID, created_at: d(10) + "T10:00:00Z" },
  { id: "t9", barbershop_id: DEMO_ID, type: "expense", amount: 200, description: "Salario ayudante", category: "Salario", client_id: null, date: d(10), created_by: DEMO_ID, created_at: d(10) + "T18:00:00Z" },
  { id: "t10", barbershop_id: DEMO_ID, type: "income", amount: 80, description: "Corte + Barba", category: "Barba", client_id: "c2", date: d(12), created_by: DEMO_ID, created_at: d(12) + "T11:00:00Z" },
];

export const DEMO_MEMBERSHIPS: Membership[] = [
  { id: "m1", barbershop_id: DEMO_ID, client_id: "c1", plan: "monthly", price: 200, start_date: `${y}-${pad(m)}-01`, end_date: `${y}-${pad(m === 12 ? 1 : m + 1)}-01`, status: "active", created_at: `${y}-${pad(m)}-01T00:00:00Z` },
  { id: "m2", barbershop_id: DEMO_ID, client_id: "c4", plan: "quarterly", price: 500, start_date: `${y}-${pad(m)}-06`, end_date: `${y}-${pad(Math.min(m + 3, 12))}-06`, status: "active", created_at: `${y}-${pad(m)}-06T00:00:00Z` },
  { id: "m3", barbershop_id: DEMO_ID, client_id: "c2", plan: "monthly", price: 200, start_date: `${y}-${pad(m > 1 ? m - 1 : 12)}-01`, end_date: `${y}-${pad(m)}-01`, status: "expired", created_at: `${y}-${pad(m > 1 ? m - 1 : 12)}-01T00:00:00Z` },
];
