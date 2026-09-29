import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import { Smile, AlertCircle, Plus, Eye, ShieldAlert } from 'lucide-react';
import { BehaviorType } from '../../lib/types/database.types';

export function BehaviorView() {
  const { behaviorRecords, students, addBehaviorRecord, currentUser, currentBranch } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentId, setStudentId] = useState('std-01');
  const [type, setType] = useState<BehaviorType>('positive');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [isParentVisible, setIsParentVisible] = useState(true);

  const filteredRecords =
    currentUser.role === 'parent'
      ? behaviorRecords.filter((b) => b.is_visible_to_parent)
      : behaviorRecords;

  const handleAdd = () => {
    if (!title.trim() || !description.trim()) {
      alert('يرجى ملء عنوان الملاحظة والوصف');
      return;
    }
    addBehaviorRecord({
      student_id: studentId,
      type,
      title,
      description,
      action_taken: actionTaken,
      is_visible_to_parent: isParentVisible,
      incident_date: '2026-09-29',
    });
    setShowAddModal(false);
    setTitle('');
    setDescription('');
    setActionTaken('');
    alert('تم رصد السجل بنجاح!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Smile className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900">سجل السلوك والمواظبة والملاحظات التربوية</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            توثيق السلوكيات الإيجابية والمخالفات مع التحكم في مستوى الظهور لولي الأمر
          </p>
        </div>
        {currentUser.role !== 'parent' && (
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            تسجيل ملاحظة سلوكية
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((rec) => {
          const st = students.find((s) => s.id === rec.student_id);
          return (
            <Card key={rec.id} className="hover:shadow-xs transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Badge variant={rec.type === 'positive' ? 'success' : 'danger'}>
                    {rec.type === 'positive' ? 'سلوك إيجابي وتميز' : 'ملاحظة سلوكية'}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{rec.incident_date}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-2">{rec.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{rec.description}</p>

                {rec.action_taken && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                    <span className="font-bold text-slate-500 block text-[10px]">الإجراء المتخذ:</span>
                    {rec.action_taken}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">الطالب: <strong className="text-slate-800">{st?.full_name}</strong></span>
                  <Badge variant={rec.is_visible_to_parent ? 'info' : 'default'} className="text-[10px]">
                    {rec.is_visible_to_parent ? 'ظاهر لولي الأمر' : 'سري داخلي'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="تدوين ملاحظة سلوكية جديدة"
        description="تسجيل الإشادة أو المخالفة وضبط خصوصية العرض لولي الأمر"
      >
        <div className="space-y-4">
          <Select
            label="الطالب المعني *"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.grade_name})
              </option>
            ))}
          </Select>

          <Select
            label="نوع السجل *"
            value={type}
            onChange={(e) => setType(e.target.value as BehaviorType)}
          >
            <option value="positive">سلوك إيجابي وتفوق</option>
            <option value="negative">مخالفة سلوكية أو عدم انضباط</option>
            <option value="general">ملاحظة متابعة عامة</option>
          </Select>

          <Input
            label="عنوان الملاحظة *"
            placeholder="مثال: قيادة الفريق الإذاعي، إتلاف أدوات المعمل..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">التفاصيل *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <Input
            label="الإجراء المتخذ أو المكافأة"
            placeholder="شهادة شكر، استدعاء ولي أمر..."
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="visibleParent"
              checked={isParentVisible}
              onChange={(e) => setIsParentVisible(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="visibleParent" className="text-xs font-bold text-slate-700">
              إتاحة الملاحظة لعرض ولي الأمر في حسابه الخاص
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAdd}>
              حفظ وتوثيق السجل
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
