// E2E Tests for Discovery & Swipe Flow
import { test, expect } from '@playwright/test';

test.describe('Discovery Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');
    await expect(page).toHaveURL('/discover');
  });

  test('should display profiles in swipe stack', async ({ page }) => {
    await expect(page.locator('text=Découvrir')).toBeVisible();
    // Check that at least one profile card is visible
    await expect(page.locator('[data-testid="profile-card"]').first()).toBeVisible();
  });

  test('should swipe right (like) with button', async ({ page }) => {
    await page.click('button[aria-label="Liker"]');
    // Should show next profile
    await expect(page.locator('[data-testid="profile-card"]').first()).toBeVisible();
  });

  test('should swipe left (pass) with button', async ({ page }) => {
    await page.click('button[aria-label="Passer"]');
    // Should show next profile
    await expect(page.locator('[data-testid="profile-card"]').first()).toBeVisible();
  });

  test('should super like with button', async ({ page }) => {
    await page.click('button[aria-label="Super Like"]');
    // Should show next profile
    await expect(page.locator('[data-testid="profile-card"]').first()).toBeVisible();
  });

  test('should open profile detail on click', async ({ page }) => {
    await page.click('[data-testid="profile-card"]');
    await expect(page).toHaveURL(/\/profile\/[^/]+/);
  });

  test('should filter profiles', async ({ page }) => {
    await page.click('button:has-text("Filtres")');
    await expect(page.locator('text=Filtres de découverte')).toBeVisible();

    // Change age range
    await page.fill('[name="minAge"]', '20');
    await page.fill('[name="maxAge"]', '25');

    // Select gender
    await page.check('[name="genders"][value="female"]');
    await page.uncheck('[name="genders"][value="male"]');

    // Apply filters
    await page.click('button:has-text("Appliquer")');

    // Results should update
    await expect(page.locator('[data-testid="profile-card"]').first()).toBeVisible();
  });

  test('should show empty state when no profiles', async ({ page }) => {
    // This would require mocking or specific test data
    // For now, just verify the component handles empty state
    await expect(page.locator('text=Aucun profil à découvrir')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Likes Received Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');
    await page.goto('/likes');
  });

  test('should display received likes', async ({ page }) => {
    await expect(page.locator('text=Likes reçus')).toBeVisible();
    // Check for like cards
    await expect(page.locator('[data-testid="like-card"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should like back to create match', async ({ page }) => {
    await page.click('[data-testid="like-card"] button:has-text("Liked")');
    // Should show match notification
    await expect(page.locator('text=Nouveau Match')).toBeVisible({ timeout: 5000 });
  });
});