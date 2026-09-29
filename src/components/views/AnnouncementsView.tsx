import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import { Megaphone, Plus, Bell, Users, Calendar } from 'lucide-react';
import { Announcement } from '../../lib/types/database.types';

export function AnnouncementsView() {
  const { announcements, addAnnouncement, currentUser } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<Announcement['target_audience']>('all');

  const handleAdd = () => {
    if (!title.trim() || !content.trim()) {
      alert('يرجى تعبئة عنوان ومحتوى الإعلان');
      return;
    }
    addAnnouncement({
      title,
      content,
      target_audience: audience,
    });
    setShowAddModal(false);
    setTitle('');
    setContent('');
    alert('تم نشر التعميم والإعلان وإرسال الإشعارات للجمهور المستهدف!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">مركز التعاميم والإعلانات المدرسية</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            نشر التوجيهات والتعاميم الرسمية وتوجيهها للمدرسة كاملة أو المعلمين أو أولياء الأمور
          </p>
        </div>
        {currentUser.role !== 'parent' && (
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-xs font-bold">
            <Plus className="w-4 h-4 ml-1.5" />
            نشر إعلان جديد
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((ann) => (
          <Card key={ann.id} className="hover:shadow-xs transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Badge variant={ann.target_audience === 'all' ? 'purple' : 'info'}>
                  الجمهور: {ann.target_audience === 'all' ? 'كافة منسوبي المدرسة' : 'أولياء الأمور فقط'}
                </Badge>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {ann.published_at}
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mt-3">{ann.title}</h3>
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {ann.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                صادر عن: <strong className="text-slate-700">{ann.created_by_name}</strong>
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
        description="سيتم إرسال الإشعار فوراً إلى لوحة تحكم الفئة المستهدفة"
      >
        <div className="space-y-4">
          <Input
            label="عنوان الإعلان *"
            placeholder="مثال: موعد اختبارات الفصل الدراسي الأول"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select
            label="الجمهور المستهدف *"
            value={audience}
            onChange={(e) => setAudience(e.target.value as Announcement['target_audience'])}
          >
            <option value="all">كافة منسوبي المدرسة (معلمين وأولياء أمور)</option>
            <option value="parents">أولياء الأمور فقط</option>
            <option value="teachers">المعلمين فقط</option>
          </Select>

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">نص الإعلان *</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب تفاصيل الإعلان والتعليمات بدقة..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAdd}>
              نشر وإرسال التعميم
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
