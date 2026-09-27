import { ppeQuestions } from "../../features/safesport/workspace/ppe-history";
import { test, expect, type Page } from "@playwright/test";
import {
  navigation,
  roles,
  href,
} from "../../features/safesport/workspace/catalog";
async function choice(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
  if (label === "Active role") {
    const titles: Record<string, string> = {
      Athlete: "athlete",
      Guardian: "guardian",
      Clinician: "clinician",
      Physiotherapist: "physiotherapist",
      Coach: "coach",
      "Institution administrator": "institution",
      "Operations coordinator": "operations",
      "System administrator": "sys-admin",
    };
    await expect(page).toHaveURL(new RegExp(`/safesport/${titles[option]}$`));
  }
}
for (const role of roles) {
  test(`${role}: all navigation and embedded record destinations render`, async ({
    page,
  }) => {
    test.setTimeout(240000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const targets = new Set(navigation[role].map((n) => href(role, n.path)));
    for (const target of targets) {
      await page.goto(target);
      await expect(page.locator("main")).toBeVisible();
      if (target === href(role) && !["athlete", "guardian"].includes(role))
        await expect(page.locator(".recharts-sector").first()).toBeVisible();
      if (target === href(role))
        await page.screenshot({
          path: `/tmp/safesport-${role}-desktop.png`,
          fullPage: true,
        });
      await expect(page.locator("main")).not.toContainText("Page unavailable");
      await expect(page.locator("main")).not.toContainText(
        "This workspace could not be displayed",
      );
      await expect(page.locator("main")).not.toContainText("404");
      await expect(page.locator("main")).not.toContainText(
        "Record unavailable",
      );
      await expect(page.locator("main")).not.toContainText(
        "Athlete unavailable",
      );
      const embedded = await page
        .locator('main a[href^="/safesport/"]')
        .evaluateAll((links) => links.map((l) => l.getAttribute("href")!));
      for (const link of embedded) targets.add(link);
      if (targets.size > 90) throw new Error("Unexpected navigation expansion");
    }
    expect(errors).toEqual([]);
    console.log(`${role}: verified ${targets.size} route destinations`);
  });
}
test("referral creation, validation, completion and notification update", async ({
  page,
}) => {
  await page.goto("/safesport/clinician/referrals");
  await page
    .getByRole("button", { name: "Create referral", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Demo physiotherapy referral");
  await page
    .getByRole("textbox", { name: "Clinical reason" })
    .fill("Review training tolerance following clinical assessment.");
  await choice(page, "Type", "Physiotherapy");
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search referrals" })
    .fill("Physiotherapy");
  await page
    .getByRole("link", { name: "Physiotherapy", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Update referral" }).click();
  await choice(page, "Status", "Completed");
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await expect(
    page.getByText("An outcome and closure note are required"),
  ).toBeVisible();
  await choice(page, "Outcome", "Completed");
  await page
    .getByRole("textbox", { name: "Closure / coordination note" })
    .fill("Specialist review completed and follow-up communicated.");
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("main")).toContainText("Outcome: completed");
  await page.getByRole("link", { name: /Notifications, .* unread/ }).click();
  await expect(page.locator("main")).toContainText("Referrals record updated");
  await page.getByRole("button", { name: "Mark all read" }).click();
  await expect(
    page
      .getByRole("banner")
      .getByRole("link", { name: "Notifications", exact: true }),
  ).toBeVisible();
});
test("consent and PPE finalization remain gated", async ({ page }) => {
  await page.goto("/safesport/clinician/assessments/ppe-001");
  await page.getByRole("button", { name: "2. History" }).click();
  await expect(
    page.getByText("Clinical consent required", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review consent" }).click();
  await choice(page, "Clinical consent", "Obtained");
  await page
    .getByRole("textbox", { name: "Parent / guardian full name" })
    .fill("Jane Mutua");
  await page.getByRole("button", { name: "Save consent" }).click();
  await expect(page.getByText("Record the minor’s assent")).toBeVisible();
  await page.getByRole("checkbox", { name: /athlete has received/ }).check();
  await page.getByRole("button", { name: "Save consent" }).click();
  await page.getByRole("button", { name: "7. Eligibility" }).click();
  await expect(
    page.getByRole("button", { name: "Finalize clinician decision" }),
  ).toBeDisabled();
  await expect(page.locator("main")).toContainText(
    `Answer: ${ppeQuestions[0].label}`,
  );
});
test("health tabs render distinct views without navigation to screening", async ({
  page,
}) => {
  await page.goto("/safesport/athlete/health");
  for (const tab of [
    "Assessments",
    "Injuries",
    "Rehabilitation",
    "Eligibility",
    "Timeline",
  ]) {
    await page.getByRole("tab", { name: tab, exact: true }).first().click();
    await expect(
      page.getByRole("tab", { name: tab, exact: true }).first(),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page).toHaveURL(/\/athlete\/health$/);
  }
  await page.getByRole("tab", { name: "Assessments", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "PPE assessments", exact: true }),
  ).toBeVisible();
});
test("messages remain local and visible to the correct recipient", async ({
  page,
}) => {
  await page.goto("/safesport/athlete/messages");
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("My local care question");
  await page.getByRole("button", { name: "Send locally" }).click();
  await expect(
    page.getByText("My local care question", { exact: true }),
  ).toBeVisible();
  await choice(page, "Active role", "Clinician");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Messages", exact: true })
    .click();
  await expect(
    page.getByText("My local care question", { exact: true }),
  ).toBeVisible();
});
test("mobile navigation, keyboard focus and dark theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/safesport/athlete");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.getByRole("link", { name: "Skip to content" }).press("Enter");
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "My Health", exact: true })
    .click();
  await expect(page).toHaveURL(/\/athlete\/health/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/safesport-mobile.png", fullPage: true });
});

test("complete PPE updates guardian certificate without leaking clinical rationale", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/safesport/physiotherapist");
  await page
    .getByRole("link", { name: "Open rehabilitation", exact: true })
    .click();
  await page
    .getByRole("tab", { name: "Progress reviews", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add progress reviews", exact: true })
    .click();
  await choice(page, "Athlete", "Kevin Mutua");
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Kevin reassessment handoff");
  await choice(page, "Status", "Reassessment Requested");
  await page
    .getByRole("textbox", {
      name: "Plan / observations / instructions",
      exact: true,
    })
    .fill(
      "Specialist findings available; clinician participation review requested.",
    );
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("row").filter({ hasText: "Kevin reassessment handoff" }),
  ).toContainText("Reassessment Requested");
  await choice(page, "Active role", "Clinician");
  await page
    .getByRole("link", { name: "Open assessments", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start assessment", exact: true })
    .click();
  await choice(page, "Athlete", "Kevin Mutua");
  await page
    .getByRole("button", { name: "Open assessment", exact: true })
    .click();
  await expect(page).toHaveURL(/assessments\/ppe-001$/);
  await choice(page, "Clinical consent", "Obtained");
  await page.getByRole("checkbox", { name: /athlete has received/ }).check();
  await page
    .getByRole("textbox", { name: "Parent / guardian full name" })
    .fill("Jane Mutua");
  await page.getByRole("button", { name: "Save consent" }).click();
  await page.getByRole("button", { name: "2. History" }).click();
  for (const question of ppeQuestions) await choice(page, question.label, "No");
  await page
    .getByRole("checkbox", { name: /I have reviewed all history/ })
    .check();
  await page.getByRole("button", { name: "3. Vitals" }).click();
  await page.getByLabel("Systolic BP (mmHg)", { exact: false }).fill("118");
  await page.getByLabel("Diastolic BP (mmHg)", { exact: false }).fill("76");
  await page.getByLabel("Pulse (beats/min)", { exact: false }).fill("64");
  await page.getByRole("button", { name: "4. Examination" }).click();
  for (const domain of [
    "General",
    "Cardiovascular",
    "Respiratory",
    "Neurologic",
    "Vision",
    "Skin",
    "Abdomen",
  ])
    await choice(page, domain, "Normal");
  await page.getByRole("button", { name: "5. MSK baseline" }).click();
  for (const domain of [
    "Spine",
    "Shoulder",
    "Elbow / wrist / hand",
    "Hip",
    "Knee",
    "Ankle / foot",
  ])
    await choice(page, domain, "Normal");
  await page.getByRole("button", { name: "6. Sport review" }).click();
  await page
    .getByRole("textbox", { name: "Sport-specific review" })
    .fill("Clinical review of football demands completed.");
  await page.getByRole("button", { name: "7. Eligibility" }).click();
  await page
    .getByRole("textbox", { name: "Care handoff review and disposition" })
    .fill(
      "Reviewed existing care and specialist follow-up; documented participation decision with follow-up plan.",
    );
  await choice(page, "Clinician eligibility decision", "Cleared");
  await page
    .getByRole("textbox", { name: "Clinical rationale (confidential)" })
    .fill("Confidential rationale test sentinel.");
  await page.getByLabel("Review / evaluation deadline").fill("2026-10-24");
  await page
    .getByRole("textbox", { name: "Clinician signature" })
    .fill("Dr Sarah Njeri");
  await page
    .getByRole("button", { name: "Finalize clinician decision" })
    .click();
  await page.getByRole("button", { name: "Confirm finalization" }).click();
  await expect(
    page.getByRole("heading", { name: "Assessment finalized" }),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText(
    "request(s) awaiting a new finalized clinical assessment.",
  );
  await choice(page, "Active role", "Guardian");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Certificates", exact: true })
    .click();
  await expect(page.locator("main")).toContainText("Kevin Mutua");
  await expect(page.locator("main")).toContainText("Cleared");
  await expect(page.locator("main")).not.toContainText(
    "Confidential rationale test sentinel",
  );
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  expect((await pending).suggestedFilename()).toContain("ATH-00156");
  await choice(page, "Active role", "Physiotherapist");
  await page
    .getByRole("link", { name: "Open rehabilitation", exact: true })
    .click();
  await page
    .getByRole("tab", { name: "Progress reviews", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Kevin reassessment handoff" }),
  ).toContainText("Completed");
});

test("athlete onboarding preserves edits and creates the connected profile", async ({
  page,
}) => {
  await page.goto("/account/signup/athlete/name");
  await page.getByLabel("First name").fill("Amina");
  await page.getByLabel("Last name").fill("Demo");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Date of birth").fill("2005-01-15");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await choice(
    page,
    "Institution and team",
    "Green Valley Academy · U18 Football",
  );
  await page.getByLabel("Emergency contact name").fill("Demo Contact");
  await page.getByLabel("Emergency contact phone").fill("+254700123456");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Email", { exact: false }).fill("amina@example.test");
  await page.getByLabel("Demo password (not stored)").fill("demo12345");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  expect(page.url()).not.toContain("demo12345");
  await page.getByLabel("Demo verification code").fill("1234");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("form")).toContainText("Amina Demo");
  await page.getByRole("button", { name: "Edit name", exact: true }).click();
  await expect(page.getByLabel("First name")).toHaveValue("Amina");
  await page.getByLabel("First name").fill("Amina Updated");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/\/athlete\/dob$/);
  await page.goBack();
  await expect(page.getByLabel("First name")).toHaveValue("Amina Updated");
  for (const step of ["dob", "team", "account"]) {
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/athlete/${step}$`));
  }
  await page.getByLabel("Demo password (not stored)").fill("demo12345");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Demo verification code").fill("1234");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Complete demo profile" }).click();
  await expect(page).toHaveURL(/\/athlete\/consent/);
  await expect(page.locator("main")).toContainText("Amina Updated Demo");
  await expect(
    page.getByRole("combobox", { name: "Clinical consent", exact: true }),
  ).toContainText("Deferred");
});

test("rehabilitation review updates local plan and keeps eligibility separate", async ({
  page,
}) => {
  await page.goto("/safesport/physiotherapist/rehabilitation");
  await page
    .getByRole("tab", { name: "Progress reviews", exact: true })
    .click();
  await page.getByRole("button", { name: "Add progress reviews" }).click();
  await page
    .getByLabel("Title", { exact: false })
    .fill("Strength reassessment");
  await page
    .getByLabel("Plan / observations / instructions")
    .fill(
      "Progress reviewed with athlete. Clinical reassessment remains required.",
    );
  await choice(page, "Status", "Completed");
  await page.getByLabel("Progress (%)").fill("70");
  await choice(
    page,
    "Linked rehabilitation plan",
    "Hamstring strength and return to training",
  );
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await page.getByRole("tab", { name: "Active plans", exact: true }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "Hamstring strength" })
    .getByRole("button", { name: "Review / update" })
    .click();
  await expect(page.getByLabel("Progress (%)")).toHaveValue("70");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await choice(page, "Active role", "Athlete");
  await expect(page.locator("main")).not.toContainText("Automatically cleared");
});

test("human AI review and role boundaries", async ({ page }) => {
  await page.goto("/safesport/physiotherapist/ai-reviews/scr-001");
  await page
    .getByLabel("Clinical interpretation / correction reason")
    .fill("Demo movement signal reviewed in clinical context.");
  await choice(page, "Reviewer action", "Prevention Program");
  await page.getByRole("button", { name: "Sign human review" }).click();
  await expect(page.locator("main")).toContainText("Human Reviewed");
  await choice(page, "Active role", "Coach");
  await expect(page.locator("main")).not.toContainText("kneeValgusAngle");
  await page.goto("/safesport/coach/assessments/ppe-002");
  await expect(page.locator("main")).toContainText(
    "Page unavailable in this workspace",
  );
  await expect(page.locator("main")).not.toContainText("Clinical rationale");
  await page.goto("/safesport/operations/referrals/ref-002");
  await expect(page.locator("main")).not.toContainText("Palpitations");
  await expect(page.locator("main")).not.toContainText("Cardiology");
});

test("attachment preview and local message download", async ({ page }) => {
  await page.goto("/safesport/athlete/messages");
  await page.getByLabel("Attachment · up to 10 MB").setInputFiles({
    name: "care-notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Demo attachment"),
  });
  await expect(
    page.getByRole("link", { name: "care-notes.txt" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove attachment" }).click();
  await expect(page.getByRole("link", { name: "care-notes.txt" })).toHaveCount(
    0,
  );
  await page.getByLabel("Attachment · up to 10 MB").setInputFiles({
    name: "care-notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Demo attachment"),
  });
  await page.getByRole("button", { name: "Send locally" }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("link", { name: "care-notes.txt" }).click();
  expect((await pending).suggestedFilename()).toBe("care-notes.txt");
});
