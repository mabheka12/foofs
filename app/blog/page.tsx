// app/blog/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { blogPosts, states, cities } from '@/lib/db/schema'
import { desc, eq, sql, and, isNull } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Tag, Clock, ArrowRight } from 'lucide-react'

export const metadata = generateSeoMetadata({
  title: 'Roof Leak Repair Blog - Tips, Guides & Advice',
  description: 'Read expert articles, tips, and guides about roof leak repair, maintenance, and finding the right contractor for your needs.',
  keywords: ['roof leak repair blog', 'roofing tips', 'roof maintenance', 'contractor advice'],
  canonical: '/blog',
})

export default async function BlogPage() {
  const db = getDb()

  // Get published blog posts with author and location info
  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      featuredImage: blogPosts.featuredImage,
      author: blogPosts.author,
      publishedAt: blogPosts.publishedAt,
      tags: blogPosts.tags,
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
        eq(blogPosts.published, true),
        sql`${blogPosts.publishedAt} IS NOT NULL`
      )
    )
    .orderBy(desc(blogPosts.publishedAt))

  // Get popular tags
  const tagCounts = new Map<string, number>()
  for (const post of posts) {
    if (post.tags && Array.isArray(post.tags)) {
      for (const tag of post.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    }
  }
  
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Blog</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Roof Leak Repair Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Expert tips, guides, and advice on roof leak repair, maintenance, and finding the right contractor.
        </p>
      </div>

      {/* Featured Post */}
      {posts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
          <Link
            href={`/blog/${posts[0].slug}`}
            className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-64 md:h-full">
                {posts[0].featuredImage ? (
                  <Image
                    src={posts[0].featuredImage}
                    alt={posts[0].title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-6xl">🏠</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(posts[0].publishedAt!).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {posts[0].author || 'Admin'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">
                  {posts[0].title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {posts[0].excerpt}
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.slice(1).map((post) => (
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
                  <span className="text-4xl">🔧</span>
                </div>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="absolute top-3 left-3 flex gap-1">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {post.tags[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.publishedAt!).toLocaleDateString()}
                </span>
                {post.cityName && (
                  <span className="flex items-center gap-1">
                    <span>📍</span>
                    {post.cityName}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blog Posts Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Check back soon for expert articles and guides about roof leak repair.
          </p>
        </div>
      )}

      {/* Tags Section */}
      {sortedTags.length > 0 && (
        <div className="mt-12 bg-gray-50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Popular Topics</h2>
          <div className="flex flex-wrap gap-2">
            {sortedTags.map(([tag, count]) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition text-sm border border-gray-200"
              >
                #{tag} ({count})
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}