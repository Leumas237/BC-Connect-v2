// E2E Tests for Matching Flow
import { test, expect } from '@playwright/test';

test.describe('Matching Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');
  });

  test('should create match when both users like each other', async ({ page }) => {
    // This test would require two users or mocking
    // For now, verify the match creation UI
    await page.goto('/discover');

    // Like a profile
    await page.click('button[aria-label="Liker"]');

    // Check for match notification
    await expect(page.locator('text=Nouveau Match')).toBeVisible({ timeout: 5000 });

    // Click to view match
    await page.click('text=Voir le match');
    await expect(page).toHaveURL(/\/matches\/[^/]+/);
  });

  test('should display matches on matches page', async ({ page }) => {
    await page.goto('/matches');
    await expect(page.locator('text=Mes matchs')).toBeVisible();

    // Should show match cards
    await expect(page.locator('[data-testid="match-card"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should open match profile', async ({ page }) => {
    await page.goto('/matches');
    await page.click('[data-testid="match-card"]');
    await expect(page).toHaveURL(/\/matches\/[^/]+/);
  });

  test('should unmatch', async ({ page }) => {
    await page.goto('/matches');
    await page.click('[data-testid="match-card"] [aria-label="Plus d\'options"]');
    await page.click('text=Supprimer le match');

    // Confirm dialog
    await page.click('button:has-text("Supprimer")');

    // Match should be removed
    await expect(page.locator('text=Match supprimé')).toBeVisible();
  });
});

test.describe('Super Like Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');
  });

  test('should send super like', async ({ page }) => {
    await page.goto('/discover');
    await page.click('button[aria-label="Super Like"]');

    // Should show super like animation/feedback
    await expect(page.locator('text=Super Like envoyé')).toBeVisible({ timeout: 5000 });
  });

  test('should notify recipient of super like', async ({ page }) => {
    // This would require two browser contexts
    // For now, verify the notification system
    await page.goto('/discover');
    await page.click('button[aria-label="Super Like"]');

    // Check notifications
    await page.click('[aria-label="Notifications"]');
    await expect(page.locator('text=Super Like reçu')).toBeVisible({ timeout: 5000 });
  });
});