// E2E Tests for Registration Flow
import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should complete full registration flow', async ({ page }) => {
    // Step 1: Personal Information
    await expect(page.locator('text=Informations')).toBeVisible();
    await page.fill('[name="first_name"]', 'Jean');
    await page.fill('[name="last_name"]', 'Dupont');
    await page.fill('[name="email"]', 'jean.dupont@iut-fv.edu.cm');
    await page.fill('[name="date_of_birth"]', '2000-01-01');
    await page.selectOption('[name="gender"]', 'male');
    await page.selectOption('[name="institution"]', 'iut-fv-bandjoun');
    await page.click('button:has-text("Étape suivante")');

    // Step 2: Security
    await expect(page.locator('text=Sécurité')).toBeVisible();
    await page.fill('[name="password"]', 'Password123');
    await page.fill('[name="confirm_password"]', 'Password123');
    await page.click('button:has-text("Étape suivante")');

    // Step 3: Validation
    await expect(page.locator('text=Validation')).toBeVisible();
    await page.check('[name="terms_accepted"]');
    await page.check('[name="privacy_accepted"]');
    await page.click('button:has-text("Créer mon compte")');

    // Should redirect to login or verification page
    await expect(page).toHaveURL(/.*login|verification/);
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    await page.fill('[name="first_name"]', 'J');
    await page.fill('[name="email"]', 'invalid-email');
    await page.fill('[name="password"]', 'weak');
    await page.fill('[name="confirm_password"]', 'different');
    await page.fill('[name="date_of_birth"]', '2015-01-01');
    await page.click('button:has-text("Étape suivante")');

    await expect(page.locator('text=Le prénom est requis')).toBeVisible();
    await expect(page.locator('text=Format d\'email invalide')).toBeVisible();
    await expect(page.locator('text=Minimum 8 caractères')).toBeVisible();
    await expect(page.locator('text=Les mots de passe ne correspondent pas')).toBeVisible();
    await expect(page.locator('text=Vous devez avoir au moins 18 ans')).toBeVisible();
  });

  test('should navigate back and forth between steps', async ({ page }) => {
    await page.fill('[name="first_name"]', 'Jean');
    await page.fill('[name="last_name"]', 'Dupont');
    await page.fill('[name="email"]', 'jean.dupont@iut-fv.edu.cm');
    await page.fill('[name="date_of_birth"]', '2000-01-01');
    await page.selectOption('[name="gender"]', 'male');
    await page.selectOption('[name="institution"]', 'iut-fv-bandjoun');
    await page.click('button:has-text("Étape suivante")');

    await expect(page.locator('text=Sécurité')).toBeVisible();
    await page.click('button:has-text("Retour")');
    await expect(page.locator('text=Informations')).toBeVisible();
    await expect(page.locator('[name="first_name"]')).toHaveValue('Jean');
  });
});

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');

    await expect(page).toHaveURL('/discover');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button:has-text("Se connecter")');

    await expect(page.locator('text=Email ou mot de passe incorrect')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.fill('[name="password"]', 'Password123');
    await expect(page.locator('[name="password"]')).toHaveAttribute('type', 'password');
    await page.click('button[aria-label="Afficher le mot de passe"]');
    await expect(page.locator('[name="password"]')).toHaveAttribute('type', 'text');
    await page.click('button[aria-label="Masquer le mot de passe"]');
    await expect(page.locator('[name="password"]')).toHaveAttribute('type', 'password');
  });
});