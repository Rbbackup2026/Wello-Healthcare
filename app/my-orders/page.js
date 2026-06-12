import MyOrders from "../WebsiteComponent/Homecomponents/MyOrders";
import { PAGE_SEO, buildPageMetadata } from "../utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.myOrders);

export default function Page() {
  return <MyOrders />;
}
