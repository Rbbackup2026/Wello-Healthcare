import MyAccount from "../WebsiteComponent/Homecomponents/MyAccount";
import { PAGE_SEO, buildPageMetadata } from "../utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.myAccount);

export default function Page() {
  return <MyAccount />;
}
