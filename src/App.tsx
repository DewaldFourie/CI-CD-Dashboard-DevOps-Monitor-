import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Deployments from './pages/Deployments';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full">
          <Header />
          <main className="bg-gray-100 flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/deployments" element={<Deployments />} />
              <Route path="/settings" element={<Settings />} />
              {/* Future: <Route path="/artifacts" element={<Artifacts />} /> */}
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
