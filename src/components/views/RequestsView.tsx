import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { AdministrativeRequest, AdministrativeRequestType, RequestStatus } from '../../lib/types/database.types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Input, Select } from '../ui/input';
import {
  Inbox,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Send,
  Plus,
  Paperclip,
  Download,
  AlertCircle,
  FileCheck,
  Calendar,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

export function RequestsView() {
  const {
    requests,
    updateRequestStatus,
    submitRequest,
    currentUser,
    currentBranch,
    activeChild,
    parentChildren,
  } = useSchool();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReqForReview, setSelectedReqForReview] = useState<AdministrativeRequest | null>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  // Parent New Request Form
  const [reqType, setReqType] = useState<AdministrativeRequestType>('certificate_request');
  const [selectedStudentId, setSelectedStudentId] = useState(activeChild?.id || 'std-01');
  const [reqDetails, setReqDetails] = useState('');
  const [reqAttachment, setReqAttachment] = useState('تقرير_طبي_رسمي_معتمد.pdf');

  // Admin Review Form
  const [reviewStatus, setReviewStatus] = useState<RequestStatus>('in_progress');
  const [adminReplyText, setAdminReplyText] = useState('');

  // Filtering requests
  const filteredRequests = requests.filter((r) => {
    // If parent, only see requests they submitted
    if (currentUser.role === 'parent' && r.parent_id !== currentUser.id) return false;
    // If admin of a branch, see branch requests
    if (currentUser.role === 'admin' && r.branch_id !== currentBranch.id) return false;

    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const handleCreateRequest = () => {
    if (!reqDetails.trim()) {
      alert('يرجى كتابة تفاصيل ومبررات الطلب الإداري');
      return;
    }

    submitRequest(reqType, reqDetails, selectedStudentId, reqAttachment);
    setShowNewRequestModal(false);
    setReqDetails('');
    alert('تم إرسال طلبكم بنجاح إلى إدارة المدرسة، وسيتم الرد خلال 24 ساعة.');
  };

  const handleSaveReview = () => {
    if (!selectedReqForReview) return;
    if (!adminReplyText.trim()) {
      alert('يرجى كتابة رد الإدارة الرسمي');
      return;
    }

    updateRequestStatus(selectedReqForReview.id, reviewStatus, adminReplyText);
    setSelectedReqForReview(null);
    setAdminReplyText('');
    alert('تم تحديث حالة الطلب وإرسال الإشعار لولي الأمر بنجاح!');
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">تم التقديم (Submitted)</Badge>;
      case 'in_progress':
        return <Badge variant="info">قيد المراجعة والتدقيق (In Review)</Badge>;
      case 'approved':
        return <Badge variant="success">معتمد وموافق عليه (Approved)</Badge>;
      case 'completed':
        return <Badge variant="purple">مكتمل ومنجز (Completed)</Badge>;
      case 'rejected':
        return <Badge variant="danger">معتذر عنه (Rejected)</Badge>;
      default:
        return <Badge variant="default">قيد الانتظار</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900">
              مركز الطلبات والخدمات الإدارية (Administrative Requests)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة طلبات الشهادات، النقل، أعذار الغياب، والمواعيد مع دورة حياة ومتابعة إلكترونية موثقة
          </p>
        </div>

        {currentUser.role === 'parent' ? (
          <Button
            variant="primary"
            onClick={() => setShowNewRequestModal(true)}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            تقديم طلب جديد
          </Button>
        ) : (
          <div className="text-xs text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            إجمالي الطلبات الواردة: <span className="text-purple-700">{filteredRequests.length}</span>
          </div>
        )}
      </div>

      {/* Lifecycle Flow Stepper Visual */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-[11px]">
              1
            </div>
            <div>
              <span className="font-bold block">تقديم الطلب</span>
              <span className="text-[10px] text-slate-400">Submitted</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 rotate-180" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-400 text-slate-900 font-bold flex items-center justify-center text-[11px]">
              2
            </div>
            <div>
              <span className="font-bold block">المراجعة والتدقيق</span>
              <span className="text-[10px] text-slate-400">In Review</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 rotate-180" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-[11px]">
              3
            </div>
            <div>
              <span className="font-bold block">الاعتماد أو الاعتذار</span>
              <span className="text-[10px] text-slate-400">Approved / Rejected</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 rotate-180" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-400 text-slate-900 font-bold flex items-center justify-center text-[11px]">
              4
            </div>
            <div>
              <span className="font-bold block">الإنجاز والتسليم</span>
              <span className="text-[10px] text-slate-400">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'كافة الطلبات' },
          { id: 'pending', label: 'تم التقديم' },
          { id: 'in_progress', label: 'قيد المراجعة' },
          { id: 'approved', label: 'المعتمدة' },
          { id: 'completed', label: 'المكتملة' },
          { id: 'rejected', label: 'المعتذر عنها' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((req) => (
          <Card key={req.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-start justify-between">
                  {getStatusBadge(req.status)}
                  <span className="text-[10px] text-slate-400 font-mono">{req.created_at}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-3">{req.type_label}</h3>
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {req.description}
                </p>

                {req.attachment_url && (
                  <div className="mt-2.5 p-2 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-blue-900">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-mono text-[10px] truncate max-w-[150px]">{req.attachment_url}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`جاري تنزيل المرفق: ${req.attachment_url}`)}
                      className="text-[10px] py-0.5 px-2 font-bold"
                    >
                      <Download className="w-3 h-3 ml-1" />
                      تحميل
                    </Button>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الطالب المعني:</span>
                    <span className="font-bold text-slate-800">{req.student_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ولي الأمر:</span>
                    <span className="font-medium text-slate-700">{req.parent_name}</span>
                  </div>
                </div>

                {req.admin_response && (
                  <div className="mt-3 p-2.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-emerald-800 text-[10px]">
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>رد الإدارة والاعتماد الرسمي:</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">{req.admin_response}</p>
                  </div>
                )}
              </div>

              {currentUser.role !== 'parent' && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-bold text-purple-700 hover:bg-purple-50"
                    onClick={() => {
                      setSelectedReqForReview(req);
                      setReviewStatus(req.status);
                      setAdminReplyText(req.admin_response || '');
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 ml-1" />
                    البت في الطلب وتحديث الحالة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">لا توجد طلبات إدارية في هذه القائمة</p>
          <p className="text-xs text-slate-400 mt-1">كافة الطلبات منجزة أو لا توجد طلبات جديدة</p>
        </div>
      )}

      {/* Parent New Request Modal */}
      <Modal
        isOpen={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
        title="تقديم طلب إداري أو استفسار رسمي"
        description="سيتم توجيه الطلب آلياً إلى إدارة فرع المدرسة المعني للمتابعة والإفادة"
      >
        <div className="space-y-4">
          <Select
            label="نوع الطلب الرسمي *"
            value={reqType}
            onChange={(e) => setReqType(e.target.value as AdministrativeRequestType)}
          >
            <option value="certificate_request">طلب شهادة تعريف رسمية (قيد طالب)</option>
            <option value="transfer_request">طلب نقل مدرسي (بين الفروع أو مدرسة أخرى)</option>
            <option value="absence_excuse">تقديم عذر غياب رسمي (طبي أو طارئ)</option>
            <option value="appointment_request">طلب موعد مع إدارة المدرسة أو المعلم</option>
            <option value="general_inquiry">استفسار أو اقتراح عام</option>
            <option value="custom_request">طلب إداري مخصص</option>
          </Select>

          {parentChildren.length > 0 && (
            <Select
              label="اختر الطالب المعني بالطلب *"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {parentChildren.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.full_name} ({ch.grade_name} - {ch.section_name})
                </option>
              ))}
            </Select>
          )}

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تفاصيل ومبررات الطلب *
            </label>
            <textarea
              rows={4}
              placeholder="اكتب التوضيحات والتفاصيل اللازمة للإدارة..."
              value={reqDetails}
              onChange={(e) => setReqDetails(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <Input
            label="المستند المرفق (عذر طبي، هوية، مشهد رسمي)"
            value={reqAttachment}
            onChange={(e) => setReqAttachment(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowNewRequestModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateRequest}>
              إرسال الطلب رسمياً
            </Button>
          </div>
        </div>
      </Modal>

      {/* Admin Review & Decision Modal */}
      {selectedReqForReview && (
        <Modal
          isOpen={!!selectedReqForReview}
          onClose={() => setSelectedReqForReview(null)}
          title={`البت في طلب: ${selectedReqForReview.type_label}`}
          description={`مقدم من: ${selectedReqForReview.parent_name} • الطالب: ${selectedReqForReview.student_name}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-700 block text-[10px]">نص طلب ولي الأمر:</span>
              <p className="text-slate-800 leading-relaxed">{selectedReqForReview.description}</p>
            </div>

            {selectedReqForReview.attachment_url && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-blue-900 font-semibold">المرفق المرفوع من ولي الأمر:</span>
                <Button size="sm" variant="outline" className="text-xs">
                  <Download className="w-3.5 h-3.5 ml-1 text-blue-600" />
                  تحميل ومراجعة المرفق
                </Button>
              </div>
            )}

            <Select
              label="تحديث حالة دورة حياة الطلب *"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as RequestStatus)}
            >
              <option value="in_progress">قيد المراجعة والتدقيق (In Review)</option>
              <option value="approved">معتمد وموافق عليه (Approved)</option>
              <option value="completed">منجز ومكتمل رسمياً (Completed)</option>
              <option value="rejected">معتذر عنه / مرفوض (Rejected)</option>
            </Select>

            <div className="text-right">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                الرد الإداري الرسمي (سيصل إشعار فوري لولي الأمر) *
              </label>
              <textarea
                rows={3}
                placeholder="اكتب التوجيه والقرار الإداري الرسمي هنا..."
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedReqForReview(null)}>
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleSaveReview}>
                حفظ القرار واعتماد الرد
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
