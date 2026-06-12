import Findlab from "../../../WebsiteComponent/FindLabComponents/Findlab";
import JsonLd from "../../../WebsiteComponent/Homecomponents/JsonLd";
import { deslugifyLocation } from "../../../utils/cityApi";
import {
  breadcrumbSchema,
  buildPageMetadata,
  collectionPageSchema,
} from "../../../utils/seo";

export async function generateMetadata({ params }) {
  const cityLabel = deslugifyLocation(params.citySlug);
  const path = `/labs/city/${params.citySlug}`;

  return buildPageMetadata({
    title: `Diagnostic Labs in ${cityLabel}`,
    description: `Find trusted pathology and radiology labs in ${cityLabel}. Book blood tests and health checkups online with Wello Healthcare.`,
    path,
    keywords: [
      `labs in ${cityLabel}`,
      "diagnostic labs",
      "pathology lab",
      "book blood test",
      "Wello Healthcare",
    ],
  });
}

export default function Page({ params }) {
  const cityLabel = deslugifyLocation(params.citySlug);
  const path = `/labs/city/${params.citySlug}`;

  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({
            name: `Diagnostic Labs in ${cityLabel}`,
            description: `Find pathology and radiology labs in ${cityLabel} and book tests online.`,
            path,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Labs", path: "/labs/city/delhi" },
            { name: cityLabel, path },
          ]),
        ]}
      />
      <Findlab />
    </>
  );
}
