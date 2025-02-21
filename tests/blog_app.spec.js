const { test, expect, beforeEach, describe } = require('@playwright/test')
const { createUser, createBlogWith, loginWith } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await createUser(request, 'Steph Curry', 'stcurry', '123')
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByText('login')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'stcurry', '123')
      await expect(page.getByText('Steph Curry logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'wrongname', 'wrongpassword')
      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      loginWith(page, 'stcurry', '123')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlogWith(page, 'how to shoot basketball', 'Steph Curry', 'howtoshootbasketball.com')
      await expect(page.getByText('how to shoot basketball Steph')).toBeVisible()
    })

    describe('When there is a blog', () => {
      beforeEach(async ({ page }) => {
        await createBlogWith(page, "testing title", "testing author", "testing url")
      })

      test('blogs can be liked', async ({ page }) => {
        await page.getByText('view', { exact: true }).click()
        await page.getByText('likes 0 like', { exact: true }).waitFor()
        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes 1 like', { exact: true })).toBeVisible()
      })

      test('blogs can be removed', async ({ page }) => {
        await page.getByText('view', { exact: true }).click()
        await page.getByText('remove', { exact: true }).waitFor()

        page.on('dialog', async dialog => {
          if (dialog.type() === 'confirm') {
            await dialog.accept()
          }
        })

        await page.getByText('remove', { exact: true }).click()
        await page.getByRole('button', { name: 'new blog' }).waitFor()
        await expect(page.getByText('testing title testing author')).not.toBeVisible()
      })

      test('the remove button is not shown to other users', async ({ page, request }) => {
        await createUser(request, 'User Name2', 'username2', 'password2')
        await page.getByRole('button', { name: 'logout' }).click()
        await page.getByText('Log in to application').waitFor()

        await page.locator('input[name="Username"]').fill('username2')
        await page.locator('input[name="Password"]').fill('password2')
        await page.getByRole('button', { name: 'login' }).click()

        await expect(page.getByText('User Name2 logged in')).toBeVisible()
        await page.getByText('view', { exact: true }).click()
        await page.getByRole('button', { name: 'like' }).waitFor()
        await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
      })
    })

    describe('when there are multiple blogs', () => {
      beforeEach(async ({ page }) => {
        await createBlogWith(page, "title1", "author1", "url1")
        await createBlogWith(page, "title2", "author2", "url2")
        await createBlogWith(page, "title3", "author3", "url3")
      })
      test('blogs are ordered by likes', async ({ page }) => {
        const viewDivForTitle1 = page.getByText('title1 author1 view')
        await viewDivForTitle1.getByRole('button', { name: 'view' }).click()
        const likeButtonForTitle1 = page.locator('div:text-is("title1") >> .. >> button:text-is("like")');
        await likeButtonForTitle1.click()

        const viewDivForTitle2 = page.getByText('title2 author2 view')
        await viewDivForTitle2.getByRole('button', { name: 'view' }).click()
        const likeButtonForTitle2 = page.locator('div:text-is("title2") >> .. >> button:text-is("like")');
        await likeButtonForTitle2.click()
        await likeButtonForTitle2.click()
        await likeButtonForTitle2.click()

        const viewDivForTitle3 = page.getByText('title3 author3 view')
        await viewDivForTitle3.getByRole('button', { name: 'view' }).click()
        const likeButtonForTitle3 = page.locator('div:text-is("title3") >> .. >> button:text-is("like")');
        await likeButtonForTitle3.click()
        await likeButtonForTitle3.click()

        await page.reload()
        await page.getByText('title1 author1 view').waitFor()

        const blogs = await page.locator('text=/title\\d author\\d view/').allTextContents()
        expect(blogs).toEqual(['title2 author2 view', 'title3 author3 view', 'title1 author1 view'])
      })
    })
  })

})