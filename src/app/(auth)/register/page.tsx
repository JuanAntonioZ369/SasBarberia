"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", barbershopName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          barbershop_name: form.barbershopName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
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
          <h1 className="text-2xl font-bold">Crear cuenta</h1>
          <p style={{ color: "#666", marginTop: "0.3rem", fontSize: "0.9rem" }}>Registra tu barbería</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label>Nombre completo</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Juan Pérez" required />
            </div>
            <div>
              <label>Nombre de la barbería</label>
              <input name="barbershopName" value={form.barbershopName} onChange={handleChange} placeholder="Barbería El Rey" required />
            </div>
            <div>
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" required />
            </div>
            <div>
              <label>Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" required minLength={6} />
            </div>
            {error && <p style={{ color: "#f87171", fontSize: "0.85rem" }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: "#666" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: "#d4a843" }}>Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
