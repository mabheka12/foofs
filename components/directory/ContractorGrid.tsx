// components/directory/ContractorGrid.tsx
import { ContractorCard } from './ContractorCard'

interface ContractorGridProps {
  contractors: any[]
  showMap?: boolean
}

export function ContractorGrid({ contractors, showMap = false }: ContractorGridProps) {
  if (!contractors || contractors.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No contractors found .</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contractors.map((contractor) => {
        const citySlug = contractor.city?.slug || contractor.cityId
        const stateSlug = contractor.state?.slug || contractor.stateId
        
        return (
          <ContractorCard
            key={contractor.id}
            contractor={contractor}
            stateSlug={stateSlug}
            citySlug={citySlug}
          />
        )
      })}
    </div>
  )
}