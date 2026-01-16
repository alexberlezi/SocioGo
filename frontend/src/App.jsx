import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AssocieSe from './pages/AssocieSe';
import AdminDashboard from './pages/AdminDashboard';
import PendingRequests from './pages/PendingRequests';
import MembersList from './pages/MembersList';
import MemberDetails from './pages/MemberDetails';
import EditMemberProfile from './pages/EditMemberProfile';
import AssociationSettings from './pages/AssociationSettings';
import MembershipCard from './pages/MembershipCard';
import { ThemeProvider } from './context/ThemeContext';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div className="p-4">Home (Vá para /associe-se)</div>} />
          <Route path="/associe-se" element={<AssocieSe />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/approvals" element={<PendingRequests />} />
          <Route path="/admin/members" element={<MembersList />} />
          <Route path="/admin/members/:id/edit" element={<EditMemberProfile />} />
          <Route path="/admin/approvals/:id" element={<MemberDetails />} />
          <Route path="/admin/settings" element={<AssociationSettings />} />
          <Route path="/portal/carteirinha/:id" element={<MembershipCard />} />
        </Routes>
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
