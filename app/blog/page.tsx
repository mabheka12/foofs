// app/blog/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'

export async function generateMetadata() {
  return generateSeoMetadata({
    title: 'Roofing Blog - Tips, Guides, and Advice',
    description: 'Read expert articles on roof leak repair, maintenance, and roofing tips. Stay informed with the latest roofing advice and industry insights.',
    keywords: ['roofing blog', 'roof repair tips', 'roof maintenance', 'roofing advice'],
    canonical: '/blog',
  })
}

export default async function BlogPage() {
  const db = getDb()

  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      featuredImage: blogPosts.featuredImage,
      publishedAt: blogPosts.publishedAt,
      tags: blogPosts.tags,
      author: blogPosts.author,
      city: blogPosts.city,
      state: blogPosts.state,
    })
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Blog</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Roofing Blog & Tips
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Expert advice on roof leak repair, maintenance, and everything you need to know about keeping your roof in top condition.
        </p>
      </div>

      {/* Blog Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No blog posts found.</p>
          <p className="text-gray-500 mt-2">Check back later for new articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="relative h-48">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-4xl">📄</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="text-xs text-gray-400">+{post.tags.length - 2}</span>
                    )}
                  </div>
                )}
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>
                    {new Date(post.publishedAt!).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {post.author && <span>By {post.author}</span>}
                  {post.city && post.state && (
                    <span>{post.city}, {post.state}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}