import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  School,
  Branch,
  UserProfile,
  UserRole,
  Student,
  Teacher,
  Parent,
  AcademicYear,
  Grade,
  Section,
  Subject,
  StudentAttendanceRecord,
  HomeworkAssignment,
  AdministrativeRequest,
  Announcement,
  BehaviorRecord,
  TimetableEntry,
  Exam,
  StudentGrade,
} from '../types/database.types';

// Pre-seeded multi-branch enterprise school data
const INITIAL_SCHOOL: School = {
  id: 'sch-001',
  name: 'مدارس الرواد الأهلية الدولية',
  code: 'ALROWAD-KSA',
  phone: '0114567890',
  email: 'info@alrowad.edu.sa',
  address: 'المملكة العربية السعودية، الرياض',
  created_at: '2020-01-01',
  updated_at: '2026-09-01',
};

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-01',
    school_id: 'sch-001',
    name: 'فرع الرياض - حي السليمانية (الرئيسي)',
    code: 'RUH-SUL',
    city: 'الرياض',
    phone: '0112345671',
    email: 'sul@alrowad.edu.sa',
    address: 'شارع الضباب، السليمانية',
    is_active: true,
    students_count: 850,
    teachers_count: 54,
    created_at: '2020-01-10',
    updated_at: '2026-09-01',
  },
  {
    id: 'br-02',
    school_id: 'sch-001',
    name: 'فرع الرياض - حي النرجس (بنين وبنات)',
    code: 'RUH-NAR',
    city: 'الرياض',
    phone: '0112345672',
    email: 'nar@alrowad.edu.sa',
    address: 'طريق أبي بكر الصديق، النرجس',
    is_active: true,
    students_count: 620,
    teachers_count: 42,
    created_at: '2022-06-15',
    updated_at: '2026-09-01',
  },
  {
    id: 'br-03',
    school_id: 'sch-001',
    name: 'فرع جدة - حي الحمراء (الدولي)',
    code: 'JED-HAM',
    city: 'جدة',
    phone: '0122345673',
    email: 'jed@alrowad.edu.sa',
    address: 'طريق الكورنيش، الحمراء',
    is_active: true,
    students_count: 510,
    teachers_count: 38,
    created_at: '2023-08-01',
    updated_at: '2026-09-01',
  },
];

// Pre-configured role accounts for fast testing & evaluation
export const MOCK_USERS: Record<UserRole, UserProfile> = {
  super_admin: {
    id: 'usr-super',
    school_id: 'sch-001',
    role: 'super_admin',
    full_name: 'د. عبد العزيز بن سلطان آل سعود',
    email: 'superadmin@alrowad.edu.sa',
    phone: '0501112233',
    assigned_branches: ['br-01', 'br-02', 'br-03'],
    is_active: true,
    created_at: '2020-01-01',
  },
  admin: {
    id: 'usr-admin-ruh',
    school_id: 'sch-001',
    role: 'admin',
    full_name: 'أ. فهد بن ناصر التميمي (مدير فرع السليمانية)',
    email: 'admin.sul@alrowad.edu.sa',
    phone: '0504445566',
    assigned_branches: ['br-01'],
    is_active: true,
    created_at: '2021-03-01',
  },
  teacher: {
    id: 'usr-teacher-ahmed',
    school_id: 'sch-001',
    role: 'teacher',
    full_name: 'أ. أحمد منصور الهاشمي (معلم الرياضيات)',
    email: 'ahmed.mansour@alrowad.edu.sa',
    phone: '0507778899',
    assigned_branches: ['br-01'],
    is_active: true,
    created_at: '2022-09-01',
  },
  parent: {
    id: 'usr-parent-khaled',
    school_id: 'sch-001',
    role: 'parent',
    full_name: 'م. خالد بن إبراهيم السعيد (ولي أمر)',
    email: 'khaled.saeed@gmail.com',
    phone: '0559998877',
    assigned_branches: ['br-01'],
    is_active: true,
    created_at: '2023-01-15',
  },
};

const INITIAL_GRADES: Grade[] = [
  { id: 'grd-01', branch_id: 'br-01', name: 'الصف الأول الثانوي', stage: 'secondary', order_index: 10 },
  { id: 'grd-02', branch_id: 'br-01', name: 'الصف الثاني الثانوي', stage: 'secondary', order_index: 11 },
  { id: 'grd-03', branch_id: 'br-01', name: 'الصف الثالث المتوسط', stage: 'middle', order_index: 9 },
  { id: 'grd-04', branch_id: 'br-01', name: 'الصف السادس الابتدائي', stage: 'primary', order_index: 6 },
];

const INITIAL_SECTIONS: Section[] = [
  { id: 'sec-01', grade_id: 'grd-01', academic_year_id: 'ay-2026', name: 'شعبة أ (علوم طبيعية)', capacity: 28, grade_name: 'الصف الأول الثانوي' },
  { id: 'sec-02', grade_id: 'grd-01', academic_year_id: 'ay-2026', name: 'شعبة ب (عام)', capacity: 28, grade_name: 'الصف الأول الثانوي' },
  { id: 'sec-03', grade_id: 'grd-03', academic_year_id: 'ay-2026', name: 'شعبة أ', capacity: 26, grade_name: 'الصف الثالث المتوسط' },
];

const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-01', branch_id: 'br-01', grade_id: 'grd-01', name: 'الرياضيات المتقدمة 1', code: 'MATH-101', credit_hours: 4, pass_mark: 50, total_mark: 100 },
  { id: 'sub-02', branch_id: 'br-01', grade_id: 'grd-01', name: 'الفيزياء العامة', code: 'PHYS-101', credit_hours: 3, pass_mark: 50, total_mark: 100 },
  { id: 'sub-03', branch_id: 'br-01', grade_id: 'grd-01', name: 'اللغة الإنجليزية التخصصية', code: 'ENG-101', credit_hours: 3, pass_mark: 50, total_mark: 100 },
  { id: 'sub-04', branch_id: 'br-01', grade_id: 'grd-03', name: 'الرياضيات المتوسطة', code: 'MATH-03', credit_hours: 4, pass_mark: 50, total_mark: 100 },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-01',
    branch_id: 'br-01',
    section_id: 'sec-01',
    national_id: '1098765432',
    first_name: 'فيصل',
    father_name: 'خالد',
    grandfather_name: 'إبراهيم',
    family_name: 'السعيد',
    full_name: 'فيصل خالد إبراهيم السعيد',
    gender: 'male',
    date_of_birth: '2010-04-12',
    blood_type: 'O+',
    enrollment_date: '2023-09-01',
    status: 'active',
    parent_id: 'usr-parent-khaled',
    grade_name: 'الصف الأول الثانوي',
    section_name: 'شعبة أ (علوم طبيعية)',
    branch_name: 'فرع الرياض - حي السليمانية',
    address: 'الرياض - حي الملز',
  },
  {
    id: 'std-02',
    branch_id: 'br-01',
    section_id: 'sec-03',
    national_id: '1122334455',
    first_name: 'سارة',
    father_name: 'خالد',
    grandfather_name: 'إبراهيم',
    family_name: 'السعيد',
    full_name: 'سارة خالد إبراهيم السعيد',
    gender: 'female',
    date_of_birth: '2012-08-20',
    blood_type: 'A+',
    enrollment_date: '2024-09-01',
    status: 'active',
    parent_id: 'usr-parent-khaled',
    grade_name: 'الصف الثالث المتوسط',
    section_name: 'شعبة أ',
    branch_name: 'فرع الرياض - حي السليمانية',
    address: 'الرياض - حي الملز',
  },
  {
    id: 'std-03',
    branch_id: 'br-01',
    section_id: 'sec-01',
    national_id: '1088776655',
    first_name: 'عبدالله',
    father_name: 'سعود',
    grandfather_name: 'محمد',
    family_name: 'العتيبي',
    full_name: 'عبدالله سعود محمد العتيبي',
    gender: 'male',
    date_of_birth: '2010-02-15',
    blood_type: 'B+',
    enrollment_date: '2023-09-01',
    status: 'active',
    grade_name: 'الصف الأول الثانوي',
    section_name: 'شعبة أ (علوم طبيعية)',
    branch_name: 'فرع الرياض - حي السليمانية',
  },
  {
    id: 'std-04',
    branch_id: 'br-01',
    section_id: 'sec-01',
    national_id: '1077665544',
    first_name: 'ريان',
    father_name: 'ماجد',
    grandfather_name: 'سليمان',
    family_name: 'الغامدي',
    full_name: 'ريان ماجد سليمان الغامدي',
    gender: 'male',
    date_of_birth: '2010-07-08',
    blood_type: 'AB+',
    enrollment_date: '2023-09-01',
    status: 'active',
    grade_name: 'الصف الأول الثانوي',
    section_name: 'شعبة أ (علوم طبيعية)',
    branch_name: 'فرع الرياض - حي السليمانية',
  },
  {
    id: 'std-05',
    branch_id: 'br-02',
    section_id: 'sec-01',
    national_id: '1066554433',
    first_name: 'يوسف',
    father_name: 'طارق',
    grandfather_name: 'علي',
    family_name: 'الشهري',
    full_name: 'يوسف طارق علي الشهري',
    gender: 'male',
    date_of_birth: '2010-11-22',
    blood_type: 'O-',
    enrollment_date: '2024-09-01',
    status: 'active',
    grade_name: 'الصف الأول الثانوي',
    section_name: 'شعبة أ',
    branch_name: 'فرع الرياض - حي النرجس',
  },
];

const INITIAL_ATTENDANCE: StudentAttendanceRecord[] = [
  { id: 'att-01', student_id: 'std-01', section_id: 'sec-01', date: '2026-09-29', status: 'present', recorded_by: 'usr-teacher-ahmed' },
  { id: 'att-02', student_id: 'std-02', section_id: 'sec-03', date: '2026-09-29', status: 'present', recorded_by: 'usr-teacher-ahmed' },
  { id: 'att-03', student_id: 'std-03', section_id: 'sec-01', date: '2026-09-29', status: 'late', minutes_late: 15, notes: 'ازدحام مروري', recorded_by: 'usr-teacher-ahmed' },
  { id: 'att-04', student_id: 'std-04', section_id: 'sec-01', date: '2026-09-29', status: 'excused_absence', notes: 'عذر طبي مسجل', recorded_by: 'usr-teacher-ahmed' },
  { id: 'att-05', student_id: 'std-01', section_id: 'sec-01', date: '2026-09-28', status: 'present', recorded_by: 'usr-teacher-ahmed' },
  { id: 'att-06', student_id: 'std-01', section_id: 'sec-01', date: '2026-09-27', status: 'present', recorded_by: 'usr-teacher-ahmed' },
];

const INITIAL_ASSIGNMENTS: HomeworkAssignment[] = [
  {
    id: 'hw-01',
    section_id: 'sec-01',
    subject_id: 'sub-01',
    teacher_id: 'usr-teacher-ahmed',
    title: 'حل تمارين الدوال المثلثية (ص 45 - 47)',
    description: 'المطلوب حل المسائل من 1 إلى 12 وكتابة خطوات التحويل الهندسي بالكامل.',
    due_date: '2026-10-02',
    attachment_urls: [],
    status: 'active',
    subject_name: 'الرياضيات المتقدمة 1',
    section_name: 'شعبة أ (علوم طبيعية)',
  },
  {
    id: 'hw-02',
    section_id: 'sec-01',
    subject_id: 'sub-02',
    teacher_id: 'usr-teacher-ahmed',
    title: 'تقرير تجربة السقوط الحر في المعمل',
    description: 'تسجيل قراءات التسارع ومقارنتها بالقيمة النظرية وتقديم جدول البيانات.',
    due_date: '2026-10-05',
    attachment_urls: [],
    status: 'active',
    subject_name: 'الفيزياء العامة',
    section_name: 'شعبة أ (علوم طبيعية)',
  },
];

const INITIAL_REQUESTS: AdministrativeRequest[] = [
  {
    id: 'req-01',
    branch_id: 'br-01',
    parent_id: 'usr-parent-khaled',
    student_id: 'std-01',
    student_name: 'فيصل خالد إبراهيم السعيد',
    parent_name: 'م. خالد بن إبراهيم السعيد',
    type: 'certificate_request',
    type_label: 'طلب شهادة تعريف طالب باللغة الإنجليزية',
    description: 'نرجو التكرم بإصدار مشهد قيد دراسي مصدق موجه للسفارة البريطانية.',
    status: 'completed',
    admin_response: 'تم إصدار الشهادة واعتمادها رقمياً وهي جاهزة للتنزيل أو الاستلام.',
    created_at: '2026-09-25',
    updated_at: '2026-09-26',
  },
  {
    id: 'req-02',
    branch_id: 'br-01',
    parent_id: 'usr-parent-khaled',
    student_id: 'std-02',
    student_name: 'سارة خالد إبراهيم السعيد',
    parent_name: 'م. خالد بن إبراهيم السعيد',
    type: 'general_inquiry',
    type_label: 'طلب مشاركة في الأولمبياد الوطني للعلوم',
    description: 'أرغب في تسجيل الطالبة سارة في برنامج التدريب للأولمبياد العلمي للناشئين.',
    status: 'in_progress',
    admin_response: 'تم تحويل الطلب إلى منسق الموهوبين أ. فهد وسيتم التواصل خلال 48 ساعة.',
    created_at: '2026-09-28',
    updated_at: '2026-09-29',
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    branch_id: 'br-01',
    target_audience: 'all',
    title: 'انطلاق اللقاء التعريفي الأول لأولياء الأمور للفصل الدراسي الأول',
    content: 'يسر إدارة مدارس الرواد دعوة أولياء الأمور الكرام لحضور اللقاء التوجيهي يوم الخميس القادم الساعة 5:30 مساءً في المسرح الرئيسي.',
    published_at: '2026-09-27',
    created_by_name: 'إدارة فرع السليمانية',
  },
  {
    id: 'ann-02',
    branch_id: 'br-01',
    target_audience: 'parents',
    title: 'تفعيل منصة الاختبارات المعيارية والتقييم الدوري',
    content: 'نود إحاطة أولياء الأمور الكرام بأنه تم اعتماد خطة التقييم المستمر لمكونات العلامات وستظهر النتائج فور مراجعتها.',
    published_at: '2026-09-28',
    created_by_name: 'قسم الشؤون التعليمية',
  },
];

const INITIAL_BEHAVIOR: BehaviorRecord[] = [
  {
    id: 'beh-01',
    student_id: 'std-01',
    type: 'positive',
    title: 'تميز وإتقان في قيادة الفريق الطلابي للمناظرة العلمية',
    description: 'أظهر الطالب مهارات تواصل وبحث استثنائية ونال المركز الأول على مستوى الصف.',
    action_taken: 'منح شهادة شكر ونقاط تفوق سلوكي في السجل الفصلي.',
    is_visible_to_parent: true,
    recorded_by: 'usr-teacher-ahmed',
    incident_date: '2026-09-24',
  },
  {
    id: 'beh-02',
    student_id: 'std-02',
    type: 'positive',
    title: 'مبادرة تنظيم ركن القراءة الصباحية',
    description: 'قامت الطالبة سارة بتنظيم المكتبة الصفية وتشجيع زميلاتها.',
    action_taken: 'تكريم في الطابور الصباحي.',
    is_visible_to_parent: true,
    recorded_by: 'usr-teacher-ahmed',
    incident_date: '2026-09-26',
  },
];

const INITIAL_TIMETABLE: TimetableEntry[] = [
  { id: 'tt-01', section_id: 'sec-01', subject_id: 'sub-01', teacher_id: 'usr-teacher-ahmed', day_of_week: 0, period_number: 1, start_time: '07:30', end_time: '08:15', classroom: 'قاعة 101', subject_name: 'الرياضيات المتقدمة 1', teacher_name: 'أ. أحمد منصور', section_name: 'شعبة أ' },
  { id: 'tt-02', section_id: 'sec-01', subject_id: 'sub-02', teacher_id: 'usr-teacher-ahmed', day_of_week: 0, period_number: 2, start_time: '08:20', end_time: '09:05', classroom: 'معمل الفيزياء 1', subject_name: 'الفيزياء العامة', teacher_name: 'أ. عادل النجار', section_name: 'شعبة أ' },
  { id: 'tt-03', section_id: 'sec-01', subject_id: 'sub-03', teacher_id: 'usr-teacher-ahmed', day_of_week: 0, period_number: 3, start_time: '09:20', end_time: '10:05', classroom: 'قاعة 101', subject_name: 'اللغة الإنجليزية', teacher_name: 'أ. حسام فؤاد', section_name: 'شعبة أ' },
  { id: 'tt-04', section_id: 'sec-03', subject_id: 'sub-04', teacher_id: 'usr-teacher-ahmed', day_of_week: 0, period_number: 4, start_time: '10:10', end_time: '10:55', classroom: 'قاعة 204', subject_name: 'الرياضيات المتوسطة', teacher_name: 'أ. أحمد منصور', section_name: 'شعبة أ (متوسط)' },
];

const INITIAL_EXAMS: Exam[] = [
  {
    id: 'ex-01',
    subject_id: 'sub-01',
    section_id: 'sec-01',
    academic_term_id: 'term-1',
    title: 'اختبار الرياضيات النصفي - الجبر والدوال',
    exam_date: '2026-10-15',
    start_time: '08:00',
    end_time: '09:30',
    total_marks: 30,
    description: 'يشمل الوحدتين الأولى والثانية والأسئلة التطبيقية المتطورة.',
    is_published: true,
    created_by: 'usr-teacher-ahmed',
    subject_name: 'الرياضيات المتقدمة 1',
    section_name: 'شعبة أ (علوم طبيعية)',
  },
  {
    id: 'ex-02',
    subject_id: 'sub-02',
    section_id: 'sec-01',
    academic_term_id: 'term-1',
    title: 'اختبار الفيزياء العملي الأول',
    exam_date: '2026-10-20',
    start_time: '09:45',
    end_time: '11:00',
    total_marks: 20,
    description: 'تطبيق تجربة القياسات الدقيقة والمقذوفات.',
    is_published: false,
    created_by: 'usr-teacher-ahmed',
    subject_name: 'الفيزياء العامة',
    section_name: 'شعبة أ (علوم طبيعية)',
  },
];

interface SchoolContextType {
  school: School;
  branches: Branch[];
  currentBranch: Branch;
  currentUser: UserProfile;
  activeChild: Student | null;
  parentChildren: Student[];
  grades: Grade[];
  sections: Section[];
  subjects: Subject[];
  students: Student[];
  attendance: StudentAttendanceRecord[];
  assignments: HomeworkAssignment[];
  requests: AdministrativeRequest[];
  announcements: Announcement[];
  behaviorRecords: BehaviorRecord[];
  timetable: TimetableEntry[];
  exams: Exam[];
  switchBranch: (branchId: string) => void;
  switchUserRole: (role: UserRole) => void;
  switchActiveChild: (studentId: string) => void;
  hasPermission: (permissionCode: string) => boolean;
  addStudent: (student: Partial<Student>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  markAttendance: (studentId: string, status: StudentAttendanceRecord['status'], notes?: string) => void;
  markAllSectionPresent: (sectionId: string, date: string) => void;
  submitRequest: (type: AdministrativeRequest['type'], description: string, studentId: string) => void;
  updateRequestStatus: (requestId: string, status: AdministrativeRequest['status'], response: string) => void;
  addAnnouncement: (announcement: Partial<Announcement>) => void;
  addBehaviorRecord: (record: Partial<BehaviorRecord>) => void;
}

const SchoolContext = createContext<SchoolContextType | null>(null);

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [school] = useState<School>(INITIAL_SCHOOL);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentBranchId, setCurrentBranchId] = useState<string>('br-01');
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.super_admin);
  const [activeChildId, setActiveChildId] = useState<string>('std-01');

  // School Entities
  const [grades, setGrades] = useState<Grade[]>(INITIAL_GRADES);
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [attendance, setAttendance] = useState<StudentAttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>(INITIAL_ASSIGNMENTS);
  const [requests, setRequests] = useState<AdministrativeRequest[]>(INITIAL_REQUESTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [behaviorRecords, setBehaviorRecords] = useState<BehaviorRecord[]>(INITIAL_BEHAVIOR);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(INITIAL_TIMETABLE);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);

  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];

  // For parent account: find assigned children
  const parentChildren = students.filter((s) => s.parent_id === currentUser.id);
  const activeChild = parentChildren.find((c) => c.id === activeChildId) || parentChildren[0] || null;

  const switchBranch = (branchId: string) => {
    // Only super_admin or user with access to this branch can switch
    if (currentUser.role === 'super_admin' || currentUser.assigned_branches.includes(branchId)) {
      setCurrentBranchId(branchId);
    }
  };

  const switchUserRole = (role: UserRole) => {
    const targetUser = MOCK_USERS[role];
    setCurrentUser(targetUser);
    if (!targetUser.assigned_branches.includes(currentBranchId) && role !== 'super_admin') {
      setCurrentBranchId(targetUser.assigned_branches[0]);
    }
  };

  const switchActiveChild = (studentId: string) => {
    setActiveChildId(studentId);
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'admin') {
      return !permissionCode.startsWith('system.') && !permissionCode.startsWith('schools.');
    }
    if (currentUser.role === 'teacher') {
      return ['classes.view', 'attendance.mark', 'grades.enter', 'homework.create', 'behavior.record'].includes(
        permissionCode
      );
    }
    if (currentUser.role === 'parent') {
      return ['children.view', 'attendance.view', 'grades.view', 'requests.create', 'homework.view'].includes(
        permissionCode
      );
    }
    return false;
  };

  const addStudent = (studentData: Partial<Student>) => {
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      branch_id: studentData.branch_id || currentBranchId,
      section_id: studentData.section_id || 'sec-01',
      national_id: studentData.national_id || `${Date.now()}`.slice(0, 10),
      first_name: studentData.first_name || '',
      father_name: studentData.father_name || '',
      grandfather_name: studentData.grandfather_name || '',
      family_name: studentData.family_name || '',
      full_name: `${studentData.first_name} ${studentData.father_name} ${studentData.family_name}`,
      gender: studentData.gender || 'male',
      date_of_birth: studentData.date_of_birth || '2011-01-01',
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'active',
      grade_name: studentData.grade_name || 'الصف الأول الثانوي',
      section_name: studentData.section_name || 'شعبة أ',
      branch_name: currentBranch.name,
      ...studentData,
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const markAttendance = (studentId: string, status: StudentAttendanceRecord['status'], notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.student_id === studentId && a.date === today);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], status, notes, recorded_by: currentUser.id };
        return copy;
      }
      return [
        {
          id: `att-${Date.now()}`,
          student_id: studentId,
          section_id: 'sec-01',
          date: today,
          status,
          notes,
          recorded_by: currentUser.id,
        },
        ...prev,
      ];
    });
  };

  const markAllSectionPresent = (sectionId: string, date: string) => {
    const sectionStudents = students.filter((s) => s.section_id === sectionId);
    setAttendance((prev) => {
      const otherRecords = prev.filter((a) => !(a.section_id === sectionId && a.date === date));
      const newRecords: StudentAttendanceRecord[] = sectionStudents.map((s) => ({
        id: `att-${s.id}-${date}`,
        student_id: s.id,
        section_id: sectionId,
        date: date,
        status: 'present',
        recorded_by: currentUser.id,
      }));
      return [...newRecords, ...otherRecords];
    });
  };

  const submitRequest = (type: AdministrativeRequest['type'], description: string, studentId: string) => {
    const st = students.find((s) => s.id === studentId);
    const typeLabels: Record<string, string> = {
      document_request: 'طلب وثيقة دراسية',
      transfer_request: 'طلب نقل مدرسي',
      certificate_request: 'طلب شهادة تعريف رسمية',
      general_inquiry: 'طلب أو استفسار إداري',
    };

    const newReq: AdministrativeRequest = {
      id: `req-${Date.now()}`,
      branch_id: currentBranchId,
      parent_id: currentUser.id,
      student_id: studentId,
      student_name: st?.full_name || 'الطالب',
      parent_name: currentUser.full_name,
      type,
      type_label: typeLabels[type] || 'طلب عام',
      description,
      status: 'pending',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    };
    setRequests((prev) => [newReq, ...prev]);
  };

  const updateRequestStatus = (requestId: string, status: AdministrativeRequest['status'], response: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              admin_response: response,
              updated_at: new Date().toISOString().split('T')[0],
            }
          : r
      )
    );
  };

  const addAnnouncement = (data: Partial<Announcement>) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      branch_id: currentBranchId,
      target_audience: data.target_audience || 'all',
      title: data.title || '',
      content: data.content || '',
      published_at: new Date().toISOString().split('T')[0],
      created_by_name: currentUser.full_name,
      ...data,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const addBehaviorRecord = (data: Partial<BehaviorRecord>) => {
    const newRecord: BehaviorRecord = {
      id: `beh-${Date.now()}`,
      student_id: data.student_id || '',
      type: data.type || 'positive',
      title: data.title || '',
      description: data.description || '',
      action_taken: data.action_taken || '',
      is_visible_to_parent: data.is_visible_to_parent !== false,
      recorded_by: currentUser.id,
      incident_date: data.incident_date || new Date().toISOString().split('T')[0],
      ...data,
    };
    setBehaviorRecords((prev) => [newRecord, ...prev]);
  };

  return (
    <SchoolContext.Provider
      value={{
        school,
        branches,
        currentBranch,
        currentUser,
        activeChild,
        parentChildren,
        grades,
        sections,
        subjects,
        students,
        attendance,
        assignments,
        requests,
        announcements,
        behaviorRecords,
        timetable,
        exams,
        switchBranch,
        switchUserRole,
        switchActiveChild,
        hasPermission,
        addStudent,
        updateStudent,
        markAttendance,
        markAllSectionPresent,
        submitRequest,
        updateRequestStatus,
        addAnnouncement,
        addBehaviorRecord,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
