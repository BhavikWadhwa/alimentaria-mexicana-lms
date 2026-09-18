import { test, expect } from "@playwright/test";

test("pilot login is readable and does not offer demo access", async ({
  page,
}) => {
  await page.goto("/pilot/login");
  await expect(
    page.getByRole("heading", { name: "Team training" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Prototype view controls")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await expect(
    page.getByRole("heading", { name: "Reset password" }),
  ).toBeVisible();
});
test("unauthenticated direct employee and management routes redirect", async ({
  page,
}) => {
  for (const path of [
    "/pilot/training",
    "/pilot/admin",
    "/pilot/admin/employees",
    "/pilot/admin/content/20000000-0000-4000-8000-000000000001",
    "/pilot/items/20000000-0000-4000-8000-000000000001",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/pilot\/login$/);
  }
});
test("mutations reject cross-origin requests and private files are inaccessible", async ({
  request,
  baseURL,
}) => {
  const action = await request.post("/api/pilot/actions", {
    data: { action: "item-create", kind: "SOP", title: "Denied" },
    headers: { Origin: "https://untrusted.example" },
  });
  expect(action.status()).toBe(403);
  const file = await request.get(
    "/api/pilot/files?path=20000000-0000-4000-8000-000000000001/40000000-0000-4000-8000-000000000001",
  );
  expect(file.status()).toBe(401);
  const own = await request.post("/api/pilot/actions", {
    data: { action: "item-create", kind: "SOP", title: "Denied" },
    headers: { Origin: baseURL! },
  });
  expect([401, 403]).toContain(own.status());
});
