import SavedAddresses from "../WebsiteComponent/Homecomponents/SavedAddresses";
import { PAGE_SEO, buildPageMetadata } from "../utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.savedAddresses);

export default function Page() {
  return <SavedAddresses />;
}
