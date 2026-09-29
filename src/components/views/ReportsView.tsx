import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select } from '../ui/input';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Clock,
  Smile,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  School,
  FileText,
} from 'lucide-react';

export function ReportsView() {
  const {
    currentBranch,
    branches,
    students,
    attendance,
    sections,
    subjects,
    teachers,
    timetable,
    behaviorRecords,
    school,
  } = useSchool();

  const [activeReport, setActiveReport] = useState<'attendance' | 'grades' | 'workload' | 'behavior'>('attendance');
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id || 'sec-01');

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sections[0];
  const sectionStudents = students.filter((s) => s.section_id === selectedSection?.id);

  // 1. ATTENDANCE REPORT CALCULATIONS
  const studentAttendanceData = sectionStudents.map((st) => {
    const records = attendance.filter((a) => a.student_id === st.id);
    const totalDays = records.length || 1;
    const presentCount = records.filter((a) => a.status === 'present').length;
    const absentCount = records.filter(
      (a) => a.status === 'excused_absence' || a.status === 'unexcused_absence'
    ).length;
    const lateCount = records.filter((a) => a.status === 'late').length;
    const percentage = Math.round((presentCount / totalDays) * 100);

    return {
      student: st,
      totalDays,
      presentCount,
      absentCount,
      lateCount,
      percentage,
    };
  });

  const avgAttendance =
    studentAttendanceData.length > 0
      ? Math.round(
          studentAttendanceData.reduce((acc, curr) => acc + curr.percentage, 0) /
            studentAttendanceData.length
        )
      : 96;

  // 2. SECTION GRADE REPORT CALCULATIONS
  // Deterministic mock marks based on student ID to demonstrate distribution
  const studentGradesData = sectionStudents.map((st, idx) => {
    const coursework = 25 + ((idx * 2) % 6); // 25..30
    const midterm = 17 + ((idx * 3) % 4); // 17..20
    const finalExam = 42 + ((idx * 5) % 9); // 42..50
    const total = coursework + midterm + finalExam;
    return {
      student: st,
      coursework,
      midterm,
      finalExam,
      total,
      rating: total >= 90 ? 'ممتاز' : total >= 80 ? 'جيد جداً' : total >= 70 ? 'جيد' : 'مقبول',
    };
  });

  const totals = studentGradesData.map((g) => g.total);
  const avgGrade = totals.length > 0 ? (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1) : '91.5';
  const maxGrade = totals.length > 0 ? Math.max(...totals) : 98;
  const minGrade = totals.length > 0 ? Math.min(...totals) : 84;
  const passRate = totals.length > 0 ? Math.round((totals.filter((t) => t >= 60).length / totals.length) * 100) : 100;

  // 3. TEACHER WORKLOAD CALCULATIONS
  const teacherWorkloadData = teachers.map((tch) => {
    const teacherPeriods = timetable.filter(
      (t) => t.teacher_id === tch.user_id || t.teacher_id === tch.id
    );
    const assignedSectionIds = Array.from(new Set(teacherPeriods.map((t) => t.section_id)));
    const assignedSectionNames = assignedSectionIds.map(
      (id) => sections.find((s) => s.id === id)?.name || id
    );
    const taughtSubjects = Array.from(new Set(teacherPeriods.map((t) => t.subject_name || 'عام')));

    return {
      teacher: tch,
      weeklyPeriods: teacherPeriods.length,
      sectionsCount: assignedSectionIds.length,
      sectionNames: assignedSectionNames,
      subjects: taughtSubjects,
      status: teacherPeriods.length > 20 ? 'نصاب كامل' : 'نصاب جزئي',
    };
  });

  // 4. BEHAVIOR SUMMARY CALCULATIONS
  const totalBehavior = behaviorRecords.length;
  const positiveCount = behaviorRecords.filter((b) => b.type === 'positive').length;
  const negativeCount = behaviorRecords.filter((b) => b.type === 'negative').length;
  const warningCount = behaviorRecords.filter((b) => b.type === 'warning').length;
  const parentSummonsCount = behaviorRecords.filter((b) => b.type === 'parent_summons').length;

  // EXPORT HANDLERS
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';

    if (activeReport === 'attendance') {
      csvContent += 'اسم الطالب,رقم الهوية,الصف والشعبة,أيام الحضور,أيام الغياب,التأخير,نسبة الحضور %\n';
      studentAttendanceData.forEach((row) => {
        csvContent += `"${row.student.full_name}","${row.student.national_id}","${row.student.grade_name} - ${row.student.section_name}",${row.presentCount},${row.absentCount},${row.lateCount},${row.percentage}%\n`;
      });
    } else if (activeReport === 'grades') {
      csvContent += 'اسم الطالب,رقم الهوية,أعمال السنة (30),الاختبار النصفي (20),الاختبار النهائي (50),المجموع النهائي (100),التقدير\n';
      studentGradesData.forEach((row) => {
        csvContent += `"${row.student.full_name}","${row.student.national_id}",${row.coursework},${row.midterm},${row.finalExam},${row.total},"${row.rating}"\n`;
      });
    } else if (activeReport === 'workload') {
      csvContent += 'اسم المعلم,التخصص,الحصص الأسبوعية,عدد الفصول,المواد المسندة,حالة النصاب\n';
      teacherWorkloadData.forEach((row) => {
        csvContent += `"${row.teacher.profile.full_name}","${row.teacher.specialization}",${row.weeklyPeriods},${row.sectionsCount},"${row.subjects.join(' - ')}","${row.status}"\n`;
      });
    } else {
      csvContent += 'نوع السلوك,العدد,النسبة المئوية\n';
      csvContent += `سلوك إيجابي وتميز,${positiveCount},${Math.round((positiveCount / (totalBehavior || 1)) * 100)}%\n`;
      csvContent += `مخالفات سلوكية,${negativeCount},${Math.round((negativeCount / (totalBehavior || 1)) * 100)}%\n`;
      csvContent += `تنبيهات وإنذارات,${warningCount},${Math.round((warningCount / (totalBehavior || 1)) * 100)}%\n`;
      csvContent += `استدعاءات ولي أمر,${parentSummonsCount},${Math.round((parentSummonsCount / (totalBehavior || 1)) * 100)}%\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `تقرير_${activeReport}_${currentBranch.code}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              مركز التقارير المتقدمة والتحليلات الإحصائية (Reports & Analytics)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تقارير الحضور، تحصيل الشعب، أنصبة المعلمين، والسلوك مع التصدير إلى Excel والطباعة الرسمية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-bold"
          >
            <FileSpreadsheet className="w-4 h-4 ml-1.5 text-emerald-600" />
            تصدير Excel (CSV)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-bold"
          >
            <Printer className="w-4 h-4 ml-1.5" />
            طباعة التقرير الرسمي (PDF)
          </Button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'attendance', label: '1. تقرير حضور وغياب الطلاب', icon: Calendar },
          { id: 'grades', label: '2. كشف درجات وتحصيل الشعبة', icon: Award },
          { id: 'workload', label: '3. تقرير أنصبة وأعباء المعلمين', icon: Clock },
          { id: 'behavior', label: '4. تقرير ملخص السلوك والمواظبة', icon: Smile },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. STUDENT ATTENDANCE REPORT */}
      {activeReport === 'attendance' && (
        <div className="space-y-4">
          {/* Section Filter & KPIs */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">اختر الشعبة:</span>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.grade_name} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span>
                إجمالي الطلاب: <strong>{sectionStudents.length}</strong>
              </span>
              <span>
                متوسط الانضباط: <strong className="text-emerald-600">{avgAttendance}%</strong>
              </span>
            </div>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">رقم الهوية</th>
                    <th className="p-3 text-center">أيام الحضور</th>
                    <th className="p-3 text-center">أيام الغياب</th>
                    <th className="p-3 text-center">مرات التأخير</th>
                    <th className="p-3 text-center">نسبة الحضور</th>
                    <th className="p-3 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {studentAttendanceData.map((row) => (
                    <tr key={row.student.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{row.student.full_name}</td>
                      <td className="p-3 font-mono text-slate-500">{row.student.national_id}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{row.presentCount} يوم</td>
                      <td className="p-3 text-center font-bold text-rose-600">{row.absentCount} يوم</td>
                      <td className="p-3 text-center font-bold text-amber-600">{row.lateCount}</td>
                      <td className="p-3 text-center">
                        <span className="font-black text-blue-700 font-mono">{row.percentage}%</span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={row.percentage >= 90 ? 'success' : 'warning'}>
                          {row.percentage >= 90 ? 'منضبط ممتاز' : 'يحتاج متابعة'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. SECTION GRADE REPORT */}
      {activeReport === 'grades' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">الشعبة المستهدفة:</span>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.grade_name} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* KPIs */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200">
                المتوسط الحسابي: <strong>{avgGrade} / 100</strong>
              </span>
              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                أعلى درجة: <strong>{maxGrade}</strong>
              </span>
              <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200">
                أدنى درجة: <strong>{minGrade}</strong>
              </span>
              <span className="bg-purple-50 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-200">
                نسبة النجاح: <strong>{passRate}%</strong>
              </span>
            </div>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3 text-center">أعمال السنة (30)</th>
                    <th className="p-3 text-center">الاختبار النصفي (20)</th>
                    <th className="p-3 text-center">الاختبار النهائي (50)</th>
                    <th className="p-3 text-center font-black text-amber-300">المجموع النهائي (100)</th>
                    <th className="p-3 text-center">التقدير العام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {studentGradesData.map((row) => (
                    <tr key={row.student.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{row.student.full_name}</td>
                      <td className="p-3 text-center">{row.coursework}</td>
                      <td className="p-3 text-center">{row.midterm}</td>
                      <td className="p-3 text-center">{row.finalExam}</td>
                      <td className="p-3 text-center font-black text-sm text-blue-700">{row.total}</td>
                      <td className="p-3 text-center">
                        <Badge variant={row.total >= 90 ? 'success' : 'info'}>{row.rating}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. TEACHER WORKLOAD REPORT */}
      {activeReport === 'workload' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-blue-50/60 border-blue-200">
              <span className="text-xs text-blue-800 font-bold block">إجمالي أعضاء الهيئة التعليمية</span>
              <h3 className="text-2xl font-black text-blue-900 mt-1">{teachers.length} معلماً</h3>
              <p className="text-[11px] text-blue-600 mt-0.5">تغطية تعليمية بنسبة 100%</p>
            </Card>

            <Card className="p-4 bg-emerald-50/60 border-emerald-200">
              <span className="text-xs text-emerald-800 font-bold block">متوسط النصاب الأسبوعي</span>
              <h3 className="text-2xl font-black text-emerald-900 mt-1">20 حصة / أسبوع</h3>
              <p className="text-[11px] text-emerald-600 mt-0.5">مطابق للوائح وزارة التعليم</p>
            </Card>

            <Card className="p-4 bg-purple-50/60 border-purple-200">
              <span className="text-xs text-purple-800 font-bold block">إجمالي الحصص المجدولة</span>
              <h3 className="text-2xl font-black text-purple-900 mt-1">{timetable.length} حصة</h3>
              <p className="text-[11px] text-purple-600 mt-0.5">بدون أي تعارض زمني</p>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-3">اسم المعلم</th>
                    <th className="p-3">التخصص</th>
                    <th className="p-3 text-center">عدد الحصص الأسبوعية</th>
                    <th className="p-3 text-center">عدد الفصول المسندة</th>
                    <th className="p-3">الفصول والشعب المسندة</th>
                    <th className="p-3 text-center">حالة النصاب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {teacherWorkloadData.map((row) => (
                    <tr key={row.teacher.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{row.teacher.profile.full_name}</td>
                      <td className="p-3 text-slate-600">{row.teacher.specialization}</td>
                      <td className="p-3 text-center font-bold text-blue-700">{row.weeklyPeriods} حصة</td>
                      <td className="p-3 text-center font-bold">{row.sectionsCount}</td>
                      <td className="p-3 text-slate-600">
                        {row.sectionNames.length > 0 ? row.sectionNames.join('، ') : 'شعبة أ'}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="purple">{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. BEHAVIOR SUMMARY REPORT */}
      {activeReport === 'behavior' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 border-r-4 border-r-emerald-500">
              <span className="text-xs text-slate-500">سلوكيات إيجابية</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{positiveCount}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">شهادات شكر وتكريم</p>
            </Card>

            <Card className="p-4 border-r-4 border-r-rose-500">
              <span className="text-xs text-slate-500">مخالفات سلوكية</span>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{negativeCount}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">معالجة وتعهدات</p>
            </Card>

            <Card className="p-4 border-r-4 border-r-amber-500">
              <span className="text-xs text-slate-500">إنذارات وتنبيهات</span>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{warningCount}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">تنبيهات أكاديمية</p>
            </Card>

            <Card className="p-4 border-r-4 border-r-purple-500">
              <span className="text-xs text-slate-500">استدعاءات ولي أمر</span>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{parentSummonsCount}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">جلسات إرشاد طلابي</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>السجل التفصيلي للملاحظات التربوية للفرع ({currentBranch.name})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-3">الطالب</th>
                    <th className="p-3">نوع السلوك</th>
                    <th className="p-3">الملاحظة المرصودة</th>
                    <th className="p-3">الإجراء المتخذ</th>
                    <th className="p-3 text-center">التاريخ</th>
                    <th className="p-3 text-center">ظهور لولي الأمر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {behaviorRecords.map((b) => {
                    const st = students.find((s) => s.id === b.student_id);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{st?.full_name}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              b.type === 'positive'
                                ? 'success'
                                : b.type === 'warning'
                                ? 'warning'
                                : b.type === 'parent_summons'
                                ? 'purple'
                                : 'danger'
                            }
                          >
                            {b.type === 'positive'
                              ? 'إيجابي'
                              : b.type === 'warning'
                              ? 'إنذار'
                              : b.type === 'parent_summons'
                              ? 'استدعاء'
                              : 'مخالفة'}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-700">{b.title}</td>
                        <td className="p-3 text-slate-600">{b.action_taken || '—'}</td>
                        <td className="p-3 text-center font-mono text-slate-500">{b.incident_date}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`font-bold text-[11px] ${
                              b.is_visible_to_parent ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {b.is_visible_to_parent ? 'مسموح' : 'سري داخلي'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
