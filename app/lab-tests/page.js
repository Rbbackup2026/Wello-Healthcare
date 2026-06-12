import LabTestsPage from "../WebsiteComponent/FindLabComponents/FindTestlab/LabTestsPage";
import JsonLd from "../WebsiteComponent/Homecomponents/JsonLd";
import {
  PAGE_SEO,
  breadcrumbSchema,
  buildPageMetadata,
  collectionPageSchema,
} from "../utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.labTests);

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema(PAGE_SEO.labTests),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Lab Tests", path: "/lab-tests" },
          ]),
        ]}
      />
      <LabTestsPage />
    </>
  );
}
