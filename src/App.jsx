import './App.css';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx'; 

import MainLayout from './components/Layout/MainLayout/MainLayout.jsx';
import Home from './pages/Home/Home.jsx';
import Following from './pages/Following/Following.jsx';
import Explore from './pages/Explore/Explore.jsx';
import Detail from './pages/Detail/Detail.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import ProtectedRoute from './components/Common/ProtectedRoute/ProtectedRoute.jsx'; 
import AuthModal from './components/AuthModal/AuthModal.jsx'; 

function AppContent() {
  const { showAuthModal, setShowAuthModal } = useAuth(); 

  return (
    <MainLayout> {/* MainLayout của em sẽ tự động render thanh Navbar cố định ở đây */}
      <Routes>
        {/* 🔓 Các trang CÔNG KHAI - Khách vãng lai xem thoải mái */}
        <Route path="/"                   element={<Home />} />
        <Route path="/post/:id"           element={<Detail />} />
        <Route path="/profile/:userId"    element={<Profile />} />
        <Route path="/explore"            element={<Explore />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/register"           element={<Register />} />

        {/* 🔒 TRANG BẢO MẬT - Gác cổng chặn lại nếu chưa có tài khoản */}
        <Route 
          path="/following" 
          element={
            <ProtectedRoute>
              <Following />
            </ProtectedRoute>
          } 
        />
      </Routes>

      {/* ── HIỂN THỊ MODAL TOÀN CỤC ĐÈ LÊN TRÊN MAINLAYOUT ── */}
      {/* Nhờ CSS position: fixed, modal sẽ phủ lên trên cả Navbar và nội dung trang con */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider> 
       <AppContent />
    </AuthProvider>
  );
}

export default App;