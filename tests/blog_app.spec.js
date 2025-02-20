const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Steph Curry',
        username: 'stcurry',
        password: '123'
      }
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByText('login')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.locator('input[name="Username"]').fill('stcurry')
      await page.locator('input[name="Password"]').fill('123')
      await page.getByText('login').click()

      await expect(page.getByText('Steph Curry logged in')).toBeVisible()
    })

    test.only('fails with wrong credentials', async ({ page }) => {
      await page.locator('input[name="Username"]').fill('wrongname')
      await page.locator('input[name="Password"]').fill('wrongpassword')
      await page.getByText('login').click()

      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })
})