import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Teacher } from '../../lib/types/database.types';
import { DataTable, Column } from '../ui/data-table';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import {
  UserCheck,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  Trash2,
  CheckCircle,
  Briefcase,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';

export function TeachersManagementView() {
  const {
    teachers,
    sections,
    subjects,
    grades,
    currentBranch,
    addTeacher,
    assignTeacherToClass,
    removeTeacherAssignment,
    currentUser,
  } = useSchool();

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Form states for adding teacher
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('الرياضيات والعلوم التطبيقية');
  const [hireDate, setHireDate] = useState('2024-09-01');

  // Form states for assigning section & subject
  const [assignSectionId, setAssignSectionId] = useState(sections[0]?.id || 'sec-01');
  const [assignSubjectId, setAssignSubjectId] = useState(subjects[0]?.id || 'sub-01');

  // Filter teachers by current branch
  const branchTeachers = teachers.filter((t) =>
    currentUser.role === 'super_admin' ? true : t.branch_id === currentBranch.id
  );

  const handleAddTeacher = () => {
    if (!fullName.trim() || !nationalId.trim()) {
      alert('يرجى كتابة الاسم الرباعي ورقم الهوية');
      return;
    }

    addTeacher(
      {
        branch_id: currentBranch.id,
        specialization,
        hire_date: hireDate,
        status: 'active',
      },
      {
        full_name: fullName,
        national_id: nationalId,
        email: email || `teacher.${Date.now()}@alrowad.edu.sa`,
        phone: phone || '0501234567',
      }
    );

    setShowAddModal(false);
    setFullName('');
    setNationalId('');
    setEmail('');
    setPhone('');
    alert('تم تسجيل المعلم في الهيئة التعليمية بنجاح!');
  };

  const handleAssignClass = () => {
    if (!selectedTeacher) return;
    assignTeacherToClass(selectedTeacher.id, assignSectionId, assignSubjectId);

    // Update selectedTeacher in modal view
    const updated = teachers.find((t) => t.id === selectedTeacher.id);
    if (updated) setSelectedTeacher({ ...updated });

    alert('تم إسناد المادة والشعبة للمعلم بنجاح!');
    setShowAssignModal(false);
  };

  const handleRemoveAssignment = (secId: string, subId: string) => {
    if (!selectedTeacher) return;
    if (confirm('هل أنت متأكد من إلغاء إسناد هذه الشعبة للمعلم؟')) {
      removeTeacherAssignment(selectedTeacher.id, secId, subId);
      const updated = teachers.find((t) => t.id === selectedTeacher.id);
      if (updated) setSelectedTeacher({ ...updated });
    }
  };

  const columns: Column<Teacher>[] = [
    {
      header: 'اسم المعلم',
      accessorKey: 'id',
      sortable: true,
      cell: (t) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
            {t.profile.full_name[0]}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{t.profile.full_name}</span>
            <span className="text-[11px] text-slate-400">هوية: {t.profile.national_id}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'التخصص الأكاديمي',
      accessorKey: 'specialization',
      sortable: true,
      cell: (t) => (
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-slate-800 text-xs">{t.specialization}</span>
        </div>
      ),
    },
    {
      header: 'الشعب والمواد المسندة',
      cell: (t) => (
        <div className="flex flex-wrap gap-1">
          {t.assigned_sections.length > 0 ? (
            t.assigned_sections.map((a, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 px-2 py-0.5 rounded-md"
              >
                {a.subject_name} ({a.section_name})
              </span>
            ))
          ) : (
            <span className="text-[11px] text-amber-600 font-medium">لم يتم إسناد فصول بعد</span>
          )}
        </div>
      ),
    },
    {
      header: 'تاريخ التعيين',
      accessorKey: 'hire_date',
      cell: (t) => <span className="text-xs text-slate-500 font-mono">{t.hire_date}</span>,
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      cell: (t) => (
        <Badge variant={t.status === 'active' ? 'success' : 'default'}>
          {t.status === 'active' ? 'على رأس العمل' : 'إجازة رسمية'}
        </Badge>
      ),
    },
    {
      header: 'الإجراءات',
      cell: (t) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedTeacher(t)}
          className="text-xs py-1 px-2.5 font-bold"
        >
          <Layers className="w-3.5 h-3.5 ml-1 text-blue-600" />
          إدارة التعيينات
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              إدارة المعلمين وتعيين الفصول والمواد (Teacher Assignments)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ربط المعلمين بالمواد والشعب المدرسية لفرع ({currentBranch.name}) وضبط حدود الوصول الأمني
          </p>
        </div>
        {currentUser.role !== 'parent' && (
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            إضافة معلم جديد
          </Button>
        )}
      </div>

      {/* Teachers Table */}
      <Card>
        <CardContent className="p-5">
          <DataTable
            data={branchTeachers}
            columns={columns}
            searchPlaceholder="بحث باسم المعلم أو التخصص أو رقم الهوية..."
            emptyMessage="لا يوجد معلمون مسجلون في هذا الفرع حالياً"
          />
        </CardContent>
      </Card>

      {/* Teacher Profile & Assignment Management Modal */}
      {selectedTeacher && (
        <Modal
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          title={`إدارة مهام وتعيينات المعلم: ${selectedTeacher.profile.full_name}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-right">
            {/* Quick Profile Info */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-emerald-950">
                  {selectedTeacher.profile.full_name}
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  التخصص: {selectedTeacher.specialization} • رقم الهوية: {selectedTeacher.profile.national_id}
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  البريد: {selectedTeacher.profile.email} • الهاتف: {selectedTeacher.profile.phone}
                </p>
              </div>
              <Badge variant="success">معلم معتمد</Badge>
            </div>

            {/* Assigned Classes & Subjects */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  المواد والشعب المسندة رسمياً للمعلم ({selectedTeacher.assigned_sections.length})
                </h4>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowAssignModal(true)}
                  className="text-xs py-1"
                >
                  <Plus className="w-3.5 h-3.5 ml-1" />
                  إسناد شعبة جديدة
                </Button>
              </div>

              {selectedTeacher.assigned_sections.length > 0 ? (
                <div className="space-y-2">
                  {selectedTeacher.assigned_sections.map((a, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-800 block">
                          {a.subject_name}
                        </span>
                        <span className="text-[11px] text-blue-600">
                          {a.grade_name} — {a.section_name}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveAssignment(a.section_id, a.subject_id)}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 ml-1" />
                        إلغاء التعيين
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  لم يتم إسناد أي مواد أو صفوف لهذا المعلم حتى الآن.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedTeacher(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Class to Teacher Modal */}
      {showAssignModal && selectedTeacher && (
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title={`إسناد مادة وشعبة للمعلم: ${selectedTeacher.profile.full_name}`}
          description="سيتمكن المعلم من رصد الحضور والعلامات وإسناد الواجبات لهذا الصف فوراً"
        >
          <div className="space-y-4">
            <Select
              label="اختر الشعبة الدراسية *"
              value={assignSectionId}
              onChange={(e) => setAssignSectionId(e.target.value)}
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.grade_name} — {sec.name}
                </option>
              ))}
            </Select>

            <Select
              label="اختر المادة والمقرر *"
              value={assignSubjectId}
              onChange={(e) => setAssignSubjectId(e.target.value)}
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} (كود: {sub.code})
                </option>
              ))}
            </Select>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleAssignClass}>
                تأكيد الإسناد
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Teacher Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="تسجيل معلم جديد في فرع المدرسة"
        description="إدخال البيانات الرسمية والتخصص لتفعيل حساب المعلم"
      >
        <div className="space-y-4">
          <Input
            label="الاسم الرباعي للمعلم *"
            placeholder="مثال: أ. يوسف إبراهيم الشمري"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="رقم الهوية الوطنية *"
              placeholder="10XXXXXXXX"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
            <Input
              label="التخصص الأكاديمي *"
              placeholder="اللغة العربية والدراسات الإسلامية"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="البريد الإلكتروني المهني"
              type="email"
              placeholder="yousef@alrowad.edu.sa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="رقم الجوال"
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="تاريخ التعيين والالتحاق"
            type="date"
            value={hireDate}
            onChange={(e) => setHireDate(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAddTeacher}>
              حفظ وتسجيل المعلم
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
