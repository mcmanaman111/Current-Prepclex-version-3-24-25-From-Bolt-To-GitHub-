import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard3 from './pages/Dashboard3';
import AdminDashboard from './pages/admin/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CreateTest from './pages/CreateTest';
import PreviousTests from './pages/PreviousTests';
import Performance from './pages/Performance';
import Notes from './pages/Notes';
import Help from './pages/Help';
import Account from './pages/Account';
import ExamPage from './pages/ExamPage';
import TestResults from './pages/TestResults';
import StudyResources from './pages/StudyResources';
import LabValues from './pages/LabValues';
import VitalSigns from './pages/VitalSigns';
import DrugClassifications from './pages/DrugClassifications';
import MedMath from './pages/MedMath';
import NursingAbbreviations from './pages/NursingAbbreviations';
import Home from './pages/Home';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './components/AuthProvider';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth <= 640;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const DefaultLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={toggleSidebar}
        isMobile={isMobile}
      />
      <div className={`flex-1 flex flex-col ${!isMobile && !isSidebarCollapsed ? 'ml-64' : ''} ${!isMobile && isSidebarCollapsed ? 'ml-16' : ''} transition-all duration-300`}>
        <Header 
          isMobile={isMobile}
          onMenuClick={toggleSidebar}
        />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50/50 to-white dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900 transition-colors">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/exam" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
        <Route path="/results" element={
          <ProtectedRoute>
            <DefaultLayout>
              <TestResults />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <DefaultLayout>
              <AdminDashboard />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DefaultLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/study-planner" element={<Dashboard3 />} />
                  <Route path="/create-test" element={<CreateTest />} />
                  <Route path="/previous-tests" element={<PreviousTests />} />
                  <Route path="/performance" element={<Performance />} />
                  <Route path="/study-resources" element={<StudyResources />} />
                  <Route path="/lab-values" element={<LabValues />} />
                  <Route path="/vital-signs" element={<VitalSigns />} />
                  <Route path="/drug-classifications" element={<DrugClassifications />} />
                  <Route path="/med-math" element={<MedMath />} />
                  <Route path="/nursing-abbreviations" element={<NursingAbbreviations />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/account" element={<Account />} />
                </Routes>
              </DefaultLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;