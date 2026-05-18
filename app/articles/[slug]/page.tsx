import { notFound } from "next/navigation"
import Link from "next/link"
import { getAllArticles, getArticleBySlug } from "@/lib/articles"
import { ArrowLeft, Calendar, Clock, Tag, BookOpen, Lightbulb, Code } from "@phosphor-icons/react/ssr"
import { ArticleContent } from "@/components/article-content"
import type { Metadata } from "next"

const categoryConfig = {
  project: { label: "Case Study", icon: BookOpen, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  insights: { label: "Insights", icon: Lightbulb, color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  technical: { label: "Technical", icon: Code, color: "text-lime-400 bg-lime-400/10 border-lime-400/30" },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = getAllArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  
  if (!article) {
    return { title: "Article Not Found" }
  }

  return {
    title: `${article.title} | supercore.tech`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const config = categoryConfig[article.category]
  const Icon = config.icon

  return (
    <main className="min-h-screen pt-32 pb-20">
      <article className="max-w-3xl mx-auto px-6">
        {/* Back Link */}
        <Link 
          href="/articles"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${config.color}`}>
              <Icon className="w-3.5 h-3.5" />
              {config.label}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {article.title}
          </h1>

          <p className="text-xl text-white/60 mb-8">
            {article.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white/40 pb-8 border-b border-white/10">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
          </div>
        </header>

        {/* Content */}
        <ArticleContent content={article.content} />

        {/* Tags */}
        <footer className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/60 bg-white/5 rounded-lg border border-white/10">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </footer>

        {/* CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
          <h3 className="text-xl font-bold text-white mb-2">Interested in working together?</h3>
          <p className="text-white/60 mb-4">Let&apos;s discuss how I can help you build production-ready AI systems.</p>
          <Link 
            href="/connect"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Start a Conversation
          </Link>
        </div>
      </article>
    </main>
  )
}
