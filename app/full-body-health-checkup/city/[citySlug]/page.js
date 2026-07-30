import FullbodyHealthPackages from "../../../WebsiteComponent/FindLabComponents/Fullbody/FullbodyHealthPackages";
import JsonLd from "../../../WebsiteComponent/Homecomponents/JsonLd";
import { deslugifyLocation } from "../../../utils/cityApi";
import {
  breadcrumbSchema,
  buildPageMetadata,
  collectionPageSchema,
} from "../../../utils/seo";

export async function generateMetadata({ params }) {
  const cityLabel = deslugifyLocation(params.citySlug);
  const path = `/full-body-health-checkup/city/${params.citySlug}`;

  return buildPageMetadata({
    title: `Full Body Health Checkup in ${cityLabel}`,
    description: `Book full body health checkup packages in ${cityLabel}. Compare tests, prices, and book home sample collection with Wello Healthcare.`,
    path,
    keywords: [
      `full body checkup ${cityLabel}`,
      `health checkup packages ${cityLabel}`,
      "full body health checkup",
      "Wello Healthcare",
    ],
  });
}

export default function Page({ params }) {
  const cityLabel = deslugifyLocation(params.citySlug);
  const path = `/full-body-health-checkup/city/${params.citySlug}`;

  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({
            name: `Full Body Health Checkup in ${cityLabel}`,
            description: `Book full body health checkup packages in ${cityLabel} online.`,
            path,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Full Body Health Checkup", path: "/full-body-health-checkup" },
            { name: cityLabel, path },
          ]),
        ]}
      />
      <FullbodyHealthPackages />
    </>
  );
}
