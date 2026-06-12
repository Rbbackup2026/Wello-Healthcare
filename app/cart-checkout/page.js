import CartPage from "../WebsiteComponent/Homecomponents/CartPage";
import { PAGE_SEO, buildPageMetadata } from "../utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.checkout);

export default function Page() {
  return <CartPage />;
}
