import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CowPage from './pages/CowPage';
import CartPage from './pages/CartPage';
import ButcherDashboard from './pages/ButcherDashboard';
import CreateRoundPage from './pages/CreateRoundPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminPage from './pages/AdminPage';
import ToastContainer from './components/Toast';
import { useRoundStore } from './stores/roundStore';

function App() {
  const initialize = useRoundStore(s => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;

