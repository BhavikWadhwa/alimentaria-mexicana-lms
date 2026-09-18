/** Request-scoped cookie client. The service key is reserved for Auth admin and
 * private file transport; ordinary database reads and writes always use RLS. */
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function isPilotConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.APP_URL,
  );
}

export async function createPilotClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.APP_URL?.startsWith("https://") ?? false,
        path: "/",
      },
      cookies: {
        getAll: () => jar.getAll(),
        setAll(values) {
          // Server Components cannot mutate cookies. proxy.ts refreshes sessions;
          // route handlers can and must persist login/logout/recovery changes.
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Read-only rendering context. */
          }
        },
      },
    },
  );
}

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
