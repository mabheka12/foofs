import Link from "next/link"

export default function AdvertiseCta() {
  return (
    <Link
      href="/advertise"
      className="flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
    >
      <span className="font-semibold text-gray-700">Own a roofing business?</span>
      <span className="text-sm text-gray-500 mt-1">Get featured here</span>
      <span className="text-sm text-blue-600 font-medium mt-3">Learn more →</span>
    </Link>
  )
}