import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "localhost" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },
  // Preserves Google's index when kvitkovapovnya.com cuts over from the old
  // Wix site to this app — every URL that appeared in the old site's sitemaps
  // (store-products, store-categories, pages) gets a permanent redirect to
  // its closest equivalent here, so indexed pages don't 404 and their link
  // equity carries over instead of starting from zero.
  //
  // Cyrillic path segments must be percent-encoded — Next's redirect matcher
  // compares against the raw request path, which arrives URI-encoded, and a
  // literal (non-encoded) Cyrillic `source` silently never matches.
  async redirects() {
    const encodePath = (path: string) =>
      path
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");

    const rules = [
      // Categories
      { source: "/category/підписка-на-квіти", destination: "/katalog/pidpyska" },
      { source: "/category/разова-доставка", destination: "/katalog/buket" },
      { source: "/category/весільна-підписка", destination: "/wedding" },
      { source: "/category/разова-доставка-для-бізнесу", destination: "/dlya-biznesu" },
      { source: "/category/all-products", destination: "/katalog" },
      { source: "/category/аксесуари-до-квітів", destination: "/" },
      { source: "/category/подарунки-до-квітів", destination: "/" },

      // Products — old site sold each subscription size as its own page;
      // the ones we still carry map 1:1, the rest fall back to the category
      // page where every available size is listed.
      { source: "/product-page/підписка-на-квіти-розмір-l", destination: "/product/pidpyska-l" },
      { source: "/product-page/підписка-на-квіти-розмір-м", destination: "/product/pidpyska-m" },
      { source: "/product-page/підписка-на-квіти-розмір-xl", destination: "/katalog/pidpyska" },
      { source: "/product-page/підписка-на-квіти-розмір-xxl", destination: "/katalog/pidpyska" },
      { source: "/product-page/разова-доставка-розмір-м", destination: "/product/buket" },
      { source: "/product-page/разова-доставка-розмір-l", destination: "/product/buket" },
      { source: "/product-page/разова-доставка-розмір-xl", destination: "/product/buket" },
      { source: "/product-page/разова-доставка-розмір-xxl", destination: "/product/buket" },
      { source: "/product-page/lipper-блиск-для-губ", destination: "/" },
      { source: "/product-page/crumb-крем-для-рук-50-мл", destination: "/" },

      // Legal / static pages
      { source: "/accessibility-statement", destination: "/oferta" },
      { source: "/copy-of-czech-terms-conditions-2", destination: "/oferta" },
      { source: "/copy-of-turkish-privacy-policy", destination: "/politika-konfidentsiynosti" },
      { source: "/copy-of-turkish-refund-policy", destination: "/dostavka-ta-oplata" },
      { source: "/copy-of-turkish-shipping-policy", destination: "/dostavka-ta-oplata" },
    ];

    return rules.map((rule) => ({ ...rule, source: encodePath(rule.source), permanent: true }));
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
