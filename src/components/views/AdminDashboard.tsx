import React from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  Award,
  Clock,
  Inbox,
  Megaphone,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

export function AdminDashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { currentBranch, students, attendance, requests, exams, announcements } = useSchool();

  const branchStudents = students.filter((s) => s.branch_id === currentBranch.id);
  const todayAttendance = attendance.filter((a) => a.date === '2026-09-29');
  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const attendanceRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 96;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <Badge variant="info">{currentBranch.name}</Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">
              لوحة إدارة الفرع الأكاديمية والتشغيلية
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              متابعة حضور الطلاب، رصد العلامات والامتحانات، الجداول، وإجراءات أولياء الأمور اليومية.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('attendance')}
              className="text-xs font-bold"
            >
              <CalendarCheck className="w-4 h-4 ml-1.5" />
              رصد حضور اليوم
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('students')}
              className="text-xs font-bold"
            >
              <GraduationCap className="w-4 h-4 ml-1.5" />
              إدارة الطلاب
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">طلاب هذا الفرع</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{branchStudents.length}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">شعب نشطة: 3 شعب</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">نسبة حضور اليوم</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{attendanceRate}%</h3>
              <p className="text-[11px] text-slate-400 mt-1">إجمالي المرصود: {todayAttendance.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">الامتحانات القادمة</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{exams.length}</h3>
              <p className="text-[11px] text-slate-400 mt-1">الفصل الدراسي الأول</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">طلبات تحتاج رداً</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {requests.filter((r) => r.status === 'pending' || r.status === 'in_progress').length}
              </h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">شهادات ونقل واستفسار</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections: Requests & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Parent Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>الطلبات الإدارية الواردة من أولياء الأمور</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('requests')} className="text-xs">
                عرض الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{req.type_label}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        الطالب: <span className="text-slate-700 font-medium">{req.student_name}</span> | ولي الأمر: {req.parent_name}
                      </p>
                    </div>
                    <Badge variant={req.status === 'completed' ? 'success' : req.status === 'in_progress' ? 'info' : 'warning'}>
                      {req.status === 'completed' ? 'منجز' : req.status === 'in_progress' ? 'قيد المعالجة' : 'قيد الانتظار'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg">
                    {req.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* School Announcements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>التعاميم والإعلانات المدرسية الصادرة</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('announcements')} className="text-xs">
                إعلان جديد
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-blue-600 font-bold px-2 py-0.5 bg-blue-50 rounded-md">
                      {ann.target_audience === 'all' ? 'الكل' : 'أولياء الأمور'}
                    </span>
                    <span className="text-[10px] text-slate-400">{ann.published_at}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 mt-2">{ann.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
