import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DEMO_MODE } from "@/lib/demo";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    DEMO_MODE ? "http://localhost:54321" : process.env.NEXT_PUBLIC_SUPABASE_URL!,
    DEMO_MODE ? "demo-anon-key" : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
