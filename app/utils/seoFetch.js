import { toApiUrl, toAssetUrl } from "./api";
import { deslugifyLocation, fetchCityCollection, mapApiProduct } from "./cityApi";
import { stripHtml, truncateText } from "./seo";

const fetchJson = async (url) => {
  try {
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
};

const getBlogTitle = (blog) =>
  blog?.title || blog?.name || blog?.blogTitle || "Health Blog";

const getBlogDescription = (blog) =>
  truncateText(
    blog?.metaDescription ||
      blog?.shortDescription ||
      blog?.intro ||
      blog?.description ||
      blog?.content ||
      "",
    160
  );

const getBlogImage = (blog) => {
  const image =
    blog?.imageUrl ||
    blog?.image ||
    blog?.thumbnail ||
    blog?.bannerImage ||
    blog?.coverImage ||
    "";
  return image ? toAssetUrl(image) : "";
};

export const fetchBlogForSeo = async (id) => {
  const payload = await fetchJson(toApiUrl(`/getblogid/${id}`));
  const blog = payload?.data || payload;
  if (!blog || typeof blog !== "object") return null;

  return {
    id: String(blog._id || blog.id || id),
    title: getBlogTitle(blog),
    description: getBlogDescription(blog),
    image: getBlogImage(blog),
    datePublished: blog?.createdAt || blog?.publishedAt || blog?.date,
    dateModified: blog?.updatedAt || blog?.modifiedAt,
    faqs:
      blog?.faqs ||
      blog?.faq ||
      blog?.blogFaqs ||
      blog?.blogFAQ ||
      [],
  };
};

export const fetchProductForSeo = async (id) => {
  const payload = await fetchJson(toApiUrl(`/get_product/${id}`));
  const product = payload?.data || payload;
  if (!product || typeof product !== "object") return null;

  const name =
    product?.name ||
    product?.itemName ||
    product?.title ||
    product?.packageName ||
    "Lab Test";

  return {
    id: String(product._id || product.id || id),
    name,
    description: truncateText(
      product?.metaDescription ||
        product?.description ||
        product?.descrption ||
        product?.desc ||
        "",
      160
    ),
    image: product?.image ? toAssetUrl(product.image) : "",
    price:
      Number(
        product?.price ??
          product?.salePrice ??
          product?.offerPrice ??
          product?.discountedPrice ??
          0
      ) || undefined,
    category:
      product?.category?.name ||
      product?.categoryName ||
      product?.department ||
      product?.type ||
      "Medical Test",
    faqs: product?.faqs || product?.faq || [],
  };
};

export const fetchLabTestForSeo = async (city, testName) => {
  const cityName = deslugifyLocation(decodeURIComponent(city || "delhi"));
  const decodedTestName = decodeURIComponent(testName || "");

  try {
    const products = await fetchCityCollection("get_product", cityName);
    const match = products.find(
      (product) =>
        String(
          product?.name ||
            product?.itemName ||
            product?.title ||
            product?.packageName ||
            ""
        ).toLowerCase() === decodedTestName.toLowerCase()
    );

    if (!match) return null;

    const mapped = mapApiProduct(match, 0, cityName);
    return {
      id: mapped.id,
      name: mapped.name,
      description: truncateText(mapped.description, 160),
      price: mapped.price || undefined,
      category: mapped.category,
      city: cityName,
      faqs: mapped.faqs || [],
      path: `/lab-tests/${encodeURIComponent(city)}/${encodeURIComponent(decodedTestName)}`,
    };
  } catch {
    return null;
  }
};

export const fetchBlogCategoryForSeo = async (slug) => {
  const payload = await fetchJson(toApiUrl(`/getblogsbycategory/${slug}`));
  const blogs = Array.isArray(payload) ? payload : payload?.data || [];
  const label = deslugifyLocation(slug);

  return {
    slug,
    title: `${label} Health Blogs`,
    description: `Read ${label} health articles, wellness tips, and medical guides from Wello Healthcare.`,
    count: blogs.length,
  };
};
