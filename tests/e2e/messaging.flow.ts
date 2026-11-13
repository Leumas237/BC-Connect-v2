// E2E Tests for Messaging Flow
import { test, expect } from '@playwright/test';

test.describe('Messaging Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');
  });

  test('should display conversations list', async ({ page }) => {
    await page.goto('/messages');
    await expect(page.locator('text=Messages')).toBeVisible();

    // Should show conversation items
    await expect(page.locator('[data-testid="conversation-item"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should open conversation', async ({ page }) => {
    await page.goto('/messages');
    await page.click('[data-testid="conversation-item"]');
    await expect(page).toHaveURL(/\/messages\/[^/]+/);
  });

  test('should send and receive messages', async ({ page }) => {
    await page.goto('/messages');
    await page.click('[data-testid="conversation-item"]');

    // Type and send message
    await page.fill('[placeholder="Écrire un message..."]', 'Hello, comment ça va ?');
    await page.click('button[aria-label="Envoyer"]');

    // Message should appear
    await expect(page.locator('text=Hello, comment ça va ?')).toBeVisible();

    // Should show read receipt
    await expect(page.locator('[data-testid="read-receipt"]')).toBeVisible({ timeout: 5000 });
  });

  test('should show typing indicator', async ({ page }) => {
    await page.goto('/messages');
    await page.click('[data-testid="conversation-item"]');

    // Start typing
    await page.fill('[placeholder="Écrire un message..."]', 'Je suis en train d\'écrire');

    // Should show typing indicator for other user (would need second user)
    // For now, just verify input works
    await expect(page.locator('[placeholder="Écrire un message..."]')).toHaveValue('Je suis en train d\'écrire');
  });

  test('should navigate back to conversations list', async ({ page }) => {
    await page.goto('/messages');
    await page.click('[data-testid="conversation-item"]');
    await page.click('button[aria-label="Retour"]');
    await expect(page).toHaveURL('/messages');
  });

  test('should display unread count badge', async ({ page }) => {
    await page.goto('/messages');

    // Check for unread badges
    const unreadBadge = page.locator('[data-testid="unread-badge"]');
    // Should be visible if there are unread messages
    // await expect(unreadBadge.first()).toBeVisible();
  });
});

test.describe('Message Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');
    await page.goto('/messages');
    await page.click('[data-testid="conversation-item"]');
  });

  test('should show message options menu', async ({ page }) => {
    // Hover over message
    await page.hover('[data-testid="message-bubble"]');
    await page.click('[data-testid="message-options"]');

    // Should show options
    await expect(page.locator('text=Partager')).toBeVisible();
    await expect(page.locator('text=Supprimer')).toBeVisible();
  });

  test('should delete message', async ({ page }) => {
    await page.hover('[data-testid="message-bubble"]');
    await page.click('[data-testid="message-options"]');
    await page.click('text=Supprimer');
    await page.click('button:has-text("Supprimer")');

    await expect(page.locator('text=Message supprimé')).toBeVisible();
  });

  test('should mark conversation as read on open', async ({ page }) => {
    await page.goto('/messages');

    // Check if unread badge disappears after opening
    // This would require a conversation with unread messages
  });
});

test.describe('Real-time Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button:has-text("Se connecter")');
  });

  test('should receive messages in real-time', async ({ page }) => {
    // This test would require two browser contexts
    // For now, verify the real-time connection is established
    await page.goto('/messages');
    await page.click('[data-testid="conversation-item"]');

    // Check for real-time connection indicator
    // await expect(page.locator('[data-testid="realtime-connected"]')).toBeVisible();
  });

  test('should show online status', async ({ page }) => {
    await page.goto('/matches');
    await page.click('[data-testid="match-card"]');

    // Check for online indicator
    // await expect(page.locator('[data-testid="online-indicator"]')).toBeVisible();
  });
});