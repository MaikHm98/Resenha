import { expect, test } from '@playwright/test'

test('carrega a rota publica de login', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: /entrar em campo/i })).toBeVisible()
})
