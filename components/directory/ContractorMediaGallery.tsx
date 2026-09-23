import {
  asc,
  eq,
  and,
} from 'drizzle-orm'

import {
  getDb,
} from '@/lib/db'

import {
  contractorMedia,
} from '@/lib/db/ownerSchema'


export async function ContractorMediaGallery({
  contractorId,
  contractorName,
}: {
  contractorId: number
  contractorName: string
}) {
  const db = getDb()

  const media =
    await db
      .select()
      .from(
        contractorMedia
      )
      .where(
        and(
          eq(
            contractorMedia.contractorId,
            contractorId
          ),
          eq(
            contractorMedia.status,
            'approved'
          )
        )
      )
      .orderBy(
        asc(
          contractorMedia.sortOrder
        ),
        asc(
          contractorMedia.createdAt
        )
      )

  if (!media.length) {
    return null
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Photos
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {media.map(
          (item) => (
            <figure
              key={item.id}
              className="overflow-hidden rounded-lg border border-gray-100"
            >
              <img
                src={`/api/contractor-media/public/${item.id}`}
                alt={
                  item.altText ||
                  `${contractorName} roofing business photo`
                }
                loading="lazy"
                className="h-56 w-full object-cover"
              />

              {item.caption && (
                <figcaption className="p-3 text-sm text-gray-600">
                  {
                    item.caption
                  }
                </figcaption>
              )}
            </figure>
          )
        )}
      </div>
    </section>
  )
}