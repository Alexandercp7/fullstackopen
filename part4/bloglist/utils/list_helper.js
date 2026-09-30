const dummy = () => 1

const totalLikes = (blogs) =>
  blogs.reduce((sum, blog) => sum + blog.likes, 0)

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const top = blogs.reduce((best, current) =>
    current.likes > best.likes ? current : best
  )

  return {
    title: top.title,
    author: top.author,
    likes: top.likes,
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const counts = new Map()
  for (const blog of blogs) {
    counts.set(blog.author, (counts.get(blog.author) || 0) + 1)
  }

  let topAuthor = null
  let maxBlogs = -1
  for (const [author, count] of counts.entries()) {
    if (count > maxBlogs) {
      topAuthor = author
      maxBlogs = count
    }
  }

  return { author: topAuthor, blogs: maxBlogs }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const likesByAuthor = new Map()
  for (const blog of blogs) {
    likesByAuthor.set(blog.author, (likesByAuthor.get(blog.author) || 0) + blog.likes)
  }

  let topAuthor = null
  let maxLikes = -1
  for (const [author, likes] of likesByAuthor.entries()) {
    if (likes > maxLikes) {
      topAuthor = author
      maxLikes = likes
    }
  }

  return { author: topAuthor, likes: maxLikes }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
