import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CowPage from './pages/CowPage';
import CartPage from './pages/CartPage';
import ButcherDashboard from './pages/ButcherDashboard';
import CreateRoundPage from './pages/CreateRoundPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminPage from './pages/AdminPage';
import RegisterPage from './pages/RegisterPage';
import ToastContainer from './components/Toast';
import { useRoundStore } from './stores/roundStore';

// Standalone pages without Layout
const STANDALONE_PATHS = ['/register'];

function AppContent() {
  const initialize = useRoundStore(s => s.initialize);
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const isStandalone = STANDALONE_PATHS.includes(location.pathname);

  if (isStandalone) {
    return (
      <>
        <ToastContainer />
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cow" element={<CowPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/butcher" element={<ButcherDashboard />} />
          <Route path="/butcher/create" element={<CreateRoundPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
