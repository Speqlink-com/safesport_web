import { test, expect, type Page } from "@playwright/test";
import {
  ppeQuestions,
  detailFields,
  historyErrors,
  summarizeHistory,
} from "../../features/safesport/workspace/ppe-history";
async function choice(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
async function role(page: Page, name: string, path: string) {
  await choice(page, "Active role", name);
  await expect(page).toHaveURL(new RegExp(`/safesport/${path}$`));
}
test("individual history preserves separate answers and requires structured follow-up", () => {
  const answers = Object.fromEntries(ppeQuestions.map((q) => [q.id, "no"]));
  answers.chest = "yes";
  expect(summarizeHistory(answers).Cardiovascular).toBe("yes");
  expect(answers.fainting).toBe("no");
  expect(historyErrors({ historyAnswers: answers })).toContain(
    `Complete the structured follow-up: ${ppeQuestions[0].label}`,
  );
  const complete = Object.fromEntries(
    detailFields.map(([key]) => [key, "Unknown"]),
  );
  expect(
    historyErrors({
      historyAnswers: answers,
      historyDetails: { chest: complete },
    }),
  ).toEqual([]);
  expect(
    historyErrors(
      { historyAnswers: answers, historyDetails: { chest: complete } },
      true,
    ),
  ).toContain(`Document clinician resolution: ${ppeQuestions[0].label}`);
  expect(
    historyErrors({
      historyAnswers: { ...answers, chest: "no", injury: "yes" },
    }),
  ).toContain(
    "Record each injury or current musculoskeletal problem separately.",
  );
  expect(
    historyErrors({
      historyAnswers: { ...answers, chest: "no", neurologic: "yes" },
      concussion: {
        present: "yes",
        episodes: "0",
        lastEpisode: "",
        recovery: "",
        symptoms: "",
      },
    }),
  ).toContain(
    "Complete concussion episode count, most recent episode, recovery and symptoms.",
  );
});
test("athlete submits individual PPE answers and clinician receives the same details", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/safesport/athlete/questionnaires");
  for (const q of ppeQuestions)
    await choice(page, q.label, q.id === "chest" ? "Yes" : "No");
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await expect(
    page.getByText(
      `Complete the structured follow-up: ${ppeQuestions[0].label}`,
      { exact: true },
    ),
  ).toBeVisible();
  for (const [, label] of detailFields)
    await page
      .getByRole("textbox", {
        name: `${ppeQuestions[0].label} — ${label}`,
        exact: true,
      })
      .fill(
        label === "Symptoms"
          ? "Symptoms sentinel for clinician review"
          : "Unknown",
      );
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await expect(
    page.getByText("Questionnaire submitted for clinician review", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("main")).toContainText(
    "History received for clinical assessment.",
  );
  await role(page, "Clinician", "clinician");
  await page
    .getByRole("link", { name: "Open assessments", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Brian Otieno", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "2. History", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: ppeQuestions[0].label, exact: true }),
  ).toContainText("Yes");
  await expect(
    page.getByRole("combobox", { name: ppeQuestions[1].label, exact: true }),
  ).toContainText("No");
  await expect(
    page.getByRole("textbox", {
      name: `${ppeQuestions[0].label} — Symptoms`,
      exact: true,
    }),
  ).toHaveValue("Symptoms sentinel for clinician review");
  await page
    .getByRole("button", { name: "7. Eligibility", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Finalize clinician decision",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(page.locator("main")).toContainText(
    `Document clinician resolution: ${ppeQuestions[0].label}`,
  );
});
test("PPE referral reaches assigned physiotherapist and completed care still needs clinician review", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/safesport/clinician/assessments/ppe-001");
  await page
    .getByRole("button", { name: "Create linked referral", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Athlete", exact: true }),
  ).toContainText("Kevin Mutua");
  await expect(
    page.getByRole("combobox", { name: "Linked PPE assessment", exact: true }),
  ).toContainText("ppe-001");
  await choice(page, "Type", "Physiotherapy");
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("PPE handoff test");
  await page
    .getByRole("textbox", { name: "Clinical reason", exact: true })
    .fill("Assess function and return findings to clinician.");
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await role(page, "Physiotherapist", "physiotherapist");
  const link = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "My Referrals", exact: true });
  if (!(await link.isVisible()))
    await page.getByRole("button", { name: "Referrals", exact: true }).click();
  await link.click();
  await page
    .getByRole("link", { name: "PPE handoff test", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Update referral", exact: true })
    .click();
  await choice(page, "Status", "Completed");
  await choice(page, "Outcome", "Completed");
  await page
    .getByRole("textbox", { name: "Closure / coordination note", exact: true })
    .fill("Assessment completed; findings returned for clinician review.");
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await page.getByRole("link", { name: "Athlete record", exact: true }).click();
  await expect(page.locator("main")).toContainText("PPE care journey");
  await expect(page.locator("main")).toContainText(
    "Care evidence has not been reviewed with the latest clinician decision.",
  );
  await expect(page.locator("main")).not.toContainText(
    "Recorded stages are complete in this view.",
  );
});
test("guardian questionnaire keeps confidential questions private", async ({
  page,
}) => {
  await page.goto("/safesport/guardian/questionnaires");
  for (const q of ppeQuestions.filter((q) => "private" in q)) {
    await expect(
      page.getByRole("combobox", { name: q.label, exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("combobox", { name: q.label, exact: true }),
    ).toContainText("Discuss privately");
  }
  await expect(
    page.getByRole("textbox", { name: /clinician resolution/ }),
  ).toHaveCount(0);
});

test("PPE questionnaire and care journey remain usable on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/safesport/athlete/questionnaires");
  await choice(page, ppeQuestions[0].label, "Yes");
  await expect(
    page.getByRole("textbox", {
      name: `${ppeQuestions[0].label} — Symptoms`,
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/safesport-ppe-questionnaire-mobile.png",
    fullPage: true,
  });
  await page.goto("/safesport/clinician/assessments/ppe-001");
  await page
    .getByRole("button", {
      name: "View journey steps and handoffs",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Participation certificate",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/safesport-ppe-journey-mobile.png",
    fullPage: true,
  });
});
