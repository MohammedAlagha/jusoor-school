import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CalendarCheck, CheckCheck, Clock, AlertCircle, FileSpreadsheet, Search } from 'lucide-react';
import { AttendanceStatus } from '../../lib/types/database.types';

export function AttendanceView() {
  const { students, attendance, markAttendance, markAllSectionPresent, currentBranch } = useSchool();
  const [selectedDate, setSelectedDate] = useState('2026-09-29');
  const [selectedSection, setSelectedSection] = useState('sec-01');

  // Filter students by section
  const sectionStudents = students.filter((s) => s.section_id === selectedSection && s.branch_id === currentBranch.id);

  // Stats calculation
  const sectionAttendanceRecords = sectionStudents.map((s) => {
    const rec = attendance.find((a) => a.student_id === s.id && a.date === selectedDate);
    return {
      student: s,
      status: rec ? rec.status : ('present' as AttendanceStatus),
      notes: rec?.notes || '',
    };
  });

  const presentCount = sectionAttendanceRecords.filter((r) => r.status === 'present').length;
  const lateCount = sectionAttendanceRecords.filter((r) => r.status === 'late').length;
  const excusedCount = sectionAttendanceRecords.filter((r) => r.status === 'excused_absence').length;
  const unexcusedCount = sectionAttendanceRecords.filter((r) => r.status === 'unexcused_absence').length;
  const totalStudents = sectionStudents.length || 1;
  const attendancePercentage = Math.round(((presentCount + lateCount) / totalStudents) * 100);

  const handleMarkAll = () => {
    markAllSectionPresent(selectedSection, selectedDate);
    alert('تم رصد جميع طلاب الشعبة كـ "حاضر" بنجاح!');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">نظام تسجيل ومتابعة الحضور والغياب</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل سريع لحضور الشعبة اليومي مع الإشعار التلقائي لولي الأمر عند تسجيل غياب
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <span>التاريخ:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-800"
            />
          </div>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer font-bold text-slate-700"
          >
            <option value="sec-01">الصف الأول الثانوي - شعبة أ</option>
            <option value="sec-02">الصف الأول الثانوي - شعبة ب</option>
            <option value="sec-03">الصف الثالث المتوسط - شعبة أ</option>
          </select>

          <Button
            variant="success"
            size="sm"
            onClick={handleMarkAll}
            className="text-xs font-bold shadow-xs"
          >
            <CheckCheck className="w-4 h-4 ml-1.5" />
            تسجيل الكل حاضر (Mark All Present)
          </Button>
        </div>
      </div>

      {/* Real-time KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-right">
          <span className="text-[11px] font-semibold text-emerald-800 block">حاضر</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{presentCount}</span>
          <span className="text-[10px] text-emerald-600">{attendancePercentage}% نسبة الحضور</span>
        </div>
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-right">
          <span className="text-[11px] font-semibold text-amber-800 block">متأخر</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{lateCount}</span>
          <span className="text-[10px] text-amber-600">دقائق التأخير موثقة</span>
        </div>
        <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl text-right">
          <span className="text-[11px] font-semibold text-blue-800 block">غياب بعذر مقبول</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{excusedCount}</span>
          <span className="text-[10px] text-blue-600">مرفق تقرير طبي</span>
        </div>
        <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-xl text-right">
          <span className="text-[11px] font-semibold text-rose-800 block">غياب بدون عذر</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{unexcusedCount}</span>
          <span className="text-[10px] text-rose-600">يظهر فوراً لولي الأمر</span>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>كشف حضور شعبة الطلاب ({sectionStudents.length} طالب)</CardTitle>
            <span className="text-xs text-slate-400">التاريخ: {selectedDate}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">اسم الطالب</th>
                  <th className="p-4">رقم الهوية</th>
                  <th className="p-4">حالة الحضور</th>
                  <th className="p-4">ملاحظات العذر / التأخير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sectionAttendanceRecords.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/50">
                    <td className="p-4 text-xs font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{item.student.full_name}</span>
                      <span className="text-[11px] text-slate-400">{item.student.section_name}</span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-600">{item.student.national_id}</td>
                    <td className="p-4">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          markAttendance(item.student.id, e.target.value as AttendanceStatus, item.notes)
                        }
                        className={`text-xs font-bold rounded-lg px-3 py-1.5 border cursor-pointer ${
                          item.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : item.status === 'late'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : item.status === 'excused_absence'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        <option value="present">حاضر (Present)</option>
                        <option value="late">متأخر (Late)</option>
                        <option value="excused_absence">غائب بعذر (Excused)</option>
                        <option value="unexcused_absence">غائب بدون عذر (Unexcused)</option>
                        <option value="early_leave">خروج مبكر (Early Leave)</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="ملاحظات العذر..."
                        defaultValue={item.notes}
                        onBlur={(e) => markAttendance(item.student.id, item.status, e.target.value)}
                        className="w-full text-xs px-2.5 py-1 rounded border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
