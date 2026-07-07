// app/blog/[slug]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { blogPosts, states, cities } from '@/lib/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import ShareButtons from '@/components/blog/ShareButtons'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const db = getDb()

  const post = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.published, true)
      )
    )
    .limit(1)

  if (!post.length) return {}

  return generateSeoMetadata({
    title: post[0].metaTitle || post[0].title,
    description: post[0].metaDescription || post[0].excerpt || '',
    keywords: post[0].tags || [],
    canonical: `/blog/${post[0].slug}`,
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const db = getDb()

  const result = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      content: blogPosts.content,
      excerpt: blogPosts.excerpt,
      featuredImage: blogPosts.featuredImage,
      author: blogPosts.author,
      publishedAt: blogPosts.publishedAt,
      tags: blogPosts.tags,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
      stateName: states.name,
      stateSlug: states.slug,
      cityName: cities.name,
      citySlug: cities.slug,
    })
    .from(blogPosts)
    .leftJoin(states, eq(blogPosts.stateId, states.id))
    .leftJoin(cities, eq(blogPosts.cityId, cities.id))
    .where(
      and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.published, true)
      )
    )
    .limit(1)

  if (!result.length) notFound()

  const post = result[0]

  // Get related posts
  let relatedPosts: any[] = []

  if (post.tags && post.tags.length > 0) {
    try {
      const tagConditions = post.tags.map((tag: string) =>
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${blogPosts.tags}) AS t
          WHERE t = ${tag}
        )`
      )

      const whereCondition = tagConditions.length > 1
        ? sql`(${tagConditions.join(' OR ')})`
        : tagConditions[0]

      relatedPosts = await db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          publishedAt: blogPosts.publishedAt,
        })
        .from(blogPosts)
        .where(
          and(
            eq(blogPosts.published, true),
            sql`${blogPosts.id} != ${post.id}`,
            whereCondition
          )
        )
        .orderBy(sql`RANDOM()`)
        .limit(3)
    } catch (error) {
      console.error('Error fetching related posts:', error)
      relatedPosts = []
    }
  }

  if (relatedPosts.length === 0) {
    relatedPosts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.published, true),
          sql`${blogPosts.id} != ${post.id}`
        )
      )
      .orderBy(desc(blogPosts.publishedAt))
      .limit(3)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{post.title}</span>
      </nav>

      {/* Back Button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {/* Article Header */}
      <article>
        <div className="mb-8">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishedAt!).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {post.author && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
            )}
            {post.cityName && (
              <span className="flex items-center gap-2">
                <span>📍</span>
                <Link
                  href={`/${post.stateSlug}/${post.citySlug}`}
                  className="text-blue-600 hover:underline"
                >
                  {post.cityName}, {post.stateName}
                </Link>
              </span>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative h-96 mb-8 rounded-xl overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Share Section - Using Client Component */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <ShareButtons 
            title={post.title} 
            slug={post.slug} 
            excerpt={post.excerpt || ''} 
          />
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/blog/${related.slug}`}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="relative h-40">
                  {related.featuredImage ? (
                    <Image
                      src={related.featuredImage}
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-3xl">📄</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(related.publishedAt!).toLocaleDateString()}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                    {related.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}