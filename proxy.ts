import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refresh cookies before rendering. RLS and route checks remain the boundary. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookieOptions: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.APP_URL?.startsWith("https://") ?? false,
          path: "/",
        },
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(values) {
            values.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            values.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );
    await client.auth.getUser();
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}
export const config = { matcher: ["/pilot/:path*", "/api/pilot/:path*"] };
