import { AuthProvider } from './Components/MainRoute/AuthContext';
import { LocationProvider } from './Components/MainRoute/LocationContext';
import { CartProvider } from './Components/MainRoute/CartContext';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import CartNotificationHost from './WebsiteComponent/Homecomponents/CartNotificationHost';
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

export const metadata = {
  title: "Wello Healthcare",
  icons: {
    icon: "/images/Wello logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
