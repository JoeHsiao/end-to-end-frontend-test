const createBlogWith = async (page, title, author, url) => {
  await page.getByText('new blog').click()
  await page.getByText('create new', { exact: true }).waitFor()
  await page.locator('input[id="title"]').fill(title)
  await page.locator('input[id="author"]').fill(author)
  await page.locator('input[id="url"]').fill(url)
  await page.getByText('create', { exact: true }).click()
  await page.getByRole('button', { name: 'view' }).waitFor()
}

export { createBlogWith }