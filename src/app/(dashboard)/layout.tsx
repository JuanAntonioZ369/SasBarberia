export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DemoBanner from "@/components/DemoBanner";
import { DEMO_MODE, DEMO_USER } from "@/lib/demo";
import type { User } from "@supabase/supabase-js";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user: User;

  if (DEMO_MODE) {
    user = DEMO_USER as unknown as User;
  } else {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/login");
    user = data.user;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6">
        {DEMO_MODE && <DemoBanner />}
        {children}
      </main>
    </div>
  );
}
