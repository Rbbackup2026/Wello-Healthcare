import HelpFeedback from "../WebsiteComponent/Homecomponents/HelpFeedback";
import JsonLd from "../WebsiteComponent/Homecomponents/JsonLd";
import {
  PAGE_SEO,
  breadcrumbSchema,
  buildPageMetadata,
  webPageSchema,
} from "../utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.helpFeedback);

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema(PAGE_SEO.helpFeedback),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Help & Feedback", path: "/help-feedback" },
          ]),
        ]}
      />
      <HelpFeedback />
    </>
  );
}
