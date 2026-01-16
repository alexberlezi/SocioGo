import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AssocieSe from './pages/AssocieSe';
import AdminDashboard from './pages/AdminDashboard';
import PendingRequests from './pages/PendingRequests';
import MembersList from './pages/MembersList';
import MemberDetails from './pages/MemberDetails';
import EditMemberProfile from './pages/EditMemberProfile';
import AssociationSettings from './pages/AssociationSettings';
import MembershipCard from './pages/MembershipCard';
import PublicValidator from './pages/PublicValidator';
import MemberFinance from './pages/MemberFinance';
import FinanceDashboard from './pages/FinanceDashboard';
import CashFlow from './pages/CashFlow';
import Categories from './pages/Categories';
import FinancialAudit from './pages/FinancialAudit';
import MonthlyClosure from './pages/MonthlyClosure';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import SaasManagement from './pages/SaasManagement';
import UserManagement from './pages/UserManagement';
import CompanyManagement from './pages/CompanyManagement';
import FeatureGuard, { FeaturesProvider } from './components/auth/FeatureGuard';
import GlobalAdminGuard from './components/auth/GlobalAdminGuard';
import Login from './pages/Login';
import Events from './pages/Events';
import News from './pages/News';
import Polls from './pages/Polls';
import Profile from './pages/Profile';

// Portal Imports
import MemberPortalLayout from './components/layout/MemberPortalLayout';
import PortalDashboard from './pages/portal/PortalDashboard';
import PortalVoting from './pages/portal/PortalVoting';
import PortalCertificates from './pages/portal/PortalCertificates';
import { TenantProvider } from './context/TenantContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <FeaturesProvider>
          <TenantProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Login />} /> {/* Default to Login */}
              <Route path="/associe-se" element={<AssocieSe />} />

              {/* Public Verification Route */}
              <Route path="/portal/carteirinha/:id" element={<MembershipCard />} />
              <Route path="/v/:id" element={<PublicValidator />} />

              {/* Admin Routes */}
              <Route path="/admin/financeiro/socio/:id" element={<MemberFinance />} />
              <Route path="/admin/financeiro" element={<FinanceDashboard />} />
              <Route path="/admin/financeiro/categorias" element={<Categories />} />
              <Route path="/admin/financeiro/logs" element={<FinancialAudit />} />
              <Route path="/admin/financeiro/fechamento" element={<MonthlyClosure />} />
              <Route path="/admin/fluxo-caixa" element={<CashFlow />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/approvals" element={<PendingRequests />} />
              <Route path="/admin/members" element={<MembersList />} />
              <Route path="/admin/members/:id/edit" element={<EditMemberProfile />} />
              <Route path="/admin/approvals/:id" element={<MemberDetails />} />
              <Route path="/admin/settings" element={<AssociationSettings />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/events" element={<Events />} />
              <Route path="/admin/news" element={<News />} />
              <Route path="/admin/polls" element={<Polls />} />
              <Route path="/admin/profile" element={<Profile />} />
              <Route path="/admin/associations" element={
                <GlobalAdminGuard>
                  <CompanyManagement />
                </GlobalAdminGuard>
              } />
              <Route path="/admin/saas" element={
                <GlobalAdminGuard>
                  <SaasManagement />
                </GlobalAdminGuard>
              } />

              {/* Member Portal Routes */}
              <Route path="/portal" element={<MemberPortalLayout />}>
                <Route index element={<PortalDashboard />} />
                <Route path="dashboard" element={<PortalDashboard />} />
                <Route path="carteirinha" element={<MembershipCard />} />
                <Route path="votacoes" element={<PortalVoting />} />
                <Route path="certificados" element={<PortalCertificates />} />
                <Route path="perfil" element={<EditMemberProfile />} />
              </Route>
            </Routes>
          </TenantProvider>
        </FeaturesProvider>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: '!bg-slate-900 !text-white !shadow-2xl !rounded-lg !p-4 !font-medium !min-w-[300px]',
          success: {
            className: '!border-l-4 !border-l-green-500',
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            className: '!border-l-4 !border-l-red-500',
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;
