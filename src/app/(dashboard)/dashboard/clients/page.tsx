import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import ClientsManager from "@/components/ClientsManager";
import { DEMO_MODE, DEMO_CLIENTS, DEMO_USER } from "@/lib/demo";
import type { Client } from "@/lib/supabase/types";

export default async function ClientsPage() {
  let clients: Client[];
  let barbershopId: string;

  if (DEMO_MODE) {
    clients = DEMO_CLIENTS;
    barbershopId = DEMO_USER.id;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    barbershopId = user?.user_metadata?.barbershop_id || user?.id;
    const { data } = await supabase.from("clients").select("*").eq("barbershop_id", barbershopId).order("full_name");
    clients = (data ?? []) as Client[];
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users size={24} />
            Clientes
          </h1>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>{clients.length} clientes registrados</p>
        </div>
      </div>
      <ClientsManager initialClients={clients} barbershopId={barbershopId} demoMode={DEMO_MODE} />
    </div>
  );
}
