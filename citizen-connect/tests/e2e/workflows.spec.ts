import { expect, test, type Page } from "@playwright/test";
type DemoRole = "citizen" | "officer" | "gn" | "admin";
const shown = (page: Page, text: string | RegExp) =>
  page
    .getByText(text, { exact: typeof text === "string" })
    .filter({ visible: true });
const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true }).filter({ visible: true });
const button = (page: Page, name: string | RegExp) =>
  page.getByRole("button", { name, exact: typeof name === "string" });
const press = (page: Page, name: string | RegExp) => button(page, name).click();
const tab = (page: Page, name: string) => shown(page, name).last().click();
async function home(page: Page) {
  await page.goto("/");
  await expect(shown(page, /Hello,/)).toBeVisible();
}
async function demoLogin(page: Page, role: DemoRole) {
  await page.goto("/");
  await expect(shown(page, "Explore the local demo")).toBeVisible();
  await press(page, role);
  await press(page, `Continue as ${role === "gn" ? "GN officer" : role}`);
  await expect(shown(page, /Hello,/)).toBeVisible();
  await page.screenshot({ path: `../docs/screenshots/${role}-home.png` });
}
async function logout(page: Page, staff = false) {
  await home(page);
  if (staff) {
    await tab(page, "Settings");
    await press(page, /My Profile/);
  } else await tab(page, "Profile");
  await press(page, "Log Out");
  await expect(shown(page, "Explore the local demo")).toBeVisible();
}
async function report(
  page: Page,
  description: string,
  checkValidation = false,
) {
  await home(page);
  await press(page, /Report an Issue/);
  await press(page, /Road Damage/);
  if (checkValidation) {
    await press(page, "Next");
    await expect(shown(page, "Select an option to continue.")).toBeVisible();
  }
  await page.getByRole("radio", { name: "Potholes", exact: true }).click();
  await press(page, "Next");
  await page.getByRole("radio", { name: "Colombo 03", exact: true }).click();
  await press(page, "Next");
  await page
    .getByRole("radio", { name: "Colombo Municipal Council", exact: true })
    .click();
  await press(page, "Next");
  await field(page, "Description").fill(description);
  await press(page, "Next");
  await field(page, "Address / Landmark").fill(
    "Temple Road evaluation location",
  );
  await field(page, "Latitude").fill("6.9002");
  await field(page, "Longitude").fill("79.8538");
  await press(page, "Confirm Location & Submit");
  await expect(shown(page, "Report Submitted!")).toBeVisible();
  return (await shown(page, /^#RO-/).textContent())!.slice(1);
}
async function openReport(page: Page, reference: string, staff = false) {
  await home(page);
  await tab(page, staff ? "Complaints" : "My Reports");
  await field(page, "Search reports...").fill(reference);
  await press(page, /Road Damage/);
}
test("FR1–FR4: persistence, assignment, progress, notification and feedback", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (e) => failures.push(e.message));
  await demoLogin(page, "citizen");
  const reference = await report(
    page,
    "Evaluation: pothole near Temple Road.",
    true,
  );
  await openReport(page, reference);
  await press(page, "Edit Report");
  await field(page, "Description").fill(
    "Evaluation updated: pothole near Temple Road.",
  );
  await press(page, "Save Changes");
  await expect(
    shown(page, "Evaluation updated: pothole near Temple Road."),
  ).toBeVisible();
  await page.reload();
  await expect(
    shown(page, "Evaluation updated: pothole near Temple Road."),
  ).toBeVisible();
  await logout(page);
  await demoLogin(page, "officer");
  await openReport(page, reference, true);
  await press(page, "Assign details");
  await page.getByRole("radio", { name: "Dilini Perera", exact: true }).click();
  await field(page, "Note").fill("Inspect this pothole.");
  await press(page, "Assign Complaint");
  await press(page, "In Progress");
  await press(page, "High");
  await press(page, "Save Progress");
  await expect(shown(page, "Changes saved.")).toBeVisible();
  await press(page, "Resolved");
  await press(page, "Save Progress");
  await press(page, "Assigned");
  await press(page, "Save Progress");
  await expect(
    shown(page, "A complaint cannot move backwards in its workflow."),
  ).toBeVisible();
  await logout(page, true);
  await demoLogin(page, "citizen");
  await press(page, /Check latest status updates/);
  await button(page, /Status updated/)
    .first()
    .click();
  await expect(shown(page, /is now Resolved\./)).toBeVisible();
  await press(page, "View Complaint");
  await expect(button(page, "Edit Report")).toHaveCount(0);
  await press(page, "Track Complaint");
  await field(page, "Comment").fill("Resolved quickly, thank you.");
  await press(page, "Submit Feedback");
  await expect(button(page, "Update Feedback")).toBeVisible();
  await page.screenshot({ path: "../docs/screenshots/complaint-timeline.png" });
  expect(failures).toEqual([]);
});
test("admin category and contact create/read/update/delete", async ({
  page,
}) => {
  await demoLogin(page, "admin");
  await tab(page, "Settings");
  await press(page, /Service Categories/);
  await press(page, /Add new category/);
  await field(page, "Category Name").fill("Evaluation category");
  await field(page, "Issue Types (one per line)").fill("Test issue\nOther");
  await press(page, "Save Category");
  await press(page, /Evaluation category/);
  await field(page, "Category Name").fill("Updated evaluation category");
  await press(page, "Save Category");
  await press(page, /Updated evaluation category/);
  await press(page, "Delete Category");
  await press(page, "Confirm deletion");
  await expect(button(page, /Updated evaluation category/)).toHaveCount(0);
  await home(page);
  await tab(page, "Settings");
  await press(page, /Contact Finder/);
  await press(page, "Add Contact");
  await field(page, "Department / Service").fill("Evaluation department");
  await field(page, "Phone").fill("0111234567");
  await field(page, "Email").fill("service@example.lk");
  await press(page, "Save Contact");
  await field(page, "Search department or service...").fill(
    "Evaluation department",
  );
  await press(page, "Edit");
  await field(page, "Department / Service").fill("Updated department");
  await press(page, "Save Contact");
  await field(page, "Search department or service...").fill(
    "Updated department",
  );
  await press(page, "Edit");
  await press(page, "Delete Contact");
  await press(page, "Confirm deletion");
  await expect(shown(page, "Updated department")).toHaveCount(0);
});
test("FR5: GN division visibility and read-only progress", async ({ page }) => {
  await demoLogin(page, "citizen");
  await page.evaluate(() => {
    const key = "@citizen-connect/data-v1";
    const data = JSON.parse(localStorage.getItem(key)!);
    data.complaints.push({
      ...data.complaints[0],
      id: "outside-division",
      reference: "OUTSIDE",
      division: "Division 04",
    });
    localStorage.setItem(key, JSON.stringify(data));
  });
  await logout(page);
  await demoLogin(page, "gn");
  await tab(page, "Complaints");
  await field(page, "Search reports...").fill("OUTSIDE");
  await expect(shown(page, "No reports match your search.")).toBeVisible();
  await field(page, "Search reports...").fill("WC0012");
  await press(page, /Water Complaint/);
  await expect(button(page, "Assign details")).toHaveCount(0);
  await press(page, "Track Complaint");
  await expect(button(page, "Save Progress")).toHaveCount(0);
});
test("user activation safeguards and persistent profile editing", async ({
  page,
}) => {
  await demoLogin(page, "admin");
  await tab(page, "Settings");
  await press(page, /Officer Management/);
  await press(page, "+ Add Officer");
  await field(page, "Name").fill("Evaluation Officer");
  await field(page, "Email").fill("evaluation@example.lk");
  await press(page, "Save User");
  await press(page, /Evaluation Officer/);
  await press(page, "Disabled");
  await press(page, "Save User");
  await press(page, "Disabled");
  await expect(button(page, /Evaluation Officer/)).toBeVisible();
  await press(page, /Evaluation Officer/);
  await press(page, "Active");
  await press(page, "Save User");
  await press(page, "All");
  await expect(button(page, /Evaluation Officer/)).toContainText("Active");
  await press(page, /Evaluation Officer/);
  await home(page);
  await tab(page, "Settings");
  await press(page, /User Management/);
  await field(page, "Search users...").fill("admin@demo.lk");
  await press(page, /Nimal Perera/);
  await press(page, "Disabled");
  await press(page, "Save User");
  await expect(
    shown(page, "You cannot disable or demote your own account."),
  ).toBeVisible();
  await home(page);
  await tab(page, "Settings");
  await press(page, /My Profile/);
  await press(page, /Edit Profile/);
  await field(page, "Full Name").fill("Admin Updated");
  await field(page, "Mobile Number").fill("0711111111");
  await press(page, "Save Changes");
  await page.reload();
  await expect(shown(page, "Admin Updated")).toBeVisible();
});
test("submitted report deletion and notification read/delete persistence", async ({
  page,
}) => {
  await demoLogin(page, "citizen");
  const reference = await report(
    page,
    "Deletion evaluation report near Temple Road.",
  );
  await openReport(page, reference);
  await press(page, "Delete Report");
  await press(page, "Keep report");
  await expect(button(page, "Delete Report")).toBeVisible();
  await press(page, "Delete Report");
  await press(page, "Confirm deletion");
  await page.reload();
  await field(page, "Search reports...").fill(reference);
  await expect(shown(page, "No reports match your search.")).toBeVisible();
  await home(page);
  await press(page, /Check latest status updates/);
  await press(page, /Status updated/);
  await expect(shown(page, /is now In Progress\./)).toBeVisible();
  await press(page, "Delete Notification");
  await page.reload();
  await expect(shown(page, "You have no notifications yet.")).toBeVisible();
});
