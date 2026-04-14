import { createBrowserClient } from "@supabase/ssr";
import { DEMO_MODE } from "@/lib/demo";

export function createClient() {
  if (DEMO_MODE) {
    return createBrowserClient("http://localhost:54321", "demo-anon-key");
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
