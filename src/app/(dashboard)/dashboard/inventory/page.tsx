import { createClient } from "@/lib/supabase/server";
import InventoryManager from "@/components/InventoryManager";
import { Package } from "lucide-react";
import { DEMO_MODE, DEMO_PRODUCTS, DEMO_USER } from "@/lib/demo";
import type { Product } from "@/lib/supabase/types";

export default async function InventoryPage() {
  let products: Product[];
  let barbershopId: string;

  if (DEMO_MODE) {
    products = DEMO_PRODUCTS;
    barbershopId = DEMO_USER.id;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    barbershopId = user?.user_metadata?.barbershop_id || user?.id;
    const { data } = await supabase.from("products").select("*").eq("barbershop_id", barbershopId).order("name");
    products = (data ?? []) as Product[];
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package size={24} />
          Inventario
        </h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>{products.length} productos registrados</p>
      </div>
      <InventoryManager initialProducts={products} barbershopId={barbershopId} demoMode={DEMO_MODE} />
    </div>
  );
}
