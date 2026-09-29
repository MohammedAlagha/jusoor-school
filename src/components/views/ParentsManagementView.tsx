import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Parent, ParentStudentLink } from '../../lib/types/database.types';
import { DataTable, Column } from '../ui/data-table';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import {
  Users,
  Plus,
  Link as LinkIcon,
  Unlink,
  Briefcase,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  Eye,
  CheckCircle,
} from 'lucide-react';

export function ParentsManagementView() {
  const {
    parents,
    parentStudents,
    students,
    addParent,
    linkParentStudent,
    unlinkParentStudent,
    currentUser,
  } = useSchool();

  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [showLinkChildModal, setShowLinkChildModal] = useState(false);

  // New Parent Form State
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationshipType, setRelationshipType] = useState<'father' | 'mother' | 'guardian'>('father');
  const [workplace, setWorkplace] = useState('');

  // Link Student State
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'std-01');
  const [linkRelType, setLinkRelType] = useState('father');
  const [isPrimaryContact, setIsPrimaryContact] = useState(true);

  const handleAddParent = () => {
    if (!fullName.trim() || !nationalId.trim()) {
      alert('يرجى إدخال الاسم الرباعي ورقم الهوية');
      return;
    }

    addParent(
      {
        relationship_type: relationshipType,
        workplace,
        emergency_phone: phone,
      },
      {
        full_name: fullName,
        national_id: nationalId,
        email: email || `parent.${Date.now()}@alrowad.edu.sa`,
        phone: phone || '0500000000',
      }
    );

    setShowAddParentModal(false);
    setFullName('');
    setNationalId('');
    setPhone('');
    setEmail('');
    setWorkplace('');
    alert('تم إنشاء حساب ولي الأمر بنجاح!');
  };

  const handleLinkStudent = () => {
    if (!selectedParent) return;
    linkParentStudent(selectedParent.id, selectedStudentId, linkRelType, isPrimaryContact);
    alert('تم ربط الطالب بولي الأمر بنجاح!');
    setShowLinkChildModal(false);
  };

  const handleUnlink = (parentId: string, studentId: string) => {
    if (confirm('هل أنت متأكد من فك ارتباط هذا الطالب بولي الأمر؟')) {
      unlinkParentStudent(parentId, studentId);
    }
  };

  const columns: Column<Parent>[] = [
    {
      header: 'ولي الأمر',
      accessorKey: 'id',
      sortable: true,
      cell: (pr) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
            {pr.profile.full_name[0]}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{pr.profile.full_name}</span>
            <span className="text-[11px] text-slate-400">هوية: {pr.profile.national_id}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'صلة القرابة',
      accessorKey: 'relationship_type',
      cell: (pr) => (
        <Badge variant={pr.relationship_type === 'father' ? 'info' : 'purple'}>
          {pr.relationship_type === 'father'
            ? 'الأب (Father)'
            : pr.relationship_type === 'mother'
            ? 'الأم (Mother)'
            : 'الوصي القانوني (Guardian)'}
        </Badge>
      ),
    },
    {
      header: 'بيانات الاتصال والعمل',
      cell: (pr) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-slate-700">
            <Phone className="w-3 h-3 text-slate-400" />
            <span className="font-mono">{pr.profile.phone}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <Briefcase className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[150px]">{pr.workplace || 'غير محدد'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'الأبناء المربوطين (M:N Link)',
      cell: (pr) => {
        const links = parentStudents.filter(
          (ps) => ps.parent_id === pr.id || ps.parent_id === pr.user_id
        );
        return (
          <div className="flex flex-wrap gap-1">
            {links.length > 0 ? (
              links.map((link) => (
                <span
                  key={link.id}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                    link.is_primary_contact
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
                >
                  <GraduationCap className="w-3 h-3" />
                  {link.student_name}
                  {link.is_primary_contact && (
                    <span className="text-[9px] bg-emerald-600 text-white rounded px-1">رئيسي</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400 italic">لا يوجد أبناء مرتبطين</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'الإجراءات',
      cell: (pr) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedParent(pr)}
          className="text-xs py-1 px-2.5 font-bold"
        >
          <Eye className="w-3.5 h-3.5 ml-1 text-blue-600" />
          إدارة الأبناء والربط
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
            <Users className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">
              إدارة أولياء الأمور والروابط الأسرية (Parent-Student Management)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ربط أولياء الأمور بأكثر من طالب (علاقة متعدد لمتعدد M:N) وإدارة جهات الاتصال الأساسية
          </p>
        </div>

        {currentUser.role !== 'parent' && (
          <Button
            variant="primary"
            onClick={() => setShowAddParentModal(true)}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            إنشاء حساب ولي أمر
          </Button>
        )}
      </div>

      {/* Parents Table */}
      <Card>
        <CardContent className="p-5">
          <DataTable
            data={parents}
            columns={columns}
            searchPlaceholder="بحث باسم ولي الأمر أو رقم الهوية أو الهاتف..."
          />
        </CardContent>
      </Card>

      {/* Parent Details & Child Link Management Modal */}
      {selectedParent && (
        <Modal
          isOpen={!!selectedParent}
          onClose={() => setSelectedParent(null)}
          title={`ملف ولي الأمر: ${selectedParent.profile.full_name}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-right">
            {/* Info Box */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-amber-950">
                  {selectedParent.profile.full_name}
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  الهوية: {selectedParent.profile.national_id} • الجوال: {selectedParent.profile.phone}
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  جهة العمل: {selectedParent.workplace || 'غير مدونة'}
                </p>
              </div>
              <Badge variant="warning">حساب مفعل</Badge>
            </div>

            {/* Linked Students List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  الطلاب المرتبطون بهذا الحساب
                </h4>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowLinkChildModal(true)}
                  className="text-xs py-1"
                >
                  <LinkIcon className="w-3.5 h-3.5 ml-1" />
                  ربط طالب جديد بهذا الحساب
                </Button>
              </div>

              {parentStudents.filter(
                (ps) => ps.parent_id === selectedParent.id || ps.parent_id === selectedParent.user_id
              ).length > 0 ? (
                <div className="space-y-2">
                  {parentStudents
                    .filter(
                      (ps) =>
                        ps.parent_id === selectedParent.id ||
                        ps.parent_id === selectedParent.user_id
                    )
                    .map((link) => {
                      const studentObj = students.find((s) => s.id === link.student_id);
                      return (
                        <div
                          key={link.id}
                          className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">
                              {link.student_name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {studentObj?.grade_name || 'الصف'} • {studentObj?.section_name || 'الشعبة'} •{' '}
                              صلة القرابة: {link.relationship_type === 'father' ? 'أب' : 'أم'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {link.is_primary_contact && (
                              <Badge variant="success">جهة الاتصال الأساسية</Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUnlink(selectedParent.id, link.student_id)}
                              className="text-rose-600 hover:bg-rose-50 text-xs"
                            >
                              <Unlink className="w-3.5 h-3.5 ml-1" />
                              فصل الارتباط
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  لم يتم ربط أي طالب بحساب ولي الأمر هذا حتى الآن.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedParent(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Link Student Modal */}
      {showLinkChildModal && selectedParent && (
        <Modal
          isOpen={showLinkChildModal}
          onClose={() => setShowLinkChildModal(false)}
          title={`ربط طالب بحساب ولي الأمر: ${selectedParent.profile.full_name}`}
          description="تفعيل وصول ولي الأمر لسجلات الطالب الأكاديمية والحضور والدرجات"
        >
          <div className="space-y-4">
            <Select
              label="اختر الطالب المراد ربطه *"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.grade_name} - {s.section_name})
                </option>
              ))}
            </Select>

            <Select
              label="صلة القرابة للطالب *"
              value={linkRelType}
              onChange={(e) => setLinkRelType(e.target.value)}
            >
              <option value="father">أب (Father)</option>
              <option value="mother">أم (Mother)</option>
              <option value="guardian">وصي / كفيل قانوني (Guardian)</option>
            </Select>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimaryContact}
                onChange={(e) => setIsPrimaryContact(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPrimary" className="text-xs font-bold text-slate-700">
                تعيين كجهة اتصال أساسية للطوارئ وإشعارات الغياب
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowLinkChildModal(false)}>
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleLinkStudent}>
                تأكيد ربط الطالب
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Parent Modal */}
      <Modal
        isOpen={showAddParentModal}
        onClose={() => setShowAddParentModal(false)}
        title="إنشاء حساب ولي أمر جديد"
        description="تسجيل البيانات الرسمية لولي الأمر وتفعيل الدخول للمنصة"
      >
        <div className="space-y-4">
          <Input
            label="الاسم الكامل لولي الأمر *"
            placeholder="مثال: م. سعود عبدالله الدوسري"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="رقم الهوية الوطنية / الإقامة *"
              placeholder="10XXXXXXXX"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
            <Select
              label="صلة القرابة *"
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as any)}
            >
              <option value="father">أب</option>
              <option value="mother">أم</option>
              <option value="guardian">وصي قانوني</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="رقم الجوال الشخصي *"
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Input
            label="جهة العمل / الوظيفة"
            placeholder="مثال: وزارة الطاقة - مستشار"
            value={workplace}
            onChange={(e) => setWorkplace(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddParentModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAddParent}>
              حفظ وإنشاء الحساب
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
