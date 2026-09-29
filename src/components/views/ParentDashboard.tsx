import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { ChildSwitcher } from '../layout/ChildSwitcher';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import {
  CalendarCheck,
  Award,
  BookOpen,
  Inbox,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { AdministrativeRequest } from '../../lib/types/database.types';

export function ParentDashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { activeChild, attendance, assignments, requests, exams, behaviorRecords, submitRequest } = useSchool();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<AdministrativeRequest['type']>('certificate_request');
  const [requestDesc, setRequestDesc] = useState('');

  if (!activeChild) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        لم يتم العثور على بيانات أبناء مسجلة لهذا الحساب.
      </div>
    );
  }

  // Attendance for active child
  const childAttendance = attendance.filter((a) => a.student_id === activeChild.id);
  const todayRecord = childAttendance.find((a) => a.date === '2026-09-29');

  // Requests for active child
  const childRequests = requests.filter((r) => r.student_id === activeChild.id);

  // Positive behavior for active child
  const childBehavior = behaviorRecords.filter(
    (b) => b.student_id === activeChild.id && b.is_visible_to_parent
  );

  const handleCreateRequest = () => {
    if (!requestDesc.trim()) {
      alert('يرجى كتابة تفاصيل الطلب');
      return;
    }
    submitRequest(requestType, requestDesc, activeChild.id);
    setRequestDesc('');
    setShowRequestModal(false);
    alert('تم إرسال الطلب إلى إدارة المدرسة بنجاح!');
  };

  return (
    <div className="space-y-6">
      {/* Top Child Selector */}
      <ChildSwitcher />

      {/* Child Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Attendance Card */}
        <Card className="border-r-4 border-r-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">حضور اليوم ({activeChild.first_name})</p>
              <div className="mt-1">
                {todayRecord ? (
                  <Badge variant={todayRecord.status === 'present' ? 'success' : 'danger'}>
                    {todayRecord.status === 'present'
                      ? 'حاضر في المدرسة'
                      : todayRecord.status === 'late'
                      ? 'متأخر'
                      : 'غائب'}
                  </Badge>
                ) : (
                  <Badge variant="default">جاري رصد الحضور</Badge>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">تاريخ اليوم: 2026-09-29</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Academic Stage Card */}
        <Card className="border-r-4 border-r-blue-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">الصف والشعبة</p>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{activeChild.grade_name}</h4>
              <p className="text-[10px] text-blue-600 font-medium mt-0.5">{activeChild.section_name}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Behavior & Points Card */}
        <Card className="border-r-4 border-r-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">السلوك والمواظبة</p>
              <h4 className="text-base font-extrabold text-amber-600 mt-1">100 / 100</h4>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {childBehavior.length} إشادات تميز معتمدة
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Parent Requests Card */}
        <Card className="border-r-4 border-r-purple-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">الطلبات الإدارية للابن</p>
              <h4 className="text-lg font-bold text-slate-800 mt-1">{childRequests.length} طلبات</h4>
              <button
                onClick={() => setShowRequestModal(true)}
                className="text-[11px] text-purple-600 font-bold hover:underline mt-0.5 block text-right cursor-pointer"
              >
                + تقديم طلب جديد
              </button>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Homework, Exams & Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Homework */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>الواجبات المنزلية المطلوبة من {activeChild.first_name}</CardTitle>
              <Badge variant="info">محدث أسبوعياً</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.map((hw) => (
                <div key={hw.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{hw.title}</span>
                    <span className="text-[11px] text-rose-500 font-semibold">تاريخ التسليم: {hw.due_date}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{hw.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">المادة: {hw.subject_name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Published Exams */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>جدول الامتحانات المعتمدة المنشورة</CardTitle>
              <Badge variant="purple">نظام RLS للمنطقة المنشورة</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exams
                .filter((ex) => ex.is_published)
                .map((exam) => (
                  <div key={exam.id} className="p-3 rounded-xl border border-slate-100 bg-white">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{exam.title}</span>
                      <Badge variant="warning">{exam.exam_date}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span>المادة: {exam.subject_name}</span>
                      <span>
                        الوقت: {exam.start_time} - {exam.end_time}
                      </span>
                      <span className="font-bold text-blue-600">الدرجة: {exam.total_marks}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Administrative Requests Tracker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>الطلبات الإدارية السابقة لـ {activeChild.first_name}</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة حالة طلبات الشهادات أو النقل أو الاستفسارات وردود الإدارة
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowRequestModal(true)}
              className="text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 ml-1" />
              تقديم طلب جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {childRequests.map((req) => (
              <div key={req.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{req.type_label}</h4>
                    <p className="text-xs text-slate-600 mt-1">{req.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">تاريخ التقديم: {req.created_at}</span>
                  </div>
                  <Badge
                    variant={
                      req.status === 'completed'
                        ? 'success'
                        : req.status === 'in_progress'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {req.status === 'completed' ? 'منجز ومكتمل' : req.status === 'in_progress' ? 'قيد المعالجة' : 'قيد الانتظار'}
                  </Badge>
                </div>
                {req.admin_response && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-100 text-xs">
                    <span className="font-bold text-emerald-800 block text-[11px]">رد إدارة المدرسة:</span>
                    <p className="text-emerald-700 mt-0.5">{req.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={`تقديم طلب إداري بخصوص (${activeChild.first_name})`}
        description="سيتم إرسال الطلب مباشرة لإدارة الفرع ومتابعته إلكترونياً"
      >
        <div className="space-y-4">
          <Select
            label="نوع الطلب *"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as AdministrativeRequest['type'])}
          >
            <option value="certificate_request">طلب شهادة تعريف طالب رسمية</option>
            <option value="document_request">طلب نسخة من الوثائق والملف المدرسي</option>
            <option value="transfer_request">طلب نقل إلى فرع أو مدرسة أخرى</option>
            <option value="general_inquiry">استفسار أو موعد مع المرشد الطلابي</option>
          </Select>

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تفاصيل ومبررات الطلب *
            </label>
            <textarea
              rows={4}
              value={requestDesc}
              onChange={(e) => setRequestDesc(e.target.value)}
              placeholder="اكتب ما تحتاجه بدقة ليتمكن موظف الإدارة من خدمتكم بأسرع وقت..."
              className="w-full px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateRequest}>
              <Send className="w-3.5 h-3.5 ml-1.5" />
              إرسال الطلب
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
