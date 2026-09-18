/** Opt-in live tests. Point only at a dedicated test project: fixtures are retained
 * inactive to exercise the same history-retention rules as normal operations. */
import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const enabled = process.env.PILOT_LIVE_TESTS === "1";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function login(page: Page, email: string, password: string) {
  await page.goto("/pilot/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

test("live admin → employee → quiz → history, restricted denial and deactivation", async ({
  page,
  browser,
  baseURL,
}) => {
  test.skip(
    !enabled,
    "Requires an explicitly configured dedicated Supabase test project",
  );
  test.setTimeout(180000);
  expect(url).toBeTruthy();
  expect(key).toBeTruthy();
  expect(serviceKey).toBeTruthy();
  const service = createClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = crypto.randomUUID().slice(0, 8);
  const password = `Pilot-${crypto.randomUUID()}!`;
  const adminEmail = `pilot-admin-${suffix}@example.test`;
  const employeeEmail = `pilot-employee-${suffix}@example.test`;
  const outsiderEmail = `pilot-outsider-${suffix}@example.test`;
  const fixtureIds: string[] = [];
  const itemIds: string[] = [];
  const roleResult = await service.from("job_roles").select("id,name");
  expect(roleResult.error).toBeNull();
  const prepRole = roleResult.data!.find(
    (role) => role.name === "Prep Cook",
  )!.id;
  const lineRole = roleResult.data!.find(
    (role) => role.name === "Line Cook",
  )!.id;
  const { viewport, isMobile, hasTouch } = test.info().project.use;
  const employeeContext = await browser.newContext({
    viewport,
    isMobile,
    hasTouch,
  });
  const employeePage = await employeeContext.newPage();
  const outsiderContext = await browser.newContext({
    viewport,
    isMobile,
    hasTouch,
  });
  const outsiderPage = await outsiderContext.newPage();
  try {
    for (const [email, appRole, jobRole] of [
      [adminEmail, "ADMIN", prepRole],
      [outsiderEmail, "EMPLOYEE", lineRole],
    ]) {
      const result = await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      expect(result.error).toBeNull();
      fixtureIds.push(result.data.user!.id);
      const profile = await service
        .from("employees")
        .update({
          active: true,
          first_name: "Pilot",
          last_name: suffix,
          app_role: appRole,
          job_role_id: jobRole,
        })
        .eq("id", result.data.user!.id);
      expect(profile.error).toBeNull();
    }
    await login(page, adminEmail, "wrong-password");
    await expect(page.getByRole("status")).toContainText("incorrect");
    await login(page, adminEmail, password);
    await expect(page).toHaveURL(/\/pilot\/admin$/);
    await page.goto("/pilot/admin/employees");
    await page.getByLabel("First name", { exact: true }).fill("Test employee");
    await page.getByLabel("Last name", { exact: true }).fill(suffix);
    await page.getByLabel("Email", { exact: true }).fill(employeeEmail);
    await page
      .getByLabel("Kitchen role", { exact: true })
      .selectOption(prepRole);
    await page.getByLabel("Initial password").fill(password);
    await page
      .getByRole("button", { name: "Create employee", exact: true })
      .click();
    await expect(page).toHaveURL(/\/pilot\/admin\/employees\/[\w-]+$/);
    const employeeId = new URL(page.url()).pathname.split("/").at(-1)!;
    fixtureIds.push(employeeId);
    await page.goto("/pilot/admin/content");
    await page
      .getByLabel("Title", { exact: true })
      .fill(`Live training ${suffix}`);
    await page.getByRole("button", { name: "Create draft" }).click();
    await expect(page).toHaveURL(/\/pilot\/admin\/content\/[\w-]+$/);
    const moduleId = new URL(page.url()).pathname.split("/").at(-1)!;
    itemIds.push(moduleId);
    const image = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=",
      "base64",
    );
    const upload = await page.request.post(`${baseURL}/api/pilot/files`, {
      headers: { Origin: baseURL! },
      multipart: {
        item_id: moduleId,
        file: { name: "fixture.png", mimeType: "image/png", buffer: image },
      },
    });
    expect(upload.status()).toBe(200);
    const { path: filePath } = await upload.json();
    const fileUrl = `${baseURL}/api/pilot/files?path=${encodeURIComponent(filePath)}`;
    await page
      .getByRole("button", { name: "+ Add content block", exact: true })
      .click();
    await page
      .getByLabel("Content", { exact: true })
      .fill("Review this controlled test procedure.");
    await page.getByLabel("Restrict to selected kitchen roles").check();
    await page.getByLabel("Prep Cook", { exact: true }).check();
    await page
      .getByRole("button", { name: "+ Add question", exact: true })
      .click();
    await page
      .getByLabel("Question", { exact: true })
      .fill("Which choice is correct?");
    await page.getByLabel("Question 1 option 1").fill("Incorrect choice");
    await page.getByLabel("Question 1 option 2").fill("Correct choice");
    await page.getByLabel("Question 1 correct answer 2").check();
    await page
      .getByRole("button", { name: "Save & publish", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Published");
    await page.goto(`/pilot/admin/employees/${employeeId}`);
    await page.getByLabel("Published training").selectOption(moduleId);
    await page
      .getByRole("button", { name: "Assign training", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("assigned");
    await login(employeePage, employeeEmail, password);
    await expect(employeePage).toHaveURL(/\/pilot\/training$/);
    const download = await employeePage.request.get(fileUrl);
    expect(download.status()).toBe(200);
    expect(await download.body()).toEqual(image);
    expect(download.headers()["cache-control"]).toContain("no-store");
    await employeePage
      .getByRole("link")
      .filter({ hasText: `Live training ${suffix}` })
      .click();
    await expect(
      employeePage.getByText("Review this controlled test procedure."),
    ).toBeVisible();
    await employeePage
      .getByRole("button", { name: "I have completed the content" })
      .click();
    await employeePage.getByLabel("Incorrect choice", { exact: true }).check();
    await employeePage.getByRole("button", { name: "Submit quiz" }).click();
    await expect(employeePage.getByRole("status")).toContainText("Not passed");
    await employeePage.getByLabel("Correct choice", { exact: true }).check();
    await employeePage.getByRole("button", { name: "Submit quiz" }).click();
    await expect(
      employeePage.getByRole("heading", { name: "Training complete" }),
    ).toBeVisible();
    await employeePage.goto("/pilot/admin/employees");
    await expect(employeePage).toHaveURL(/\/pilot\/training$/);
    const deniedAction = await employeePage.request.post(
      `${baseURL}/api/pilot/actions`,
      {
        data: { action: "item-create", kind: "SOP", title: "Denied" },
        headers: { Origin: baseURL! },
      },
    );
    expect(deniedAction.status()).toBe(403);
    await login(outsiderPage, outsiderEmail, password);
    await expect(outsiderPage).toHaveURL(/\/pilot\/training$/);
    expect((await outsiderPage.request.get(fileUrl)).status()).toBe(404);
    await outsiderPage.goto(`/pilot/items/${moduleId}`);
    await expect(
      outsiderPage.getByRole("heading", { name: "Content unavailable" }),
    ).toBeVisible();
    const outsider = createClient(url!, key!, {
      auth: { persistSession: false },
    });
    expect(
      (
        await outsider.auth.signInWithPassword({
          email: outsiderEmail,
          password,
        })
      ).error,
    ).toBeNull();
    expect(
      (await outsider.storage.from("pilot-content").download(filePath)).error,
    ).toBeTruthy();
    expect(
      (
        await outsider.storage
          .from("pilot-content")
          .createSignedUrl(filePath, 60)
      ).error,
    ).toBeTruthy();
    expect(
      (await outsider.from("learning_items").select("*").eq("id", moduleId))
        .data,
    ).toEqual([]);
    expect(
      (
        await outsider
          .from("content_blocks")
          .select("*")
          .eq("item_id", moduleId)
      ).data,
    ).toEqual([]);
    expect(
      (await outsider.rpc("editor_answers", { target: moduleId })).error,
    ).toBeTruthy();
    await page.goto(`/pilot/admin/employees/${employeeId}`);
    await expect(
      page.getByRole("cell", { name: "completed", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell").filter({ hasText: "100% · Pass" }),
    ).toBeVisible();
    await page.getByLabel("Active account").uncheck();
    await page
      .getByRole("button", { name: "Save employee", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("saved");
    expect((await employeePage.request.get(fileUrl)).ok()).toBe(false);
    await employeePage.goto(`/pilot/items/${moduleId}`);
    await expect(employeePage).toHaveURL(/\/pilot\/login$/);
    await page.goto(`/pilot/admin/content/${moduleId}`);
    await page.getByRole("button", { name: "Archive", exact: true }).click();
    await expect(page.locator(".pilot-status")).toHaveText("archived");
    await page.goto(`/pilot/admin/employees/${employeeId}`);
    await expect(
      page.getByRole("cell", { name: "completed", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page).toHaveURL(/\/pilot\/login$/);
    await page.goto("/pilot/admin");
    await expect(page).toHaveURL(/\/pilot\/login$/);
  } catch (error) {
    await test.info().attach("employee-page", {
      body: await employeePage.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
    throw error;
  } finally {
    if (itemIds.length)
      await service
        .from("learning_items")
        .update({ status: "ARCHIVED" })
        .in("id", itemIds);
    if (fixtureIds.length)
      await service
        .from("employees")
        .update({ active: false })
        .in("id", fixtureIds);
    await employeeContext.close();
    await outsiderContext.close();
  }
});
