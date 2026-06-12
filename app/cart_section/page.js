import CartDrawer from "../WebsiteComponent/Homecomponents/CartDrawer";
import Footer from "../WebsiteComponent/Homecomponents/Footer";
import Navbar from "../WebsiteComponent/Homecomponents/Navbar";
import TopBar from "../WebsiteComponent/Homecomponents/TopBar";
import { PAGE_SEO, buildPageMetadata } from "../utils/seo";

export const metadata = buildPageMetadata(PAGE_SEO.cart);

export default function Page() {
  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>
      <CartDrawer asPage />
      <Footer />
    </>
  );
}
