import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AssocieSe from './pages/AssocieSe';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-4">Home (Vá para /associe-se)</div>} />
        <Route path="/associe-se" element={<AssocieSe />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
