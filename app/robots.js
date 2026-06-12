import { SITE_URL } from "./utils/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin_index",
          "/cart-checkout",
          "/cart_section",
          "/my-account",
          "/my-orders",
          "/saved-addresses",
          "/order-confirmation/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
