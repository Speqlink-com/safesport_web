import { test, expect } from "@playwright/test";
import {
  roles,
  href,
  navigation,
} from "../../features/safesport/workspace/catalog";

for (const role of roles) {
  test(`${role}: mobile content and tablet overview remain usable`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    const list = navigation[role].find((item) =>
      ["athletes", "users", "health"].includes(item.surface),
    );
    for (const path of ["", list?.path, "messages", "settings"].filter(
      (path): path is string => path !== undefined,
    )) {
      await page.goto(href(role, path));
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("main")).not.toContainText("Page unavailable");
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      if (!path && !["athlete", "guardian"].includes(role))
        await expect(page.locator(".recharts-sector").first()).toBeVisible();
      if (!path)
        await page.screenshot({
          path: `/tmp/safesport-${role}-mobile.png`,
          fullPage: true,
        });
    }
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto(href(role));
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    if (!["athlete", "guardian"].includes(role))
      await expect(page.locator(".recharts-sector").first()).toBeVisible();
    await page.screenshot({
      path: `/tmp/safesport-${role}-tablet.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}
