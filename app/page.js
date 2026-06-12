import Home from "./WebsiteComponent/Homecomponents/Home";
import JsonLd from "./WebsiteComponent/Homecomponents/JsonLd";
import { PAGE_SEO, breadcrumbSchema, buildPageMetadata, webPageSchema } from "./utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.home);

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema(PAGE_SEO.home),
          breadcrumbSchema([{ name: "Home", path: "/" }]),
        ]}
      />
      <Home />
    </>
  );
}
