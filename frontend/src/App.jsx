import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AssocieSe from './pages/AssocieSe';
import AdminDashboard from './pages/AdminDashboard';
import PendingRequests from './pages/PendingRequests';
import MemberDetails from './pages/MemberDetails';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div className="p-4">Home (Vá para /associe-se)</div>} />
          <Route path="/associe-se" element={<AssocieSe />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/approvals" element={<PendingRequests />} />
          <Route path="/admin/approvals/:id" element={<MemberDetails />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
