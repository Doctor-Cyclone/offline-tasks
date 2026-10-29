import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

test("tasks survive reload and remain editable offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(page.getByText("Готово к работе без сети")).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.getByLabel("Новая задача").fill("Изучить Service Worker");
  await page.getByRole("button", { name: "Добавить" }).click();
  await page.getByRole("checkbox").check();
  await page.reload();
  await expect(page.getByRole("checkbox")).toBeChecked();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("Offline", { exact: true })).toBeVisible();
  await page.getByLabel("Новая задача").fill("Работает без сети");
  await page.getByRole("button", { name: "Добавить" }).click();
  page.once("dialog", (dialog) => dialog.accept("Изменено офлайн"));
  await page
    .getByLabel("Редактировать: Работает без сети", { exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByText("Изменено офлайн", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Удалить: Изучить Service Worker", { exact: true })
    .click();
  await page.reload();
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await context.setOffline(false);
  await expect(page.getByText("Online", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});

test("invalid stored data is preserved until the user writes", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("offline-tasks:v1", "broken data"),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("Не удалось прочитать");
  expect(
    await page.evaluate(() => localStorage.getItem("offline-tasks:v1")),
  ).toBe("broken data");
});

test("new service worker waits for explicit update and preserves tasks", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/");
  await expect(page.getByText("Готово к работе без сети")).toBeVisible();
  await page.reload();
  await page.getByLabel("Новая задача").fill("Сохранить при обновлении");
  await page.getByRole("button", { name: "Добавить" }).click();
  const htmlPath = "index.html";
  const original = readFileSync(htmlPath, "utf8");
  const build = () =>
    execFileSync(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["run", "build"],
      { shell: process.platform === "win32", stdio: "pipe" },
    );
  try {
    writeFileSync(htmlPath, original.replace("<title>", "<title>Обновлено: "));
    build();
    await page.evaluate(async () => {
      const r = await navigator.serviceWorker.getRegistration();
      await r?.update();
    });
    await expect(
      page.getByRole("button", { name: "Обновить", exact: true }),
    ).toBeVisible({ timeout: 30000 });
    expect(await page.title()).not.toContain("Обновлено:");
    await page.getByRole("button", { name: "Обновить", exact: true }).click();
    await expect(page).toHaveTitle(/Обновлено:/);
    await expect(
      page.getByText("Сохранить при обновлении", { exact: true }),
    ).toBeVisible();
  } finally {
    writeFileSync(htmlPath, original);
    build();
  }
});
