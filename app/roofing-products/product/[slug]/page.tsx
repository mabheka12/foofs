import { notFound } from "next/navigation";
import Link from "next/link";
import {
  roofingProducts,
  roofingCategories,
} from "@/data/roofing-products";
import { ChevronRight } from "lucide-react";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return roofingProducts.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  const product = roofingProducts.find(
    (product) => product.slug === slug
  );

  if (!product) return {};

  return {
    title: `${product.title} | RooferNet`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = roofingProducts.find(
    (product) => product.slug === slug
  );

  if (!product) {
    notFound();
  }

  const category = roofingCategories.find(
    (category) => category.slug === product.category
  );

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8">

        <Link
          href="/roofing-products"
          className="hover:text-blue-400"
        >
          Roofing Products
        </Link>

        <span className="mx-2">/</span>

        {category && (
          <>
            <Link
              href={`/roofing-products/${category.slug}`}
              className="hover:text-blue-400"
            >
              {category.name}
            </Link>

            <span className="mx-2">/</span>
          </>
        )}

        <span>{product.title}</span>

      </nav>

      {/* Product */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">

          <div className="bg-gray-50 rounded-xl flex items-center justify-center p-6">

            <img
              src={product.image}
              alt={product.title}
              className="w-full max-h-[450px] object-contain"
            />

          </div>

          <div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
              {product.title}
            </h1>

            <p className="text-gray-600 leading-7 mb-6">
              {product.description}
            </p>

            <div className="border-t border-b border-gray-200 py-6 mb-6">

              <p className="text-sm text-gray-500 mb-2">
                Current price and availability
              </p>

              <p className="text-gray-900 font-semibold">
                Check Amazon for the latest price
              </p>

            </div>

            {product.amazon.US && (
              <a
                href={product.amazon.US}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg inline-flex items-center font-semibold transition"
              >
                Check Price on Amazon
                <ChevronRight className="w-5 h-5 ml-1" />
              </a>
            )}

            <p className="text-gray-500 text-xs mt-4">
              We may earn a commission from qualifying purchases
              made through this link.
            </p>

          </div>

        </div>

      </div>

      {/* Features */}
      <section className="mt-10 bg-white rounded-xl p-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Key Features
        </h2>

        <ul className="list-disc pl-6 text-gray-600 space-y-3">
          {product.features.map((feature) => (
            <li key={feature}>
              {feature}
            </li>
          ))}
        </ul>

      </section>

      {/* Buying considerations */}
      <section className="mt-8 bg-white rounded-xl p-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Things to Consider Before Buying
        </h2>

        <p className="text-gray-600 leading-7 mb-4">
          Before purchasing roofing equipment or supplies,
          consider the specific requirements of your roof and the
          intended application.
        </p>

        <p className="text-gray-600 leading-7">
          Roofing work can involve working at height and other
          significant hazards. Products listed here should not be
          considered a substitute for appropriate training,
          professional advice or safe working practices.
        </p>

      </section>

      {/* Related */}
      <section className="mt-10">

        <h2 className="text-2xl font-bold text-white mb-5">
          More {category?.name || "Roofing"} Products
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {roofingProducts
            .filter(
              (item) =>
                item.category === product.category &&
                item.slug !== product.slug
            )
            .slice(0, 3)
            .map((item) => (
              <Link
                key={item.slug}
                href={`/roofing-products/product/${item.slug}`}
                className="bg-white rounded-xl p-5 hover:shadow-xl transition"
              >

                <h3 className="font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>

                <span className="text-blue-600 text-sm font-semibold">
                  View Product →
                </span>

              </Link>
            ))}

        </div>

      </section>

      {/* Disclosure */}
      <section className="mt-10">

        <p className="text-gray-400 text-xs text-center max-w-3xl mx-auto">
          As an Amazon Associate, we earn from qualifying purchases.
          We do not guarantee product availability, pricing or
          specifications. Please verify product information directly
          on Amazon before purchasing.
        </p>

      </section>

      <Link
        href="/roofing-products"
        className="block mt-10 text-blue-400 hover:text-blue-300"
      >
        ← Back to Roofing Products
      </Link>

    </main>
  );
}