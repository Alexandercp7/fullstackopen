const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

let token = ''

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    await api.post('/api/users').send(helper.newUser)
    const loginResponse = await api.post('/api/login').send({
      username: helper.newUser.username,
      password: helper.newUser.password,
    })

    token = loginResponse.body.token
    await Blog.insertMany(helper.initialBlogs)
  })

  describe('viewing blogs', () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all initial blogs are returned', async () => {
      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('unique identifier property of blog posts is named id', async () => {
      const response = await api.get('/api/blogs')
      const blog = response.body[0]
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data and token', async () => {
      const blogsAtStart = await helper.blogsInDb()

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(helper.validBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)

      const titles = blogsAtEnd.map((blog) => blog.title)
      assert.ok(titles.includes(helper.validBlog.title))
    })

    test('defaults likes property to 0 if missing', async () => {
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(helper.invalidBlogs.missingLikes)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 0)
    })

    test('fails with status 400 if title or url is missing', async () => {
      const blogsAtStart = await helper.blogsInDb()

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(helper.invalidBlogs.missingTitle)
        .expect(400)

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(helper.invalidBlogs.missingUrl)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('fails with status 401 if token is not provided', async () => {
      const blogsAtStart = await helper.blogsInDb()

      await api.post('/api/blogs').send(helper.validBlog).expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status 204 if id and token are valid', async () => {
      const created = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(helper.validBlog)

      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = created.body

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      const ids = blogsAtEnd.map((blog) => blog.id)
      assert.ok(!ids.includes(blogToDelete.id))
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    })
  })

  describe('updating a blog', () => {
    test('updates likes of an existing blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedPayload = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1,
      }

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedPayload)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, updatedPayload.likes)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedInDb = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
      assert.strictEqual(updatedInDb.likes, updatedPayload.likes)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
