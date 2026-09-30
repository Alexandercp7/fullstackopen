const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

const validBlog = {
  title: 'Testing Node APIs with Supertest',
  author: 'Alex',
  url: 'https://example.com/testing-node-apis',
  likes: 5,
}

const initialUser = {
  username: 'root',
  name: 'Eduardo Canto',
  passwordHash: 'examplehash123',
}

const newUser = {
  username: 'alexdev',
  name: 'Alex',
  password: 'secretpassword',
}

const invalidUsers = {
  missingPassword: { username: 'nopass', name: 'Test User' },
  missingUsername: { name: 'Test User', password: 'validpassword' },
  shortUsername: { username: 'al', name: 'Short Username', password: 'validpassword' },
  shortPassword: { username: 'validuser', name: 'Short Password', password: '12' },
  duplicate: {
    username: 'root',
    name: 'Duplicate User',
    password: 'anotherpassword',
  },
}

const invalidBlogs = {
  missingTitle: {
    author: 'Alex',
    url: 'https://example.com/missing-title',
    likes: 3,
  },
  missingUrl: {
    title: 'Blog without URL',
    author: 'Alex',
    likes: 2,
  },
  missingLikes: {
    title: 'Blog without likes',
    author: 'Alex',
    url: 'https://example.com/no-likes',
  },
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb,
  validBlog,
  initialUser,
  newUser,
  invalidUsers,
  invalidBlogs,
}
