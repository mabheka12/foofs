// components/blog/ShareButtons.tsx
'use client'

import { Share2 } from 'lucide-react'

interface ShareButtonsProps {
  title: string
  slug: string
  excerpt?: string
}

export default function ShareButtons({ title, slug, excerpt }: ShareButtonsProps) {
  const url = typeof window !== 'undefined' 
    ? window.location.href 
    : `https://roofleakrepaird.com/blog/${slug}`

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: excerpt || '',
        url: url,
      }).catch(() => {
        // User cancelled or sharing failed
      })
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-medium text-gray-700">Share this article:</span>
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-gray-100 rounded-lg hover:bg-blue-50 transition"
          aria-label="Share on Twitter"
        >
          <span className="text-lg">🐦</span>
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-gray-100 rounded-lg hover:bg-blue-50 transition"
          aria-label="Share on Facebook"
        >
          <span className="text-lg">📘</span>
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-gray-100 rounded-lg hover:bg-blue-50 transition"
          aria-label="Share on LinkedIn"
        >
          <span className="text-lg">💼</span>
        </a>
      </div>
    </div>
  )
}