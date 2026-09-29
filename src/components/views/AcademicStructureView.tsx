import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import { BookOpen, Calendar, Layers, Plus, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Grade, Section, Subject, AcademicYear, AcademicTerm } from '../../lib/types/database.types';

export function AcademicStructureView() {
  const {
    grades,
    sections,
    subjects,
    academicYears,
    academicTerms,
    currentBranch,
    addGrade,
    addSection,
    addSubject,
    addAcademicYear,
    addAcademicTerm,
    setActiveAcademicYear,
    setActiveAcademicTerm,
    currentUser,
  } = useSchool();

  // Modals state
  const [showYearModal, setShowYearModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Form states
  const [yearName, setYearName] = useState('2027/2028');
  const [yearStartDate, setYearStartDate] = useState('2027-09-01');
  const [yearEndDate, setYearEndDate] = useState('2028-06-25');

  const [termName, setTermName] = useState('الفصل الدراسي الثاني');
  const [termYearId, setTermYearId] = useState('ay-2026');

  const [gradeName, setGradeName] = useState('الصف الثالث الثانوي');
  const [gradeStage, setGradeStage] = useState<'kindergarten' | 'primary' | 'middle' | 'secondary'>('secondary');

  const [sectionName, setSectionName] = useState('شعبة ج');
  const [sectionGradeId, setSectionGradeId] = useState(grades[0]?.id || 'grd-01');
  const [sectionCapacity, setSectionCapacity] = useState(30);

  const [subjectName, setSubjectName] = useState('الكيمياء المتقدمة');
  const [subjectCode, setSubjectCode] = useState('CHEM-101');
  const [subjectGradeId, setSubjectGradeId] = useState(grades[0]?.id || 'grd-01');
  const [subjectCredit, setSubjectCredit] = useState(3);
  const [subjectPassMark, setSubjectPassMark] = useState(50);
  const [subjectTotalMark, setSubjectTotalMark] = useState(100);

  const handleCreateYear = () => {
    if (!yearName.trim()) return;
    addAcademicYear({
      name: yearName,
      start_date: yearStartDate,
      end_date: yearEndDate,
      branch_id: currentBranch.id,
    });
    setShowYearModal(false);
    alert('تم إضافة العام الأكاديمي بنجاح!');
  };

  const handleCreateTerm = () => {
    if (!termName.trim()) return;
    addAcademicTerm({
      name: termName,
      academic_year_id: termYearId,
    });
    setShowTermModal(false);
    alert('تم إضافة الفصل الدراسي بنجاح!');
  };

  const handleCreateGrade = () => {
    if (!gradeName.trim()) return;
    addGrade({
      name: gradeName,
      stage: gradeStage,
      branch_id: currentBranch.id,
    });
    setShowGradeModal(false);
    alert('تم إضافة الصف الدراسي بنجاح!');
  };

  const handleCreateSection = () => {
    if (!sectionName.trim()) return;
    addSection({
      name: sectionName,
      grade_id: sectionGradeId,
      capacity: Number(sectionCapacity),
      academic_year_id: 'ay-2026',
    });
    setShowSectionModal(false);
    alert('تم إضافة الشعبة الدراسية بنجاح!');
  };

  const handleCreateSubject = () => {
    if (!subjectName.trim() || !subjectCode.trim()) return;
    addSubject({
      name: subjectName,
      code: subjectCode,
      grade_id: subjectGradeId,
      credit_hours: Number(subjectCredit),
      pass_mark: Number(subjectPassMark),
      total_mark: Number(subjectTotalMark),
      branch_id: currentBranch.id,
    });
    setShowSubjectModal(false);
    alert('تم إضافة المقرر الدراسي بنجاح!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              الهيكل الأكاديمي والسنوات والفصول والمقررات (Academic Structure)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إعداد السنوات الدراسية، الفصول، المراحل، الشعب وسعتها، والمناهج لفرع ({currentBranch.name})
          </p>
        </div>

        {currentUser.role !== 'parent' && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowYearModal(true)}
              className="text-xs font-bold"
            >
              <Calendar className="w-3.5 h-3.5 ml-1" />
              + عام دراسي
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGradeModal(true)}
              className="text-xs font-bold"
            >
              <Layers className="w-3.5 h-3.5 ml-1" />
              + صف دراسي
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSectionModal(true)}
              className="text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 ml-1" />
              + شعبة دراسية
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSubjectModal(true)}
              className="text-xs font-bold"
            >
              <BookOpen className="w-3.5 h-3.5 ml-1" />
              + مادة دراسية
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Academic Years & Terms */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>السنوات والفصول الدراسية</CardTitle>
              <Badge variant="purple">Academic Calendar</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2">السنوات الدراسية المسجلة:</p>
              <div className="space-y-2">
                {academicYears.map((ay) => (
                  <div
                    key={ay.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                      ay.is_current
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{ay.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {ay.start_date} إلى {ay.end_date}
                      </span>
                    </div>
                    {ay.is_current ? (
                      <Badge variant="success">العام النشط</Badge>
                    ) : (
                      currentUser.role !== 'parent' && (
                        <button
                          onClick={() => setActiveAcademicYear(ay.id)}
                          className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          تفعيل كعام نشط
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-600">الفصول الدراسية (Terms):</p>
                {currentUser.role !== 'parent' && (
                  <button
                    onClick={() => setShowTermModal(true)}
                    className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    + إضافة فصل
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {academicTerms.map((term) => (
                  <div
                    key={term.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                      term.is_current ? 'bg-emerald-50 border-emerald-300 font-bold' : 'border-slate-100'
                    }`}
                  >
                    <span>{term.name}</span>
                    {term.is_current ? (
                      <Badge variant="success">نشط حالياً</Badge>
                    ) : (
                      currentUser.role !== 'parent' && (
                        <button
                          onClick={() => setActiveAcademicTerm(term.id)}
                          className="text-[10px] text-slate-500 hover:text-blue-600 cursor-pointer"
                        >
                          تفعيل
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grades & Sections Structure */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>الصفوف الدراسية والشعب التابعة لها</CardTitle>
              <Badge variant="info">{grades.length} صفوف مسجلة</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grades.map((grade) => {
                const gradeSections = sections.filter((s) => s.grade_id === grade.id);
                return (
                  <div
                    key={grade.id}
                    className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{grade.name}</h4>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          المرحلة:{' '}
                          {grade.stage === 'secondary'
                            ? 'الثانوية'
                            : grade.stage === 'middle'
                            ? 'المتوسطة'
                            : 'الابتدائية'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {gradeSections.length} شعب دراسية
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {gradeSections.length > 0 ? (
                        gradeSections.map((sec) => (
                          <div
                            key={sec.id}
                            className="px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs flex items-center gap-2"
                          >
                            <span>{sec.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              (السعة: {sec.capacity} طالب)
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          لا توجد شعب مسجلة لهذا الصف بعد
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects & Curriculum Catalog */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>دليل المواد والمقررات الدراسية المعتمدة (Subjects Catalog)</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد الساعات الأكاديمية والحد الأدنى للنجاح والدرجة الكلية لكل مادة
              </p>
            </div>
            {currentUser.role !== 'parent' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSubjectModal(true)}
                className="text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 ml-1" />
                إضافة مادة جديدة
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">اسم المقرر</th>
                  <th className="p-3.5">كود المادة</th>
                  <th className="p-3.5">الساعات الأسبوعية</th>
                  <th className="p-3.5">درجة النجاح الصغرى</th>
                  <th className="p-3.5">الدرجة الكبرى</th>
                  <th className="p-3.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">{sub.name}</td>
                    <td className="p-3.5 font-mono text-slate-600 font-semibold">{sub.code}</td>
                    <td className="p-3.5">{sub.credit_hours} ساعات</td>
                    <td className="p-3.5 font-bold text-emerald-600">{sub.pass_mark}</td>
                    <td className="p-3.5 font-bold text-blue-600">{sub.total_mark}</td>
                    <td className="p-3.5">
                      <Badge variant="success">معتمدة رسمياً</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Year Modal */}
      <Modal
        isOpen={showYearModal}
        onClose={() => setShowYearModal(false)}
        title="إضافة عام أكاديمي جديد"
        description="تحديد نطاق العام وبداية ونهاية الفصول الدراسية"
      >
        <div className="space-y-4">
          <Input
            label="اسم العام الأكاديمي *"
            placeholder="مثال: 2027/2028"
            value={yearName}
            onChange={(e) => setYearName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="تاريخ البداية *"
              type="date"
              value={yearStartDate}
              onChange={(e) => setYearStartDate(e.target.value)}
            />
            <Input
              label="تاريخ النهاية *"
              type="date"
              value={yearEndDate}
              onChange={(e) => setYearEndDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowYearModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateYear}>
              حفظ العام
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Term Modal */}
      <Modal
        isOpen={showTermModal}
        onClose={() => setShowTermModal(false)}
        title="إضافة فصل دراسي"
        description="ربط الفصل بالعام الدراسي"
      >
        <div className="space-y-4">
          <Input
            label="اسم الفصل *"
            placeholder="الفصل الدراسي الثاني"
            value={termName}
            onChange={(e) => setTermName(e.target.value)}
          />
          <Select
            label="العام الدراسي التابع له *"
            value={termYearId}
            onChange={(e) => setTermYearId(e.target.value)}
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowTermModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateTerm}>
              حفظ الفصل
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Grade Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        title="إضافة صف دراسي جديد"
        description="إضافة مرحلة أو صف جديد للفرع"
      >
        <div className="space-y-4">
          <Input
            label="اسم الصف الدراسي *"
            placeholder="مثال: الصف الثاني الثانوي"
            value={gradeName}
            onChange={(e) => setGradeName(e.target.value)}
          />
          <Select
            label="المرحلة التعليمية *"
            value={gradeStage}
            onChange={(e) => setGradeStage(e.target.value as any)}
          >
            <option value="kindergarten">مرحلة رياض الأطفال</option>
            <option value="primary">المرحلة الابتدائية</option>
            <option value="middle">المرحلة المتوسطة</option>
            <option value="secondary">المرحلة الثانوية</option>
          </Select>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowGradeModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateGrade}>
              حفظ الصف
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        isOpen={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        title="إضافة شعبة دراسية جديدة"
        description="تحديد الصف والسعة الاستيعابية للشعبة"
      >
        <div className="space-y-4">
          <Select
            label="اختر الصف الدراسي *"
            value={sectionGradeId}
            onChange={(e) => setSectionGradeId(e.target.value)}
          >
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="اسم الشعبة *"
              placeholder="مثال: شعبة ج"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
            <Input
              label="السعة الاستيعابية (طالب) *"
              type="number"
              value={sectionCapacity}
              onChange={(e) => setSectionCapacity(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowSectionModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateSection}>
              حفظ الشعبة
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        title="إضافة مقرر دراسي جديد"
        description="تحديد بيانات المادة والدرجات والساعات المعتمدة"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="اسم المادة *"
              placeholder="مثال: الكيمياء العامة"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
            <Input
              label="كود المادة *"
              placeholder="CHEM-101"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
            />
          </div>
          <Select
            label="الصف الدراسي المستهدف *"
            value={subjectGradeId}
            onChange={(e) => setSubjectGradeId(e.target.value)}
          >
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="الساعات المعتمدة *"
              type="number"
              value={subjectCredit}
              onChange={(e) => setSubjectCredit(Number(e.target.value))}
            />
            <Input
              label="درجة النجاح *"
              type="number"
              value={subjectPassMark}
              onChange={(e) => setSubjectPassMark(Number(e.target.value))}
            />
            <Input
              label="الدرجة الكلية *"
              type="number"
              value={subjectTotalMark}
              onChange={(e) => setSubjectTotalMark(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowSubjectModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateSubject}>
              حفظ المادة
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
