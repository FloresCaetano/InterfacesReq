import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import Dashboard from '../../pages/Dashboard';
import CreadorDashboard from '../../pages/CreadorDashboard';
import FirmanteDashboard from '../../pages/FirmanteDashboard';
import AdminDashboard from '../../pages/AdminDashboard';
import AuditorDashboard from '../../pages/AuditorDashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/creador" element={<CreadorDashboard />} />
        <Route path="/firmante" element={<FirmanteDashboard />} />
        <Route path="/administrador" element={<AdminDashboard />} />
        <Route path="/auditor" element={<AuditorDashboard />} /> 
      </Routes>
    </BrowserRouter>
  );
}
