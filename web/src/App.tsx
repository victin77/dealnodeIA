import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { NewMeetingPage } from "./pages/NewMeetingPage";
import { MeetingReportPage } from "./pages/MeetingReportPage";
import { HistoryPage } from "./pages/HistoryPage";
import { FoldersPage } from "./pages/FoldersPage";
import { FolderDetailPage } from "./pages/FolderDetailPage";
import { ClientsPage } from "./pages/ClientsPage";
import { PerformancePage } from "./pages/PerformancePage";
import { SettingsPage } from "./pages/SettingsPage";

function Private({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Private><DashboardPage /></Private>} />
      <Route path="/nova" element={<Private><NewMeetingPage /></Private>} />
      <Route path="/historico" element={<Private><HistoryPage /></Private>} />
      <Route path="/pastas" element={<Private><FoldersPage /></Private>} />
      <Route path="/pastas/:id" element={<Private><FolderDetailPage /></Private>} />
      <Route path="/clientes" element={<Private><ClientsPage /></Private>} />
      <Route path="/desempenho" element={<Private><PerformancePage /></Private>} />
      <Route path="/config" element={<Private><SettingsPage /></Private>} />
      <Route
        path="/reuniao/:id"
        element={<Private><MeetingReportPage /></Private>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
