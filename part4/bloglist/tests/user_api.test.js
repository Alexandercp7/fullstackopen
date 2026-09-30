const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User(helper.initialUser)
    await user.save()
  })

  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const result = await api
      .post('/api/users')
      .send(helper.newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    assert.ok(usernames.includes(helper.newUser.username))
    assert.ok(!('passwordHash' in result.body))
  })

  test('creation fails with 400 if username or password is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    await api.post('/api/users').send(helper.invalidUsers.missingPassword).expect(400)
    await api.post('/api/users').send(helper.invalidUsers.missingUsername).expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with 400 if username or password is shorter than 3 chars', async () => {
    const usersAtStart = await helper.usersInDb()

    const res1 = await api
      .post('/api/users')
      .send(helper.invalidUsers.shortUsername)
      .expect(400)
    assert.ok(res1.body.error.includes('username must be at least 3 characters long'))

    const res2 = await api
      .post('/api/users')
      .send(helper.invalidUsers.shortPassword)
      .expect(400)
    assert.ok(res2.body.error.includes('password must be at least 3 characters long'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with 400 if username already exists', async () => {
    const usersAtStart = await helper.usersInDb()

    const result = await api
      .post('/api/users')
      .send(helper.invalidUsers.duplicate)
      .expect(400)

    assert.ok(result.body.error.includes('expected `username` to be unique'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
