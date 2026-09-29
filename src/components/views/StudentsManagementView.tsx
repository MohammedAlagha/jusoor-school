import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Student } from '../../lib/types/database.types';
import { DataTable, Column } from '../ui/data-table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  GraduationCap,
  Plus,
  Eye,
  Edit2,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle,
  FileText,
} from 'lucide-react';

export function StudentsManagementView() {
  const { students, currentBranch, addStudent, updateStudent, currentUser } = useSchool();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form State
  const [form, setForm] = useState({
    firstName: '',
    fatherName: '',
    grandfatherName: '',
    familyName: '',
    nationalId: '',
    gender: 'male' as 'male' | 'female',
    dateOfBirth: '2011-05-15',
    bloodType: 'O+',
    gradeName: 'الصف الأول الثانوي',
    sectionName: 'شعبة أ (علوم طبيعية)',
    address: 'الرياض',
  });

  const filteredStudents = students.filter((s) => {
    // If not super_admin, only show students of current branch
    if (currentUser.role !== 'super_admin' && s.branch_id !== currentBranch.id) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    return true;
  });

  const handleAddSubmit = () => {
    if (!form.firstName || !form.fatherName || !form.familyName || !form.nationalId) {
      alert('يرجى تعبئة كافة الحقول الإلزامية الاسم الرباعي ورقم الهوية');
      return;
    }

    addStudent({
      first_name: form.firstName,
      father_name: form.fatherName,
      grandfather_name: form.grandfatherName,
      family_name: form.familyName,
      national_id: form.nationalId,
      gender: form.gender,
      date_of_birth: form.dateOfBirth,
      blood_type: form.bloodType,
      grade_name: form.gradeName,
      section_name: form.sectionName,
      address: form.address,
      branch_id: currentBranch.id,
      branch_name: currentBranch.name,
      status: 'active',
    });

    setShowAddModal(false);
    setForm({
      firstName: '',
      fatherName: '',
      grandfatherName: '',
      familyName: '',
      nationalId: '',
      gender: 'male',
      dateOfBirth: '2011-05-15',
      bloodType: 'O+',
      gradeName: 'الصف الأول الثانوي',
      sectionName: 'شعبة أ (علوم طبيعية)',
      address: 'الرياض',
    });
    alert('تم إضافة الطالب إلى سجل المدرسة بنجاح!');
  };

  const columns: Column<Student>[] = [
    {
      header: 'اسم الطالب الرباعي',
      accessorKey: 'full_name',
      sortable: true,
      cell: (st) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
            {st.first_name[0]}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{st.full_name}</span>
            <span className="text-[11px] text-slate-400">هوية: {st.national_id}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'المرحلة والصف',
      accessorKey: 'grade_name',
      sortable: true,
      cell: (st) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{st.grade_name}</span>
          <span className="text-[11px] text-blue-600">{st.section_name}</span>
        </div>
      ),
    },
    {
      header: 'الفرع المسجل',
      accessorKey: 'branch_name',
      cell: (st) => <span className="text-xs text-slate-600">{st.branch_name || currentBranch.name}</span>,
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      sortable: true,
      cell: (st) => {
        const statusMap = {
          active: { label: 'منتظم (Active)', variant: 'success' as const },
          transferred: { label: 'منقول (Transferred)', variant: 'info' as const },
          graduated: { label: 'متخرج (Graduated)', variant: 'purple' as const },
          expelled: { label: 'مفصول (Expelled)', variant: 'danger' as const },
        };
        const conf = statusMap[st.status] || statusMap.active;
        return <Badge variant={conf.variant}>{conf.label}</Badge>;
      },
    },
    {
      header: 'الإجراءات',
      cell: (st) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedStudent(st)}
            className="text-xs py-1 px-2.5"
          >
            <Eye className="w-3.5 h-3.5 ml-1 text-blue-600" />
            الملف الشامل
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">سجل إدارة الطلاب والملفات الأكاديمية</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة بيانات الطلاب، الحالات الأكاديمية، والربط مع أولياء الأمور
          </p>
        </div>
        {currentUser.role !== 'parent' && (
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            تسجيل طالب جديد
          </Button>
        )}
      </div>

      {/* Filter and Table */}
      <Card>
        <CardContent className="p-5">
          <DataTable
            data={filteredStudents}
            columns={columns}
            searchPlaceholder="بحث بالاسم أو رقم الهوية أو الصف..."
            filterComponent={
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer font-medium"
              >
                <option value="all">كافة الحالات</option>
                <option value="active">منتظم فقط</option>
                <option value="transferred">منقول</option>
                <option value="graduated">متخرج</option>
              </select>
            }
          />
        </CardContent>
      </Card>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`الملف الأكاديمي الشامل: ${selectedStudent.full_name}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-right">
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-blue-950">{selectedStudent.full_name}</h3>
                <p className="text-xs text-blue-700 mt-0.5">
                  رقم الهوية الوطنية: <span className="font-mono font-bold">{selectedStudent.national_id}</span>
                </p>
              </div>
              <Badge variant="success">منتظم</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">الصف الدراسي:</span>
                <span className="font-bold text-slate-800">{selectedStudent.grade_name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">الشعبة:</span>
                <span className="font-bold text-slate-800">{selectedStudent.section_name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">تاريخ الميلاد:</span>
                <span className="font-bold text-slate-800">{selectedStudent.date_of_birth}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">فصيلة الدم:</span>
                <span className="font-bold text-slate-800">{selectedStudent.blood_type || 'غير محدد'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                <span className="text-slate-400 block text-[11px]">العنوان السكني:</span>
                <span className="font-bold text-slate-800">{selectedStudent.address || 'الرياض'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                إغلاق الملف
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="تسجيل طالب جديد في النظام"
        description="تسجيل البيانات الرسمية وربط الطالب بالشعبة والفرع مباشرة"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="الاسم الأول *"
              placeholder="محمد"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="اسم الأب *"
              placeholder="سعود"
              value={form.fatherName}
              onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
            />
            <Input
              label="اسم الجد *"
              placeholder="عبدالله"
              value={form.grandfatherName}
              onChange={(e) => setForm({ ...form, grandfatherName: e.target.value })}
            />
            <Input
              label="اسم العائلة (اللقب) *"
              placeholder="القرني"
              value={form.familyName}
              onChange={(e) => setForm({ ...form, familyName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="رقم الهوية الوطنية / الإقامة *"
              placeholder="10XXXXXXXX"
              value={form.nationalId}
              onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
            />
            <Select
              label="الجنس *"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as 'male' | 'female' })}
            >
              <option value="male">ذكر (بنين)</option>
              <option value="female">أنثى (بنات)</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="الصف الدراسي *"
              value={form.gradeName}
              onChange={(e) => setForm({ ...form, gradeName: e.target.value })}
            >
              <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
              <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
              <option value="الصف الثالث المتوسط">الصف الثالث المتوسط</option>
              <option value="الصف السادس الابتدائي">الصف السادس الابتدائي</option>
            </Select>
            <Select
              label="الشعبة *"
              value={form.sectionName}
              onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
            >
              <option value="شعبة أ (علوم طبيعية)">شعبة أ (علوم طبيعية)</option>
              <option value="شعبة ب (عام)">شعبة ب (عام)</option>
              <option value="شعبة أ">شعبة أ</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              تأكيد وإضافة الطالب
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
