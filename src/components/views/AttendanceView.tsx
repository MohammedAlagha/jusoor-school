import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  CalendarCheck,
  CheckCheck,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Users,
  GraduationCap,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { AttendanceStatus, TeacherAttendanceRecord } from '../../lib/types/database.types';

export function AttendanceView() {
  const {
    students,
    teachers,
    attendance,
    teacherAttendance,
    markAttendance,
    markAllSectionPresent,
    markTeacherAttendance,
    markAllTeachersPresent,
    currentBranch,
    currentUser,
    activeChild,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'reports'>('students');
  const [selectedDate, setSelectedDate] = useState('2026-09-29');
  const [selectedSection, setSelectedSection] = useState('sec-01');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');

  // Filter students for active branch and section
  const sectionStudents = students.filter(
    (s) => s.section_id === selectedSection && s.branch_id === currentBranch.id
  );

  // Student Attendance Records for selected section & date
  const sectionAttendanceRecords = sectionStudents.map((s) => {
    const rec = attendance.find((a) => a.student_id === s.id && a.date === selectedDate);
    return {
      student: s,
      status: rec ? rec.status : ('present' as AttendanceStatus),
      minutesLate: rec?.minutes_late || 0,
      notes: rec?.notes || '',
    };
  });

  const presentCount = sectionAttendanceRecords.filter((r) => r.status === 'present').length;
  const lateCount = sectionAttendanceRecords.filter((r) => r.status === 'late').length;
  const excusedCount = sectionAttendanceRecords.filter((r) => r.status === 'excused_absence').length;
  const unexcusedCount = sectionAttendanceRecords.filter((r) => r.status === 'unexcused_absence').length;
  const earlyLeaveCount = sectionAttendanceRecords.filter((r) => r.status === 'early_leave').length;
  const totalStudents = sectionStudents.length || 1;
  const attendancePercentage = Math.round(((presentCount + lateCount) / totalStudents) * 100);

  // Teacher Attendance Records for current branch
  const branchTeachers = teachers.filter((t) => t.branch_id === currentBranch.id);
  const teacherRecords = branchTeachers.map((t) => {
    const rec = teacherAttendance.find((a) => a.teacher_id === t.id && a.date === selectedDate);
    return {
      teacher: t,
      status: rec ? rec.status : ('present' as TeacherAttendanceRecord['status']),
      checkIn: rec?.check_in || '07:20',
      checkOut: rec?.check_out || '14:30',
      notes: rec?.notes || '',
    };
  });

  const handleMarkAllStudents = () => {
    markAllSectionPresent(selectedSection, selectedDate);
    alert('تم رصد حضور جميع طلاب الشعبة كـ "حاضر" بنجاح!');
  };

  const handleMarkAllTeachers = () => {
    markAllTeachersPresent(selectedDate);
    alert('تم رصد حضور كافة المعلمين بنجاح!');
  };

  // If user is a Parent, show child's dedicated attendance view directly
  if (currentUser.role === 'parent' && activeChild) {
    const childRecords = attendance.filter((a) => a.student_id === activeChild.id);
    const childPresents = childRecords.filter((r) => r.status === 'present').length;
    const childLates = childRecords.filter((r) => r.status === 'late').length;
    const childExcused = childRecords.filter((r) => r.status === 'excused_absence').length;
    const childUnexcused = childRecords.filter((r) => r.status === 'unexcused_absence').length;

    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold text-slate-900">
                سجل الحضور والغياب للطالب: ({activeChild.full_name})
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeChild.grade_name} — {activeChild.section_name} • التحديث لحظي وفق سجلات الإدارة
            </p>
          </div>
          <Badge variant="success">نسبة الالتزام: 98%</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-right">
            <span className="text-[11px] font-semibold text-emerald-800">أيام الحضور</span>
            <span className="text-2xl font-black text-emerald-700 block mt-1">{childPresents + 18} يوماً</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-right">
            <span className="text-[11px] font-semibold text-amber-800">مرات التأخير</span>
            <span className="text-2xl font-black text-amber-700 block mt-1">{childLates} مرات</span>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-right">
            <span className="text-[11px] font-semibold text-blue-800">غياب بعذر مقبول</span>
            <span className="text-2xl font-black text-blue-700 block mt-1">{childExcused} أيام</span>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-right">
            <span className="text-[11px] font-semibold text-rose-800">غياب بدون عذر</span>
            <span className="text-2xl font-black text-rose-700 block mt-1">{childUnexcused}</span>
          </div>
        </div>

        {/* Detailed History */}
        <Card>
          <CardHeader>
            <CardTitle>سجل الأيام المفصل للشهر الحالي</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">التاريخ</th>
                    <th className="p-3.5">حالة الحضور</th>
                    <th className="p-3.5">دقائق التأخير</th>
                    <th className="p-3.5">بيان العذر والملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {childRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-mono text-slate-800 font-bold">{rec.date}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            rec.status === 'present'
                              ? 'success'
                              : rec.status === 'late'
                              ? 'warning'
                              : rec.status === 'excused_absence'
                              ? 'info'
                              : 'danger'
                          }
                        >
                          {rec.status === 'present'
                            ? 'حاضر'
                            : rec.status === 'late'
                            ? 'متأخر'
                            : rec.status === 'excused_absence'
                            ? 'غياب بعذر'
                            : 'غائب بدون عذر'}
                        </Badge>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {rec.minutes_late ? `${rec.minutes_late} دقيقة` : '—'}
                      </td>
                      <td className="p-3.5 text-slate-600">{rec.notes || 'لا توجد ملاحظات'}</td>
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              نظام إدارة الحضور والغياب الشامل (Attendance Engine)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل ومتابعة حضور الطلاب والمعلمين، تقارير الانضباط، والإشعار الفوري لولي الأمر لفرع ({currentBranch.name})
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <span>تاريخ الرصد:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-800 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          حضور الطلاب (Student Attendance)
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'teachers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          حضور المعلمين (Teacher Attendance)
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          تقارير الحضور المتقدمة وتصدير البيانات
        </button>
      </div>

      {/* TAB 1: Student Attendance */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">الشعبة:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800 cursor-pointer"
              >
                <option value="sec-01">الصف الأول الثانوي - شعبة أ</option>
                <option value="sec-02">الصف الأول الثانوي - شعبة ب</option>
                <option value="sec-03">الصف الثالث المتوسط - شعبة أ</option>
              </select>
            </div>

            <Button
              variant="success"
              size="sm"
              onClick={handleMarkAllStudents}
              className="text-xs font-bold"
            >
              <CheckCheck className="w-4 h-4 ml-1.5" />
              تسجيل الكل حاضر (Mark All Present)
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-right">
              <span className="text-[10px] font-bold text-emerald-800 block">حاضر</span>
              <span className="text-xl font-black text-emerald-700 mt-1 block">{presentCount}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">{attendancePercentage}% انضباط</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-right">
              <span className="text-[10px] font-bold text-amber-800 block">متأخر</span>
              <span className="text-xl font-black text-amber-700 mt-1 block">{lateCount}</span>
              <span className="text-[10px] text-amber-600 font-semibold">تأخير صباحي</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-right">
              <span className="text-[10px] font-bold text-blue-800 block">غياب بعذر</span>
              <span className="text-xl font-black text-blue-700 mt-1 block">{excusedCount}</span>
              <span className="text-[10px] text-blue-600 font-semibold">عذر معتمد</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-right">
              <span className="text-[10px] font-bold text-rose-800 block">غياب بدون عذر</span>
              <span className="text-xl font-black text-rose-700 mt-1 block">{unexcusedCount}</span>
              <span className="text-[10px] text-rose-600 font-semibold">إشعار ولي الأمر</span>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-right">
              <span className="text-[10px] font-bold text-indigo-800 block">خروج مبكر</span>
              <span className="text-xl font-black text-indigo-700 mt-1 block">{earlyLeaveCount}</span>
              <span className="text-[10px] text-indigo-600 font-semibold">إذن رسمي</span>
            </div>
          </div>

          {/* Student Attendance Sheet */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10">#</th>
                      <th className="p-3">اسم الطالب</th>
                      <th className="p-3">رقم الهوية</th>
                      <th className="p-3">حالة الحضور</th>
                      <th className="p-3">دقائق التأخير</th>
                      <th className="p-3">سبب العذر / الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sectionAttendanceRecords.map((item, idx) => (
                      <tr key={item.student.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{item.student.full_name}</td>
                        <td className="p-3 font-mono text-slate-600">{item.student.national_id}</td>
                        <td className="p-3">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              markAttendance(
                                item.student.id,
                                e.target.value as AttendanceStatus,
                                item.notes
                              )
                            }
                            className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer ${
                              item.status === 'present'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : item.status === 'late'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : item.status === 'excused_absence'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : item.status === 'early_leave'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="present">حاضر (Present)</option>
                            <option value="late">متأخر (Late)</option>
                            <option value="excused_absence">غائب بعذر (Excused)</option>
                            <option value="unexcused_absence">غائب بدون عذر (Unexcused)</option>
                            <option value="early_leave">خروج مبكر (Early Leave)</option>
                          </select>
                        </td>
                        <td className="p-3">
                          {item.status === 'late' ? (
                            <input
                              type="number"
                              placeholder="دقائق"
                              defaultValue={item.minutesLate || 15}
                              className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-center font-bold"
                            />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="ملاحظات العذر والتأخير..."
                            defaultValue={item.notes}
                            onBlur={(e) =>
                              markAttendance(item.student.id, item.status, e.target.value)
                            }
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
      )}

      {/* TAB 2: Teacher Attendance */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              كشف دوام الهيئة التعليمية ليوم {selectedDate} ({teacherRecords.length} معلم)
            </span>
            <Button
              variant="success"
              size="sm"
              onClick={handleMarkAllTeachers}
              className="text-xs font-bold"
            >
              <CheckCheck className="w-4 h-4 ml-1.5" />
              تسجيل حضور كافة المعلمين
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">اسم المعلم</th>
                      <th className="p-3.5">التخصص</th>
                      <th className="p-3.5">حالة الحضور</th>
                      <th className="p-3.5">وقت الحضور (Check In)</th>
                      <th className="p-3.5">وقت الانصراف (Check Out)</th>
                      <th className="p-3.5">الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teacherRecords.map((rec) => (
                      <tr key={rec.teacher.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">{rec.teacher.profile.full_name}</td>
                        <td className="p-3.5 text-slate-600">{rec.teacher.specialization}</td>
                        <td className="p-3.5">
                          <select
                            value={rec.status}
                            onChange={(e) =>
                              markTeacherAttendance(
                                rec.teacher.id,
                                selectedDate,
                                e.target.value as any,
                                rec.checkIn,
                                rec.checkOut,
                                rec.notes
                              )
                            }
                            className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer ${
                              rec.status === 'present'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : rec.status === 'late'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : rec.status === 'early_leave'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="present">حاضر (Present)</option>
                            <option value="absent">غائب (Absent)</option>
                            <option value="late">متأخر (Late)</option>
                            <option value="early_leave">خروج مبكر (Early Leave)</option>
                          </select>
                        </td>
                        <td className="p-3.5 font-mono text-slate-800">{rec.checkIn}</td>
                        <td className="p-3.5 font-mono text-slate-800">{rec.checkOut}</td>
                        <td className="p-3.5">
                          <input
                            type="text"
                            placeholder="ملاحظات الحضور..."
                            defaultValue={rec.notes}
                            onBlur={(e) =>
                              markTeacherAttendance(
                                rec.teacher.id,
                                selectedDate,
                                rec.status,
                                rec.checkIn,
                                rec.checkOut,
                                e.target.value
                              )
                            }
                            className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
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
      )}

      {/* TAB 3: Reports & Advanced Analytics */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div>
                  <CardTitle>تقرير الانضباط والغياب الشهري العام</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تحليل غياب الطلاب وتصنيف الأعذار الطبية والرسمية مع إمكانية التصدير
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert('تم تصدير كشف الحضور والغياب بصيغة Excel بنجاح!')}
                    className="text-xs font-bold"
                  >
                    <Download className="w-3.5 h-3.5 ml-1" />
                    تصدير Excel (CSV)
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold">إجمالي أيام الدراسة المرصودة</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">22 يوماً</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-xs text-emerald-800 font-bold">متوسط الحضور بالفرع</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">96.8%</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-xs text-rose-800 font-bold">الغياب غير المبرر</span>
                  <p className="text-2xl font-black text-rose-700 mt-1">1.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
