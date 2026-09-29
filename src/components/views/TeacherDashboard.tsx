import React from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Clock,
  BookOpen,
  CalendarCheck,
  Award,
  FileText,
  Smile,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';

export function TeacherDashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { currentUser, timetable, assignments, markAllSectionPresent, students } = useSchool();

  // Filter timetable for this teacher
  const teacherPeriods = timetable.filter((t) => t.day_of_week === 0);

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge variant="success" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 mb-2">
              بوابة المعلم المعتمد (Teacher Portal)
            </Badge>
            <h1 className="text-xl font-extrabold">{currentUser.full_name}</h1>
            <p className="text-xs text-emerald-100 mt-1">
              مرحباً بك! تقتصر صلاحياتك بحسب قواعد RLS الصارمة على المواد والصفوف والشعب المسندة إليك فقط.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('attendance')}
              className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs"
            >
              <CalendarCheck className="w-4 h-4 ml-1.5" />
              رصد الحضور السريع
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('assignments')}
              className="border-white/30 text-white hover:bg-white/10 font-bold text-xs"
            >
              <Plus className="w-4 h-4 ml-1.5" />
              إضافة واجب منزلي
            </Button>
          </div>
        </div>
      </div>

      {/* Today's Schedule (حصص اليوم) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <CardTitle>جدول حصص اليوم (الأحد)</CardTitle>
            </div>
            <Badge variant="info">4 حصص مجدولة</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teacherPeriods.map((period) => (
              <div
                key={period.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-500/60 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    الحصة {period.period_number}
                  </span>
                  <span className="text-slate-400 font-mono">{period.start_time} - {period.end_time}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-800">{period.subject_name}</h4>
                <p className="text-xs text-slate-500 mt-1">{period.section_name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{period.classroom}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      markAllSectionPresent(period.section_id, '2026-09-29');
                      alert('تم رصد حضور الشعبة كاملاً (Mark All Present) بنجاح!');
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    رصد الحضور (الكل حاضر)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Assignments & Behavior Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>الواجبات المدرسية المفتوحة حالياً</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('assignments')} className="text-xs">
                إدارة الواجبات
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.map((hw) => (
                <div key={hw.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{hw.title}</span>
                    <Badge variant="warning">تسليم: {hw.due_date}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{hw.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>المادة: {hw.subject_name}</span>
                    <span>{hw.section_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Behavior Actions */}
        <Card>
          <CardHeader>
            <CardTitle>تدوين السلوك والملاحظات الأكاديمية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 mb-4">
              يمكنك رصد النقاط الإيجابية للطلاب المتميزين أو تسجيل المخالفات السلوكية وفق لائحة السلوك المعتمدة وتحديد إمكانية ظهورها لولي الأمر.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('behavior')}
                className="text-xs font-semibold"
              >
                <Smile className="w-4 h-4 ml-1.5 text-emerald-600" />
                رصد تعزيز إيجابي
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('behavior')}
                className="text-xs font-semibold"
              >
                <AlertCircle className="w-4 h-4 ml-1.5 text-rose-500" />
                تسجيل ملاحظة سلوكية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
