import { test, expect } from '@playwright/test';

test.describe('NEXUS Feature Validation Suite', () => {
  // Automatically bypass login before each test is executed
  test.beforeEach(async ({ page }) => {
    // Navigate to the authentication gateway
    await page.goto('/login');

    // Locate the Student quick access bypass button
    // It contains the text "Student" (with a Zap icon)
    const studentBypassBtn = page.getByRole('button', { name: 'Student', exact: true });
    await expect(studentBypassBtn).toBeVisible();
    await studentBypassBtn.click();

    // Wait for successful redirection to the main dashboard
    await page.waitForURL('**/');
  });

  /**
   * 1. Apply Now Routing Gateway (Feature by Koushik)
   * Validates that clicking "Apply Now" on a company card launches the external portal
   * in a new browser tab/page without modifying the current tab's URL.
   */
  test('Apply Now Routing Gateway', async ({ page }) => {
    // Navigate to Placement Hub
    await page.goto('/placement');

    // Locate the first company card that has an active application URL (indicated by an "Apply Now" button)
    // We target company cards wrapped in anchor links matching 'a.group'
    const companyCard = page.locator('a.group').filter({
      has: page.getByRole('button', { name: 'Apply Now' })
    }).first();

    await expect(companyCard).toBeVisible();

    // Find the "Apply Now" button inside the selected company card
    const applyButton = companyCard.getByRole('button', { name: 'Apply Now' });

    // Click the button and capture the new browser tab/page event
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      applyButton.click(),
    ]);

    // Assert that the new tab's URL is external and valid
    await newPage.waitForLoadState();
    const externalUrl = newPage.url();
    expect(externalUrl).toMatch(/^https?:\/\//);
    expect(externalUrl).not.toContain('localhost:3000');

    // Clean up by closing the new tab
    await newPage.close();
  });

  /**
   * 2. ProfileSync to LMS Bridge (Features by Dhrithi & Yudhisthir)
   * Validates that clicking a missing skill badge opens the learning pathway dropdown menu,
   * showing all target LMS links (YouTube, Coursera, LeetCode), and that event propagation is prevented.
   */
  test('ProfileSync to LMS Bridge', async ({ page }) => {
    // Navigate to Placement Hub
    await page.goto('/placement');

    // Switch to the ProfileSync Analyzer tab
    const profileSyncTab = page.getByRole('button', { name: 'ProfileSync Analyzer' });
    await profileSyncTab.click();

    // Locate the first "Gaps Detected" container containing missing skill badges
    const gapsSection = page.locator('div').filter({ hasText: /Gaps Detected/ }).first();
    await expect(gapsSection).toBeVisible();

    // Retrieve the first missing skill badge button inside the gaps section
    const missingBadge = gapsSection.getByRole('button').first();
    await expect(missingBadge).toBeVisible();

    const initialUrl = page.url();

    // Trigger the LMS dropdown by clicking the skill badge
    await missingBadge.click();

    // Assert dropdown menu visibility (uses Radix menu primitive role)
    const dropdownMenu = page.getByRole('menu');
    await expect(dropdownMenu).toBeVisible();

    // Assert that the three target LMS routes are rendered correctly inside the menu
    const youtubeItem = dropdownMenu.getByRole('menuitem', { name: 'Watch on YouTube' });
    const courseraItem = dropdownMenu.getByRole('menuitem', { name: 'Coursera Certificates' });
    const leetcodeItem = dropdownMenu.getByRole('menuitem', { name: 'Practice on LeetCode' });

    await expect(youtubeItem).toBeVisible();
    await expect(courseraItem).toBeVisible();
    await expect(leetcodeItem).toBeVisible();

    // CRITICAL: Assert that current page URL has NOT changed (proves stopPropagation prevented parent <Link> trigger)
    expect(page.url()).toBe(initialUrl);
  });

  /**
   * 3. Offer Optimizer Simulator (Feature by Jashwanth)
   * Validates input range adjustments, select dropdown selections for location and stack,
   * rendering of disposable income calculations, and display of the winner recommendation badge.
   */
  test('Offer Optimizer Simulator', async ({ page }) => {
    // Navigate to Placement Hub
    await page.goto('/placement');

    // Navigate to the Offer Optimizer tab/view
    const optimizerTab = page.getByRole('button', { name: 'Offer Optimizer' });
    await optimizerTab.click();

    // Locate individual offer input panels
    const offerAPanel = page.locator('div').filter({ has: page.locator('span', { hasText: 'OFFER A' }) }).first();
    const offerBPanel = page.locator('div').filter({ has: page.locator('span', { hasText: 'OFFER B' }) }).first();

    await expect(offerAPanel).toBeVisible();
    await expect(offerBPanel).toBeVisible();

    // Select the Headline CTC and Base Salary range inputs in each card (1st input: Headline CTC, 2nd input: Base Salary)
    const headlineA = offerAPanel.locator('input[type="range"]').nth(0);
    const baseA = offerAPanel.locator('input[type="range"]').nth(1);

    const headlineB = offerBPanel.locator('input[type="range"]').nth(0);
    const baseB = offerBPanel.locator('input[type="range"]').nth(1);

    // Adjust offer criteria with distinct numeric values
    await headlineA.fill('20');
    await baseA.fill('16');
    await headlineB.fill('25');
    await baseB.fill('18');

    // Confirm range input values updated the DOM texts successfully
    await expect(offerAPanel.getByText('20 Lakhs')).toBeVisible();
    await expect(offerAPanel.getByText('16 Lakhs')).toBeVisible();
    await expect(offerBPanel.getByText('25 Lakhs')).toBeVisible();
    await expect(offerBPanel.getByText('18 Lakhs')).toBeVisible();

    // Locate location/cost select and stack select (1st select: City Cost, 2nd select: Tech Stack)
    const citySelectA = offerAPanel.locator('select').nth(0);
    const techSelectA = offerAPanel.locator('select').nth(1);

    const citySelectB = offerBPanel.locator('select').nth(0);
    const techSelectB = offerBPanel.locator('select').nth(1);

    // Adjust dropdown selectors to create financial and career divergence
    await citySelectA.selectOption('tier3'); // Tier-3 Low Cost
    await techSelectA.selectOption('modern'); // Modern Stack (20% YoY Growth)

    await citySelectB.selectOption('tier1'); // Tier-1 High Cost
    await techSelectB.selectOption('legacy'); // Legacy Stack (4% YoY Growth)

    // Assert that the calculated output fields render and are loaded
    const disposableIncomeHeader = page.getByRole('heading', { name: 'Estimated Monthly Disposable Income' });
    await expect(disposableIncomeHeader).toBeVisible();

    const disposableIncomeA = page.locator('span.font-mono').nth(0);
    const disposableIncomeB = page.locator('span.font-mono').nth(1);

    await expect(disposableIncomeA).toBeVisible();
    await expect(disposableIncomeB).toBeVisible();

    const textA = await disposableIncomeA.innerText();
    const textB = await disposableIncomeB.innerText();

    expect(textA.trim()).not.toBe('');
    expect(textB.trim()).not.toBe('');
    expect(textA).toContain('/mo');
    expect(textB).toContain('/mo');

    // Assert that the "Winning Offer" badge/recommendation text has updated and is visible
    const winningBadge = page.getByText('WINNING RECOMMENDATION');
    await expect(winningBadge).toBeVisible();

    const winnerHeading = page.locator('h4:has-text("OFFER")');
    await expect(winnerHeading).toBeVisible();
  });

  /**
   * 4. Interview Intelligence Vault (Feature by Nishanth)
   * Validates filling and submitting the interview sharing form, and asserts
   * that the newly broadcasted card displays correctly inside the alumni prep grid.
   */
  test('Interview Intelligence Vault', async ({ page }) => {
    // Navigate to Placement Hub
    await page.goto('/placement');

    // Switch to the Interview Intelligence tab
    const vaultTab = page.getByRole('button', { name: 'Interview Intelligence' });
    await vaultTab.click();

    // Populate prep resource submission form fields
    await page.getByPlaceholder('e.g. Rahul Sharma').fill('Rahul Sharma');
    await page.getByPlaceholder('e.g. Microsoft').fill('Microsoft');

    // Select LeetCode from the resource type select dropdown
    const typeSelect = page.locator('form select');
    await typeSelect.selectOption('leetcode');

    // Provide target resource URL
    await page.getByPlaceholder('https://example.com/resource').fill('https://leetcode.com/discuss/interview-question/123456');

    // Fill in the description with our search query string
    await page.getByPlaceholder('Detail the interview rounds, questions asked, or general advice...').fill('E2E Test Description');

    // Broadcast submission
    await page.getByRole('button', { name: 'Broadcast to Vault' }).click();

    // Verify the data grid updates automatically to render the new resource containing our unique description
    const newResourceCard = page.locator('p', { hasText: 'E2E Test Description' });
    await expect(newResourceCard).toBeVisible();
  });
});
