import {
  CircleDollarSign,
} from 'lucide-react'


export function ContractorPricing({
  priceRange,
  pricingNotes,
  minimumJobPrice,
  priceCurrency,
}: {
  priceRange?: string | null
  pricingNotes?: string | null
  minimumJobPrice?: string | null
  priceCurrency?: string | null
}) {
  if (
    !priceRange &&
    !pricingNotes &&
    !minimumJobPrice
  ) {
    return null
  }

  let formattedMinimum:
    string | null = null

  if (minimumJobPrice) {
    const amount =
      Number(
        minimumJobPrice
      )

    if (
      Number.isFinite(amount)
    ) {
      try {
        formattedMinimum =
          new Intl.NumberFormat(
            'en-US',
            {
              style:
                'currency',

              currency:
                priceCurrency ||
                'USD',

              maximumFractionDigits:
                0,
            }
          ).format(amount)
      } catch {
        formattedMinimum =
          `${priceCurrency || 'USD'} ${amount}`
      }
    }
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <CircleDollarSign className="h-5 w-5 text-green-600" />
        Pricing information
      </h2>

      <div className="space-y-2">

        {priceRange && (
          <p>
            <span className="font-medium">
              Price range:
            </span>{' '}

            {priceRange ===
            'Varies'
              ? 'Varies by project'
              : priceRange}
          </p>
        )}

        {formattedMinimum && (
          <p>
            <span className="font-medium">
              Minimum job price:
            </span>{' '}

            From{' '}
            {formattedMinimum}
          </p>
        )}

        {pricingNotes && (
          <p className="leading-relaxed text-gray-600">
            {pricingNotes}
          </p>
        )}

        <p className="pt-2 text-xs text-gray-400">
          Pricing is provided by the
          business and may vary by
          project.
        </p>
      </div>
    </section>
  )
}