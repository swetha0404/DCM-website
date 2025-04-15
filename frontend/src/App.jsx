// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UserSettings from './pages/UserSettings.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/app" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      <Route path="/settings" element={
        <PrivateRoute>
          <UserSettings />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
