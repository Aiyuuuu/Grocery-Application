import AuthPage from './pages/AuthPage/AuthPage';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const IS_AUTHENTICATED = true;

function App() {
  if (!IS_AUTHENTICATED) {
    return <AuthPage />;
  }

  return <AppRoutes />;
}

export default App;