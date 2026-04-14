"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full" style={{ background: "#d4a84320" }}>
              <Scissors size={32} color="#d4a843" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">SasBarbería</h1>
          <p style={{ color: "#666", marginTop: "0.3rem", fontSize: "0.9rem" }}>Accede a tu panel de control</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p style={{ color: "#f87171", fontSize: "0.85rem" }}>{error}</p>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: "#666" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/register" style={{ color: "#d4a843" }}>Registrarse</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
