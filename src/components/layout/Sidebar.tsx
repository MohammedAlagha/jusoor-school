import React from 'react';
import { useSchool } from '../../lib/store/school-store';
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  ShieldCheck,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  Clock,
  FileText,
  Smile,
  Megaphone,
  Inbox,
  FolderLock,
  BarChart3,
  Settings,
  UserCheck,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ currentView, onNavigate, isOpenMobile, onCloseMobile }: SidebarProps) {
  const { currentUser, school, currentBranch } = useSchool();

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'super_admin':
        return [
          { id: 'dashboard', label: 'لوحة التحكم العامة', icon: LayoutDashboard },
          { id: 'schools', label: 'إدارة المدرسة الأم', icon: Building2 },
          { id: 'branches', label: 'إدارة الفروع (Multi-Branch)', icon: GitBranch },
          { id: 'admins', label: 'مدراء الفروع والصلاحيات', icon: ShieldCheck },
          { id: 'users', label: 'المستخدمون والحسابات', icon: Users },
          { id: 'students', label: 'سجل الطلاب المركزي', icon: GraduationCap },
          { id: 'reports', label: 'التقارير المجمعة', icon: BarChart3 },
          { id: 'settings', label: 'إعدادات النظام وRLS', icon: Settings },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'لوحة تحكم الفرع', icon: LayoutDashboard },
          { id: 'students', label: 'إدارة الطلاب', icon: GraduationCap },
          { id: 'attendance', label: 'الحضور والغياب', icon: CalendarCheck },
          { id: 'academic', label: 'الصفوف والشعب والمواد', icon: BookOpen },
          { id: 'teachers', label: 'المعلمون والتعيينات', icon: UserCheck },
          { id: 'grading', label: 'العلامات والامتحانات', icon: Award },
          { id: 'timetable', label: 'الجدول الدراسي والتعارضات', icon: Clock },
          { id: 'assignments', label: 'الواجبات المدرسية', icon: FileText },
          { id: 'behavior', label: 'سجل السلوك والملاحظات', icon: Smile },
          { id: 'requests', label: 'الطلبات الإدارية', icon: Inbox },
          { id: 'announcements', label: 'الإعلانات والتعاميم', icon: Megaphone },
          { id: 'reports', label: 'التقارير والإحصائيات', icon: BarChart3 },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'لوحة تحكم المعلم', icon: LayoutDashboard },
          { id: 'classes', label: 'فصولي وشعبي المسندة', icon: BookOpen },
          { id: 'attendance', label: 'تسجيل حضور الحصة', icon: CalendarCheck },
          { id: 'grading', label: 'رصد الدرجات والامتحانات', icon: Award },
          { id: 'assignments', label: 'إسناد ومتابعة الواجبات', icon: FileText },
          { id: 'timetable', label: 'جدول الحصص الأسبوعي', icon: Clock },
          { id: 'behavior', label: 'تدوين ملاحظات السلوك', icon: Smile },
          { id: 'announcements', label: 'إعلانات المدرسة', icon: Megaphone },
        ];
      case 'parent':
        return [
          { id: 'dashboard', label: 'بوابة ولي الأمر', icon: LayoutDashboard },
          { id: 'children', label: 'ملف الأبناء الأكاديمي', icon: GraduationCap },
          { id: 'attendance', label: 'سجل الحضور والغياب', icon: CalendarCheck },
          { id: 'grades', label: 'كشف الدرجات والشهادات', icon: Award },
          { id: 'assignments', label: 'الواجبات المنزلية', icon: FileText },
          { id: 'timetable', label: 'الجدول الدراسي', icon: Clock },
          { id: 'behavior', label: 'تقرير السلوك والتميز', icon: Smile },
          { id: 'requests', label: 'تقديم ومتابعة طلب إداري', icon: Inbox },
          { id: 'announcements', label: 'تعاميم المدرسة', icon: Megaphone },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 bottom-0 right-0 w-64 bg-slate-900 text-slate-200 z-50 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                ر
              </div>
              <div className="overflow-hidden">
                <h1 className="text-sm font-extrabold text-white truncate leading-tight">
                  {school.name}
                </h1>
                <p className="text-[11px] text-blue-400 mt-0.5 truncate font-medium">
                  {currentUser.role === 'super_admin' ? 'الإدارة العامة والموحدة' : currentBranch.name}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              القائمة الرئيسية
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <div>
              <p className="text-[10px] text-slate-500">العام الأكاديمي الحالي</p>
              <p className="font-bold text-slate-300">2026 / 2027</p>
            </div>
            <div className="text-left">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-1.5 animate-pulse" />
              <span className="text-[10px] text-emerald-400">RLS Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
