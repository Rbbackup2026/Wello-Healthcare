import { AuthProvider } from './Components/MainRoute/AuthContext';
import { LocationProvider } from './Components/MainRoute/LocationContext';
import { CartProvider } from './Components/MainRoute/CartContext';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import CartNotificationHost from './WebsiteComponent/Homecomponents/CartNotificationHost';
import TopRouteLoader from './WebsiteComponent/Homecomponents/TopRouteLoader';
import JsonLd from './WebsiteComponent/Homecomponents/JsonLd';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  medicalBusinessSchema,
  organizationSchema,
  websiteSchema,
} from './utils/seo';
import './index.css';
import './App.css';
import './styles/wello-layout.css';
import './styles/cart-drawer.css';
import './styles/cart-checkout.css';
import './styles/lab-detail.css';
import './styles/wello-responsive.css';
import './styles/home-page.css';
import './styles/fullbody-packages.css';
import './styles/blog-detail.css';
import './styles/my-account.css';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_TAGLINE} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS.join(", "),
  applicationName: SITE_NAME,
  category: "healthcare",
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/Wello logo.png",
    apple: "/images/Wello logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <body>
        <JsonLd data={[organizationSchema(), websiteSchema(), medicalBusinessSchema()]} />
        <TopRouteLoader />
        <AppRouterCacheProvider>
          <AuthProvider>
            <LocationProvider>
              <CartProvider>
                <CartNotificationHost />
                {children}
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
