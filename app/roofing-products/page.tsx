import Link from "next/link";
import { roofingCategories } from "@/data/roofing-products";

export const metadata = {
  title: "Roofing Tools & Supplies | RooferNet",
  description:
    "Browse roofing tools, roof inspection equipment, repair supplies, sealants, gutter tools and other roofing products.",
};

export default function RoofingProductsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">

      <section className="text-center mb-14">

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">
          Roofing Tools & Supplies
        </h1>

        <p className="text-gray-300 max-w-3xl mx-auto text-lg">
          Explore useful roofing tools, inspection equipment,
          maintenance supplies and other products for homeowners
          and roofing professionals.
        </p>

        <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-5">
          We may earn a commission from qualifying purchases made
          through links to Amazon.
        </p>

      </section>

      <section>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
          Browse Roofing Products
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {roofingCategories.map((item) => (
            <div
              key={item.slug}
              className="bg-white rounded-xl shadow hover:shadow-xl transition p-6"
            >

              <div className="text-5xl mb-4">
                {item.emoji}
              </div>

              <h3 className="font-bold text-xl mb-3">
                {item.name}
              </h3>

              <p className="text-gray-600 text-sm leading-6 mb-6">
                {item.description}
              </p>

              <Link
                href={`/roofing-products/${item.slug}`}
                className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
              >
                Browse {item.name} →
              </Link>

            </div>
          ))}

        </div>

      </section>

      <section className="mt-16 bg-white rounded-xl p-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Choosing Roofing Products
        </h2>

        <p className="text-gray-600 leading-7 mb-4">
          The appropriate roofing products depend on the type of
          roof, the maintenance or repair task and the manufacturer's
          specifications.
        </p>

        <p className="text-gray-600 leading-7">
          Roofing work can involve significant safety risks. If a
          repair requires working at height or involves structural
          components, consider consulting a qualified roofing
          professional rather than attempting the work yourself.
        </p>

      </section>

      <section className="mt-10 text-center">

        <p className="text-gray-400 text-xs max-w-3xl mx-auto">
          As an Amazon Associate, we earn from qualifying purchases.
          Product availability and prices may change. Please check
          Amazon for the latest product information before purchasing.
        </p>

      </section>

    </main>
  );
}