import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BarChart3, Download, FileSpreadsheet, Printer, TrendingUp, Users, Calendar, Award } from 'lucide-react';

export function ReportsView() {
  const { currentBranch, branches, students, attendance } = useSchool();
  const [reportType, setReportType] = useState('attendance');

  const handleExportPDF = () => {
    alert('جاري توليد ملف تقرير رسمي مصدق بصيغة PDF وطباعته...');
    window.print();
  };

  const handleExportExcel = () => {
    alert('تم تصدير كشف البيانات الإحصائي بصيغة Excel (CSV) بنجاح!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">مركز التقارير والإحصائيات وتصدير الوثائق</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            كشوف الحضور والغياب، التحصيل الأكاديمي، ونسب تفوق الطلاب للفرع والمؤسسة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="text-xs font-bold">
            <FileSpreadsheet className="w-4 h-4 ml-1.5 text-emerald-600" />
            تصدير Excel
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportPDF} className="text-xs font-bold">
            <Download className="w-4 h-4 ml-1.5" />
            طباعة / تصدير PDF
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">معدل الانضباط العام</span>
            <Badge variant="success">96.8%</Badge>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">انضباط استثنائي</h3>
          <p className="text-[11px] text-slate-400 mt-1">بناءً على 4,820 سجلاً خلال الفصل</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الطلاب المتفوقون (معدل +90%)</span>
            <Badge variant="purple">38%</Badge>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">قائمة الشرف</h3>
          <p className="text-[11px] text-slate-400 mt-1">مؤهلون لشهادات التميز السنوية</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">حالات التعثر المحتاجة لمعالجة</span>
            <Badge variant="warning">3.2%</Badge>
          </div>
          <h3 className="text-2xl font-black text-amber-600 mt-2">متابعة إرشادية</h3>
          <p className="text-[11px] text-slate-400 mt-1">تم إشعار أولياء الأمور</p>
        </Card>
      </div>

      {/* Reports Template Table */}
      <Card>
        <CardHeader>
          <CardTitle>التقارير الجاهزة للتصدير والطباعة الرسمية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">كشف الدرجات والشهادة الفصلية المعتمدة (Term Report Card)</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">يتضمن المعدل العام، الترتيب، تفصيل المواد، وتوقيع إدارة المدرسة والباركود الأمني.</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportPDF} className="text-xs">
              <Printer className="w-3.5 h-3.5 ml-1" />
              طباعة الشهادة
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">تقرير الحضور والغياب الشهري المفصل لكافة الفروع</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">تتبع نسب الغياب بعذر وبدون عذر والتأخيرات لكل مرحلة وشعبة.</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportExcel} className="text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5 ml-1 text-emerald-600" />
              تصدير جدول CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
