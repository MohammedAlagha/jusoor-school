import React from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BookOpen, Calendar, Layers, Plus } from 'lucide-react';

export function AcademicStructureView() {
  const { grades, sections, subjects, currentBranch } = useSchool();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">الهيكل الأكاديمي والصفوف والشعب والمواد</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إعداد المراحل الدراسية، الشعب، السعة الاستيعابية، والمواد الدراسية لفرع ({currentBranch.name})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Academic Years & Terms */}
        <Card>
          <CardHeader>
            <CardTitle>السنوات والفصول الدراسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-950">العام الأكاديمي 2026 / 2027</span>
                <Badge variant="success">العام النشط</Badge>
              </div>
              <p className="text-[11px] text-blue-700 mt-1">01 سبتمبر 2026 — 25 يونيو 2027</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-100 flex justify-between">
                <span>الفصل الدراسي الأول (نشط)</span>
                <span className="font-bold text-slate-700">الترم 1</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 flex justify-between text-slate-400">
                <span>الفصل الدراسي الثاني</span>
                <span>قريباً</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grades & Sections */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>الصفوف والشعب المسجلة بالفرع</CardTitle>
              <Badge variant="info">{grades.length} صفوف دراسية</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grades.map((grade) => {
                const gradeSections = sections.filter((s) => s.grade_id === grade.id);
                return (
                  <div key={grade.id} className="p-3.5 border border-slate-200/80 rounded-xl bg-slate-50/40">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{grade.name}</h4>
                      <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        المرحلة: {grade.stage === 'secondary' ? 'ثانوية' : grade.stage === 'middle' ? 'متوسطة' : 'ابتدائية'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {gradeSections.map((sec) => (
                        <div
                          key={sec.id}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs"
                        >
                          {sec.name} • <span className="text-slate-400 font-normal">سعة: {sec.capacity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>المواد والمقررات الدراسية المعتمدة</CardTitle>
            <Badge variant="purple">{subjects.length} مقررات</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">اسم المادة</th>
                  <th className="p-3">الكود</th>
                  <th className="p-3">الساعات المعتمدة</th>
                  <th className="p-3">درجة النجاح</th>
                  <th className="p-3">الدرجة الكلية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{sub.name}</td>
                    <td className="p-3 font-mono text-slate-600">{sub.code}</td>
                    <td className="p-3">{sub.credit_hours} ساعات</td>
                    <td className="p-3 font-bold text-emerald-600">{sub.pass_mark}</td>
                    <td className="p-3 font-bold text-blue-600">{sub.total_mark}</td>
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
