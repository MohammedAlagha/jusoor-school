import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import {
  FileText,
  Calendar,
  Plus,
  Paperclip,
  CheckCircle,
  Clock,
  Send,
  Eye,
  Award,
  MessageSquare,
  FileCheck,
  AlertCircle,
  Download,
  UploadCloud,
} from 'lucide-react';
import { HomeworkAssignment, HomeworkSubmission } from '../../lib/types/database.types';

export function AssignmentsView() {
  const {
    assignments,
    submissions,
    subjects,
    sections,
    currentBranch,
    currentUser,
    activeChild,
    addHomeworkAssignment,
    gradeHomeworkSubmission,
    submitHomework,
  } = useSchool();

  const [selectedHwForSubmissions, setSelectedHwForSubmissions] = useState<HomeworkAssignment | null>(null);
  const [selectedSubmForGrading, setSelectedSubmForGrading] = useState<HomeworkSubmission | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState<HomeworkAssignment | null>(null);

  // Form states for creating homework
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-06');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'sub-01');
  const [sectionId, setSectionId] = useState(sections[0]?.id || 'sec-01');

  // Grading states
  const [gradeInput, setGradeInput] = useState(10);
  const [feedbackInput, setFeedbackInput] = useState('عمل ممتاز ومتقن، بارك الله فيك.');

  // Student upload simulation state
  const [attachmentName, setAttachmentName] = useState('حل_الواجب_المنزلي_المعتمد.pdf');

  const handleAddSubmit = () => {
    if (!title.trim() || !desc.trim()) {
      alert('يرجى كتابة عنوان وتفاصيل الواجب المدرسي');
      return;
    }
    const sub = subjects.find((s) => s.id === subjectId);
    const sec = sections.find((s) => s.id === sectionId);

    addHomeworkAssignment({
      title,
      description: desc,
      due_date: dueDate,
      subject_id: subjectId,
      section_id: sectionId,
      subject_name: sub?.name || 'المقرر',
      section_name: sec?.name || 'شعبة أ',
    });

    setShowAddModal(false);
    setTitle('');
    setDesc('');
    alert('تم إسناد ونشر الواجب المدرسي بنجاح!');
  };

  const handleSaveGrade = () => {
    if (!selectedSubmForGrading) return;
    gradeHomeworkSubmission(selectedSubmForGrading.id, Number(gradeInput), feedbackInput);
    setSelectedSubmForGrading(null);
    alert('تم رصد الدرجة وكتابة الملاحظات التعليمية للطالب بنجاح!');
  };

  const handleStudentSubmit = () => {
    if (!showSubmitModal || !activeChild) return;
    submitHomework(showSubmitModal.id, activeChild.id, attachmentName);
    setShowSubmitModal(null);
    alert('تم تسليم الحل وإرساله للمعلم بنجاح!');
  };

  // If Parent View: focused on active child's homework & status
  if (currentUser.role === 'parent' && activeChild) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">
                الواجبات والمهام المدرسية للطالب: ({activeChild.full_name})
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeChild.grade_name} — {activeChild.section_name} • متابعة مواعيد التسليم وتصحيح المعلم
            </p>
          </div>
          <Badge variant="info">الشعبة: {activeChild.section_name}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((hw) => {
            const childSubm = submissions.find(
              (s) => s.assignment_id === hw.id && s.student_id === activeChild.id
            );

            return (
              <Card key={hw.id} className="hover:shadow-xs transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <Badge variant="purple">{hw.subject_name}</Badge>
                    <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      آخر موعد: {hw.due_date}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2.5">{hw.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {hw.description}
                  </p>

                  {/* Submission Status & Feedback Box */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">حالة التسليم:</span>
                      {childSubm ? (
                        <Badge variant={childSubm.status === 'graded' ? 'success' : 'info'}>
                          {childSubm.status === 'graded'
                            ? `تم التصحيح (${childSubm.grade} / ${childSubm.max_grade || 10})`
                            : 'تم التسليم (قيد التصحيح)'}
                        </Badge>
                      ) : (
                        <Badge variant="warning">لم يتم التسليم بعد</Badge>
                      )}
                    </div>

                    {childSubm?.feedback && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                        <div className="flex items-center gap-1 font-bold text-emerald-900 mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span>ملاحظات المعلم:</span>
                        </div>
                        <p className="text-emerald-800 leading-relaxed">{childSubm.feedback}</p>
                      </div>
                    )}

                    {!childSubm && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setShowSubmitModal(hw)}
                        className="w-full text-xs font-bold mt-2"
                      >
                        <UploadCloud className="w-4 h-4 ml-1.5" />
                        رفع وتسليم الحل الآن
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Solution Modal */}
        {showSubmitModal && (
          <Modal
            isOpen={!!showSubmitModal}
            onClose={() => setShowSubmitModal(null)}
            title={`تسليم حل الواجب: ${showSubmitModal.title}`}
            description="إرفاق ملف الحل بصيغة PDF أو صورة للإرسال إلى معلم المادة"
          >
            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-2">
                <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">الملف المحدد للإرفاق:</p>
                <span className="font-mono text-xs bg-white px-3 py-1 rounded border border-slate-200 inline-block text-blue-700 font-bold">
                  {attachmentName}
                </span>
                <p className="text-[10px] text-slate-400">PDF, Word, PNG (الحد الأقصى 25MB)</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowSubmitModal(null)}>
                  إلغاء
                </Button>
                <Button variant="primary" onClick={handleStudentSubmit}>
                  تأكيد تسليم الواجب
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // Teacher / Admin Management View
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              إدارة الواجبات المدرسية والتسليمات (Homework Module)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إسناد المهام المنزلية للشعب، متابعة التسليمات، وتصحيح الحلول مع التغذية الراجعة لفرع ({currentBranch.name})
          </p>
        </div>
        {currentUser.role !== 'parent' && (
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-xs font-bold">
            <Plus className="w-4 h-4 ml-1.5" />
            إسناد واجب مدرسي جديد
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((hw) => {
          const hwSubmissions = submissions.filter((s) => s.assignment_id === hw.id);
          const gradedCount = hwSubmissions.filter((s) => s.status === 'graded').length;

          return (
            <Card key={hw.id} className="hover:shadow-xs transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Badge variant="purple">{hw.subject_name}</Badge>
                  <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    الموعد النهائي: {hw.due_date}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-2.5">{hw.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {hw.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>الشعبة: <strong className="text-slate-800">{hw.section_name}</strong></span>
                  <span className="text-[11px] text-blue-700 font-bold">
                    التسليمات: {hwSubmissions.length} ({gradedCount} مصححة)
                  </span>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedHwForSubmissions(hw)}
                    className="text-xs w-full font-bold"
                  >
                    <Eye className="w-3.5 h-3.5 ml-1 text-blue-600" />
                    متابعة وتصحيح التسليمات ({hwSubmissions.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submissions List Modal */}
      {selectedHwForSubmissions && (
        <Modal
          isOpen={!!selectedHwForSubmissions}
          onClose={() => setSelectedHwForSubmissions(null)}
          title={`تسليمات الطلاب: ${selectedHwForSubmissions.title}`}
          description={`الشعبة: ${selectedHwForSubmissions.section_name} • تاريخ التسليم: ${selectedHwForSubmissions.due_date}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {submissions.filter((s) => s.assignment_id === selectedHwForSubmissions.id).length > 0 ? (
              <div className="space-y-2">
                {submissions
                  .filter((s) => s.assignment_id === selectedHwForSubmissions.id)
                  .map((subm) => (
                    <div
                      key={subm.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{subm.student_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          وقت التسليم: {subm.submitted_at} • مرفق: {subm.attachment_url || 'solution.pdf'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {subm.status === 'graded' ? (
                          <Badge variant="success">
                            تم الرصد: {subm.grade} / {subm.max_grade || 10}
                          </Badge>
                        ) : (
                          <Badge variant="warning">في انتظار التصحيح</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedSubmForGrading(subm);
                            setGradeInput(subm.grade ?? 10);
                            setFeedbackInput(subm.feedback || 'حل متقن، أحسنت.');
                          }}
                          className="text-xs"
                        >
                          <Award className="w-3.5 h-3.5 ml-1" />
                          تصحيح
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                لم يقم أي طالب بتسليم هذا الواجب حتى الآن
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedHwForSubmissions(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Grading Modal */}
      {selectedSubmForGrading && (
        <Modal
          isOpen={!!selectedSubmForGrading}
          onClose={() => setSelectedSubmForGrading(null)}
          title={`تصحيح واجب الطالب: ${selectedSubmForGrading.student_name}`}
          description="رصد الدرجة وإرسال الملاحظات التعليمية للطالب وولي أمره"
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <span className="text-blue-900 font-semibold">الملف المرفق للحل:</span>
              <Button size="sm" variant="outline" className="text-xs">
                <Download className="w-3.5 h-3.5 ml-1 text-blue-600" />
                تحميل حل الطالب
              </Button>
            </div>

            <Input
              label="الدرجة الممنوحة (من 10) *"
              type="number"
              value={gradeInput}
              onChange={(e) => setGradeInput(Number(e.target.value))}
            />

            <div className="text-right">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                الملاحظات والتوجيهات التربوية (ستظهر لولي الأمر)
              </label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedSubmForGrading(null)}>
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleSaveGrade}>
                اعتماد وحفظ الدرجة
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Homework Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إسناد واجب مدرسي جديد"
        description="سيظهر الواجب مباشرة للطلاب وأولياء أمورهم في جدول المهام"
      >
        <div className="space-y-4">
          <Input
            label="عنوان الواجب *"
            placeholder="مثال: تمارين حساب التكامل ص 64"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="المادة *"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </Select>

            <Select
              label="الشعبة المستهدفة *"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.grade_name} — {sec.name}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="الموعد النهائي للتسليم *"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تفاصيل وتوجيهات الواجب *
            </label>
            <textarea
              rows={3}
              placeholder="اكتب التمارين المطلوب حلها وتعليمات التسليم..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              نشر الواجب للطلاب
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
