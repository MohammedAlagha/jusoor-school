import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Award, CheckCircle, Eye, Lock, Unlock, Plus, AlertCircle, FileSpreadsheet } from 'lucide-react';

export function GradingView() {
  const { currentBranch, students, currentUser } = useSchool();
  const [isPublished, setIsPublished] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('الرياضيات المتقدمة 1');
  const [showComponentModal, setShowComponentModal] = useState(false);

  // Flexible Grading Components
  const [components, setComponents] = useState([
    { id: 'gc-01', name: 'المشاركة والتفاعل والواجبات', weight: 20, maxScore: 20 },
    { id: 'gc-02', name: 'الاختبارات القصيرة الدورية', weight: 20, maxScore: 20 },
    { id: 'gc-03', name: 'الاختبار النصفي الموحد', weight: 20, maxScore: 20 },
    { id: 'gc-04', name: 'الاختبار العملي والتطبيقي', weight: 10, maxScore: 10 },
    { id: 'gc-05', name: 'الاختبار النهائي التحريري', weight: 30, maxScore: 30 },
  ]);

  // Sample student grades
  const [gradesData, setGradesData] = useState([
    { studentId: 'std-01', name: 'فيصل خالد إبراهيم السعيد', scores: [19, 18, 19, 10, 28] },
    { studentId: 'std-03', name: 'عبدالله سعود محمد العتيبي', scores: [17, 16, 17, 9, 25] },
    { studentId: 'std-04', name: 'ريان ماجد سليمان الغامدي', scores: [18, 19, 18, 10, 27] },
  ]);

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);

  const handleScoreChange = (studentIdx: number, compIdx: number, newScore: number) => {
    const copy = [...gradesData];
    copy[studentIdx].scores[compIdx] = Math.min(components[compIdx].maxScore, Math.max(0, newScore));
    setGradesData(copy);
  };

  const handleTogglePublish = () => {
    if (currentUser.role === 'teacher') {
      alert('عذراً، نشر العلامات لولي الأمر يتطلب اعتماد الإدارة (Admin / Super Admin).');
      return;
    }
    setIsPublished(!isPublished);
    alert(
      !isPublished
        ? 'تم نشر واعتماد العلامات بنجاح! يمكن لأولياء الأمور الآن الاطلاع على النتائج.'
        : 'تم إلغاء نشر العلامات وحجبها عن أولياء الأمور للتعديل والمراجعة.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900">
              نظام رصد العلامات المرن واعتماد النتائج
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تحديد مكونات التقييم وأوزانها مع حماية النشر (Workflow: رصد المعلم ➔ مراجعة الإدارة ➔ نشر لولي الأمر)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant={isPublished ? 'success' : 'warning'} className="text-xs py-1 px-3">
            {isPublished ? 'منشورة لأولياء الأمور' : 'مسودة غير منشورة'}
          </Badge>
          {currentUser.role !== 'teacher' && (
            <Button
              variant={isPublished ? 'outline' : 'primary'}
              size="sm"
              onClick={handleTogglePublish}
              className="text-xs font-bold"
            >
              {isPublished ? (
                <>
                  <Lock className="w-4 h-4 ml-1.5" />
                  حجب العلامات للمراجعة
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

      {/* Components Weights Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>مكونات العلامة الموزونة للمادة ({selectedSubject})</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                إجمالي الأوزان: <span className="font-bold text-slate-700">{totalWeight}%</span> (يجب أن يساوي 100%)
              </p>
            </div>
            {currentUser.role !== 'teacher' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComponentModal(true)}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 ml-1" />
                إضافة مكون تقييم
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {components.map((comp) => (
              <div key={comp.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-right">
                <span className="text-[11px] font-bold text-slate-800 block truncate">{comp.name}</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-lg font-black text-blue-600">{comp.weight}%</span>
                  <span className="text-[10px] text-slate-400">الحد: {comp.maxScore} درجة</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grades Sheet */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>كشف رصد درجات الطلاب (الصف الأول الثانوي - شعبة أ)</CardTitle>
            <span className="text-xs text-slate-400">الفصل الدراسي الأول 2026/2027</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">اسم الطالب</th>
                  {components.map((c) => (
                    <th key={c.id} className="p-3.5 text-center">
                      {c.name} ({c.maxScore})
                    </th>
                  ))}
                  <th className="p-3.5 text-center bg-blue-50/70 text-blue-900 font-extrabold">
                    المجموع النهائي (100)
                  </th>
                  <th className="p-3.5 text-center">التقدير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradesData.map((row, rowIdx) => {
                  const total = row.scores.reduce((a, b) => a + b, 0);
                  const gradeLetter =
                    total >= 90 ? 'ممتاز (A+)' : total >= 80 ? 'جيد جداً (B)' : total >= 70 ? 'جيد (C)' : 'مقبول (D)';
                  return (
                    <tr key={row.studentId} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{row.name}</td>
                      {row.scores.map((score, colIdx) => (
                        <td key={colIdx} className="p-3.5 text-center">
                          <input
                            type="number"
                            value={score}
                            disabled={isPublished && currentUser.role === 'teacher'}
                            onChange={(e) => handleScoreChange(rowIdx, colIdx, Number(e.target.value))}
                            className="w-14 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-md py-1 focus:bg-white focus:border-blue-500"
                          />
                        </td>
                      ))}
                      <td className="p-3.5 text-center bg-blue-50/30 font-black text-blue-700 text-sm">
                        {total}
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge variant={total >= 90 ? 'success' : total >= 80 ? 'info' : 'warning'}>
                          {gradeLetter}
                        </Badge>
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
  );
}
