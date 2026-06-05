import './App.css';
import { BrowserRouter } from 'react-router-dom';
import MainRoute from './Components/MainRoute/MainRoute';
import { AuthProvider } from './Components/MainRoute/AuthContext';
import { LocationProvider } from './Components/MainRoute/LocationContext';

function App() {
  return (
    <>
    <AuthProvider>
      <LocationProvider>
        <BrowserRouter>
          <MainRoute />
        </BrowserRouter>
      </LocationProvider>
    </AuthProvider>
  </>
  );
}

export default App;
