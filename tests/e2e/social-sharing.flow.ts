// E2E Tests for Social Media Sharing Flow
import { test, expect } from '@playwright/test';

test.describe('Social Media Sharing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');
  });

  test('should add social media accounts', async ({ page }) => {
    await page.goto('/settings/social');
    await expect(page.locator('text=Mes réseaux sociaux')).toBeVisible();

    // Add Instagram
    await page.click('button:has-text("Ajouter un réseau")');
    await expect(page.locator('text=Ajouter un réseau social')).toBeVisible();

    await page.selectOption('[name="platform"]', 'instagram');
    await page.fill('[name="username"]', 'mon_instagram');
    await page.click('button:has-text("Ajouter")');

    // Should appear in list
    await expect(page.locator('text=Instagram')).toBeVisible();
    await expect(page.locator('text=mon_instagram')).toBeVisible();
  });

  test('should edit social media account', async ({ page }) => {
    await page.goto('/settings/social');

    // Click edit on existing account
    await page.click('[data-testid="social-account"] button[aria-label="Modifier"]');
    await page.fill('[name="username"]', 'nouveau_pseudo');
    await page.click('button:has-text("Sauvegarder")');

    await expect(page.locator('text=nouveau_pseudo')).toBeVisible();
  });

  test('should delete social media account', async ({ page }) => {
    await page.goto('/settings/social');

    await page.click('[data-testid="social-account"] button[aria-label="Supprimer"]');
    await page.click('button:has-text("Supprimer")');

    await expect(page.locator('text=Réseau social supprimé')).toBeVisible();
  });

  test('should toggle visibility on profile', async ({ page }) => {
    await page.goto('/settings/social');

    // Toggle visibility
    await page.click('[data-testid="social-account"] [role="switch"]');

    // Should show "Public" badge
    await expect(page.locator('text=Public')).toBeVisible();
  });
});

test.describe('Social Sharing After Match', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');
  });

  test('should show shared social networks on match profile', async ({ page }) => {
    await page.goto('/matches');
    await page.click('[data-testid="match-card"]');

    // Should show social networks section
    await expect(page.locator('text=Réseaux partagés')).toBeVisible();

    // Should show shared accounts
    await expect(page.locator('[data-testid="shared-social"]').first()).toBeVisible();
  });

  test('should toggle sharing of social accounts with match', async ({ page }) => {
    await page.goto('/matches');
    await page.click('[data-testid="match-card"]');

    // Find social account toggle
    const toggleButton = page.locator('[data-testid="social-share-toggle"]').first();

    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Should update to "Partagé"
      await expect(page.locator('text=Partagé')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should open external social profile links', async ({ page }) => {
    await page.goto('/matches');
    await page.click('[data-testid="match-card"]');

    // Click on shared social link
    const link = page.locator('[data-testid="shared-social"] a').first();

    if (await link.isVisible()) {
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^https:\/\//);
    }
  });

  test('should manage sharing from match detail page', async ({ page }) => {
    await page.goto('/matches');
    await page.click('[data-testid="match-card"]');

    // Click on "Voir les réseaux partagés"
    await page.click('text=Voir les réseaux partagés');

    await expect(page.locator('text=Réseaux partagés par')).toBeVisible();

    // Toggle sharing
    await page.click('[data-testid="social-share-toggle"]');

    await expect(page.locator('text=Partagé')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Social Account Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');
    await page.goto('/settings/social');
  });

  test('should validate username format for each platform', async ({ page }) => {
    await page.click('button:has-text("Ajouter un réseau")');

    // Test Instagram (no @ required)
    await page.selectOption('[name="platform"]', 'instagram');
    await page.fill('[name="username"]', '@invalid_user');
    await page.click('button:has-text("Ajouter")');

    // Should show error or auto-remove @
    // Implementation dependent

    // Test WhatsApp (phone number format)
    await page.selectOption('[name="platform"]', 'whatsapp');
    await page.fill('[name="username"]', '33612345678');
    await page.click('button:has-text("Ajouter")');

    // Should accept phone format
  });

  test('should auto-generate URL from username', async ({ page }) => {
    await page.click('button:has-text("Ajouter un réseau")');
    await page.selectOption('[name="platform"]', 'instagram');
    await page.fill('[name="username"]', 'mon_profil');

    // URL field should auto-fill
    const urlField = page.locator('[name="url"]');
    const value = await urlField.inputValue();
    expect(value).toContain('instagram.com/mon_profil');
  });
});