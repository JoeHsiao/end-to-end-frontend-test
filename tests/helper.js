const createUser = async (request, name, username, password) => {
  await request.post('http://localhost:3003/api/users', {
    data: {
      name: name,
      username: username,
      password: password
    }
  })
}

const createBlogWith = async (page, title, author, url) => {
  await page.getByText('new blog').click()
  await page.getByText('create new', { exact: true }).waitFor()
  await page.locator('input[id="title"]').fill(title)
  await page.locator('input[id="author"]').fill(author)
  await page.locator('input[id="url"]').fill(url)
  await page.getByText('create', { exact: true }).click()
  await page.getByRole('button', { name: 'new blog' }).waitFor()
}

export { createUser, createBlogWith }