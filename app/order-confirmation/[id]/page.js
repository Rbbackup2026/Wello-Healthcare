import OrderConfirmation from "../../Components/MainRoute/OrderConfirmation";
import { PAGE_SEO, buildPageMetadata } from "../../utils/seo";

export const metadata = buildPageMetadata({
  ...PAGE_SEO.orderConfirmation,
  path: "/order-confirmation",
});

export default function Page() {
  return <OrderConfirmation />;
}
