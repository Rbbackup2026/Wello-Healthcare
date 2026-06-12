import FullbodyHealthPackages from "../WebsiteComponent/FindLabComponents/Fullbody/FullbodyHealthPackages";
import JsonLd from "../WebsiteComponent/Homecomponents/JsonLd";
import {
  PAGE_SEO,
  breadcrumbSchema,
  buildPageMetadata,
  collectionPageSchema,
} from "../utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.fullBodyCheckup);

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema(PAGE_SEO.fullBodyCheckup),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Full Body Health Checkup", path: "/full-body-health-checkup" },
          ]),
        ]}
      />
      <FullbodyHealthPackages />
    </>
  );
}
