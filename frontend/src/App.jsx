import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AssocieSe from './pages/AssocieSe';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-4">Home (Vá para /associe-se)</div>} />
        <Route path="/associe-se" element={<AssocieSe />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
