import { createClient } from '@/lib/supabase/server'
import { BlogCard } from '@/components/blog/blog-card'
import { getTranslations } from 'next-intl/server'

export default async function BlogPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false })

  const t = await getTranslations('BlogPage')

  return (
    <div className="max-w-7xl mx-auto flex flex-col items-center px-4 md:px-6 py-12 md:py-24">
      <h1 className="text-3xl font-bold tracking-tight mb-6">{t('title')}</h1>
      <p className="text-muted-foreground mb-8 max-w-3xl text-center">{t('subtitle')}</p>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts?.map(post => <BlogCard key={post.id} post={post} />)}
        </div>
      </div>
    </div>
  )
}
