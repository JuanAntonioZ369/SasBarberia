"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, Package, TrendingUp, CreditCard,
  LogOut, Scissors, Menu, X
} from "lucide-react";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/clients", icon: Users, label: "Clientes" },
  { href: "/dashboard/inventory", icon: Package, label: "Inventario" },
  { href: "/dashboard/finances", icon: TrendingUp, label: "Finanzas" },
  { href: "/dashboard/memberships", icon: CreditCard, label: "Membresías" },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    try { await supabase.auth.signOut(); } catch {}
    router.push("/login");
    router.refresh();
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
  const barbershop = user.user_metadata?.barbershop_name || "Mi Barbería";

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: "#111", borderRight: "1px solid #1e1e1e" }}>
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: "#1e1e1e" }}>
        <div className="flex items-center gap-2 mb-1">
          <Scissors size={20} color="#d4a843" />
          <span className="font-bold text-sm" style={{ color: "#d4a843" }}>{barbershop}</span>
        </div>
        <p className="text-xs" style={{ color: "#555" }}>{name}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? "#d4a84315" : "transparent",
                color: active ? "#d4a843" : "#888",
                borderLeft: active ? "2px solid #d4a843" : "2px solid transparent",
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: "#1e1e1e" }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors"
          style={{ color: "#666" }}
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "#111", borderBottom: "1px solid #1e1e1e" }}>
        <div className="flex items-center gap-2">
          <Scissors size={18} color="#d4a843" />
          <span className="font-bold text-sm" style={{ color: "#d4a843" }}>{barbershop}</span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ color: "#888" }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-64">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile spacer */}
      <div className="md:hidden h-14" />
    </>
  );
}
