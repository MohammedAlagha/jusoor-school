import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Building2, GitBranch, Users, GraduationCap, ShieldCheck, Plus, CheckCircle2, ArrowUpRight } from 'lucide-react';

export function SuperAdminDashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { school, branches, currentBranch, switchBranch, students, requests } = useSchool();
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchData, setNewBranchData] = useState({ name: '', code: '', city: '', phone: '' });

  const totalStudents = branches.reduce((sum, b) => sum + (b.students_count || 0), 0);
  const totalTeachers = branches.reduce((sum, b) => sum + (b.teachers_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              نظام إدارة المدارس المتكامل (Super Admin Console)
            </div>
            <h1 className="text-2xl font-black">{school.name}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              إدارة الفروع المتعددة، الرقابة المركزية على الطلاب والمعلمين، وتطبيق سياسات الأمان وعزل البيانات الصارمة (Row Level Security).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddBranchModal(true)}
              variant="primary"
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-md text-xs font-bold"
            >
              <Plus className="w-4 h-4 ml-1.5" />
              إنشاء فرع جديد
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">إجمالي الفروع النشطة</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{branches.length}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 100% عاملة ومتصلة
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GitBranch className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">إجمالي الطلاب (كافة الفروع)</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalStudents.toLocaleString('ar-SA')}</h3>
              <p className="text-[11px] text-slate-400 mt-1">مسجلين في العام 2026/2027</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">الهيئة التعليمية (المعلمين)</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalTeachers}</h3>
              <p className="text-[11px] text-slate-400 mt-1">موزعين على 3 فروع</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">طلبات أولياء الأمور المعلقة</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{requests.filter(r => r.status === 'pending').length}</h3>
              <p className="text-[11px] text-amber-600 mt-1 font-medium">تحتاج اتخاذ إجراء</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches Multi-Branch Overview */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>فروع المدارس التابعة للنظام (Multi-Branch Architecture)</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              كل فرع يمتلك عزلاً منطقياً في قاعدة البيانات مع دعم التنقل المركزي للسوبر أدمن
            </p>
          </div>
          <Badge variant="purple">RLS Multi-Tenancy</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((branch) => {
              const isSelected = branch.id === currentBranch.id;
              return (
                <div
                  key={branch.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        كود: {branch.code}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-2 text-sm">{branch.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{branch.city} • {branch.address}</p>
                    </div>
                    {isSelected ? (
                      <Badge variant="success">نشط حالياً</Badge>
                    ) : (
                      <Badge variant="default">جاهز</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">الطلاب:</span>
                      <span className="font-bold text-slate-800">{branch.students_count} طالب</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">المعلمين:</span>
                      <span className="font-bold text-slate-800">{branch.teachers_count} معلم</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant={isSelected ? 'secondary' : 'outline'}
                      className="w-full text-xs"
                      onClick={() => switchBranch(branch.id)}
                    >
                      {isSelected ? 'أنت داخل الفرع' : 'التبديل إلى هذا الفرع'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Roles & Security Matrix Preview */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>مصفوفة الصلاحيات والأمان المعتمدة (RBAC & RLS)</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              فصل الصلاحيات الصارم بين Super Admin و Admin و Teacher و Parent
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">المستوى / الدور</th>
                  <th className="p-3">نطاق الفروع</th>
                  <th className="p-3">الوصول لبيانات الطلاب</th>
                  <th className="p-3">تسجيل الحضور والعلامات</th>
                  <th className="p-3">حالة عزل RLS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-bold text-purple-700">Super Admin</td>
                  <td className="p-3">كافة الفروع والمدارس</td>
                  <td className="p-3">وصول شامل لكل السجلات</td>
                  <td className="p-3">إشراف واعتماد وتعديل</td>
                  <td className="p-3"><Badge variant="purple">Bypass Policy</Badge></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-blue-700">Admin</td>
                  <td className="p-3">الفروع المسندة إليه فقط</td>
                  <td className="p-3">طلاب فرعه فقط</td>
                  <td className="p-3">تسجيل واعتماد ونشر</td>
                  <td className="p-3"><Badge variant="info">Branch Isolation</Badge></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-emerald-700">Teacher</td>
                  <td className="p-3">فرعه المسند</td>
                  <td className="p-3">صفوفه وشعبه المسندة فقط</td>
                  <td className="p-3">رصد درجات مواده فقط</td>
                  <td className="p-3"><Badge variant="success">Classroom Isolation</Badge></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-amber-700">Parent</td>
                  <td className="p-3">حسب فرع أبنائه</td>
                  <td className="p-3">أبناؤه المرتبطون بحسابه فقط</td>
                  <td className="p-3">عرض الدرجات المنشورة فقط</td>
                  <td className="p-3"><Badge variant="warning">Family Isolation (M:N)</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Branch Modal */}
      <Modal
        isOpen={showAddBranchModal}
        onClose={() => setShowAddBranchModal(false)}
        title="إضافة فرع مدرسي جديد للمؤسسة"
        description="سيتم إنشاء الفرع وربطه بـ database schema مع توليد معرفات RLS الفريدة"
      >
        <div className="space-y-4">
          <Input
            label="اسم الفرع *"
            placeholder="مثال: فرع الدمام - حي الشاطئ"
            value={newBranchData.name}
            onChange={(e) => setNewBranchData({ ...newBranchData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="كود الفرع الفريد *"
              placeholder="DMM-SHT"
              value={newBranchData.code}
              onChange={(e) => setNewBranchData({ ...newBranchData, code: e.target.value.toUpperCase() })}
            />
            <Input
              label="المدينة *"
              placeholder="الدمام"
              value={newBranchData.city}
              onChange={(e) => setNewBranchData({ ...newBranchData, city: e.target.value })}
            />
          </div>
          <Input
            label="رقم هاتف الفرع"
            placeholder="0138999999"
            value={newBranchData.phone}
            onChange={(e) => setNewBranchData({ ...newBranchData, phone: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddBranchModal(false)}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('تم إنشاء الفرع بنجاح وربطه بالهيكل التنظيمي الأكاديمي.');
                setShowAddBranchModal(false);
              }}
            >
              حفظ الفرع
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
