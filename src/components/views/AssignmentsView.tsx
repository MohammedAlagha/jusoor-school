import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import { FileText, Calendar, Plus, Paperclip, CheckCircle } from 'lucide-react';

export function AssignmentsView() {
  const { assignments, currentBranch, currentUser } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-05');
  const [subjectName, setSubjectName] = useState('الرياضيات المتقدمة 1');

  const handleAdd = () => {
    if (!title.trim() || !desc.trim()) {
      alert('يرجى تعبئة عنوان ووصف الواجب المنزلي');
      return;
    }
    alert('تم إسناد الواجب ونشره لطلاب الشعبة بنجاح!');
    setShowAddModal(false);
    setTitle('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">إدارة الواجبات والمهام المدرسية</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إسناد المهام والواجبات للشعب وتحديد مواعيد التسليم وظهورها التلقائي في حساب ولي الأمر
          </p>
        </div>
        {currentUser.role !== 'parent' && (
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-xs font-bold">
            <Plus className="w-4 h-4 ml-1.5" />
            إضافة واجب جديد
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((hw) => (
          <Card key={hw.id} className="hover:shadow-xs transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <Badge variant="purple">{hw.subject_name}</Badge>
                <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  تسليم: {hw.due_date}
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mt-2.5">{hw.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {hw.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>الشعبة: <strong className="text-slate-800">{hw.section_name}</strong></span>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> نشط ومتاح
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إسناد واجب مدرسي جديد"
        description="سيظهر الواجب مباشرة للطلاب وأولياء أمورهم في جدول المهام"
      >
        <div className="space-y-4">
          <Input
            label="عنوان الواجب *"
            placeholder="مثال: تمارين التفاضل ص 34"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="المادة *"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            >
              <option value="الرياضيات المتقدمة 1">الرياضيات المتقدمة 1</option>
              <option value="الفيزياء العامة">الفيزياء العامة</option>
              <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
            </Select>
            <Input
              label="تاريخ الاستحقاق والتسليم *"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الوصف وتعليمات الحل *
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="اكتب التوجيهات، أرقام الصفحات، وطريقة التسليم..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAdd}>
              إسناد وحفظ الواجب
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
