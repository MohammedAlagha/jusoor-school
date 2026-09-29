import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import {
  Megaphone,
  Plus,
  Bell,
  Users,
  Calendar,
  Building,
  GraduationCap,
  Paperclip,
  Download,
  Filter,
} from 'lucide-react';
import { Announcement } from '../../lib/types/database.types';

export function AnnouncementsView() {
  const { announcements, addAnnouncement, currentUser, currentBranch, branches, grades } =
    useSchool();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterAudience, setFilterAudience] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<Announcement['target_audience']>('all');
  const [targetBranchId, setTargetBranchId] = useState(currentBranch.id);
  const [targetGradeId, setTargetGradeId] = useState(grades[0]?.id || 'gr-01');
  const [attachmentName, setAttachmentName] = useState('تعميم_التقويم_الفصلي_المعتمد.pdf');

  // Filter announcements according to role and audience filter
  const visibleAnnouncements = announcements.filter((ann) => {
    // Parent visibility rules
    if (currentUser.role === 'parent') {
      if (ann.target_audience === 'teachers') return false;
      if (ann.branch_id && ann.branch_id !== currentBranch.id) return false;
      return true;
    }

    // Teacher visibility rules
    if (currentUser.role === 'teacher') {
      if (ann.target_audience === 'parents') return false;
      if (ann.branch_id && ann.branch_id !== currentBranch.id) return false;
      return true;
    }

    // Admin / Super Admin filter
    if (filterAudience !== 'all' && ann.target_audience !== filterAudience) return false;
    return true;
  });

  const handleAddSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert('يرجى تعبئة عنوان ومحتوى التعميم الرسمي');
      return;
    }

    addAnnouncement({
      title,
      content,
      target_audience: audience,
      branch_id: audience === 'branch' ? targetBranchId : undefined,
      grade_id: audience === 'grade' ? targetGradeId : undefined,
      attachment_url: attachmentName,
      created_by_name: currentUser.full_name,
    });

    setShowAddModal(false);
    setTitle('');
    setContent('');
    alert('تم نشر وتعميم الإعلان الرسمي بنجاح وإشعار الفئة المستهدفة!');
  };

  const getAudienceBadge = (target: Announcement['target_audience']) => {
    switch (target) {
      case 'all':
        return <Badge variant="purple">الجميع (كافة الفروع والمنسوبين)</Badge>;
      case 'branch':
        return <Badge variant="info">فرع محدد</Badge>;
      case 'grade':
        return <Badge variant="warning">صف دراسي محدد</Badge>;
      case 'teachers':
        return <Badge variant="default">الهيئة التعليمية فقط</Badge>;
      case 'parents':
        return <Badge variant="success">أولياء الأمور فقط</Badge>;
      default:
        return <Badge variant="default">عام</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              مركز التعاميم والإعلانات المدرسية (Announcements Module)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إرسال وتوجيه البلاغات الرسمية حسب الفرع أو الصف أو الفئات المستهدفة لفرع ({currentBranch.name})
          </p>
        </div>

        {currentUser.role !== 'parent' && (
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            نشر تعميم أو إعلان رسمي
          </Button>
        )}
      </div>

      {/* Target Audience Filters (Admin only) */}
      {currentUser.role !== 'parent' && (
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'all', label: 'كافة التعاميم' },
            { id: 'parents', label: 'أولياء الأمور' },
            { id: 'teachers', label: 'المعلمين' },
            { id: 'branch', label: 'تعاميم الفرع' },
            { id: 'grade', label: 'تعاميم الصفوف' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterAudience(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterAudience === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleAnnouncements.map((ann) => (
          <Card key={ann.id} className="hover:shadow-xs transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                {getAudienceBadge(ann.target_audience)}
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {ann.published_at}
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mt-2.5">{ann.title}</h3>
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {ann.content}
              </p>

              {ann.attachment_url && (
                <div className="mt-3 p-2 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-blue-900">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-mono text-[11px]">{ann.attachment_url}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert(`جاري تنزيل الملف المرفق: ${ann.attachment_url}`)}
                    className="text-[11px] py-0.5 px-2"
                  >
                    <Download className="w-3 h-3 ml-1" />
                    تحميل
                  </Button>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  جهة الإصدار: <strong className="text-slate-700">{ann.created_by_name}</strong>
                </span>
                <span className="text-emerald-600 font-semibold">معتمد رسمياً</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Announcement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إنشاء ونشر إعلان / تعميم مدرسي"
        description="تحديد الجمهور المستهدف بدقة وإرفاق المستندات الرسمية"
      >
        <div className="space-y-4">
          <Input
            label="عنوان التعميم *"
            placeholder="مثال: الخطة التشغيلية لاختبارات الفصل الأول"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select
            label="الفئة المستهدفة بالتعميم *"
            value={audience}
            onChange={(e) => setAudience(e.target.value as Announcement['target_audience'])}
          >
            <option value="all">كافة منسوبي المدارس (عام)</option>
            <option value="parents">أولياء الأمور فقط</option>
            <option value="teachers">الهيئة التعليمية والمعلمون فقط</option>
            <option value="branch">فرع محدد</option>
            <option value="grade">مرحلة / صف دراسي محدد</option>
          </Select>

          {audience === 'branch' && (
            <Select
              label="اختر الفرع المستهدف *"
              value={targetBranchId}
              onChange={(e) => setTargetBranchId(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </Select>
          )}

          {audience === 'grade' && (
            <Select
              label="اختر الصف الدراسي المستهدف *"
              value={targetGradeId}
              onChange={(e) => setTargetGradeId(e.target.value)}
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          )}

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              نص البيان والمحتوى الرسمي *
            </label>
            <textarea
              rows={4}
              placeholder="اكتب تفاصيل الإعلان والتوجيهات والتواريخ المطلوبة..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <Input
            label="المستند المرفق (PDF / التعميم الرسمي)"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              نشر التعميم فوراً
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
