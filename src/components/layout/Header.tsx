import React, { useState } from 'react';
import { useSchool, MOCK_USERS } from '../../lib/store/school-store';
import { UserRole } from '../../lib/types/database.types';
import { Building2, Bell, Shield, ChevronDown, Check, GraduationCap } from 'lucide-react';
import { Badge } from '../ui/badge';

export function Header() {
  const { currentBranch, branches, switchBranch, currentUser, switchUserRole } = useSchool();
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleLabels: Record<UserRole, { label: string; variant: 'purple' | 'info' | 'success' | 'warning' }> = {
    super_admin: { label: 'سوبر أدمن (إدارة عامة)', variant: 'purple' },
    admin: { label: 'مدير فرع (Admin)', variant: 'info' },
    teacher: { label: 'معلم (Teacher)', variant: 'success' },
    parent: { label: 'ولي أمر (Parent)', variant: 'warning' },
  };

  // Determine which branches the current user can access
  const availableBranches =
    currentUser.role === 'super_admin'
      ? branches
      : branches.filter((b) => currentUser.assigned_branches.includes(b.id));

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Branch Context Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-all text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs"
            >
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block leading-tight">الفرع النشط</span>
                <span className="truncate max-w-[180px] sm:max-w-xs">{currentBranch.name}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showBranchMenu && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowBranchMenu(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                  فروع المؤسسة المتاحة لك
                </div>
                {availableBranches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => switchBranch(branch.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-right hover:bg-slate-50 transition-colors ${
                      branch.id === currentBranch.id ? 'bg-blue-50/50 text-blue-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p>{branch.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{branch.city} • كود: {branch.code}</p>
                    </div>
                    {branch.id === currentBranch.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center / Right: Role Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Persona Switcher for Evaluation */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/80 hover:bg-amber-100/60 transition-colors text-xs font-bold text-amber-900 cursor-pointer shadow-2xs"
              title="تبديل الدور لتجربة الصلاحيات"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">تبديل الدور:</span>
              <Badge variant={roleLabels[currentUser.role].variant}>
                {roleLabels[currentUser.role].label}
              </Badge>
              <ChevronDown className="w-3 h-3 text-amber-700" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute left-0 sm:right-auto mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                  اختر الحساب لتجربة صلاحيات RLS
                </div>
                {(['super_admin', 'admin', 'teacher', 'parent'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => switchUserRole(role)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-right hover:bg-slate-50 transition-colors ${
                      currentUser.role === role ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p>{MOCK_USERS[role].full_name}</p>
                      <p className="text-[10px] text-slate-400">{roleLabels[role].label}</p>
                    </div>
                    {currentUser.role === role && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
            </button>

            {showNotifications && (
              <div
                className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50 text-right"
                onClick={() => setShowNotifications(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-900">الإشعارات والتنبيهات</span>
                  <span className="text-[10px] text-blue-600 cursor-pointer">تحديد كمقروء</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100">
                    <p className="font-semibold text-slate-800">تم تسجيل حضور اليوم بنجاح</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">تم رصد حضور الشعب والصفوف لفرع السليمانية.</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-800">طلب إداري جديد من ولي أمر</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">م. خالد السعيد قدم طلب شهادة قيد دراسي.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1 border-r border-slate-200 pr-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
              {currentUser.full_name.slice(0, 1)}
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                {currentUser.full_name}
              </p>
              <p className="text-[10px] text-slate-400">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
