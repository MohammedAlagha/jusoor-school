import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Student, StudentStatus } from '../../lib/types/database.types';
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
  UserCheck,
  CalendarCheck,
  Award,
  BookOpen,
  Smile,
  FileSpreadsheet,
  Download,
  FolderLock,
  Sparkles,
} from 'lucide-react';

export function StudentsManagementView() {
  const {
    students,
    parentStudents,
    attendance,
    assignments,
    exams,
    behaviorRecords,
    currentBranch,
    addStudent,
    updateStudent,
    updateStudentStatus,
    currentUser,
  } = useSchool();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<
    'personal' | 'parents' | 'attendance' | 'grades' | 'exams' | 'homework' | 'behavior' | 'documents'
  >('personal');

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
    if (currentUser.role !== 'super_admin' && s.branch_id !== currentBranch.id) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    return true;
  });

  const handleAddSubmit = () => {
    if (!form.firstName || !form.fatherName || !form.familyName || !form.nationalId) {
      alert('يرجى تعبئة كافة الحقول الإلزامية: الاسم الرباعي ورقم الهوية');
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

  const handleStatusChange = (newStatus: StudentStatus) => {
    if (!selectedStudent) return;
    updateStudentStatus(selectedStudent.id, newStatus);
    setSelectedStudent({ ...selectedStudent, status: newStatus });
    alert(`تم تحديث حالة الطالب إلى: ${newStatus}`);
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
      header: 'الحالة الأكاديمية',
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
            onClick={() => {
              setSelectedStudent(st);
              setActiveTab('personal');
            }}
            className="text-xs py-1 px-2.5 font-bold"
          >
            <Eye className="w-3.5 h-3.5 ml-1 text-blue-600" />
            الملف الشامل
          </Button>
        </div>
      ),
    },
  ];

  // Specific student sub-entity queries
  const studentParents = selectedStudent
    ? parentStudents.filter((ps) => ps.student_id === selectedStudent.id)
    : [];

  const studentAttendance = selectedStudent
    ? attendance.filter((a) => a.student_id === selectedStudent.id)
    : [];

  const studentBehavior = selectedStudent
    ? behaviorRecords.filter((b) => b.student_id === selectedStudent.id)
    : [];

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
                <option value="active">منتظم فقط (Active)</option>
                <option value="transferred">منقول (Transferred)</option>
                <option value="graduated">متخرج (Graduated)</option>
                <option value="expelled">مفصول (Expelled)</option>
              </select>
            }
          />
        </CardContent>
      </Card>

      {/* Comprehensive Student Profile Modal with 8+ Domain Tabs */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`الملف الأكاديمي الشامل: ${selectedStudent.full_name}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-right">
            {/* Top Identity Ribbon */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base">{selectedStudent.full_name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  هوية وطنية: <span className="font-mono text-amber-300">{selectedStudent.national_id}</span> •{' '}
                  {selectedStudent.grade_name} ({selectedStudent.section_name})
                </p>
              </div>

              {/* Status Change Selector */}
              {currentUser.role !== 'parent' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">الحالة:</span>
                  <select
                    value={selectedStudent.status}
                    onChange={(e) => handleStatusChange(e.target.value as StudentStatus)}
                    className="bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 cursor-pointer"
                  >
                    <option value="active">منتظم (Active)</option>
                    <option value="transferred">منقول (Transferred)</option>
                    <option value="graduated">متخرج (Graduated)</option>
                    <option value="expelled">مفصول (Expelled)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2 text-xs">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'personal' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                المعلومات الشخصية
              </button>
              <button
                onClick={() => setActiveTab('parents')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'parents' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                أولياء الأمور ({studentParents.length})
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                الحضور والغياب
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'grades' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                كشف العلامات
              </button>
              <button
                onClick={() => setActiveTab('exams')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'exams' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                الامتحانات
              </button>
              <button
                onClick={() => setActiveTab('homework')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'homework' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                الواجبات
              </button>
              <button
                onClick={() => setActiveTab('behavior')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'behavior' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                السلوك والملاحظات
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'documents' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                الوثائق والملفات
              </button>
            </div>

            {/* TAB 1: Personal Info */}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">الاسم الكامل:</span>
                  <span className="font-bold text-slate-800">{selectedStudent.full_name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">الجنس:</span>
                  <span className="font-bold text-slate-800">
                    {selectedStudent.gender === 'male' ? 'ذكر (بنين)' : 'أنثى (بنات)'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">تاريخ الميلاد:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedStudent.date_of_birth}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">فصيلة الدم:</span>
                  <span className="font-bold text-slate-800">{selectedStudent.blood_type || 'O+'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">تاريخ التسجيل:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedStudent.enrollment_date}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">الفرع:</span>
                  <span className="font-bold text-slate-800">{selectedStudent.branch_name || currentBranch.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 col-span-2">
                  <span className="text-slate-400 block text-[11px]">العنوان السكني المسجل:</span>
                  <span className="font-bold text-slate-800">{selectedStudent.address || 'الرياض - حي الملز'}</span>
                </div>
              </div>
            )}

            {/* TAB 2: Parents & Family Links */}
            {activeTab === 'parents' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  قائمة أولياء الأمور المرتبطين بالطالب عبر جدول العلاقات الأسرية (ParentStudent):
                </p>
                {studentParents.length > 0 ? (
                  studentParents.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{p.parent_name}</span>
                          {p.is_primary_contact && (
                            <Badge variant="success">جهة الاتصال الأساسية</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          صلة القرابة: <strong className="text-slate-700">{p.relationship_type === 'father' ? 'الأب' : 'الأم'}</strong> • رقم الجوال: <span className="font-mono">{p.phone}</span>
                        </p>
                      </div>
                      <Badge variant="info">مفعل</Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    لا يوجد أولياء أمور مرتبطون حالياً بهذا الطالب
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Attendance */}
            {activeTab === 'attendance' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex justify-between items-center">
                  <span>نسبة الحضور التراكمية:</span>
                  <strong className="text-sm">98% (انضباط ممتاز)</strong>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">التاريخ</th>
                        <th className="p-2.5">الحالة</th>
                        <th className="p-2.5">الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentAttendance.map((rec) => (
                        <tr key={rec.id}>
                          <td className="p-2.5 font-mono">{rec.date}</td>
                          <td className="p-2.5">
                            <Badge variant={rec.status === 'present' ? 'success' : 'danger'}>
                              {rec.status === 'present' ? 'حاضر' : 'غائب'}
                            </Badge>
                          </td>
                          <td className="p-2.5 text-slate-500">{rec.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: Grades */}
            {activeTab === 'grades' && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-blue-900 block">المعدل العام التراكمي: 95.8%</span>
                    <span className="text-[11px] text-blue-700">الترتيب: الثالث على مستوى الشعبة</span>
                  </div>
                  <Badge variant="purple">مرتبة الشرف</Badge>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">المادة</th>
                        <th className="p-2.5">الدرجة</th>
                        <th className="p-2.5">التقدير</th>
                        <th className="p-2.5">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-bold">الرياضيات المتقدمة 1</td>
                        <td className="p-2.5 font-bold text-blue-600">96 / 100</td>
                        <td className="p-2.5">ممتاز (A+)</td>
                        <td className="p-2.5"><Badge variant="success">معتمدة</Badge></td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">الفيزياء العامة</td>
                        <td className="p-2.5 font-bold text-blue-600">94 / 100</td>
                        <td className="p-2.5">ممتاز (A)</td>
                        <td className="p-2.5"><Badge variant="success">معتمدة</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: Exams */}
            {activeTab === 'exams' && (
              <div className="space-y-2 text-xs">
                {exams.map((ex) => (
                  <div key={ex.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">{ex.title}</span>
                      <span className="text-[11px] text-slate-500">المادة: {ex.subject_name} • التاريخ: {ex.exam_date}</span>
                    </div>
                    <Badge variant={ex.is_published ? 'success' : 'warning'}>
                      {ex.is_published ? 'النتيجة منشورة' : 'قيد التصحيح'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 6: Homework */}
            {activeTab === 'homework' && (
              <div className="space-y-2 text-xs">
                {assignments.map((hw) => (
                  <div key={hw.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{hw.title}</span>
                      <span className="text-rose-600">تسليم: {hw.due_date}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{hw.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 7: Behavior */}
            {activeTab === 'behavior' && (
              <div className="space-y-2 text-xs">
                {studentBehavior.length > 0 ? (
                  studentBehavior.map((b) => (
                    <div key={b.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex justify-between">
                        <Badge variant={b.type === 'positive' ? 'success' : 'danger'}>
                          {b.type === 'positive' ? 'إشادة تميز' : 'مخالفة'}
                        </Badge>
                        <span className="text-[10px] text-slate-400">{b.incident_date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-1">{b.title}</h4>
                      <p className="text-slate-600 mt-0.5">{b.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    لا توجد ملاحظات سلوكية مسجلة
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: Documents & Archive */}
            {activeTab === 'documents' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">شهادة الميلاد وبطاقة الهوية الوطنية</span>
                      <span className="text-[10px] text-slate-400">PDF • وثيقة مصدقة ومحمية في Supabase Storage</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Download className="w-3.5 h-3.5 ml-1" />
                    تحميل
                  </Button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">التقرير الطبي وفحص اللياقة المدرسية</span>
                      <span className="text-[10px] text-slate-400">PDF • ساري المفعول</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Download className="w-3.5 h-3.5 ml-1" />
                    تحميل
                  </Button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
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
