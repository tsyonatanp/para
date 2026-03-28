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
import ErrorBoundary from './components/ErrorBoundary';
import { useRoundStore } from './stores/roundStore';
import { useOrderStore } from './stores/orderStore';

// Standalone pages without Layout
const STANDALONE_PATHS = ['/register'];

function AppContent() {
  const initialize = useRoundStore(s => s.initialize);
  const initOrders = useOrderStore(s => s.initOrders);
  const location = useLocation();

  useEffect(() => {
    const boot = async () => {
      await initialize();
      // After parts are loaded, load orders and recalculate soldKg
      const roundId = useRoundStore.getState().round?.id;
      if (roundId) {
        await initOrders(roundId);
      }
    };
    boot();
  }, [initialize, initOrders]);

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
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
