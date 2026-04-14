import { createClient } from "@/lib/supabase/server";
import { formatCurrency, getCurrentWeekRange, getCurrentMonthRange, today, isUpcomingBirthday } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, Package, CreditCard, Gift } from "lucide-react";
import RevenueChart from "@/components/charts/RevenueChart";
import { DEMO_MODE, DEMO_CLIENTS, DEMO_PRODUCTS, DEMO_TRANSACTIONS, DEMO_MEMBERSHIPS } from "@/lib/demo";

export default async function DashboardPage() {
  const week = getCurrentWeekRange();
  const month = getCurrentMonthRange();
  const todayStr = today();

  type TxRow = { type: string; amount: number; date?: string; description?: string };
  type ClientRow = { id: string; full_name: string; birthday: string | null };
  type ProductRow = { id: string; name: string; stock: number; min_stock: number };

  let weekTx: TxRow[] | null;
  let monthTx: TxRow[] | null;
  let todayTx: TxRow[] | null;
  let clients: ClientRow[] | null;
  let products: ProductRow[] | null;
  let memberships: { id: string; status: string }[] | null;

  if (DEMO_MODE) {
    weekTx = DEMO_TRANSACTIONS.filter(t => t.date >= week.start && t.date <= week.end);
    monthTx = DEMO_TRANSACTIONS.filter(t => t.date >= month.start && t.date <= month.end);
    todayTx = DEMO_TRANSACTIONS.filter(t => t.date === todayStr);
    clients = DEMO_CLIENTS;
    products = DEMO_PRODUCTS;
    memberships = DEMO_MEMBERSHIPS.filter(m => m.status === "active");
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const barbershopId = user?.user_metadata?.barbershop_id || user?.id;

    const [r1, r2, r3, r4, r5, r6] = await Promise.all([
      supabase.from("transactions").select("type,amount").eq("barbershop_id", barbershopId).gte("date", week.start).lte("date", week.end),
      supabase.from("transactions").select("type,amount,date,description").eq("barbershop_id", barbershopId).gte("date", month.start).lte("date", month.end).order("date"),
      supabase.from("transactions").select("type,amount,description").eq("barbershop_id", barbershopId).eq("date", todayStr),
      supabase.from("clients").select("id,full_name,birthday").eq("barbershop_id", barbershopId),
      supabase.from("products").select("id,name,stock,min_stock").eq("barbershop_id", barbershopId),
      supabase.from("memberships").select("id,status").eq("barbershop_id", barbershopId).eq("status", "active"),
    ]);

    weekTx = r1.data as TxRow[] | null;
    monthTx = r2.data as TxRow[] | null;
    todayTx = r3.data as TxRow[] | null;
    clients = r4.data as ClientRow[] | null;
    products = r5.data as ProductRow[] | null;
    memberships = r6.data;
  }

  const calcTotals = (tx: TxRow[] | null) => ({
    income: tx?.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0) ?? 0,
    expenses: tx?.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) ?? 0,
  });

  const weekStats = calcTotals(weekTx);
  const monthStats = calcTotals(monthTx);
  const todayStats = calcTotals(todayTx);

  const lowStock = products?.filter(p => p.stock <= p.min_stock) ?? [];
  const upcomingBirthdays = clients?.filter(c => c.birthday && isUpcomingBirthday(c.birthday)) ?? [];

  // Build chart data from monthly transactions
  const chartData: Record<string, { income: number; expenses: number }> = {};
  monthTx?.forEach(tx => {
    const day = (tx.date ?? "").slice(8, 10);
    if (!chartData[day]) chartData[day] = { income: 0, expenses: 0 };
    if (tx.type === "income") chartData[day].income += tx.amount;
    else chartData[day].expenses += tx.amount;
  });
  const chartArray = Object.entries(chartData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, vals]) => ({ day, ...vals }));

  const StatCard = ({ label, value, sub, icon: Icon, color }: {
    label: string; value: string; sub?: string;
    icon: React.ElementType; color: string;
  }) => (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <p style={{ color: "#666", fontSize: "0.8rem", marginBottom: "0.4rem" }}>{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p style={{ color: "#555", fontSize: "0.8rem", marginTop: "0.3rem" }}>{sub}</p>}
        </div>
        <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          {new Date().toLocaleDateString("es-BO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Today stats */}
      <div className="mb-3">
        <p style={{ color: "#666", fontSize: "0.8rem", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hoy</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Ingresos hoy" value={formatCurrency(todayStats.income)} icon={TrendingUp} color="#22c55e" />
          <StatCard label="Gastos hoy" value={formatCurrency(todayStats.expenses)} icon={TrendingDown} color="#ef4444" />
          <StatCard label="Clientes activos" value={String(clients?.length ?? 0)} icon={Users} color="#d4a843" />
          <StatCard label="Membresías" value={String(memberships?.length ?? 0)} sub="activas" icon={CreditCard} color="#60a5fa" />
        </div>
      </div>

      {/* Week + Month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="card">
          <p style={{ color: "#666", fontSize: "0.8rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Esta semana</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p style={{ color: "#22c55e", fontSize: "1.4rem", fontWeight: 700 }}>{formatCurrency(weekStats.income)}</p>
              <p style={{ color: "#555", fontSize: "0.8rem" }}>Ingresos</p>
            </div>
            <div>
              <p style={{ color: "#ef4444", fontSize: "1.4rem", fontWeight: 700 }}>{formatCurrency(weekStats.expenses)}</p>
              <p style={{ color: "#555", fontSize: "0.8rem" }}>Gastos</p>
            </div>
            <div className="col-span-2 pt-2 border-t" style={{ borderColor: "#1e1e1e" }}>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", color: weekStats.income - weekStats.expenses >= 0 ? "#22c55e" : "#ef4444" }}>
                {formatCurrency(weekStats.income - weekStats.expenses)}
              </p>
              <p style={{ color: "#555", fontSize: "0.8rem" }}>Ganancia neta</p>
            </div>
          </div>
        </div>

        <div className="card">
          <p style={{ color: "#666", fontSize: "0.8rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Este mes</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p style={{ color: "#22c55e", fontSize: "1.4rem", fontWeight: 700 }}>{formatCurrency(monthStats.income)}</p>
              <p style={{ color: "#555", fontSize: "0.8rem" }}>Ingresos</p>
            </div>
            <div>
              <p style={{ color: "#ef4444", fontSize: "1.4rem", fontWeight: 700 }}>{formatCurrency(monthStats.expenses)}</p>
              <p style={{ color: "#555", fontSize: "0.8rem" }}>Gastos</p>
            </div>
            <div className="col-span-2 pt-2 border-t" style={{ borderColor: "#1e1e1e" }}>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", color: monthStats.income - monthStats.expenses >= 0 ? "#22c55e" : "#ef4444" }}>
                {formatCurrency(monthStats.income - monthStats.expenses)}
              </p>
              <p style={{ color: "#555", fontSize: "0.8rem" }}>Ganancia neta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartArray.length > 0 && (
        <div className="card mb-6">
          <p style={{ color: "#999", fontSize: "0.8rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ingresos vs Gastos — Este mes</p>
          <RevenueChart data={chartArray} />
        </div>
      )}

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {lowStock.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} color="#fbbf24" />
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fbbf24" }}>Stock bajo ({lowStock.length})</p>
            </div>
            <div className="flex flex-col gap-2">
              {lowStock.slice(0, 5).map(p => (
                <div key={p.id} className="flex justify-between items-center">
                  <span style={{ fontSize: "0.85rem" }}>{p.name}</span>
                  <span className="badge badge-yellow">{p.stock} unid.</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingBirthdays.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Gift size={16} color="#d4a843" />
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#d4a843" }}>Cumpleaños próximos</p>
            </div>
            <div className="flex flex-col gap-2">
              {upcomingBirthdays.map(c => (
                <div key={c.id} className="flex justify-between items-center">
                  <span style={{ fontSize: "0.85rem" }}>{c.full_name}</span>
                  <span className="badge badge-yellow">
                    {new Date(c.birthday!).toLocaleDateString("es-BO", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
