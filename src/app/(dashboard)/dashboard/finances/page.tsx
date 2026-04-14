import { createClient } from "@/lib/supabase/server";
import FinancesManager from "@/components/FinancesManager";
import { TrendingUp } from "lucide-react";
import { DEMO_MODE, DEMO_TRANSACTIONS, DEMO_CLIENTS, DEMO_USER } from "@/lib/demo";
import type { Transaction } from "@/lib/supabase/types";

export default async function FinancesPage() {
  let transactions: Transaction[];
  let clients: { id: string; full_name: string }[];
  let barbershopId: string;
  let userId: string;

  if (DEMO_MODE) {
    transactions = [...DEMO_TRANSACTIONS].sort((a, b) => b.date.localeCompare(a.date));
    clients = DEMO_CLIENTS.map(c => ({ id: c.id, full_name: c.full_name }));
    barbershopId = DEMO_USER.id;
    userId = DEMO_USER.id;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    barbershopId = user?.user_metadata?.barbershop_id || user?.id;
    userId = user!.id;
    const [txRes, clRes] = await Promise.all([
      supabase.from("transactions").select("*").eq("barbershop_id", barbershopId).order("date", { ascending: false }).limit(200),
      supabase.from("clients").select("id,full_name").eq("barbershop_id", barbershopId).order("full_name"),
    ]);
    transactions = (txRes.data ?? []) as Transaction[];
    clients = (clRes.data ?? []) as { id: string; full_name: string }[];
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp size={24} />
          Finanzas
        </h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>Registro de ingresos y gastos</p>
      </div>
      <FinancesManager
        initialTransactions={transactions}
        clients={clients}
        barbershopId={barbershopId}
        userId={userId}
        demoMode={DEMO_MODE}
      />
    </div>
  );
}
