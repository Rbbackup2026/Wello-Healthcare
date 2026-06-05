import { AuthProvider } from '../app/Components/MainRoute/AuthContext';
import { LocationProvider } from '../app/Components/MainRoute/LocationContext';
import { CartProvider } from '../app/Components/MainRoute/CartContext';
import '../app/index.css';
import '../app/App.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <Component {...pageProps} />
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default MyApp;
