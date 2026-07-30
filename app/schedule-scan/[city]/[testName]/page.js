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
  const path =
    test?.path ||
    `/schedule-scan/${params.city}/${encodeURIComponent(params.testName)}`;

  if (!test) {
    return buildPageMetadata({
      title: `Radiology Scan in ${cityLabel}`,
      description: `Book radiology and imaging scans in ${cityLabel} with Wello Healthcare.`,
      path,
    });
  }

  return buildPageMetadata({
    title: `${test.name} in ${test.city} - Schedule Scan Online`,
    description:
      test.description ||
      `Book ${test.name} in ${test.city}. Trusted imaging centres and reliable reports with Wello Healthcare.`,
    path,
  });
}

export default async function Page({ params }) {
  const test = await fetchLabTestForSeo(params.city, params.testName);
  const cityLabel = deslugifyLocation(params.city);
  const path = `/schedule-scan/${params.city}/${encodeURIComponent(params.testName)}`;

  return (
    <>
      <JsonLd
        data={[
          productSchema({
            name: test?.name || params.testName,
            description: test?.description,
            price: test?.price,
            path,
          }),
          faqSchema(test?.faqs || []),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Schedule Scan", path: "/schedule-scan" },
            {
              name: test?.name || params.testName,
              path,
            },
          ]),
        ]}
      />
      <LabTestDetailPage />
    </>
  );
}
