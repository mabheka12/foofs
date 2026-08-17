"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, ChevronRight } from "lucide-react";

const promos = [
  {
    title: "🏠 Roofing Tools & Supplies",
    description:
      "Find useful roofing tools, inspection equipment and maintenance products.",
  },
  {
    title: "🛠️ Recommended Roofing Products",
    description:
      "Browse selected roofing tools and supplies available on Amazon.",
  },
  {
    title: "🔥 Roofing & Home Maintenance Picks",
    description:
      "Discover useful products for roof and home maintenance.",
  },
];

export default function RoofingPromoRibbon() {
  const [visible, setVisible] = useState(true);
  const [promo, setPromo] = useState(promos[0]);

  useEffect(() => {
    const hiddenUntil = localStorage.getItem(
      "roofingPromoRibbonHiddenUntil"
    );

    if (hiddenUntil && Number(hiddenUntil) > Date.now()) {
      setVisible(false);
      return;
    }

    setPromo(
      promos[Math.floor(Math.random() * promos.length)]
    );
  }, []);

  function dismiss() {
    const oneDay = Date.now() + 24 * 60 * 60 * 1000;

    localStorage.setItem(
      "roofingPromoRibbonHiddenUntil",
      oneDay.toString()
    );

    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">

        <Link
          href="/roofing-products"
          className="flex items-center gap-3 flex-1 hover:opacity-95"
        >
          <ShoppingBag className="w-5 h-5 shrink-0" />

          <div className="flex flex-col md:flex-row md:items-center md:gap-2">
            <span className="font-semibold">
              {promo.title}
            </span>

            <span className="hidden md:inline text-blue-100">
              {promo.description}
            </span>
          </div>

          <span className="hidden sm:flex items-center font-semibold ml-auto">
            View Products
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </Link>

        <button
          onClick={dismiss}
          className="hover:bg-white/20 rounded-full p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}