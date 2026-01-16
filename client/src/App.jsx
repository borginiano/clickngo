import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VendorProfile from './pages/VendorProfile';
import MyProducts from './pages/MyProducts';
import MyCoupons from './pages/MyCoupons';
import Chat from './pages/Chat';
import BecomeVendor from './pages/BecomeVendor';
import Dashboard from './pages/Dashboard';
import Fairs from './pages/Fairs';
import Premium from './pages/Premium';
import Privacy from './pages/Legal/Privacy';
import Terms from './pages/Legal/Terms';
import Classifieds from './pages/Classifieds';
import ClassifiedDetail from './pages/ClassifiedDetail';
import MyClassifieds from './pages/MyClassifieds';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeView from './pages/ResumeView';
import ProductDetail from './pages/ProductDetail';
import AdminPanel from './pages/AdminPanel';
import MyAccount from './pages/MyAccount';
import MyFavorites from './pages/MyFavorites';
import VendorStats from './pages/VendorStats';
import FAQ from './pages/FAQ';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WelcomeBanner from './components/WelcomeBanner';
import Tour, { useTour } from './components/Tour';
import styles from './App.module.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
}

function VendorRoute({ children }) {
  const { user, loading, isVendor } = useAuth();

  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isVendor) return <Navigate to="/become-vendor" />;

  return children;
}

function AppRoutes() {
  const { showTour, setShowTour } = useTour();

  return (
    <div className={styles.app}>
      <Navbar />
      <WelcomeBanner />
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vendor/:id" element={<VendorProfile />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/fairs" element={<Fairs />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/classifieds" element={<Classifieds />} />
          <Route path="/classified/:id" element={<ClassifiedDetail />} />
          <Route path="/faq" element={<FAQ />} />

          <Route path="/my-classifieds" element={
            <ProtectedRoute><MyClassifieds /></ProtectedRoute>
          } />

          <Route path="/my-resume" element={
            <ProtectedRoute><ResumeBuilder /></ProtectedRoute>
          } />

          <Route path="/resume/:userId" element={<ResumeView />} />

          <Route path="/become-vendor" element={
            <ProtectedRoute><BecomeVendor /></ProtectedRoute>
          } />

          <Route path="/dashboard" element={<Navigate to="/my-account" replace />} />

          <Route path="/my-products" element={
            <VendorRoute><MyProducts /></VendorRoute>
          } />

          <Route path="/my-coupons" element={
            <VendorRoute><MyCoupons /></VendorRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute><AdminPanel /></ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute><Chat /></ProtectedRoute>
          } />

          <Route path="/chat/:conversationId" element={
            <ProtectedRoute><Chat /></ProtectedRoute>
          } />

          <Route path="/my-account" element={
            <ProtectedRoute><MyAccount /></ProtectedRoute>
          } />

          <Route path="/my-favorites" element={
            <ProtectedRoute><MyFavorites /></ProtectedRoute>
          } />

          <Route path="/vendor-stats" element={
            <ProtectedRoute><VendorStats /></ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
      {showTour && <Tour onComplete={() => setShowTour(false)} />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

