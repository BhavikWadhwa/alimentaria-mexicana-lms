import { NextResponse } from "next/server";
import { createPilotClient, isPilotConfigured } from "@/app/lib/pilot/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = process.env.APP_URL ?? url.origin;
  if (isPilotConfigured()) {
    const client = await createPilotClient();
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");
    // token_hash recovery links also work on a different device from the request.
    if (tokenHash && (type === "recovery" || type === "invite")) {
      const { error } = await client.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      if (!error)
        return NextResponse.redirect(new URL("/pilot/password", base));
    } else if (code) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(new URL("/pilot/password", base));
    }
  }
  return NextResponse.redirect(new URL("/pilot/login?expired=1", base));
}
