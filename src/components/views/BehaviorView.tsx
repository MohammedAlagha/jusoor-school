import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import {
  Smile,
  AlertTriangle,
  AlertCircle,
  Plus,
  Eye,
  EyeOff,
  UserCheck,
  Calendar,
  FileText,
  MailWarning,
  Sparkles,
  Search,
} from 'lucide-react';
import { BehaviorType } from '../../lib/types/database.types';

export function BehaviorView() {
  const { behaviorRecords, students, addBehaviorRecord, currentUser, currentBranch, activeChild } =
    useSchool();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Form states
  const [studentId, setStudentId] = useState(students[0]?.id || 'std-01');
  const [type, setType] = useState<BehaviorType>('positive');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [isParentVisible, setIsParentVisible] = useState(true);
  const [incidentDate, setIncidentDate] = useState('2026-09-29');

  // If logged in as parent: only show visible records for the active child!
  const recordsToDisplay =
    currentUser.role === 'parent'
      ? behaviorRecords.filter(
          (b) => b.student_id === activeChild?.id && b.is_visible_to_parent
        )
      : behaviorRecords.filter((b) => {
          if (filterType === 'all') return true;
          return b.type === filterType;
        });

  const handleAddSubmit = () => {
    if (!title.trim() || !description.trim()) {
      alert('يرجى كتابة عنوان ووصف الملاحظة السلوكية');
      return;
    }

    addBehaviorRecord({
      student_id: studentId,
      type,
      title,
      description,
      action_taken: actionTaken,
      is_visible_to_parent: isParentVisible,
      incident_date: incidentDate,
    });

    setShowAddModal(false);
    setTitle('');
    setDescription('');
    setActionTaken('');
    alert('تم رصد السلوك التربوي وحفظه في سجل الطالب بنجاح!');
  };

  const getBadgeForType = (bType: BehaviorType) => {
    switch (bType) {
      case 'positive':
        return <Badge variant="success">سلوك إيجابي وتميز</Badge>;
      case 'negative':
        return <Badge variant="danger">سلوك سلبي ومخالفة</Badge>;
      case 'warning':
        return <Badge variant="warning">تنبيه / إنذار رسمي</Badge>;
      case 'parent_summons':
        return <Badge variant="purple">استدعاء ولي أمر</Badge>;
      default:
        return <Badge variant="default">ملاحظة عامة</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smile className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900">
              سجل السلوك والمواظبة والملاحظات التربوية (Behavior Tracking)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            توثيق السلوكيات الإيجابية، المخالفات، التنبيهات، واستدعاءات ولي الأمر لفرع ({currentBranch.name})
          </p>
        </div>

        {currentUser.role !== 'parent' && (
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            رصد ملاحظة سلوكية جديدة
          </Button>
        )}
      </div>

      {/* Filter Tabs for Admin/Teacher */}
      {currentUser.role !== 'parent' && (
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'all', label: 'كافة السجلات' },
            { id: 'positive', label: 'السلوكيات الإيجابية' },
            { id: 'warning', label: 'التنبيهات والإنذارات' },
            { id: 'negative', label: 'المخالفات السلوكية' },
            { id: 'parent_summons', label: 'استدعاءات ولي الأمر' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recordsToDisplay.map((rec) => {
          const st = students.find((s) => s.id === rec.student_id);

          return (
            <Card
              key={rec.id}
              className={`hover:shadow-xs transition-shadow ${
                rec.type === 'parent_summons' ? 'border-purple-300 bg-purple-50/20' : ''
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  {getBadgeForType(rec.type)}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {rec.incident_date}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-2.5">{rec.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {rec.description}
                </p>

                {rec.action_taken && (
                  <div className="mt-3 p-2.5 bg-slate-100/70 rounded-xl text-xs text-slate-700 border border-slate-200/60">
                    <span className="font-bold text-slate-600 block text-[10px] mb-0.5">
                      الإجراء المتخذ والتوصية:
                    </span>
                    {rec.action_taken}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    الطالب: <strong className="text-slate-900 font-bold">{st?.full_name}</strong>
                  </span>
                  {currentUser.role !== 'parent' && (
                    <div className="flex items-center gap-1 text-[11px]">
                      {rec.is_visible_to_parent ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> متاح لولي الأمر
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <EyeOff className="w-3.5 h-3.5" /> سري ومحجوب
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recordsToDisplay.length === 0 && (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
          <Smile className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">لا توجد ملاحظات سلوكية مسجلة حالياً</p>
          <p className="text-xs text-slate-400 mt-1">السجل نظيف ومنضبط بالكامل</p>
        </div>
      )}

      {/* Add Behavior Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="رصد ملاحظة سلوكية / تربوية"
        description="توثيق الإجراءات المتخذة ومستوى مشاركتها مع ولي الأمر"
      >
        <div className="space-y-4">
          <Select
            label="الطالب المعني *"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.full_name} ({st.grade_name} - {st.section_name})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="نوع السلوك *"
              value={type}
              onChange={(e) => setType(e.target.value as BehaviorType)}
            >
              <option value="positive">إيجابي (مبادرة وتميز)</option>
              <option value="negative">سلبي (مخالفة سلوكية)</option>
              <option value="warning">تنبيه / إنذار أكاديمي</option>
              <option value="parent_summons">استدعاء ولي أمر رسمي</option>
            </Select>

            <Input
              label="تاريخ الواقعة *"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
            />
          </div>

          <Input
            label="عنوان الملاحظة *"
            placeholder="مثال: إتقان في تقديم العرض التقديمي / تأخر متكرر عن الحصة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تفاصيل الواقعة والسلوك المرصود *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب التقرير المفصل للملاحظة..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <Input
            label="الإجراء المتخذ والتوجيه التربوي *"
            placeholder="مثال: شهادة شكر / تنبيه شفهي / خطاب رسمي لولي الأمر"
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
          />

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 block">إظهار السجل في بوابة ولي الأمر</span>
              <span className="text-[10px] text-slate-400">
                في حال التعطيل يظل السجل سرياً للإدارة والمعلمين فقط
              </span>
            </div>
            <input
              type="checkbox"
              checked={isParentVisible}
              onChange={(e) => setIsParentVisible(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              حفظ السجل
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
