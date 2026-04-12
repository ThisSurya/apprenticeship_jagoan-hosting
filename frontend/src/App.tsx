import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import GuestRoute from '@/components/auth/GuestRoute';
import { MainLayout } from '@/components/layouts/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Residents from '@/pages/Residents';
import Houses from '@/pages/Houses';
import HouseDetail from '@/pages/HouseDetail';
import Billing from '@/pages/Billing';
import Expenses from '@/pages/Expenses';
import Reports from '@/pages/Reports';
import Login from '@/pages/Login';
import Templates from '@/pages/Templates';

import { ResidentProvider } from '@/context/ResidentContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ResidentProvider>
          <TooltipProvider delayDuration={0}>
            <Routes>
              {/* Public/Guest Routes */}
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
              </Route>

              {/* Private/Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/warga" element={<Residents />} />
                  <Route path="/rumah" element={<Houses />} />
                  <Route path="/rumah/:id" element={<HouseDetail />} />
                  <Route path="/tagihan" element={<Billing />} />
                  <Route path="/pengeluaran" element={<Expenses />} />
                  <Route path="/laporan" element={<Reports />} />
                  <Route path="/templates" element={<Templates />} />
                </Route>
              </Route>
            </Routes>
          </TooltipProvider>
        </ResidentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
