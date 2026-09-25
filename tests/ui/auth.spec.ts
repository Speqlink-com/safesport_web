import { test, expect, type Page } from "@playwright/test";
async function choice(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
test("guardian onboarding links a minor and preserves separate consent", async ({
  page,
}) => {
  await page.goto("/account/signup/guardian/name");
  await page.getByLabel("First name").fill("Jane");
  await page.getByLabel("Last name").fill("Mutua");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/\/guardian\/relationship$/);
  await choice(page, "Relationship", "Parent");
  await page.getByLabel("Contact phone").fill("+254700123456");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/\/guardian\/find-athlete$/);
  await page.getByLabel("Search minor by name or SafeSport ID").fill("Kevin");
  await choice(page, "Linked minor", "Kevin Mutua · ATH-00156");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/\/guardian\/account$/);
  await page.getByLabel("Email", { exact: false }).fill("jane@example.test");
  await page.getByLabel("Demo password (not stored)").fill("demo12345");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/\/guardian\/verify$/);
  await page.getByLabel("Demo verification code").fill("1234");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Complete demo profile" }).click();
  await expect(page).toHaveURL(/\/guardian\/consent$/);
  await expect(page.locator("main")).toContainText("Kevin Mutua");
  await expect(
    page.getByRole("combobox", { name: "Clinical consent", exact: true }),
  ).toContainText("Deferred");
});
test("abandoned recovery cannot redirect a fresh sign-in into password reset", async ({
  page,
}) => {
  await page.goto("/account/forgot-password");
  await page.getByLabel("Email", { exact: false }).fill("jane@example.test");
  await page.getByRole("button", { name: "Continue recovery preview" }).click();
  await expect(page).toHaveURL(/\/verify-otp$/);
  await page
    .getByRole("link", { name: "Back to sign in", exact: true })
    .click();
  await expect(page).toHaveURL(/\/signin$/);
  await choice(page, "Demo workspace", "Athlete");
  await page.getByLabel("Email", { exact: false }).fill("brian@example.test");
  await page.getByLabel("Demo password", { exact: false }).fill("demo12345");
  await page
    .getByRole("button", { name: "Continue to verification preview" })
    .click();
  await expect(page).toHaveURL(/\/verify-otp$/);
  await page.getByLabel("Four-digit demo code").fill("9999");
  await page.getByRole("button", { name: "Verify demo code" }).click();
  await expect(
    page.getByText("Enter the demonstration code 1234.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Four-digit demo code").fill("1234");
  await page.getByRole("button", { name: "Verify demo code" }).click();
  await expect(page).toHaveURL(/\/safesport\/athlete$/);
});
test("institution demo request validates and reaches a truthful confirmation", async ({
  page,
}) => {
  await page.goto("/account/request-demo/type");
  await choice(page, "Organization type", "School");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/\/request-demo\/details$/);
  await page.getByLabel("Organization name").fill("Demo Sports School");
  await page.getByLabel("Number of athletes").fill("120");
  await page.getByLabel("Location").fill("Nairobi");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/\/request-demo\/contact$/);
  await page.getByLabel("Contact person").fill("Demo Coordinator");
  await page.getByLabel("Work email").fill("coordinator@example.test");
  await page
    .getByRole("checkbox", { name: /I understand this request/ })
    .check();
  await page.getByRole("button", { name: "Prepare demo request" }).click();
  await expect(page).toHaveURL(/\/request-demo\/success$/);
  await expect(page.getByText(/nothing was sent/)).toBeVisible();
  await expect(page.getByText(/Demo Sports School/)).toBeVisible();
});

test("legacy paths, profile query tabs and settled dark-theme rendering", async ({
  page,
}) => {
  await page.goto("/dashboard/safesport/coach/roster");
  await expect(page).toHaveURL(/\/safesport\/coach\/roster$/);
  await expect(page.locator("main")).toContainText("Team roster");
  await page.goto("/account/reset-pasword");
  await expect(
    page.getByRole("heading", { name: "Choose a demo password" }),
  ).toBeVisible();
  await page.goto("/safesport/athlete/profile?tab=health");
  await expect(
    page.getByRole("tab", { name: "Health", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.goto("/safesport/athlete/health");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect
    .poll(async () =>
      page
        .getByRole("tab", { name: "Assessments", exact: true })
        .first()
        .evaluate((element) => {
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext("2d")!;
          const pixel = (color: string) => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            return Array.from(context.getImageData(0, 0, 1, 1).data);
          };
          const foreground = pixel(getComputedStyle(element).color);
          const background = pixel(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--background",
            ),
          );
          const alpha = foreground[3] / 255;
          const composite = foreground
            .slice(0, 3)
            .map(
              (channel, index) =>
                channel * alpha + background[index] * (1 - alpha),
            );
          const luminance = (channels: number[]) =>
            channels
              .slice(0, 3)
              .map((channel) => {
                const value = channel / 255;
                return value <= 0.04045
                  ? value / 12.92
                  : ((value + 0.055) / 1.055) ** 2.4;
              })
              .reduce(
                (sum, value, index) =>
                  sum + value * [0.2126, 0.7152, 0.0722][index],
                0,
              );
          const a = luminance(composite),
            b = luminance(background);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        }),
    )
    .toBeGreaterThanOrEqual(4.5);
  await page.screenshot({
    path: "/tmp/safesport-mobile-dark-settled.png",
    fullPage: true,
    animations: "disabled",
  });
});
