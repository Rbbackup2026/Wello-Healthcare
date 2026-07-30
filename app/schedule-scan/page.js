import ScheduleScanPage from "../WebsiteComponent/FindLabComponents/ScheduleScan/ScheduleScanPage";
import JsonLd from "../WebsiteComponent/Homecomponents/JsonLd";
import {
  PAGE_SEO,
  breadcrumbSchema,
  buildPageMetadata,
  collectionPageSchema,
} from "../utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.scheduleScan);

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema(PAGE_SEO.scheduleScan),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Schedule Scan", path: "/schedule-scan" },
          ]),
        ]}
      />
      <ScheduleScanPage />
    </>
  );
}
