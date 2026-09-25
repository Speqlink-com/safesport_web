import { test, expect, type Page } from "@playwright/test";
async function choice(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
test("appointment creation and cancellation update the schedule", async ({
  page,
}) => {
  await page.goto("/safesport/operations/appointments");
  await page
    .getByRole("button", { name: "Create appointment", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Demo follow-up appointment");
  await page.getByLabel("Date and time").fill("2026-10-01T10:30");
  await page
    .getByLabel("Location and scheduling notes")
    .fill("Green Valley clinic, room 2.");
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await page
    .getByRole("link", { name: "Demo follow-up appointment", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Update record", exact: true })
    .click();
  await choice(page, "Status", "Cancelled");
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await expect(page.locator("main")).toContainText("Cancelled");
  await page.getByRole("link", { name: "Back to list", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search events" })
    .fill("Demo follow-up appointment");
  await expect(
    page.getByRole("row").filter({ hasText: "Demo follow-up appointment" }),
  ).toContainText("Cancelled");
});
test("user creation, pagination, filtering and suspension work locally", async ({
  page,
}) => {
  await page.goto("/safesport/sys-admin/users");
  await page.getByRole("button", { name: "Add demo user" }).click();
  await page.getByLabel("Full name").fill("Zulu Demo");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("zulu@example.test");
  await page.getByRole("button", { name: "Save access" }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("main")).toContainText("Zulu Demo");
  await choice(page, "Status filter", "Invited");
  await expect(page.locator("main")).toContainText("1 of 9 users");
  await page
    .getByRole("button", { name: "Manage access", exact: true })
    .click();
  await choice(page, "Access status", "Suspended");
  await page.getByRole("button", { name: "Save access" }).click();
  await expect(
    page.getByText("No matching records", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Search users" }).fill("Zulu");
  await expect(
    page.getByRole("row").filter({ hasText: "Zulu Demo" }),
  ).toContainText("Suspended");
});
test("seed referral pending outcome cannot be closed by operations", async ({
  page,
}) => {
  await page.goto("/safesport/operations/referrals/ref-001");
  await page.getByRole("button", { name: "Update referral" }).click();
  await choice(page, "Status", "Completed");
  await page
    .getByLabel("Closure / coordination note")
    .fill(
      "Appointment logistics confirmed, specialist outcome is still pending.",
    );
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByText(
      "An outcome and closure note are required to complete a referral.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator("main")).toContainText("In Progress");
});
test("capture preview, consent gate, simulated result and quality rejection", async ({
  page,
}) => {
  await page.goto("/safesport/clinician/screenings");
  await page
    .getByRole("button", { name: "New screening", exact: true })
    .click();
  await choice(page, "Athlete", "Kevin Mutua");
  await expect(
    page.getByText(
      "Clinical consent and separate video consent are required.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save capture" }),
  ).toBeDisabled();
  await choice(page, "Athlete", "Brian Otieno");
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d")!;
    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: BlobPart[] = [];
    const done = new Promise<number[]>((resolve) => {
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () =>
        resolve(
          Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())),
        );
    });
    recorder.start();
    ctx.fillStyle = "#174D16";
    ctx.fillRect(0, 0, 320, 240);
    await new Promise((r) => setTimeout(r, 350));
    recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
    return done;
  });
  await page.getByLabel("Movement video (up to 100 MB)").setInputFiles({
    name: "demo-capture.webm",
    mimeType: "video/webm",
    buffer: Buffer.from(bytes),
  });
  await expect(page.locator("video")).toHaveAttribute("src", /^blob:/);
  await page.getByRole("button", { name: "Save capture" }).click();
  await expect(page).toHaveURL(/\/screenings\/scr-/);
  await choice(page, "Capture quality", "Usable");
  await page.getByRole("button", { name: "Load simulated AI result" }).click();
  await expect(page.locator("main")).toContainText("DEMO-2.3.1");
  await expect(page.locator("main")).toContainText("Awaiting Human Review");
  await choice(page, "Capture quality", "Retake required");
  await expect(page.locator("main")).not.toContainText(
    "Moderate Movement Risk",
  );
  await page
    .getByLabel("Retake instructions")
    .fill("Repeat frontal view with the entire athlete visible.");
  await page.getByRole("button", { name: "Save retake instructions" }).click();
  await expect(page.locator("main")).toContainText("Quality Failed");
});
