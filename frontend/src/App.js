import React, { useState } from 'react';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [userId, setUserId] = useState(null);

  if (!userId) {
    return <RegisterPage onRegistered={setUserId} />;
  }

  return <DashboardPage userId={userId} onLogout={() => setUserId(null)} />;
}
