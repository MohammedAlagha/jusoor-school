import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { AdministrativeRequest, RequestStatus } from '../../lib/types/database.types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Inbox, CheckCircle2, Clock, XCircle, MessageSquare, Send } from 'lucide-react';

export function RequestsView() {
  const { requests, updateRequestStatus, currentUser, currentBranch } = useSchool();
  const [selectedReq, setSelectedReq] = useState<AdministrativeRequest | null>(null);
  const [newStatus, setNewStatus] = useState<RequestStatus>('in_progress');
  const [adminReply, setAdminReply] = useState('');

  const filteredRequests =
    currentUser.role === 'parent'
      ? requests.filter((r) => r.parent_id === currentUser.id)
      : currentUser.role === 'super_admin'
      ? requests
      : requests.filter((r) => r.branch_id === currentBranch.id);

  const handleUpdate = () => {
    if (!selectedReq) return;
    updateRequestStatus(selectedReq.id, newStatus, adminReply);
    setSelectedReq(null);
    setAdminReply('');
    alert('تم تحديث حالة الطلب والرد على ولي الأمر بنجاح!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900">إدارة الطلبات الإدارية وشهادات الطلاب</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            استقبال طلبات أولياء الأمور الرسمية والبت فيها وإشعارهم بالنتيجة إلكترونياً
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((req) => (
          <Card key={req.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-start justify-between">
                  <Badge
                    variant={
                      req.status === 'completed'
                        ? 'success'
                        : req.status === 'in_progress'
                        ? 'info'
                        : req.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {req.status === 'completed'
                      ? 'مكتمل'
                      : req.status === 'in_progress'
                      ? 'قيد المعالجة'
                      : req.status === 'rejected'
                      ? 'مرفوض'
                      : 'قيد الانتظار'}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{req.created_at}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-3">{req.type_label}</h3>
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {req.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الطالب:</span>
                    <span className="font-bold text-slate-800">{req.student_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ولي الأمر:</span>
                    <span className="font-medium text-slate-700">{req.parent_name}</span>
                  </div>
                </div>

                {req.admin_response && (
                  <div className="mt-3 p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs border border-emerald-100">
                    <span className="font-bold block text-[10px]">رد الإدارة:</span>
                    {req.admin_response}
                  </div>
                )}
              </div>

              {currentUser.role !== 'parent' && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      setSelectedReq(req);
                      setNewStatus(req.status);
                      setAdminReply(req.admin_response || '');
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 ml-1" />
                    معالجة الطلب والرد
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Action Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={`معالجة: ${selectedReq.type_label}`}
          description={`مقدم من ولي الأمر ${selectedReq.parent_name} بخصوص الطالب ${selectedReq.student_name}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                تحديث حالة الطلب *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                className="w-full px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg"
              >
                <option value="pending">قيد الانتظار (Pending)</option>
                <option value="in_progress">قيد المعالجة (In Progress)</option>
                <option value="completed">مكتمل ومعتمد (Completed)</option>
                <option value="rejected">مرفوض (Rejected)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نص الرد الإداري الموجه لولي الأمر *
              </label>
              <textarea
                rows={3}
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                placeholder="اكتب رد الإدارة أو تعليمات الاستلام أو سبب الرفض..."
                className="w-full px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedReq(null)}>
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleUpdate}>
                <Send className="w-3.5 h-3.5 ml-1" />
                حفظ التحديث وإرسال الإشعار
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
