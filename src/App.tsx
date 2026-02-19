import { useAuth } from './contexts/AuthContext';
import { useLocation } from './hooks/useNavigate';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import StockTransactions from './pages/StockTransactions';
import Users from './pages/Users';
import Layout from './components/Layout';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (location === '/register') {
      return <Register />;
    }
    return <Login />;
  }

  let page;
  switch (location) {
    case '/dashboard':
      page = <Dashboard />;
      break;
    case '/products':
      page = <Products />;
      break;
    case '/categories':
      page = <Categories />;
      break;
    case '/stock':
      page = <StockTransactions />;
      break;
    case '/users':
      page = <Users />;
      break;
    default:
      page = <Dashboard />;
  }

  return <Layout>{page}</Layout>;
}

export default App;
