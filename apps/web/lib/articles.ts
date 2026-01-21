import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

export interface ArticleMeta {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  readTime: string
  category: 'project' | 'insights' | 'technical'
  featured?: boolean
}

export interface Article extends ArticleMeta {
  content: string
}

const articlesDirectory = path.join(process.cwd(), process.env.NODE_ENV === 'production' ? 'content/articles' : '../../content/articles')

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(articlesDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(articlesDirectory)
  const articles = fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map(fileName => {
      const slug = fileName.replace(/\.mdx$/, '')
      const fullPath = path.join(articlesDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      const stats = readingTime(content)

      return {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        description: data.description || '',
        tags: data.tags || [],
        readTime: stats.text,
        category: data.category || 'insights',
        featured: data.featured || false,
      } as ArticleMeta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return articles
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const stats = readingTime(content)

    return {
      slug,
      title: data.title || slug,
      date: data.date || new Date().toISOString(),
      description: data.description || '',
      tags: data.tags || [],
      readTime: stats.text,
      category: data.category || 'insights',
      featured: data.featured || false,
      content,
    }
  } catch {
    return null
  }
}

export function getArticlesByCategory(category: ArticleMeta['category']): ArticleMeta[] {
  return getAllArticles().filter(article => article.category === category)
}

export function getFeaturedArticles(): ArticleMeta[] {
  return getAllArticles().filter(article => article.featured)
}
