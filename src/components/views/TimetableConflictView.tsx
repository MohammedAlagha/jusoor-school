import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Select, Input } from '../ui/input';
import { Clock, AlertTriangle, CheckCircle2, Plus, Calendar } from 'lucide-react';
import { TimetableEntry } from '../../lib/types/database.types';

export function TimetableConflictView() {
  const { timetable, currentBranch } = useSchool();
  const [entries, setEntries] = useState<TimetableEntry[]>(timetable);
  const [showAddModal, setShowAddModal] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Form
  const [selectedSection, setSelectedSection] = useState('sec-01');
  const [selectedTeacher, setSelectedTeacher] = useState('usr-teacher-ahmed');
  const [selectedSubject, setSelectedSubject] = useState('الرياضيات المتقدمة 1');
  const [dayOfWeek, setDayOfWeek] = useState(0); // Sunday
  const [periodNumber, setPeriodNumber] = useState(1);
  const [classroom, setClassroom] = useState('قاعة 101');

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  // Conflict Detection Function
  const checkConflict = (
    sectionId: string,
    teacherId: string,
    day: number,
    period: number
  ): { hasConflict: boolean; reason?: string } => {
    // 1. Check Section Conflict (Same section cannot have 2 classes at same period)
    const sectionConflict = entries.find(
      (e) => e.section_id === sectionId && e.day_of_week === day && e.period_number === period
    );
    if (sectionConflict) {
      return {
        hasConflict: true,
        reason: `تعارض شعبة! الشعبة المحددة لديها بالفعل حصة (${sectionConflict.subject_name}) في الحصة رقم ${period}.`,
      };
    }

    // 2. Check Teacher Conflict (Same teacher cannot teach 2 classes at same period)
    const teacherConflict = entries.find(
      (e) => e.teacher_id === teacherId && e.day_of_week === day && e.period_number === period
    );
    if (teacherConflict) {
      return {
        hasConflict: true,
        reason: `تعارض معلم! المعلم مسند له بالفعل حصة في (${teacherConflict.section_name}) في نفس الوقت والحصة رقم ${period}.`,
      };
    }

    return { hasConflict: false };
  };

  const handleAddEntry = () => {
    const conflict = checkConflict(selectedSection, selectedTeacher, dayOfWeek, periodNumber);
    if (conflict.hasConflict) {
      setConflictWarning(conflict.reason || 'تعارض في الجدولة!');
      return;
    }

    const newEntry: TimetableEntry = {
      id: `tt-${Date.now()}`,
      section_id: selectedSection,
      subject_id: 'sub-01',
      teacher_id: selectedTeacher,
      day_of_week: dayOfWeek,
      period_number: periodNumber,
      start_time: '07:30',
      end_time: '08:15',
      classroom: classroom,
      subject_name: selectedSubject,
      teacher_name: selectedTeacher === 'usr-teacher-ahmed' ? 'أ. أحمد منصور' : 'أ. خالد التميمي',
      section_name: selectedSection === 'sec-01' ? 'شعبة أ (ثانوي)' : 'شعبة أ (متوسط)',
    };

    setEntries([...entries, newEntry]);
    setShowAddModal(false);
    setConflictWarning(null);
    alert('تم حفظ الحصة في الجدول بنجاح دون أي تعارض زمني!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              إدارة الجداول الدراسية مع محرك منع التعارض (Conflict Prevention Engine)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            يتحقق النظام آلياً من عدم ازدواجية المعلم أو تكرار الشعبة في نفس الحصة الزمنية قبل الحفظ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setConflictWarning(null);
              setShowAddModal(true);
            }}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            إضافة حصة جديدة
          </Button>
        </div>
      </div>

      {/* Timetable Weekly Visual Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>الجدول الأسبوعي العام للفرع ({currentBranch.name})</CardTitle>
            <Badge variant="purple">Constraint Validated</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 border-l border-slate-200 w-24">اليوم</th>
                  {periods.map((p) => (
                    <th key={p} className="p-3.5 text-center border-l border-slate-100 last:border-0">
                      الحصة {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((dayName, dayIdx) => (
                  <tr key={dayIdx} className="hover:bg-slate-50/40">
                    <td className="p-3.5 font-bold text-slate-900 bg-slate-50/60 border-l border-slate-200">
                      {dayName}
                    </td>
                    {periods.map((p) => {
                      const slotEntries = entries.filter(
                        (e) => e.day_of_week === dayIdx && e.period_number === p
                      );
                      return (
                        <td
                          key={p}
                          className="p-2 border-l border-slate-100 last:border-0 min-w-[130px] align-top"
                        >
                          {slotEntries.length > 0 ? (
                            <div className="space-y-1.5">
                              {slotEntries.map((e) => (
                                <div
                                  key={e.id}
                                  className="p-2 bg-blue-50/80 border border-blue-200/80 rounded-lg text-right"
                                >
                                  <p className="font-bold text-blue-950 truncate">{e.subject_name}</p>
                                  <p className="text-[10px] text-blue-700">{e.section_name}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{e.teacher_name}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-14 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-300">
                              فترة شاغرة
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Period Modal with Conflict Detection Warning */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="تسكين حصة جديدة في الجدول"
        description="سيقوم محرك النظام بفحص تعارضات المعلم والشعبة فوراً"
      >
        <div className="space-y-4">
          {conflictWarning && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-bounce">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">تم اكتشاف تعارض في الجدولة!</p>
                <p className="mt-0.5">{conflictWarning}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="الشعبة الدراسية *"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="sec-01">الصف الأول الثانوي - شعبة أ</option>
              <option value="sec-02">الصف الأول الثانوي - شعبة ب</option>
              <option value="sec-03">الصف الثالث المتوسط - شعبة أ</option>
            </Select>

            <Select
              label="المعلم المكلف *"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="usr-teacher-ahmed">أ. أحمد منصور (رياضيات)</option>
              <option value="usr-teacher-khaled">أ. خالد التميمي (فيزياء)</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="اليوم *"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
            >
              {days.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </Select>

            <Select
              label="رقم الحصة *"
              value={periodNumber}
              onChange={(e) => setPeriodNumber(Number(e.target.value))}
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  الحصة {p} (07:30 - 08:15)
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="اسم القاعة أو المعمل *"
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAddEntry}>
              فحص التعارض وحفظ الحصة
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
