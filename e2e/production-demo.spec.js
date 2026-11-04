import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const demoEmail = process.env.DEMO_EMAIL;
const demoPassword = process.env.DEMO_PASSWORD;
const demoName = process.env.DEMO_NAME || "Demo Reviewer";
const hasDemoCredentials = Boolean(demoEmail && demoPassword);

test.describe("production demo account", () => {
  test.skip(!hasDemoCredentials, "DEMO_EMAIL and DEMO_PASSWORD are required for authenticated production checks.");
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    page.testDiagnostics = { consoleErrors: [], serverErrors: [] };

    page.on("console", (message) => {
      const text = message.text();
      const expectedUnauthenticatedProbe =
        text === "Failed to load resource: the server responded with a status of 401 ()";
      if (message.type() === "error" && !expectedUnauthenticatedProbe) page.testDiagnostics.consoleErrors.push(text);
    });
    page.on("response", (response) => {
      if (response.status() >= 500) {
        page.testDiagnostics.serverErrors.push(`${response.status()} ${response.request().method()} ${response.url()}`);
      }
    });
  });

  test.afterEach(async ({ page }) => {
    expect(page.testDiagnostics.consoleErrors, "Browser console errors").toEqual([]);
    expect(page.testDiagnostics.serverErrors, "HTTP 5xx responses").toEqual([]);
  });

  async function login(page) {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(demoEmail);
    await page.getByRole("textbox", { name: "Password", exact: true }).fill(demoPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/app$/, { timeout: 30_000 });
    await expect(page.getByText("Tasks Today", { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  async function expectNoSeriousAccessibilityViolations(page, context) {
    await page.evaluate(async () => {
      const finiteAnimations = document.getAnimations().filter((animation) => {
        const timing = animation.effect?.getComputedTiming();
        return timing && Number.isFinite(timing.endTime) && timing.endTime <= 2_000;
      });
      await Promise.all(finiteAnimations.map((animation) => animation.finished.catch(() => undefined)));
    });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const severeViolations = results.violations.filter(({ impact }) => impact === "serious" || impact === "critical");
    const summary = severeViolations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      targets: nodes.map(({ target }) => target.join(" ")),
      failures: nodes.flatMap(({ any }) => any.map(({ message }) => message)),
    }));
    expect(summary, `${context} has serious or critical accessibility violations`).toEqual([]);
  }

  async function openAllTasks(page) {
    await page.getByRole("button", { name: "View All" }).click();
    await expect(page.getByRole("heading", { name: "All tasks" })).toBeVisible();
  }

  async function openCreateTask(page) {
    const desktopCreateButton = page.getByRole("button", { name: "Create new task" });
    if (await desktopCreateButton.isVisible()) await desktopCreateButton.click();
    else await page.getByRole("button", { name: "Add task" }).click();
    await expect(page.getByRole("dialog", { name: "Add new task" })).toBeVisible();
  }

  test("loads the seeded overview on desktop and mobile", async ({ page }, testInfo) => {
    await login(page);

    await expect(page.getByText(demoName, { exact: true })).toBeAttached();
    await expect(page.getByText("Test mobile navigation", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Review dashboard experience", { exact: true }).first()).toBeVisible();
    await expectNoSeriousAccessibilityViolations(page, "Overview");

    await testInfo.attach("overview", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });

  test("searches by keyword and opens the matching task details", async ({ page }, testInfo) => {
    await login(page);
    await openAllTasks(page);

    const search = page.getByRole("searchbox", { name: "Search tasks" });
    await search.fill("walkthrough");
    const viewResult = page.getByRole("button", { name: "View Prepare project walkthrough" });
    await expect(viewResult).toBeVisible();
    await viewResult.click();

    const details = page.getByRole("dialog", { name: "Prepare project walkthrough" });
    await expect(details).toBeVisible();
    await expect(details.getByText("Description", { exact: true })).toBeVisible();
    await expectNoSeriousAccessibilityViolations(page, "Task details");

    await testInfo.attach("search-and-view", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });

  test("creates, edits, completes, and deletes a temporary task", async ({ page }, testInfo) => {
    const suffix = `${testInfo.project.name}-${Date.now()}`;
    const originalTitle = `QA temporary ${suffix}`;
    const editedTitle = `QA verified ${suffix}`;

    await login(page);
    await openCreateTask(page);

    const createDialog = page.getByRole("dialog", { name: "Add new task" });
    await createDialog.getByLabel("Task title", { exact: true }).fill(originalTitle);
    await createDialog.getByLabel("Date", { exact: true }).fill("2026-11-04");
    await createDialog.getByLabel("Time", { exact: true }).fill("18:30");
    await createDialog.getByLabel("Priority", { exact: true }).selectOption("High");
    await createDialog.getByLabel("Status", { exact: true }).selectOption("Pending");
    await createDialog
      .getByLabel("Description", { exact: true })
      .fill("Temporary task created by the production browser check.");
    await createDialog.getByRole("button", { name: "Create task" }).click();
    await expect(createDialog).toBeHidden();
    await expect(page.getByText("Your new task was created successfully.")).toBeVisible();

    await openAllTasks(page);
    const search = page.getByRole("searchbox", { name: "Search tasks" });
    await search.fill(originalTitle);
    const editResult = page.getByRole("button", { name: `Edit ${originalTitle}` });
    await expect(editResult).toBeVisible();
    await editResult.click();
    const editDialog = page.getByRole("dialog", { name: "Edit task" });
    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel("Task title").fill(editedTitle);
    await editDialog.getByLabel("Description").fill("Edited and verified in desktop and mobile browser tests.");
    await editDialog.getByRole("button", { name: "Save changes" }).click();
    await expect(editDialog).toBeHidden();
    await expect(page.getByText("Your task was updated successfully.")).toBeVisible();

    await search.fill(editedTitle);
    const statusControl = page.getByRole("combobox", { name: `Update status for ${editedTitle}` });
    await expect(statusControl).toBeVisible();
    await statusControl.selectOption("Completed");
    await expect(statusControl).toHaveValue("Completed");
    await expect(page.getByText("Task marked as completed.")).toBeVisible();

    await testInfo.attach("completed-temporary-task", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    if (testInfo.project.name.includes("mobile")) {
      const swipeShell = page.locator(".mobile-task-swipe-shell").filter({ hasText: editedTitle });
      const row = swipeShell.locator(".mobile-task-row");
      await row.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const pointerId = 7;
        const startX = rect.right - 12;
        const y = rect.top + rect.height / 2;
        const originalSetPointerCapture = element.setPointerCapture;
        const originalReleasePointerCapture = element.releasePointerCapture;
        element.setPointerCapture = () => undefined;
        element.releasePointerCapture = () => undefined;
        const dispatch = (type, clientX) =>
          element.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              cancelable: true,
              clientX,
              clientY: y,
              pointerId,
              pointerType: "touch",
            }),
          );
        dispatch("pointerdown", startX);
        dispatch("pointermove", startX - 120);
        dispatch("pointerup", startX - 120);
        element.setPointerCapture = originalSetPointerCapture;
        element.releasePointerCapture = originalReleasePointerCapture;
      });
      await expect(swipeShell).toHaveClass(/is-swipe-open/);
      await page.getByRole("button", { name: `Delete ${editedTitle} after swipe` }).click();
    } else {
      await page.getByRole("button", { name: `Delete ${editedTitle}`, exact: true }).click();
    }
    const confirmation = page.getByRole("dialog", { name: "Delete this task?" });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirmation).toBeHidden();
    await expect(page.getByText("The task was deleted successfully.")).toBeVisible();
    await expect(page.getByRole("button", { name: `Edit ${editedTitle}` })).toHaveCount(0);
  });

  test("opens the mobile navigation drawer and shows profile data", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("mobile"), "Mobile-only navigation check.");
    await login(page);

    await page.getByRole("button", { name: "Open sidebar" }).click();
    await expect(page.getByRole("complementary", { name: "Workspace sidebar" })).toBeVisible();
    await expect(page.getByText(demoName, { exact: true })).toBeVisible();
    await expect(page.getByText(demoEmail, { exact: true })).toBeVisible();
    await expectNoSeriousAccessibilityViolations(page, "Mobile navigation drawer");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("complementary", { name: "Workspace sidebar" })).toBeHidden();
  });
});
