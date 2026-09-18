/** One-time bootstrap against the configured project. Secrets come from env. */
import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PILOT_ADMIN_EMAIL",
];
for (const key of required)
  if (!process.env[key]) throw new Error(`Missing ${key}`);
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const existing = await client
  .from("employees")
  .select("id, first_name, last_name")
  .eq("email", process.env.PILOT_ADMIN_EMAIL.trim().toLowerCase())
  .maybeSingle();
if (existing.error)
  throw new Error("Apply the database migration before bootstrapping.");
let id = existing.data?.id;
if (!id) {
  if (
    !process.env.PILOT_ADMIN_PASSWORD ||
    process.env.PILOT_ADMIN_PASSWORD.length < 12
  )
    throw new Error(
      "Create the identity in Supabase first, or set PILOT_ADMIN_PASSWORD to at least 12 characters.",
    );
  const result = await client.auth.admin.createUser({
    email: process.env.PILOT_ADMIN_EMAIL.trim().toLowerCase(),
    password: process.env.PILOT_ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (result.error || !result.data.user)
    throw new Error("Unable to create the initial administrator identity.");
  id = result.data.user.id;
}
const result = await client
  .from("employees")
  .update({
    first_name:
      process.env.PILOT_ADMIN_FIRST_NAME ??
      existing.data?.first_name ??
      "Pilot",
    last_name:
      process.env.PILOT_ADMIN_LAST_NAME ?? existing.data?.last_name ?? "Admin",
    app_role: "ADMIN",
    active: true,
  })
  .eq("id", id);
if (result.error)
  throw new Error("Unable to activate the initial administrator.");
console.log(
  "Initial administrator is active. Remove bootstrap password variables from your environment.",
);
