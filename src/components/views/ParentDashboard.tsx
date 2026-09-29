import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { ChildSwitcher } from '../layout/ChildSwitcher';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import {
  CalendarCheck,
  Award,
  BookOpen,
  Inbox,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Sparkles,
  Lock,
  Calendar,
  Smile,
  Megaphone,
  UploadCloud,
  FileText,
  Printer,
  ShieldCheck,
  EyeOff,
} from 'lucide-react';
import { AdministrativeRequest, AdministrativeRequestType } from '../../lib/types/database.types';

export function ParentDashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const {
    activeChild,
    attendance,
    assignments,
    submissions,
    requests,
    exams,
    examResults,
    behaviorRecords,
    timetable,
    announcements,
    isTermGradesPublished,
    submitRequest,
    submitHomework,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'attendance' | 'grades' | 'homework' | 'timetable' | 'behavior' | 'requests' | 'announcements'
  >('overview');

  // Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<AdministrativeRequestType>('certificate_request');
  const [requestDesc, setRequestDesc] = useState('');
  const [requestAttachment, setRequestAttachment] = useState('تقرير_طبي_رسمي_معتمد.pdf');

  // Submit Homework Solution State
  const [submittingHwId, setSubmittingHwId] = useState<string | null>(null);
  const [solutionAttachment, setSolutionAttachment] = useState('حل_الواجب_المنزلي.pdf');

  if (!activeChild) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        لم يتم العثور على بيانات أبناء مسجلة لهذا الحساب.
      </div>
    );
  }

  // 1. Attendance for active child only
  const childAttendance = attendance.filter((a) => a.student_id === activeChild.id);
  const todayRecord = childAttendance.find((a) => a.date === '2026-09-29');
  const totalPresent = childAttendance.filter((a) => a.status === 'present').length;
  const totalAbsence = childAttendance.filter(
    (a) => a.status === 'excused_absence' || a.status === 'unexcused_absence'
  ).length;

  // 2. Homework for active child's section
  const childHomework = assignments.filter((hw) => hw.section_id === activeChild.section_id);

  // 3. Exams: ONLY published exams for active child's section
  const publishedExams = exams.filter((e) => e.is_published && e.section_id === activeChild.section_id);

  // 4. Behavior: ONLY visible records for active child (strictly filtering out private teacher notes)
  const childBehavior = behaviorRecords.filter(
    (b) => b.student_id === activeChild.id && b.is_visible_to_parent
  );

  // 5. Timetable for active child's section
  const childTimetable = timetable.filter((t) => t.section_id === activeChild.section_id);

  // 6. Requests submitted for active child
  const childRequests = requests.filter((r) => r.student_id === activeChild.id);

  // 7. Announcements targeting parents or child's branch/grade
  const childAnnouncements = announcements.filter((ann) => {
    if (ann.target_audience === 'teachers') return false;
    if (ann.branch_id && ann.branch_id !== activeChild.branch_id) return false;
    return true;
  });

  const handleCreateRequest = () => {
    if (!requestDesc.trim()) {
      alert('يرجى كتابة تفاصيل الطلب');
      return;
    }
    submitRequest(requestType, requestDesc, activeChild.id, requestAttachment);
    setRequestDesc('');
    setShowRequestModal(false);
    alert('تم إرسال الطلب إلى إدارة المدرسة بنجاح!');
  };

  const handleSendHomework = (hwId: string) => {
    submitHomework(hwId, activeChild.id, solutionAttachment);
    setSubmittingHwId(null);
    alert('تم تسليم حل الواجب بنجاح إلى المعلم!');
  };

  return (
    <div className="space-y-6">
      {/* Top Child Selector Switcher */}
      <ChildSwitcher />

      {/* Active Child Mini Profile Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
            {activeChild.first_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">{activeChild.full_name}</h2>
              <Badge variant="purple">{activeChild.status === 'active' ? 'منتظم' : 'غير نشط'}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              رقم الهوية: <span className="font-mono text-slate-700">{activeChild.national_id}</span> • {activeChild.grade_name} ({activeChild.section_name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate('grading')}
            className="text-xs font-bold"
          >
            <Award className="w-3.5 h-3.5 ml-1 text-amber-500" />
            كشف الدرجات والشهادة
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowRequestModal(true)}
            className="text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5 ml-1" />
            تقديم طلب للمدرسة
          </Button>
        </div>
      </div>

      {/* Navigation Tabs for Parent */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: Sparkles },
          { id: 'attendance', label: 'الحضور والمواظبة', icon: CalendarCheck },
          { id: 'grades', label: 'العلامات والامتحانات', icon: Award },
          { id: 'homework', label: 'الواجبات والتسليمات', icon: BookOpen },
          { id: 'timetable', label: 'الجدول المدرسي', icon: Clock },
          { id: 'behavior', label: 'السلوك والملاحظات', icon: Smile },
          { id: 'requests', label: 'الطلبات الإدارية', icon: Inbox },
          { id: 'announcements', label: 'التعاميم والإعلانات', icon: Megaphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Attendance Status */}
            <Card className="border-r-4 border-r-emerald-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">حضور اليوم ({activeChild.first_name})</p>
                  <div className="mt-1">
                    {todayRecord ? (
                      <Badge variant={todayRecord.status === 'present' ? 'success' : 'danger'}>
                        {todayRecord.status === 'present'
                          ? 'حاضر في المدرسة'
                          : todayRecord.status === 'late'
                          ? 'متأخر'
                          : 'غائب'}
                      </Badge>
                    ) : (
                      <Badge variant="default">جاري رصد الحضور</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">تاريخ اليوم: 2026-09-29</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Academic GPA */}
            <Card className="border-r-4 border-r-blue-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">المعدل الفصلي التراكمي</p>
                  <h4 className="text-lg font-black text-slate-900 mt-0.5">
                    {isTermGradesPublished ? '95.8%' : 'قيد المراجعة'}
                  </h4>
                  <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
                    {isTermGradesPublished ? 'المركز الثالث على الشعبة' : 'لم تنشر الدرجات بعد'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Behavior & Points */}
            <Card className="border-r-4 border-r-amber-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">السلوك والمواظبة</p>
                  <h4 className="text-lg font-black text-amber-600 mt-0.5">100 / 100</h4>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    {childBehavior.length} إشادات تميز معتمدة
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Requests */}
            <Card className="border-r-4 border-r-purple-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">الطلبات الإدارية للابن</p>
                  <h4 className="text-lg font-bold text-slate-800 mt-0.5">{childRequests.length} طلبات</h4>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="text-[11px] text-purple-600 font-bold hover:underline mt-0.5 block text-right cursor-pointer"
                  >
                    + تقديم طلب جديد
                  </button>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Inbox className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Shortcuts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Homework Peek */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle>الواجبات المنزلية المستحقة</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('homework')} className="text-xs">
                    عرض الكل ({childHomework.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5">
                {childHomework.slice(0, 2).map((hw) => (
                  <div key={hw.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{hw.title}</span>
                      <span className="text-rose-600 font-mono font-bold text-[11px]">تسليم: {hw.due_date}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{hw.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Published Exams Peek */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle>الامتحانات المعتمدة المنشورة</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('grades')} className="text-xs">
                    عرض الكل ({publishedExams.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5">
                {publishedExams.length > 0 ? (
                  publishedExams.map((ex) => (
                    <div key={ex.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{ex.title}</span>
                        <Badge variant="purple">{ex.exam_date}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>المادة: {ex.subject_name}</span>
                        <span>التوقيت: {ex.start_time} - {ex.end_time}</span>
                        <span className="font-bold text-blue-600">{ex.total_marks} درجة</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    لا توجد امتحانات منشورة حالياً
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>سجل الحضور والغياب للابن: {activeChild.full_name}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  إجمالي أيام الحضور: {totalPresent} • إجمالي الغياب: {totalAbsence}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRequestType('absence_excuse');
                  setShowRequestModal(true);
                }}
                className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                + تقديم عذر غياب رسمي
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">التاريخ</th>
                    <th className="p-3.5">حالة الحضور</th>
                    <th className="p-3.5">الملاحظات المسجلة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {childAttendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-mono text-slate-800 font-semibold">{rec.date}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            rec.status === 'present'
                              ? 'success'
                              : rec.status === 'late'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {rec.status === 'present'
                            ? 'حاضر'
                            : rec.status === 'late'
                            ? 'متأخر'
                            : rec.status === 'excused_absence'
                            ? 'غياب بعذر'
                            : 'غياب بدون عذر'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-600">{rec.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: GRADES & EXAMS (STRICT RESTRICTION: NO UNPUBLISHED DATA) */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          {!isTermGradesPublished && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>تنويه الإدارة الأكاديمية:</strong> نتائج وعلامات هذا الفصل الدراسي ما زالت قيد المراجعة والتدقيق الداخلي ولم تعتمد للنشر بعد. ستظهر فور اعتمادها من مدير المدرسة.
              </div>
            </div>
          )}

          {/* Published Report Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>كشف الدرجات الفصلية المعتمدة</CardTitle>
                <Badge variant={isTermGradesPublished ? 'success' : 'warning'}>
                  {isTermGradesPublished ? 'معتمدة ومنشورة' : 'مسودة غير منشورة'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isTermGradesPublished ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">المقرر الدراسي</th>
                        <th className="p-3.5 text-center">أعمال السنة (30)</th>
                        <th className="p-3.5 text-center">الاختبار النصفي (20)</th>
                        <th className="p-3.5 text-center">النهائي (50)</th>
                        <th className="p-3.5 text-center font-black text-blue-900">المجموع النهائي (100)</th>
                        <th className="p-3.5 text-center">التقدير</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">الرياضيات المتقدمة 1</td>
                        <td className="p-3.5 text-center">29</td>
                        <td className="p-3.5 text-center">19</td>
                        <td className="p-3.5 text-center">48</td>
                        <td className="p-3.5 text-center font-black text-blue-700 text-sm">96</td>
                        <td className="p-3.5 text-center"><Badge variant="success">ممتاز (A+)</Badge></td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">الفيزياء العامة</td>
                        <td className="p-3.5 text-center">28</td>
                        <td className="p-3.5 text-center">18</td>
                        <td className="p-3.5 text-center">48</td>
                        <td className="p-3.5 text-center font-black text-blue-700 text-sm">94</td>
                        <td className="p-3.5 text-center"><Badge variant="success">ممتاز (A)</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  العلامات محجوبة ومحمية بنظام أذونات RLS حتى إعلانها رسمياً
                </div>
              )}
            </CardContent>
          </Card>

          {/* Published Exams */}
          <Card>
            <CardHeader>
              <CardTitle>الامتحانات المجدولة المنشورة</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {publishedExams.map((ex) => (
                <div key={ex.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{ex.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      المادة: {ex.subject_name} • التاريخ: {ex.exam_date} ({ex.start_time} - {ex.end_time})
                    </p>
                  </div>
                  <Badge variant="purple">الدرجة: {ex.total_marks}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: HOMEWORK & SUBMISSIONS */}
      {activeTab === 'homework' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {childHomework.map((hw) => {
            const childSubm = submissions.find(
              (s) => s.assignment_id === hw.id && s.student_id === activeChild.id
            );

            return (
              <Card key={hw.id} className="hover:shadow-xs transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <Badge variant="purple">{hw.subject_name}</Badge>
                    <span className="text-[11px] text-rose-600 font-mono font-bold">
                      الموعد النهائي: {hw.due_date}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2.5">{hw.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {hw.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">حالة التسليم:</span>
                      {childSubm ? (
                        <Badge variant={childSubm.status === 'graded' ? 'success' : 'info'}>
                          {childSubm.status === 'graded'
                            ? `تم التصحيح (${childSubm.grade} / 10)`
                            : 'تم التسليم (في انتظار التصحيح)'}
                        </Badge>
                      ) : (
                        <Badge variant="warning">لم يتم التسليم بعد</Badge>
                      )}
                    </div>

                    {childSubm?.feedback && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                        <strong className="block text-[10px] text-emerald-800">ملاحظات المعلم:</strong>
                        {childSubm.feedback}
                      </div>
                    )}

                    {!childSubm && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setSubmittingHwId(hw.id)}
                        className="w-full text-xs font-bold mt-2"
                      >
                        <UploadCloud className="w-4 h-4 ml-1.5" />
                        تسليم حل الواجب إلكترونياً
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 5: TIMETABLE */}
      {activeTab === 'timetable' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>الجدول الدراسي الأسبوعي: ({activeChild.section_name})</CardTitle>
              <Badge variant="info">محدث ومعتمد</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {childTimetable.map((entry) => (
                <div key={entry.id} className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-blue-900">الحصة {entry.period_number}</span>
                    <span className="font-mono text-[10px] text-blue-600">{entry.start_time} - {entry.end_time}</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{entry.subject_name}</div>
                  <div className="text-[11px] text-slate-600">المعلم: {entry.teacher_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">📍 {entry.classroom}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: BEHAVIOR & NOTES (STRICTLY RESTRICTED TO is_visible_to_parent) */}
      {activeTab === 'behavior' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {childBehavior.map((rec) => (
              <Card key={rec.id} className="hover:shadow-xs transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <Badge variant={rec.type === 'positive' ? 'success' : 'danger'}>
                      {rec.type === 'positive' ? 'سلوك إيجابي وتميز' : 'ملاحظة سلوكية'}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">{rec.incident_date}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2.5">{rec.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {rec.description}
                  </p>

                  {rec.action_taken && (
                    <div className="mt-3 p-2 bg-slate-100 rounded-lg text-xs text-slate-700">
                      <strong className="block text-[10px] text-slate-500">الإجراء والتوجيه التربوي:</strong>
                      {rec.action_taken}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {childBehavior.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              لا توجد ملاحظات سلوكية مسجلة للابن
            </div>
          )}
        </div>
      )}

      {/* TAB 7: ADMINISTRATIVE REQUESTS */}
      {activeTab === 'requests' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>الطلبات الإدارية المقدمة لـ {activeChild.first_name}</CardTitle>
              <Button size="sm" variant="primary" onClick={() => setShowRequestModal(true)} className="text-xs font-bold">
                <Plus className="w-3.5 h-3.5 ml-1" />
                تقديم طلب جديد
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {childRequests.map((req) => (
              <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{req.type_label}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{req.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">تاريخ التقديم: {req.created_at}</span>
                  </div>
                  <Badge
                    variant={
                      req.status === 'completed'
                        ? 'success'
                        : req.status === 'in_progress'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {req.status === 'completed'
                      ? 'منجز ومكتمل'
                      : req.status === 'in_progress'
                      ? 'قيد المعالجة'
                      : 'قيد الانتظار'}
                  </Badge>
                </div>
                {req.admin_response && (
                  <div className="mt-2 p-2.5 bg-emerald-50 rounded-lg text-xs text-emerald-800 border border-emerald-100">
                    <strong className="block text-[10px] text-emerald-900">رد إدارة المدرسة:</strong>
                    {req.admin_response}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 8: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {childAnnouncements.map((ann) => (
            <Card key={ann.id} className="hover:shadow-xs transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Badge variant="purple">تعميم مدرسي</Badge>
                  <span className="text-[10px] text-slate-400 font-mono">{ann.published_at}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-2.5">{ann.title}</h3>
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {ann.content}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  صادر عن: <strong className="text-slate-700">{ann.created_by_name}</strong>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={`تقديم طلب إداري بخصوص (${activeChild.first_name})`}
        description="سيتم إرسال الطلب مباشرة لإدارة الفرع ومتابعته إلكترونياً"
      >
        <div className="space-y-4">
          <Select
            label="نوع الطلب *"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as AdministrativeRequestType)}
          >
            <option value="certificate_request">طلب شهادة تعريف طالب رسمية</option>
            <option value="transfer_request">طلب نقل إلى فرع أو مدرسة أخرى</option>
            <option value="absence_excuse">تقديم عذر غياب رسمي (إجازة مرضية / طارئ)</option>
            <option value="appointment_request">طلب موعد مع إدارة المدرسة أو المعلم</option>
            <option value="general_inquiry">استفسار أو اقتراح عام</option>
          </Select>

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تفاصيل ومبررات الطلب *
            </label>
            <textarea
              rows={4}
              value={requestDesc}
              onChange={(e) => setRequestDesc(e.target.value)}
              placeholder="اكتب ما تحتاجه بدقة ليتمكن موظف الإدارة من خدمتكم بأسرع وقت..."
              className="w-full px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Input
            label="المستند المرفق (PDF / صورة)"
            value={requestAttachment}
            onChange={(e) => setRequestAttachment(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateRequest}>
              <Send className="w-3.5 h-3.5 ml-1.5" />
              إرسال الطلب
            </Button>
          </div>
        </div>
      </Modal>

      {/* Homework Submit Modal */}
      {submittingHwId && (
        <Modal
          isOpen={!!submittingHwId}
          onClose={() => setSubmittingHwId(null)}
          title="تسليم حل الواجب المنزلي"
          description="إرفاق ملف الحل بصيغة PDF أو صورة لمعلم المادة"
        >
          <div className="space-y-4">
            <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-2">
              <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700">الملف المحدد للرفع:</p>
              <span className="font-mono text-xs bg-white px-3 py-1 rounded border border-slate-200 inline-block text-blue-700 font-bold">
                {solutionAttachment}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSubmittingHwId(null)}>
                إلغاء
              </Button>
              <Button variant="primary" onClick={() => handleSendHomework(submittingHwId)}>
                تأكيد التسليم
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
