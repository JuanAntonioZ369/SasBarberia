import { FlaskConical } from "lucide-react";

export default function DemoBanner() {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-lg mb-5 text-sm font-medium"
      style={{ background: "#1a1400", border: "1px solid #3d2e00", color: "#fbbf24" }}
    >
      <FlaskConical size={15} />
      <span>
        <strong>Modo demo</strong> — los datos son de ejemplo y se guardan solo en memoria.
        Conecta Supabase en <code style={{ background: "#2a2000", padding: "1px 5px", borderRadius: 4 }}>.env.local</code> para activar la base de datos.
      </span>
    </div>
  );
}
