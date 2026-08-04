import { expect, test } from "@playwright/test";

test("builds, previews, and opens template management", async (
  { page },
  testInfo,
) => {
  await page.goto("/builder", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Northstar", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Email design canvas")).toBeVisible();

  if (testInfo.project.name === "chromium") {
    await page.getByRole("button", { name: "Add Heading" }).click();
    await expect(page.getByText("A clear, compelling headline")).toBeVisible();

    await page.getByRole("button", { name: "Preview" }).click();
    await expect(page.getByTitle(/email preview/)).toBeVisible();
  }

  await page.getByRole("button", { name: /Templates/ }).click();
  await expect(page.getByRole("dialog", { name: "Templates" })).toBeVisible();
});
