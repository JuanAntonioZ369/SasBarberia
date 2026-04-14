import { createClient } from "@/lib/supabase/server";
import MembershipsManager from "@/components/MembershipsManager";
import { CreditCard } from "lucide-react";
import type { Membership } from "@/lib/supabase/types";
import { DEMO_MODE, DEMO_MEMBERSHIPS, DEMO_CLIENTS, DEMO_USER } from "@/lib/demo";

export default async function MembershipsPage() {
  let memberships: Membership[];
  let clients: { id: string; full_name: string }[];
  let barbershopId: string;

  if (DEMO_MODE) {
    memberships = DEMO_MEMBERSHIPS;
    clients = DEMO_CLIENTS.map(c => ({ id: c.id, full_name: c.full_name }));
    barbershopId = DEMO_USER.id;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    barbershopId = user?.user_metadata?.barbershop_id || user?.id;
    const [mRes, cRes] = await Promise.all([
      supabase.from("memberships").select("*").eq("barbershop_id", barbershopId).order("created_at", { ascending: false }),
      supabase.from("clients").select("id,full_name").eq("barbershop_id", barbershopId).order("full_name"),
    ]);
    memberships = (mRes.data ?? []) as Membership[];
    clients = (cRes.data ?? []) as { id: string; full_name: string }[];
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard size={24} />
          Membresías
        </h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          {memberships.filter(m => m.status === "active").length} membresías activas
        </p>
      </div>
      <MembershipsManager
        initialMemberships={memberships}
        clients={clients}
        barbershopId={barbershopId}
        demoMode={DEMO_MODE}
      />
    </div>
  );
}
