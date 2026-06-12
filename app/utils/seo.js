export const SITE_NAME = "Wello Healthcare";
export const SITE_TAGLINE = "Book Blood Tests & Health Checkups Online";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.wellohealthcare.com"
).replace(/\/$/, "");

export const DEFAULT_DESCRIPTION =
  "Book pathology blood tests, radiology scans, and full body health checkups online with Wello Healthcare. Home sample collection, trusted labs, and affordable packages across India.";

export const DEFAULT_KEYWORDS = [
  "Wello Healthcare",
  "blood test online",
  "lab tests",
  "health checkup",
  "full body checkup",
  "home sample collection",
  "pathology tests",
  "radiology tests",
  "diagnostic labs India",
];

export const SUPPORT_PHONE = "+91-8448158188";
export const SUPPORT_EMAIL = "support@wellohealthcare.com";
export const DEFAULT_OG_IMAGE = "/images/Wello logo.png";

export const absoluteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};

export const toAbsoluteAssetUrl = (path = "") => {
  if (!path) return absoluteUrl(DEFAULT_OG_IMAGE);
  if (/^https?:\/\//i.test(path)) return path;
  return absoluteUrl(path.startsWith("/") ? path : `/${path}`);
};

export const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const truncateText = (value = "", maxLength = 160) => {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
};

export const buildPageMetadata = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords = DEFAULT_KEYWORDS,
  noIndex = false,
  image,
  type = "website",
}) => {
  const pageTitle = title?.includes(SITE_NAME) ? title : title;
  const fullTitle = title?.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = absoluteUrl(path);
  const ogImage = toAbsoluteAssetUrl(image || DEFAULT_OG_IMAGE);

  return {
    title: pageTitle,
    description: truncateText(description, 160),
    keywords: Array.isArray(keywords) ? keywords.join(", ") : keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: fullTitle,
      description: truncateText(description, 160),
      url: canonicalUrl,
      siteName: SITE_NAME,
      type,
      locale: "en_IN",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: truncateText(description, 160),
      images: [ogImage],
    },
  };
};

export const PAGE_SEO = {
  home: {
    title: SITE_TAGLINE,
    description:
      "Book blood tests, radiology imaging, and full body health checkups online with Wello Healthcare. Fast reports, home collection, and trusted diagnostic partners.",
    path: "/",
    keywords: DEFAULT_KEYWORDS,
  },
  labTests: {
    title: "Book Lab Tests Online",
    description:
      "Browse and book pathology blood tests and radiology tests online. Compare prices, choose home collection, and schedule sample pickup with Wello Healthcare.",
    path: "/lab-tests",
    keywords: [...DEFAULT_KEYWORDS, "book lab test", "pathology test booking"],
  },
  fullBodyCheckup: {
    title: "Full Body Health Checkup Packages",
    description:
      "Explore affordable full body health checkup packages with comprehensive blood tests, organ profiles, and preventive screening. Book online with home sample collection.",
    path: "/full-body-health-checkup",
    keywords: [...DEFAULT_KEYWORDS, "full body checkup package", "preventive health checkup"],
  },
  blogs: {
    title: "Health Blogs & Wellness Tips",
    description:
      "Read expert health blogs, wellness guides, and medical tips from Wello Healthcare to make informed decisions about lab tests and preventive care.",
    path: "/blogs",
    keywords: [...DEFAULT_KEYWORDS, "health blog", "wellness tips", "medical articles"],
  },
  downloadReport: {
    title: "Download Lab Test Report",
    description:
      "Download your pathology and diagnostic lab test reports securely online from Wello Healthcare.",
    path: "/download-report",
    keywords: [...DEFAULT_KEYWORDS, "download lab report", "test report online"],
  },
  helpFeedback: {
    title: "Help & Feedback",
    description:
      "Contact Wello Healthcare support for booking help, report queries, and feedback. Email support@wellohealthcare.com or call +91-8448158188.",
    path: "/help-feedback",
    keywords: [...DEFAULT_KEYWORDS, "Wello support", "customer care"],
  },
  findLabs: {
    title: "Find Diagnostic Labs Near You",
    description:
      "Search trusted pathology and radiology labs by city. Book blood tests and health checkups with Wello Healthcare partner labs.",
    path: "/labs/city",
    keywords: [...DEFAULT_KEYWORDS, "diagnostic labs near me", "pathology lab"],
  },
  cart: {
    title: "Your Cart",
    description: "Review selected lab tests and health packages in your Wello Healthcare cart.",
    path: "/cart_section",
    noIndex: true,
  },
  checkout: {
    title: "Cart Checkout",
    description: "Complete your lab test booking, choose sample collection slot, and pay securely.",
    path: "/cart-checkout",
    noIndex: true,
  },
  myAccount: {
    title: "My Account",
    description: "Manage your Wello Healthcare account, bookings, and profile settings.",
    path: "/my-account",
    noIndex: true,
  },
  myOrders: {
    title: "My Orders",
    description: "View your lab test bookings and order history with Wello Healthcare.",
    path: "/my-orders",
    noIndex: true,
  },
  savedAddresses: {
    title: "Saved Addresses",
    description: "Manage saved home sample collection addresses for faster checkout.",
    path: "/saved-addresses",
    noIndex: true,
  },
  orderConfirmation: {
    title: "Order Confirmation",
    description: "Your Wello Healthcare lab test booking confirmation details.",
    path: "/order-confirmation",
    noIndex: true,
  },
};

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: toAbsoluteAssetUrl(DEFAULT_OG_IMAGE),
  email: SUPPORT_EMAIL,
  telephone: SUPPORT_PHONE,
  sameAs: [SITE_URL],
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: {
      "@type": "ImageObject",
      url: toAbsoluteAssetUrl(DEFAULT_OG_IMAGE),
    },
  },
});

export const medicalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: SITE_NAME,
  url: SITE_URL,
  image: toAbsoluteAssetUrl(DEFAULT_OG_IMAGE),
  telephone: SUPPORT_PHONE,
  email: SUPPORT_EMAIL,
  priceRange: "₹₹",
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
});

export const webPageSchema = ({ name, description, path }) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name,
  description: truncateText(description, 200),
  url: absoluteUrl(path),
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
});

export const breadcrumbSchema = (items = []) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const productSchema = ({ name, description, path, image, price, sku, category }) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name,
  description: truncateText(description, 300),
  image: toAbsoluteAssetUrl(image),
  sku: sku || undefined,
  category: category || "Medical Test",
  brand: {
    "@type": "Brand",
    name: SITE_NAME,
  },
  offers: {
    "@type": "Offer",
    url: absoluteUrl(path),
    priceCurrency: "INR",
    price: price || undefined,
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  },
});

export const articleSchema = ({
  title,
  description,
  path,
  image,
  datePublished,
  dateModified,
  author = SITE_NAME,
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description: truncateText(description, 300),
  image: toAbsoluteAssetUrl(image),
  author: {
    "@type": "Organization",
    name: author,
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: {
      "@type": "ImageObject",
      url: toAbsoluteAssetUrl(DEFAULT_OG_IMAGE),
    },
  },
  datePublished: datePublished || undefined,
  dateModified: dateModified || datePublished || undefined,
  mainEntityOfPage: absoluteUrl(path),
});

export const faqSchema = (faqs = []) => {
  const entries = faqs
    .map((faq) => ({
      question: faq?.question || faq?.q || faq?.title || "",
      answer: stripHtml(faq?.answer || faq?.a || faq?.content || ""),
    }))
    .filter((faq) => faq.question && faq.answer);

  if (!entries.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

export const collectionPageSchema = ({ name, description, path }) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  description: truncateText(description, 200),
  url: absoluteUrl(path),
});
