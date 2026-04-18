import { useState } from 'react';
import AuthPage from './pages/AuthPage/AuthPage';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Toggle to false to see AuthPage

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <AppRoutes />;
}

export default App;