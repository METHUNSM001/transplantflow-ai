import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { AlertsPage } from './pages/AlertsPage';
import { DashboardPage } from './pages/DashboardPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { LoginPage } from './pages/LoginPage';
import { MatchingPage } from './pages/MatchingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrganDetailPage } from './pages/OrganDetailPage';
import { OrgansPage } from './pages/OrgansPage';
import { RecipientsPage } from './pages/RecipientsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SimulationsPage } from './pages/SimulationsPage';
import { TransportsPage } from './pages/TransportsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Core Shell Layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="organs" element={<OrgansPage />} />
            <Route path="organs/:id" element={<OrganDetailPage />} />
            <Route path="matching" element={<MatchingPage />} />
            <Route path="transports" element={<TransportsPage />} />
            <Route path="hospitals" element={<HospitalsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="simulations" element={<SimulationsPage />} />
            <Route path="recipients" element={<RecipientsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
