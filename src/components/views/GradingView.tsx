import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import {
  Award,
  Lock,
  Unlock,
  Plus,
  Trash2,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  BarChart,
  Eye,
  FileText,
} from 'lucide-react';
import { Exam, GradingComponent } from '../../lib/types/database.types';

export function GradingView() {
  const {
    students,
    subjects,
    sections,
    grades,
    exams,
    examResults,
    gradingComponents,
    isTermGradesPublished,
    addGradingComponent,
    deleteGradingComponent,
    createExam,
    togglePublishExam,
    recordExamResult,
    togglePublishTermGrades,
    currentUser,
    currentBranch,
    activeChild,
    school,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'components' | 'exams' | 'report_card'>('components');
  const [selectedSubjectId, setSelectedSubjectId] = useState('sub-01');
  const [selectedSectionId, setSelectedSectionId] = useState('sec-01');

  // Modals state
  const [showCompModal, setShowCompModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showEnterResultsModal, setShowEnterResultsModal] = useState<Exam | null>(null);

  // Form states for new grading component
  const [compName, setCompName] = useState('المشروع البحثي الفصلي');
  const [compWeight, setCompWeight] = useState(15);
  const [compMaxScore, setCompMaxScore] = useState(15);

  // Form states for new exam
  const [examTitle, setExamTitle] = useState('اختبار الكيمياء النصفي الأول');
  const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || 'sub-01');
  const [examSectionId, setExamSectionId] = useState(sections[0]?.id || 'sec-01');
  const [examDate, setExamDate] = useState('2026-10-25');
  const [examStartTime, setExamStartTime] = useState('08:00');
  const [examEndTime, setExamEndTime] = useState('09:30');
  const [examTotalMarks, setExamTotalMarks] = useState(30);
  const [examDesc, setExamDesc] = useState('يشمل اختبار الوحدتين الأولى والثانية والأسئلة المقالية التطبيقية');

  // Interactive Student Scores Sheet for Component Evaluation
  const [scoresSheet, setScoresSheet] = useState<Record<string, number[]>>({
    'std-01': [15, 14, 19, 18, 28], // Total: 94
    'std-03': [13, 13, 16, 17, 26], // Total: 85
    'std-04': [14, 15, 18, 19, 27], // Total: 93
  });

  const sectionStudents = students.filter(
    (s) => s.section_id === selectedSectionId && s.branch_id === currentBranch.id
  );

  const totalWeight = gradingComponents.reduce((sum, c) => sum + c.weight, 0);

  const handleScoreChange = (studentId: string, compIdx: number, val: number) => {
    const studentScores = scoresSheet[studentId] || [12, 12, 15, 15, 25];
    const updated = [...studentScores];
    const max = gradingComponents[compIdx]?.max_score || 30;
    updated[compIdx] = Math.min(max, Math.max(0, val));
    setScoresSheet({ ...scoresSheet, [studentId]: updated });
  };

  const handleCreateComponent = () => {
    if (!compName.trim()) return;
    addGradingComponent({
      name: compName,
      weight: Number(compWeight),
      max_score: Number(compMaxScore),
      subject_id: selectedSubjectId,
      academic_term_id: 'term-1',
    });
    setShowCompModal(false);
    alert('تم إضافة مكون التقييم الجديد بنجاح!');
  };

  const handleCreateExam = () => {
    if (!examTitle.trim()) return;
    const sub = subjects.find((s) => s.id === examSubjectId);
    const sec = sections.find((s) => s.id === examSectionId);

    createExam({
      title: examTitle,
      subject_id: examSubjectId,
      section_id: examSectionId,
      academic_term_id: 'term-1',
      exam_date: examDate,
      start_time: examStartTime,
      end_time: examEndTime,
      total_marks: Number(examTotalMarks),
      description: examDesc,
      subject_name: sub?.name || 'مقرر دراسي',
      section_name: sec?.name || 'شعبة أ',
    });

    setShowExamModal(false);
    alert('تم إنشاء الامتحان وجدولته بنجاح!');
  };

  const handleTogglePublishTerm = () => {
    if (currentUser.role === 'teacher') {
      alert('نشر العلامات لولي الأمر يتطلب اعتماد مدير المدرسة أو السوبر أدمن.');
      return;
    }
    togglePublishTermGrades();
    alert(
      !isTermGradesPublished
        ? 'تم نشر درجات الفصل الدراسي لجميع أولياء الأمور بنجاح!'
        : 'تم حجب الدرجات للمراجعة والتعديل الداخلي.'
    );
  };

  // If Parent View: show only published grades & report card for active child
  if (currentUser.role === 'parent' && activeChild) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <h1 className="text-xl font-bold text-slate-900">
                كشف العلامات والتقييم الأكاديمي: ({activeChild.full_name})
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeChild.grade_name} — {activeChild.section_name} • الفصل الدراسي الأول 2026/2027
            </p>
          </div>
          <Badge variant="purple">المعدل العام: 95.8%</Badge>
        </div>

        {/* Child Grades Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>الدرجات المعتمدة المنشورة</CardTitle>
              <Badge variant="success">معتمدة رسمياً</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">المقرر الدراسي</th>
                    <th className="p-3.5">الساعات</th>
                    <th className="p-3.5">أعمال السنة</th>
                    <th className="p-3.5">النصفي</th>
                    <th className="p-3.5">النهائي</th>
                    <th className="p-3.5 text-center font-black text-blue-900">المجموع النهائي (100)</th>
                    <th className="p-3.5 text-center">التقدير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">الرياضيات المتقدمة 1</td>
                    <td className="p-3.5">4</td>
                    <td className="p-3.5">29 / 30</td>
                    <td className="p-3.5">19 / 20</td>
                    <td className="p-3.5">48 / 50</td>
                    <td className="p-3.5 text-center font-black text-blue-700 text-sm">96</td>
                    <td className="p-3.5 text-center"><Badge variant="success">ممتاز (A+)</Badge></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">الفيزياء العامة</td>
                    <td className="p-3.5">3</td>
                    <td className="p-3.5">28 / 30</td>
                    <td className="p-3.5">18 / 20</td>
                    <td className="p-3.5">48 / 50</td>
                    <td className="p-3.5 text-center font-black text-blue-700 text-sm">94</td>
                    <td className="p-3.5 text-center"><Badge variant="success">ممتاز (A)</Badge></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">اللغة الإنجليزية التخصصية</td>
                    <td className="p-3.5">3</td>
                    <td className="p-3.5">30 / 30</td>
                    <td className="p-3.5">20 / 20</td>
                    <td className="p-3.5">47 / 50</td>
                    <td className="p-3.5 text-center font-black text-blue-700 text-sm">97</td>
                    <td className="p-3.5 text-center"><Badge variant="success">ممتاز (A+)</Badge></td>
                  </tr>
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
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900">
              النظام الأكاديمي: إدارة العلامات والامتحانات والشهادات
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إعداد أوزان التقييم المرنة، جدولة ورصد نتائج الامتحانات، واعتماد الشهادات لفرع ({currentBranch.name})
          </p>
        </div>

        {/* Global Publishing Workflow */}
        <div className="flex items-center gap-2.5">
          <Badge variant={isTermGradesPublished ? 'success' : 'warning'} className="text-xs py-1 px-3">
            {isTermGradesPublished ? 'العلامات منشورة لأولياء الأمور' : 'مسودة غير منشورة (قيد التدقيق)'}
          </Badge>
          {currentUser.role !== 'teacher' && (
            <Button
              variant={isTermGradesPublished ? 'outline' : 'primary'}
              size="sm"
              onClick={handleTogglePublishTerm}
              className="text-xs font-bold"
            >
              {isTermGradesPublished ? (
                <>
                  <Lock className="w-4 h-4 ml-1.5" />
                  حجب العلامات
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 ml-1.5" />
                  نشر واعتماد النتائج لولي الأمر
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'components'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart className="w-4 h-4" />
          رصد مكونات التقييم الموزونة (Grading Components)
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          إدارة الامتحانات ونتائجها (Exams Management)
        </button>

        <button
          onClick={() => setActiveTab('report_card')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'report_card'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          كشف الدرجات والشهادة الأكاديمية (Report Card)
        </button>
      </div>

      {/* TAB 1: Flexible Grading Components & Weights */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div>
                  <CardTitle>مكونات العلامة الموزونة للمادة ({subjects[0]?.name})</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    إجمالي الأوزان: <span className="font-bold text-slate-800">{totalWeight}%</span> (يجب أن يساوي 100%)
                  </p>
                </div>
                {currentUser.role !== 'teacher' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCompModal(true)}
                    className="text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 ml-1" />
                    إضافة مكون تقييم جديد
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {gradingComponents.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl relative group"
                  >
                    {currentUser.role !== 'teacher' && (
                      <button
                        onClick={() => deleteGradingComponent(comp.id)}
                        className="absolute top-2 left-2 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                        title="حذف هذا المكون"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-xs font-bold text-slate-800 block truncate">{comp.name}</span>
                    <div className="flex items-baseline justify-between mt-2.5">
                      <span className="text-xl font-black text-blue-600">{comp.weight}%</span>
                      <span className="text-[10px] text-slate-400">الحد: {comp.max_score} درجة</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interactive Continuous Assessment Sheet */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>كشف رصد درجات أعمال السنة المستمرة ({sections[0]?.name})</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="info">معدل الشعبة: 90.6%</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert('تم تصدير كشف الدرجات بصيغة Excel بنجاح!')}
                    className="text-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 ml-1 text-emerald-600" />
                    تصدير Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">اسم الطالب</th>
                      {gradingComponents.map((c) => (
                        <th key={c.id} className="p-3.5 text-center">
                          {c.name} ({c.max_score})
                        </th>
                      ))}
                      <th className="p-3.5 text-center bg-blue-50 text-blue-900 font-black">
                        المجموع (100)
                      </th>
                      <th className="p-3.5 text-center">الترتيب</th>
                      <th className="p-3.5 text-center">التقدير</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sectionStudents.map((st, idx) => {
                      const scores = scoresSheet[st.id] || [14, 14, 18, 18, 26];
                      const total = scores.reduce((a, b) => a + b, 0);
                      const rankLabel = idx === 0 ? 'الأول' : idx === 1 ? 'الثاني' : 'الثالث';
                      const gradeLetter =
                        total >= 90 ? 'ممتاز (A+)' : total >= 80 ? 'جيد جداً (B)' : 'جيد (C)';

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-bold text-slate-900">{st.full_name}</td>
                          {scores.map((score, cIdx) => (
                            <td key={cIdx} className="p-3.5 text-center">
                              <input
                                type="number"
                                value={score}
                                disabled={isTermGradesPublished && currentUser.role === 'teacher'}
                                onChange={(e) =>
                                  handleScoreChange(st.id, cIdx, Number(e.target.value))
                                }
                                className="w-14 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-md py-1 focus:bg-white focus:border-blue-500"
                              />
                            </td>
                          ))}
                          <td className="p-3.5 text-center bg-blue-50/40 font-black text-blue-700 text-sm">
                            {total}
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-700">{rankLabel}</td>
                          <td className="p-3.5 text-center">
                            <Badge variant={total >= 90 ? 'success' : 'info'}>{gradeLetter}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Exam Management Module */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">جدول الامتحانات والاختبارات المعتمدة</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مراحل الامتحان: إنشاء ➔ رصد النتائج ➔ تدقيق ➔ نشر لولي الأمر
              </p>
            </div>
            {currentUser.role !== 'parent' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowExamModal(true)}
                className="text-xs font-bold"
              >
                <Plus className="w-4 h-4 ml-1.5" />
                إنشاء امتحان جديد
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-xs transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <Badge variant={exam.is_published ? 'success' : 'warning'}>
                      {exam.is_published ? 'منشور ومعتمد لولي الأمر' : 'مسودة غير منشورة'}
                    </Badge>
                    <span className="text-xs text-blue-600 font-bold font-mono">
                      الدرجة الكلية: {exam.total_marks} درجة
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-3">{exam.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{exam.description}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">المقرر:</span>
                      <span className="font-bold text-slate-800">{exam.subject_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">الشعبة:</span>
                      <span className="font-bold text-slate-800">{exam.section_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">التاريخ:</span>
                      <span className="font-bold text-slate-800">{exam.exam_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">التوقيت:</span>
                      <span className="font-mono text-slate-800">
                        {exam.start_time} - {exam.end_time}
                      </span>
                    </div>
                  </div>

                  {currentUser.role !== 'parent' && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowEnterResultsModal(exam)}
                        className="text-xs w-full"
                      >
                        <Award className="w-3.5 h-3.5 ml-1 text-blue-600" />
                        رصد درجات الطلاب
                      </Button>
                      <Button
                        size="sm"
                        variant={exam.is_published ? 'outline' : 'primary'}
                        onClick={() => togglePublishExam(exam.id)}
                        className="text-xs shrink-0"
                      >
                        {exam.is_published ? 'حجب' : 'نشر لولي الأمر'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Term Report Card & Certificate */}
      {activeTab === 'report_card' && (
        <Card className="max-w-4xl mx-auto shadow-md">
          <CardContent className="p-8 space-y-6">
            {/* Certificate Header */}
            <div className="text-center border-b-2 border-slate-900 pb-5">
              <h2 className="text-xl font-black text-slate-900">{school.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{currentBranch.name}</p>
              <div className="inline-block mt-3 px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs tracking-wider">
                كشف الدرجات والشهادة الفصلية الرسمية (Official Term Report Card)
              </div>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">اسم الطالب:</span>
                <span className="font-bold text-slate-900 text-sm">فيصل خالد إبراهيم السعيد</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">رقم الهوية:</span>
                <span className="font-bold text-slate-800 font-mono">1098765432</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الصف والشعبة:</span>
                <span className="font-bold text-slate-800">الأول الثانوي (شعبة أ)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">العام الأكاديمي:</span>
                <span className="font-bold text-slate-800">2026/2027 — الفصل 1</span>
              </div>
            </div>

            {/* Subjects Marks Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-3">المقرر الدراسي</th>
                    <th className="p-3">الساعات المعتمدة</th>
                    <th className="p-3">درجة النجاح</th>
                    <th className="p-3 text-center">الدرجة المكتسبة (100)</th>
                    <th className="p-3 text-center">التقدير الحرفي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-bold">الرياضيات المتقدمة 1</td>
                    <td className="p-3">4</td>
                    <td className="p-3">50</td>
                    <td className="p-3 text-center font-black text-blue-700 text-sm">96</td>
                    <td className="p-3 text-center font-bold text-emerald-700">ممتاز (A+)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">الفيزياء العامة</td>
                    <td className="p-3">3</td>
                    <td className="p-3">50</td>
                    <td className="p-3 text-center font-black text-blue-700 text-sm">94</td>
                    <td className="p-3 text-center font-bold text-emerald-700">ممتاز (A)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">اللغة الإنجليزية التخصصية</td>
                    <td className="p-3">3</td>
                    <td className="p-3">50</td>
                    <td className="p-3 text-center font-black text-blue-700 text-sm">97</td>
                    <td className="p-3 text-center font-bold text-emerald-700">ممتاز (A+)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary GPA & Ranking */}
            <div className="grid grid-cols-3 gap-4 bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
              <div>
                <span className="text-[11px] text-blue-800 font-bold block">المعدل العام التراكمي</span>
                <span className="text-2xl font-black text-blue-900 mt-1 block">95.8%</span>
              </div>
              <div>
                <span className="text-[11px] text-blue-800 font-bold block">التقدير العام</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block">ممتاز مع مرتبة الشرف</span>
              </div>
              <div>
                <span className="text-[11px] text-blue-800 font-bold block">الترتيب في الشعبة</span>
                <span className="text-2xl font-black text-purple-700 mt-1 block">المركز الثالث</span>
              </div>
            </div>

            {/* Signature & Barcode Simulation */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                <p className="font-bold text-slate-800">توقيع وختم مدير المدرسة:</p>
                <div className="w-28 h-10 border-b border-dashed border-slate-400 mt-2" />
              </div>
              <div className="text-left font-mono">
                <p className="text-[10px] text-slate-400">وثيقة إلكترونية مصدقة برقم قيد:</p>
                <p className="font-bold text-slate-700">VER-2026-ALROWAD-998811</p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                variant="primary"
                onClick={() => {
                  alert('جاري تجهيز وطباعة الشهادة الرسمية...');
                  window.print();
                }}
                className="text-xs font-bold"
              >
                <Printer className="w-4 h-4 ml-1.5" />
                طباعة الشهادة الرسمية PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Component Modal */}
      <Modal
        isOpen={showCompModal}
        onClose={() => setShowCompModal(false)}
        title="إضافة مكون تقييم جديد للمادة"
        description="تحديد وزن المكون والدرجة القصوى"
      >
        <div className="space-y-4">
          <Input
            label="اسم المكون *"
            placeholder="مثال: الاختبار العملي، البحوث..."
            value={compName}
            onChange={(e) => setCompName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="الوزن النسبي (%) *"
              type="number"
              value={compWeight}
              onChange={(e) => setCompWeight(Number(e.target.value))}
            />
            <Input
              label="الدرجة القصوى للمكون *"
              type="number"
              value={compMaxScore}
              onChange={(e) => setCompMaxScore(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowCompModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateComponent}>
              حفظ المكون
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Exam Modal */}
      <Modal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        title="إنشاء امتحان مدرسي جديد"
        description="تحديد موعد الامتحان والشعبة والمقرر"
      >
        <div className="space-y-4">
          <Input
            label="عنوان الامتحان *"
            placeholder="اختبار الرياضيات النصفي الثاني"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="المقرر الدراسي *"
              value={examSubjectId}
              onChange={(e) => setExamSubjectId(e.target.value)}
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </Select>

            <Select
              label="الشعبة المستهدفة *"
              value={examSectionId}
              onChange={(e) => setExamSectionId(e.target.value)}
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.grade_name} — {sec.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="التاريخ *"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
            <Input
              label="وقت البدء *"
              type="time"
              value={examStartTime}
              onChange={(e) => setExamStartTime(e.target.value)}
            />
            <Input
              label="الدرجة الكلية *"
              type="number"
              value={examTotalMarks}
              onChange={(e) => setExamTotalMarks(Number(e.target.value))}
            />
          </div>

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              وصف الامتحان ومفردات الأسئلة
            </label>
            <textarea
              rows={3}
              value={examDesc}
              onChange={(e) => setExamDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowExamModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateExam}>
              جدولة الامتحان
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enter Exam Results Modal */}
      {showEnterResultsModal && (
        <Modal
          isOpen={!!showEnterResultsModal}
          onClose={() => setShowEnterResultsModal(null)}
          title={`رصد نتائج امتحان: ${showEnterResultsModal.title}`}
          description={`الدرجة الكلية: ${showEnterResultsModal.total_marks} درجة`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">الدرجة المحصلة</th>
                    <th className="p-3">ملاحظات المصحح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sectionStudents.map((st) => (
                    <tr key={st.id}>
                      <td className="p-3 font-bold text-slate-900">{st.full_name}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={28}
                          max={showEnterResultsModal.total_marks}
                          onBlur={(e) =>
                            recordExamResult(
                              showEnterResultsModal.id,
                              st.id,
                              Number(e.target.value)
                            )
                          }
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-center font-bold"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="ملاحظات..."
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowEnterResultsModal(null)}>
                إغلاق
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert('تم حفظ واعتماد نتائج الامتحان في السجل الأكاديمي!');
                  setShowEnterResultsModal(null);
                }}
              >
                تأكيد وحفظ النتائج
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
