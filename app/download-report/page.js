import ReportsPage from "../WebsiteComponent/FindLabComponents/REportDownload/ReportsPage";
import JsonLd from "../WebsiteComponent/Homecomponents/JsonLd";
import {
  PAGE_SEO,
  breadcrumbSchema,
  buildPageMetadata,
  webPageSchema,
} from "../utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.downloadReport);

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema(PAGE_SEO.downloadReport),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Download Report", path: "/download-report" },
          ]),
        ]}
      />
      <ReportsPage />
    </>
  );
}
