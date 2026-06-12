import ItemDetail from "../../WebsiteComponent/Homecomponents/ItemDetail";
import JsonLd from "../../WebsiteComponent/Homecomponents/JsonLd";
import {
  breadcrumbSchema,
  buildPageMetadata,
  faqSchema,
  productSchema,
} from "../../utils/seo";
import { fetchProductForSeo } from "../../utils/seoFetch";

export async function generateMetadata({ params }) {
  const product = await fetchProductForSeo(params.id);

  if (!product) {
    return buildPageMetadata({
      title: "Lab Test Details",
      description: "View lab test and health package details on Wello Healthcare.",
      path: `/product/${params.id}`,
    });
  }

  return buildPageMetadata({
    title: `${product.name} - Book Online`,
    description: product.description,
    path: `/product/${product.id}`,
    keywords: [product.name, product.category, "book lab test", "Wello Healthcare"],
  });
}

export default async function Page({ params }) {
  const product = await fetchProductForSeo(params.id);
  const path = `/product/${params.id}`;

  return (
    <>
      {product && (
        <JsonLd
          data={[
            productSchema({
              name: product.name,
              description: product.description,
              path,
              image: product.image,
              price: product.price,
              sku: product.id,
              category: product.category,
            }),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Lab Tests", path: "/lab-tests" },
              { name: product.name, path },
            ]),
            faqSchema(product.faqs),
          ]}
        />
      )}
      <ItemDetail id={params.id} />
    </>
  );
}
