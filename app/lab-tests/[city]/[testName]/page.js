import LabTestDetailPage from "../../../WebsiteComponent/FindLabComponents/FindTestlab/LabTestDetailPage";
import JsonLd from "../../../WebsiteComponent/Homecomponents/JsonLd";
import { deslugifyLocation } from "../../../utils/cityApi";
import {
  breadcrumbSchema,
  buildPageMetadata,
  faqSchema,
  productSchema,
} from "../../../utils/seo";
import { fetchLabTestForSeo } from "../../../utils/seoFetch";

export async function generateMetadata({ params }) {
  const test = await fetchLabTestForSeo(params.city, params.testName);
  const cityLabel = deslugifyLocation(params.city);
  const path = test?.path || `/lab-tests/${params.city}/${params.testName}`;

  if (!test) {
    return buildPageMetadata({
      title: `Lab Test in ${cityLabel}`,
      description: `Book lab tests in ${cityLabel} with home sample collection from Wello Healthcare.`,
      path,
    });
  }

  return buildPageMetadata({
    title: `${test.name} in ${test.city} - Book Online`,
    description:
      test.description ||
      `Book ${test.name} in ${test.city}. Home blood sample collection, affordable pricing, and trusted labs with Wello Healthcare.`,
    path,
    keywords: [test.name, test.city, "lab test booking", "home collection"],
  });
}

export default async function Page({ params }) {
  const test = await fetchLabTestForSeo(params.city, params.testName);
  const cityLabel = deslugifyLocation(params.city);
  const path = test?.path || `/lab-tests/${params.city}/${params.testName}`;

  return (
    <>
      {test && (
        <JsonLd
          data={[
            productSchema({
              name: `${test.name} in ${test.city}`,
              description: test.description,
              path,
              price: test.price,
              sku: test.id,
              category: test.category,
            }),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Lab Tests", path: "/lab-tests" },
              { name: cityLabel, path: `/lab-tests?city=${encodeURIComponent(test.city)}` },
              { name: test.name, path },
            ]),
            faqSchema(test.faqs),
          ]}
        />
      )}
      <LabTestDetailPage />
    </>
  );
}
