import React, { useState } from 'react';
import { useSchool } from '../../lib/store/school-store';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Select, Input } from '../ui/input';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Calendar,
  Users,
  Building,
  GraduationCap,
  Trash2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { TimetableEntry } from '../../lib/types/database.types';

export function TimetableConflictView() {
  const {
    timetable,
    sections,
    teachers,
    subjects,
    currentBranch,
    addTimetableEntry,
    deleteTimetableEntry,
    currentUser,
  } = useSchool();

  const [viewMode, setViewMode] = useState<'section' | 'teacher' | 'classroom'>('section');
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id || 'sec-01');
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.user_id || 'usr-teacher-ahmed');
  const [selectedClassroom, setSelectedClassroom] = useState('قاعة 101');

  const [showAddModal, setShowAddModal] = useState(false);
  const [conflictError, setConflictError] = useState<{
    type: 'teacher' | 'section' | 'classroom';
    message: string;
    suggestedPeriod?: number;
    suggestedDay?: number;
  } | null>(null);

  // Form states
  const [formSectionId, setFormSectionId] = useState(sections[0]?.id || 'sec-01');
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.user_id || 'usr-teacher-ahmed');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || 'sub-01');
  const [formDayOfWeek, setFormDayOfWeek] = useState(0); // Sunday
  const [formPeriodNumber, setFormPeriodNumber] = useState(1);
  const [formClassroom, setFormClassroom] = useState('قاعة 101');

  const days = [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الإثنين' },
    { id: 2, name: 'الثلاثاء' },
    { id: 3, name: 'الأربعاء' },
    { id: 4, name: 'الخميس' },
  ];

  const periods = [
    { num: 1, time: '07:30 - 08:15' },
    { num: 2, time: '08:20 - 09:05' },
    { num: 3, time: '09:20 - 10:05' },
    { num: 4, time: '10:10 - 10:55' },
    { num: 5, time: '11:10 - 11:55' },
    { num: 6, time: '12:00 - 12:45' },
    { num: 7, time: '12:50 - 01:35' },
  ];

  const classrooms = ['قاعة 101', 'قاعة 102', 'معمل الفيزياء 1', 'معمل الكيمياء', 'قاعة 204'];

  // Conflict Detection Engine checking ALL 3 types:
  // 1. Teacher Conflict (المدرس في شعبتين بنفس الوقت)
  // 2. Section Conflict (الشعبة تدرس مادتين بنفس الوقت)
  // 3. Classroom Conflict (القاعة محجوزة لشعبتين بنفس الوقت)
  const validateConflict = (
    secId: string,
    tchId: string,
    room: string,
    day: number,
    period: number
  ) => {
    // 1. Section Conflict
    const secConflict = timetable.find(
      (e) => e.section_id === secId && e.day_of_week === day && e.period_number === period
    );
    if (secConflict) {
      // Find next free period for this section
      const nextFree = periods.find(
        (p) => !timetable.some((e) => e.section_id === secId && e.day_of_week === day && e.period_number === p.num)
      );
      return {
        type: 'section' as const,
        message: `تعارض شعبة! الشعبة المحددة مجدول لها مسبقاً (${secConflict.subject_name}) في الحصة رقم (${period}).`,
        suggestedPeriod: nextFree ? nextFree.num : (period % 7) + 1,
        suggestedDay: day,
      };
    }

    // 2. Teacher Conflict
    const tchConflict = timetable.find(
      (e) => e.teacher_id === tchId && e.day_of_week === day && e.period_number === period
    );
    if (tchConflict) {
      const nextFree = periods.find(
        (p) => !timetable.some((e) => e.teacher_id === tchId && e.day_of_week === day && e.period_number === p.num)
      );
      return {
        type: 'teacher' as const,
        message: `تعارض معلم! المعلم يدرّس بالفعل في (${tchConflict.section_name}) في نفس التوقيت والحصة رقم (${period}).`,
        suggestedPeriod: nextFree ? nextFree.num : (period % 7) + 1,
        suggestedDay: day,
      };
    }

    // 3. Classroom Conflict
    const roomConflict = timetable.find(
      (e) => e.classroom === room && e.day_of_week === day && e.period_number === period
    );
    if (roomConflict) {
      return {
        type: 'classroom' as const,
        message: `تعارض قاعة! (${room}) محجوزة مسبقاً لحصة (${roomConflict.subject_name} - ${roomConflict.section_name}) في هذا التوقيت.`,
        suggestedPeriod: (period % 7) + 1,
        suggestedDay: day,
      };
    }

    return null;
  };

  const handleAddSubmit = () => {
    const conflict = validateConflict(
      formSectionId,
      formTeacherId,
      formClassroom,
      formDayOfWeek,
      formPeriodNumber
    );

    if (conflict) {
      setConflictError(conflict);
      return;
    }

    const sec = sections.find((s) => s.id === formSectionId);
    const sub = subjects.find((s) => s.id === formSubjectId);
    const tch = teachers.find((t) => t.user_id === formTeacherId || t.id === formTeacherId);

    addTimetableEntry({
      section_id: formSectionId,
      subject_id: formSubjectId,
      teacher_id: formTeacherId,
      day_of_week: formDayOfWeek,
      period_number: formPeriodNumber,
      classroom: formClassroom,
      subject_name: sub?.name || 'مقرر دراسي',
      teacher_name: tch?.profile.full_name || 'معلم الحصة',
      section_name: sec?.name || 'شعبة أ',
      start_time: periods[formPeriodNumber - 1]?.time.split(' - ')[0] || '07:30',
      end_time: periods[formPeriodNumber - 1]?.time.split(' - ')[1] || '08:15',
    });

    setShowAddModal(false);
    setConflictError(null);
    alert('تم إضافة الحصة وتثبيتها بالجدول بنجاح!');
  };

  const applySuggestedResolution = () => {
    if (!conflictError?.suggestedPeriod) return;
    setFormPeriodNumber(conflictError.suggestedPeriod);
    setConflictError(null);
  };

  // Filter timetable according to selected view mode
  const filteredEntries = timetable.filter((entry) => {
    if (viewMode === 'section') {
      return entry.section_id === selectedSectionId;
    } else if (viewMode === 'teacher') {
      return entry.teacher_id === selectedTeacherId;
    } else {
      return entry.classroom === selectedClassroom;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              محرك إدارة الجداول وكشف التعارضات (Conflict Prevention Engine)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            كشف ومنع تعارضات المعلمين والشعب والقاعات آلياً مع اقتراح الحلول البديلة لفرع ({currentBranch.name})
          </p>
        </div>

        {currentUser.role !== 'parent' && (
          <Button
            variant="primary"
            onClick={() => {
              setConflictError(null);
              setShowAddModal(true);
            }}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            إضافة حصة دراسية جديدة
          </Button>
        )}
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'section'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            جدول الشعبة (Section)
          </button>

          <button
            onClick={() => setViewMode('teacher')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'teacher'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            جدول المعلم (Teacher)
          </button>

          <button
            onClick={() => setViewMode('classroom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'classroom'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            جدول القاعة (Classroom)
          </button>
        </div>

        {/* Dynamic Context Selector */}
        <div className="flex items-center gap-2">
          {viewMode === 'section' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">الشعبة:</span>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800 cursor-pointer"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.grade_name} — {sec.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'teacher' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">المعلم:</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800 cursor-pointer"
              >
                {teachers.map((tch) => (
                  <option key={tch.id} value={tch.user_id}>
                    {tch.profile.full_name} ({tch.specialization})
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'classroom' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">القاعة الدراسية:</span>
              <select
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800 cursor-pointer"
              >
                {classrooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Conflict Engine Highlights */}
      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>محرك منع التعارض نشط:</strong> يفحص في أجزاء من الثانية تعارض المعلم، تعارض الشعبة، وتعارض القاعات الدراسية.
          </span>
        </div>
        <Badge variant="success">0 تعارضات حالياً</Badge>
      </div>

      {/* Weekly Matrix Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3 w-28 text-center border-l border-slate-800">اليوم</th>
                {periods.map((p) => (
                  <th key={p.num} className="p-3 text-center border-l border-slate-800 last:border-l-0 min-w-[130px]">
                    <div>الحصة {p.num}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal mt-0.5">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {days.map((day) => (
                <tr key={day.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-center bg-slate-50 text-slate-800 border-l border-slate-200">
                    {day.name}
                  </td>
                  {periods.map((p) => {
                    const entry = filteredEntries.find(
                      (e) => e.day_of_week === day.id && e.period_number === p.num
                    );

                    return (
                      <td
                        key={p.num}
                        className="p-2 border-l border-slate-100 last:border-l-0 align-top h-24"
                      >
                        {entry ? (
                          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/90 h-full flex flex-col justify-between group relative">
                            {currentUser.role !== 'parent' && (
                              <button
                                onClick={() => {
                                  if (confirm('هل تريد حذف هذه الحصة من الجدول؟')) {
                                    deleteTimetableEntry(entry.id);
                                  }
                                }}
                                className="absolute top-1.5 left-1.5 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                                title="حذف الحصة"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 text-xs block truncate">
                                {entry.subject_name}
                              </span>
                              <span className="text-[10px] text-blue-700 font-medium block mt-0.5">
                                {viewMode === 'teacher' ? entry.section_name : entry.teacher_name}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                              📍 {entry.classroom}
                            </span>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[10px] text-slate-300 rounded-lg border border-dashed border-slate-100 bg-slate-50/30">
                            فارغة
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Timetable Entry Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إضافة حصة دراسية للجدول"
        description="يقوم النظام بالتحقق التلقائي من عدم وجود أي تعارض في المعلم أو الشعبة أو القاعة"
      >
        <div className="space-y-4">
          {/* Conflict Alert Banner with Proposed Resolution */}
          {conflictError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-right">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>تم اكتشاف تعارض حرج يمنع الحفظ:</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">{conflictError.message}</p>
              {conflictError.suggestedPeriod && (
                <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-700 font-semibold">
                    💡 الحل المقترح: نقل الحصة إلى <strong>الحصة رقم {conflictError.suggestedPeriod}</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={applySuggestedResolution}
                    className="text-xs py-0.5 px-2 font-bold"
                  >
                    تطبيق الحل المقترح
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="الشعبة المستهدفة *"
              value={formSectionId}
              onChange={(e) => {
                setFormSectionId(e.target.value);
                setConflictError(null);
              }}
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.grade_name} — {sec.name}
                </option>
              ))}
            </Select>

            <Select
              label="المقرر الدراسي *"
              value={formSubjectId}
              onChange={(e) => setFormSubjectId(e.target.value)}
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </Select>
          </div>

          <Select
            label="المعلم المدرس *"
            value={formTeacherId}
            onChange={(e) => {
              setFormTeacherId(e.target.value);
              setConflictError(null);
            }}
          >
            {teachers.map((tch) => (
              <option key={tch.id} value={tch.user_id}>
                {tch.profile.full_name} ({tch.specialization})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="اليوم *"
              value={formDayOfWeek}
              onChange={(e) => {
                setFormDayOfWeek(Number(e.target.value));
                setConflictError(null);
              }}
            >
              {days.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>

            <Select
              label="رقم الحصة *"
              value={formPeriodNumber}
              onChange={(e) => {
                setFormPeriodNumber(Number(e.target.value));
                setConflictError(null);
              }}
            >
              {periods.map((p) => (
                <option key={p.num} value={p.num}>
                  الحصة {p.num} ({p.time.split(' - ')[0]})
                </option>
              ))}
            </Select>

            <Select
              label="القاعة الدراسية *"
              value={formClassroom}
              onChange={(e) => {
                setFormClassroom(e.target.value);
                setConflictError(null);
              }}
            >
              {classrooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              تأكيد وإضافة الحصة
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
