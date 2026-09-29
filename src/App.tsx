import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './lib/store/school-store';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SuperAdminDashboard } from './components/views/SuperAdminDashboard';
import { AdminDashboard } from './components/views/AdminDashboard';
import { TeacherDashboard } from './components/views/TeacherDashboard';
import { ParentDashboard } from './components/views/ParentDashboard';
import { StudentsManagementView } from './components/views/StudentsManagementView';
import { ParentsManagementView } from './components/views/ParentsManagementView';
import { AttendanceView } from './components/views/AttendanceView';
import { TimetableConflictView } from './components/views/TimetableConflictView';
import { GradingView } from './components/views/GradingView';
import { RequestsView } from './components/views/RequestsView';
import { AcademicStructureView } from './components/views/AcademicStructureView';
import { TeachersManagementView } from './components/views/TeachersManagementView';
import { BehaviorView } from './components/views/BehaviorView';
import { AssignmentsView } from './components/views/AssignmentsView';
import { AnnouncementsView } from './components/views/AnnouncementsView';
import { ReportsView } from './components/views/ReportsView';
import { Menu } from 'lucide-react';

function MainAppShell() {
  const { currentUser } = useSchool();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Render content according to currentView and active Role
  const renderViewContent = () => {
    switch (currentView) {
      case 'dashboard':
        if (currentUser.role === 'super_admin') {
          return <SuperAdminDashboard onNavigate={setCurrentView} />;
        } else if (currentUser.role === 'admin') {
          return <AdminDashboard onNavigate={setCurrentView} />;
        } else if (currentUser.role === 'teacher') {
          return <TeacherDashboard onNavigate={setCurrentView} />;
        } else {
          return <ParentDashboard onNavigate={setCurrentView} />;
        }

      case 'students':
      case 'children':
        return <StudentsManagementView />;

      case 'parents':
        return <ParentsManagementView />;

      case 'attendance':
        return <AttendanceView />;

      case 'timetable':
        return <TimetableConflictView />;

      case 'grading':
      case 'grades':
        return <GradingView />;

      case 'academic':
      case 'classes':
        return <AcademicStructureView />;

      case 'teachers':
        return <TeachersManagementView />;

      case 'requests':
        return <RequestsView />;

      case 'behavior':
        return <BehaviorView />;

      case 'assignments':
        return <AssignmentsView />;

      case 'announcements':
        return <AnnouncementsView />;

      case 'reports':
        return <ReportsView />;

      case 'branches':
      case 'schools':
      case 'admins':
      case 'users':
      case 'settings':
        return <SuperAdminDashboard onNavigate={setCurrentView} />;

      default:
        return <SuperAdminDashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Dynamic Role-Aware Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Body Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-64 transition-all">
        {/* Mobile Navigation Trigger */}
        <div className="lg:hidden bg-slate-900 text-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-xs">نظام إدارة المدرسة</span>
          </div>
          <span className="text-[10px] text-blue-400 font-bold">بوابة المدارس المتكاملة</span>
        </div>

        {/* Global Multi-Branch & Persona Header */}
        <Header />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {renderViewContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <MainAppShell />
    </SchoolProvider>
  );
}
