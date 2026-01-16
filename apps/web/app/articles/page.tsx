import Link from "next/link"
import { getAllArticles, type ArticleMeta } from "@/lib/articles"
import { ArrowRight, Calendar, Clock, Tag, BookOpen, Lightbulb, Code } from "lucide-react"

const categoryConfig = {
  project: { label: "Case Study", icon: BookOpen, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  insights: { label: "Insights", icon: Lightbulb, color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  technical: { label: "Technical", icon: Code, color: "text-lime-400 bg-lime-400/10 border-lime-400/30" },
}

function ArticleCard({ article }: { article: ArticleMeta }) {
  const config = categoryConfig[article.category]
  const Icon = config.icon

  return (
    <Link href={`/articles/${article.slug}`}>
      <article className="group h-full p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-accent/40 transition-all duration-300 hover:bg-white/[0.04]">
        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
          {article.featured && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 rounded-full">
              Featured
            </span>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h2>
        
        <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-3">
          {article.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.slice(0, 3).map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/50 bg-white/5 rounded-md">
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-accent group-hover:gap-3 transition-all">
          Read article
          <ArrowRight className="w-4 h-4" />
        </div>
      </article>
    </Link>
  )
}

export default function ArticlesPage() {
  const articles = getAllArticles()
  const featured = articles.filter(a => a.featured)
  const regular = articles.filter(a => !a.featured)

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Articles & Insights
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Thoughts on building production AI systems, lessons from the field, 
            and answers to questions clients frequently ask.
          </p>
        </div>

        {/* Featured Articles */}
        {featured.length > 0 && (
          <section className="mb-16">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-6">Featured</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-6">All Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regular.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40">No articles yet. Check back soon!</p>
          </div>
        )}
      </div>
    </main>
  )
}

export const metadata = {
  title: "Articles & Insights | per4ex.org",
  description: "Thoughts on building production AI systems, case studies, and industry insights from an AI engineer.",
}
