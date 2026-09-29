import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  School,
  Branch,
  UserProfile,
  UserRole,
  Student,
  Teacher,
  Parent,
  ParentStudentLink,
  StudentStatus,
  AcademicYear,
  AcademicTerm,
  Grade,
  Section,
  Subject,
  StudentAttendanceRecord,
  TeacherAttendanceRecord,
  AttendanceStatus,
  HomeworkAssignment,
  HomeworkSubmission,
  AdministrativeRequest,
  Announcement,
  BehaviorRecord,
  TimetableEntry,
  Exam,
  ExamResult,
  GradingComponent,
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

const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'ay-2026',
    branch_id: 'br-01',
    name: '2026/2027',
    start_date: '2026-09-01',
    end_date: '2027-06-25',
    is_current: true,
  },
  {
    id: 'ay-2025',
    branch_id: 'br-01',
    name: '2025/2026',
    start_date: '2025-09-01',
    end_date: '2026-06-20',
    is_current: false,
  },
];

const INITIAL_ACADEMIC_TERMS: AcademicTerm[] = [
  {
    id: 'term-1',
    academic_year_id: 'ay-2026',
    name: 'الفصل الدراسي الأول',
    start_date: '2026-09-01',
    end_date: '2026-12-15',
    is_current: true,
  },
  {
    id: 'term-2',
    academic_year_id: 'ay-2026',
    name: 'الفصل الدراسي الثاني',
    start_date: '2027-01-10',
    end_date: '2027-04-02',
    is_current: false,
  },
  {
    id: 'term-3',
    academic_year_id: 'ay-2026',
    name: 'الفصل الدراسي الثالث',
    start_date: '2027-04-18',
    end_date: '2027-06-25',
    is_current: false,
  },
];

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

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-01',
    user_id: 'usr-teacher-ahmed',
    branch_id: 'br-01',
    specialization: 'الرياضيات والحساب المتقدم',
    hire_date: '2022-09-01',
    status: 'active',
    profile: {
      id: 'usr-teacher-ahmed',
      school_id: 'sch-001',
      role: 'teacher',
      full_name: 'أ. أحمد منصور الهاشمي',
      email: 'ahmed.mansour@alrowad.edu.sa',
      phone: '0507778899',
      national_id: '1022334411',
      assigned_branches: ['br-01'],
      is_active: true,
      created_at: '2022-09-01',
    },
    assigned_sections: [
      {
        section_id: 'sec-01',
        section_name: 'شعبة أ (علوم طبيعية)',
        grade_name: 'الصف الأول الثانوي',
        subject_id: 'sub-01',
        subject_name: 'الرياضيات المتقدمة 1',
      },
      {
        section_id: 'sec-03',
        section_name: 'شعبة أ',
        grade_name: 'الصف الثالث المتوسط',
        subject_id: 'sub-04',
        subject_name: 'الرياضيات المتوسطة',
      },
    ],
  },
  {
    id: 'tch-02',
    user_id: 'usr-teacher-adel',
    branch_id: 'br-01',
    specialization: 'الفيزياء والعلوم التجريبية',
    hire_date: '2021-08-15',
    status: 'active',
    profile: {
      id: 'usr-teacher-adel',
      school_id: 'sch-001',
      role: 'teacher',
      full_name: 'أ. عادل النجار',
      email: 'adel.najjar@alrowad.edu.sa',
      phone: '0506665544',
      national_id: '1033445522',
      assigned_branches: ['br-01'],
      is_active: true,
      created_at: '2021-08-15',
    },
    assigned_sections: [
      {
        section_id: 'sec-01',
        section_name: 'شعبة أ (علوم طبيعية)',
        grade_name: 'الصف الأول الثانوي',
        subject_id: 'sub-02',
        subject_name: 'الفيزياء العامة',
      },
    ],
  },
  {
    id: 'tch-03',
    user_id: 'usr-teacher-hossam',
    branch_id: 'br-01',
    specialization: 'اللغة الإنجليزية واللغويات',
    hire_date: '2023-01-10',
    status: 'active',
    profile: {
      id: 'usr-teacher-hossam',
      school_id: 'sch-001',
      role: 'teacher',
      full_name: 'أ. حسام فؤاد الزهراني',
      email: 'hossam.zahrani@alrowad.edu.sa',
      phone: '0508889900',
      national_id: '1044556633',
      assigned_branches: ['br-01'],
      is_active: true,
      created_at: '2023-01-10',
    },
    assigned_sections: [
      {
        section_id: 'sec-01',
        section_name: 'شعبة أ (علوم طبيعية)',
        grade_name: 'الصف الأول الثانوي',
        subject_id: 'sub-03',
        subject_name: 'اللغة الإنجليزية التخصصية',
      },
    ],
  },
];

const INITIAL_PARENTS: Parent[] = [
  {
    id: 'pr-01',
    user_id: 'usr-parent-khaled',
    relationship_type: 'father',
    workplace: 'الهيئة الملكية للجبيل وينبع - مهندس استشاري',
    emergency_phone: '0559998877',
    profile: {
      id: 'usr-parent-khaled',
      school_id: 'sch-001',
      role: 'parent',
      full_name: 'م. خالد بن إبراهيم السعيد',
      email: 'khaled.saeed@gmail.com',
      phone: '0559998877',
      national_id: '1011223344',
      assigned_branches: ['br-01'],
      is_active: true,
      created_at: '2023-01-15',
    },
    children: [],
  },
  {
    id: 'pr-02',
    user_id: 'usr-parent-saud',
    relationship_type: 'father',
    workplace: 'شركة أرامكو السعودية - مدير مشاريع',
    emergency_phone: '0503332211',
    profile: {
      id: 'usr-parent-saud',
      school_id: 'sch-001',
      role: 'parent',
      full_name: 'أ. سعود بن محمد العتيبي',
      email: 'saud.otb@gmail.com',
      phone: '0503332211',
      national_id: '1022446688',
      assigned_branches: ['br-01'],
      is_active: true,
      created_at: '2023-08-20',
    },
    children: [],
  },
  {
    id: 'pr-03',
    user_id: 'usr-parent-noura',
    relationship_type: 'mother',
    workplace: 'وزارة التعليم - مشرفة تربوية معتمدة',
    emergency_phone: '0567778899',
    profile: {
      id: 'usr-parent-noura',
      school_id: 'sch-001',
      role: 'parent',
      full_name: 'د. نورة بنت فهد السديري',
      email: 'noura.sudairi@gmail.com',
      phone: '0567778899',
      national_id: '1033557799',
      assigned_branches: ['br-01'],
      is_active: true,
      created_at: '2023-09-01',
    },
    children: [],
  },
];

const INITIAL_PARENT_STUDENT_LINKS: ParentStudentLink[] = [
  {
    id: 'ps-01',
    parent_id: 'pr-01',
    student_id: 'std-01',
    is_primary_contact: true,
    relationship_type: 'father',
    parent_name: 'م. خالد بن إبراهيم السعيد',
    student_name: 'فيصل خالد إبراهيم السعيد',
    phone: '0559998877',
  },
  {
    id: 'ps-02',
    parent_id: 'pr-01',
    student_id: 'std-02',
    is_primary_contact: true,
    relationship_type: 'father',
    parent_name: 'م. خالد بن إبراهيم السعيد',
    student_name: 'سارة خالد إبراهيم السعيد',
    phone: '0559998877',
  },
  {
    id: 'ps-03',
    parent_id: 'pr-03',
    student_id: 'std-01',
    is_primary_contact: false,
    relationship_type: 'mother',
    parent_name: 'د. نورة بنت فهد السديري',
    student_name: 'فيصل خالد إبراهيم السعيد',
    phone: '0567778899',
  },
  {
    id: 'ps-04',
    parent_id: 'pr-02',
    student_id: 'std-03',
    is_primary_contact: true,
    relationship_type: 'father',
    parent_name: 'أ. سعود بن محمد العتيبي',
    student_name: 'عبدالله سعود محمد العتيبي',
    phone: '0503332211',
  },
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

const INITIAL_TEACHER_ATTENDANCE: TeacherAttendanceRecord[] = [
  { id: 'tatt-01', teacher_id: 'tch-01', date: '2026-09-29', status: 'present', check_in: '07:15', check_out: '14:30', notes: 'حضور مبكر' },
  { id: 'tatt-02', teacher_id: 'tch-02', date: '2026-09-29', status: 'late', check_in: '07:45', check_out: '14:30', notes: 'تأخير بعذر مقبول' },
  { id: 'tatt-03', teacher_id: 'tch-03', date: '2026-09-29', status: 'present', check_in: '07:20', check_out: '14:30', notes: 'حضور منتظم' },
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

const INITIAL_SUBMISSIONS: HomeworkSubmission[] = [
  {
    id: 'subm-01',
    assignment_id: 'hw-01',
    student_id: 'std-01',
    student_name: 'فيصل خالد إبراهيم السعيد',
    submitted_at: '2026-09-30 16:30',
    status: 'graded',
    grade: 10,
    max_grade: 10,
    feedback: 'حل نموذجي ومتقن لكافة الخطوات الرياضية، بارك الله فيك.',
    attachment_url: 'solution-std-01.pdf',
  },
  {
    id: 'subm-02',
    assignment_id: 'hw-01',
    student_id: 'std-03',
    student_name: 'عبدالله سعود محمد العتيبي',
    submitted_at: '2026-10-01 18:20',
    status: 'submitted',
    max_grade: 10,
    attachment_url: 'solution-std-03.pdf',
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

const INITIAL_GRADING_COMPONENTS: GradingComponent[] = [
  { id: 'gc-01', subject_id: 'sub-01', academic_term_id: 'term-1', name: 'المشاركة والتفاعل الصفي', weight: 15, max_score: 15 },
  { id: 'gc-02', subject_id: 'sub-01', academic_term_id: 'term-1', name: 'الواجبات والمهام المنزلية', weight: 15, max_score: 15 },
  { id: 'gc-03', subject_id: 'sub-01', academic_term_id: 'term-1', name: 'الاختبار النصفي الموحد', weight: 20, max_score: 20 },
  { id: 'gc-04', subject_id: 'sub-01', academic_term_id: 'term-1', name: 'التطبيقات العملية والمشروع', weight: 20, max_score: 20 },
  { id: 'gc-05', subject_id: 'sub-01', academic_term_id: 'term-1', name: 'الاختبار النهائي التحريري', weight: 30, max_score: 30 },
];

const INITIAL_EXAM_RESULTS: ExamResult[] = [
  { id: 'er-01', exam_id: 'ex-01', student_id: 'std-01', obtained_marks: 29, notes: 'أداء متميز واستثنائي' },
  { id: 'er-02', exam_id: 'ex-01', student_id: 'std-03', obtained_marks: 26, notes: 'إجابات جيدة جداً' },
  { id: 'er-03', exam_id: 'ex-01', student_id: 'std-04', obtained_marks: 28, notes: 'إتقان في المسائل الحسابية' },
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
  teachers: Teacher[];
  parents: Parent[];
  parentStudents: ParentStudentLink[];
  academicYears: AcademicYear[];
  academicTerms: AcademicTerm[];
  students: Student[];
  attendance: StudentAttendanceRecord[];
  teacherAttendance: TeacherAttendanceRecord[];
  assignments: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  requests: AdministrativeRequest[];
  announcements: Announcement[];
  behaviorRecords: BehaviorRecord[];
  timetable: TimetableEntry[];
  exams: Exam[];
  examResults: ExamResult[];
  gradingComponents: GradingComponent[];
  isTermGradesPublished: boolean;
  switchBranch: (branchId: string) => void;
  switchUserRole: (role: UserRole) => void;
  switchActiveChild: (studentId: string) => void;
  hasPermission: (permissionCode: string) => boolean;
  addStudent: (student: Partial<Student>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  updateStudentStatus: (studentId: string, status: StudentStatus) => void;
  markAttendance: (studentId: string, status: StudentAttendanceRecord['status'], notes?: string) => void;
  markAllSectionPresent: (sectionId: string, date: string) => void;
  markTeacherAttendance: (
    teacherId: string,
    date: string,
    status: TeacherAttendanceRecord['status'],
    checkIn?: string,
    checkOut?: string,
    notes?: string
  ) => void;
  markAllTeachersPresent: (date: string) => void;
  submitRequest: (
    type: AdministrativeRequest['type'],
    description: string,
    studentId: string,
    attachmentUrl?: string
  ) => void;
  updateRequestStatus: (requestId: string, status: AdministrativeRequest['status'], response: string) => void;
  addAnnouncement: (announcement: Partial<Announcement>) => void;
  addBehaviorRecord: (record: Partial<BehaviorRecord>) => void;
  addTeacher: (teacherData: Partial<Teacher>, profileData: Partial<UserProfile>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  assignTeacherToClass: (teacherId: string, sectionId: string, subjectId: string) => void;
  removeTeacherAssignment: (teacherId: string, sectionId: string, subjectId: string) => void;
  addParent: (parentData: Partial<Parent>, profileData: Partial<UserProfile>) => void;
  updateParent: (id: string, updates: Partial<Parent>) => void;
  linkParentStudent: (parentId: string, studentId: string, relationshipType?: string, isPrimary?: boolean) => void;
  unlinkParentStudent: (parentId: string, studentId: string) => void;
  addGrade: (gradeData: Partial<Grade>) => void;
  addSection: (sectionData: Partial<Section>) => void;
  addSubject: (subjectData: Partial<Subject>) => void;
  addAcademicYear: (yearData: Partial<AcademicYear>) => void;
  addAcademicTerm: (termData: Partial<AcademicTerm>) => void;
  setActiveAcademicYear: (yearId: string) => void;
  setActiveAcademicTerm: (termId: string) => void;
  addGradingComponent: (comp: Partial<GradingComponent>) => void;
  deleteGradingComponent: (id: string) => void;
  createExam: (examData: Partial<Exam>) => void;
  togglePublishExam: (examId: string) => void;
  recordExamResult: (examId: string, studentId: string, marks: number, notes?: string) => void;
  togglePublishTermGrades: () => void;
  addTimetableEntry: (entry: Partial<TimetableEntry>) => void;
  deleteTimetableEntry: (id: string) => void;
  addHomeworkAssignment: (hw: Partial<HomeworkAssignment>) => void;
  gradeHomeworkSubmission: (submissionId: string, grade: number, feedback: string) => void;
  submitHomework: (assignmentId: string, studentId: string, attachmentUrl?: string) => void;
}

const SchoolContext = createContext<SchoolContextType | null>(null);

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [school] = useState<School>(INITIAL_SCHOOL);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentBranchId, setCurrentBranchId] = useState<string>('br-01');
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.super_admin);
  const [activeChildId, setActiveChildId] = useState<string>('std-01');

  // School Entities
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(INITIAL_ACADEMIC_YEARS);
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>(INITIAL_ACADEMIC_TERMS);
  const [grades, setGrades] = useState<Grade[]>(INITIAL_GRADES);
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [parents, setParents] = useState<Parent[]>(INITIAL_PARENTS);
  const [parentStudents, setParentStudents] = useState<ParentStudentLink[]>(INITIAL_PARENT_STUDENT_LINKS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [attendance, setAttendance] = useState<StudentAttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendanceRecord[]>(INITIAL_TEACHER_ATTENDANCE);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>(INITIAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(INITIAL_SUBMISSIONS);
  const [requests, setRequests] = useState<AdministrativeRequest[]>(INITIAL_REQUESTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [behaviorRecords, setBehaviorRecords] = useState<BehaviorRecord[]>(INITIAL_BEHAVIOR);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(INITIAL_TIMETABLE);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [examResults, setExamResults] = useState<ExamResult[]>(INITIAL_EXAM_RESULTS);
  const [gradingComponents, setGradingComponents] = useState<GradingComponent[]>(INITIAL_GRADING_COMPONENTS);
  const [isTermGradesPublished, setIsTermGradesPublished] = useState<boolean>(false);

  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];

  // For parent account: find assigned children via parent_students M:N table or fallback to parent_id
  const myChildIds = parentStudents
    .filter((ps) => {
      const pr = parents.find((p) => p.id === ps.parent_id);
      return pr?.user_id === currentUser.id || ps.parent_id === currentUser.id;
    })
    .map((ps) => ps.student_id);

  const parentChildren = students.filter(
    (s) => myChildIds.includes(s.id) || s.parent_id === currentUser.id
  );
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

  const markTeacherAttendance = (
    teacherId: string,
    date: string,
    status: TeacherAttendanceRecord['status'],
    checkIn?: string,
    checkOut?: string,
    notes?: string
  ) => {
    setTeacherAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.teacher_id === teacherId && a.date === date);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          status,
          check_in: checkIn ?? copy[existingIdx].check_in,
          check_out: checkOut ?? copy[existingIdx].check_out,
          notes: notes ?? copy[existingIdx].notes,
        };
        return copy;
      }
      return [
        {
          id: `tatt-${Date.now()}`,
          teacher_id: teacherId,
          date,
          status,
          check_in: checkIn || '07:30',
          check_out: checkOut || '14:30',
          notes,
        },
        ...prev,
      ];
    });
  };

  const markAllTeachersPresent = (date: string) => {
    setTeacherAttendance((prev) => {
      const otherRecords = prev.filter((a) => a.date !== date);
      const newRecords: TeacherAttendanceRecord[] = teachers.map((t) => ({
        id: `tatt-${t.id}-${date}`,
        teacher_id: t.id,
        date,
        status: 'present',
        check_in: '07:15',
        check_out: '14:30',
        notes: 'حضور منتظم في الموعد',
      }));
      return [...newRecords, ...otherRecords];
    });
  };

  const submitRequest = (
    type: AdministrativeRequest['type'],
    description: string,
    studentId: string,
    attachmentUrl?: string
  ) => {
    const st = students.find((s) => s.id === studentId);
    const typeLabels: Record<string, string> = {
      certificate_request: 'طلب شهادة تعريف رسمية',
      transfer_request: 'طلب نقل مدرسي',
      absence_excuse: 'عذر غياب رسمي',
      general_inquiry: 'استفسار أو طلب عام',
      appointment_request: 'طلب موعد مع إدارة / معلم',
      custom_request: 'طلب إداري مخصص',
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
      attachment_url: attachmentUrl,
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

  const addTeacher = (teacherData: Partial<Teacher>, profileData: Partial<UserProfile>) => {
    const newId = `tch-${Date.now()}`;
    const newUserId = `usr-${Date.now()}`;
    const newTeacher: Teacher = {
      id: newId,
      user_id: newUserId,
      branch_id: teacherData.branch_id || currentBranchId,
      specialization: teacherData.specialization || 'عام',
      hire_date: teacherData.hire_date || new Date().toISOString().split('T')[0],
      status: teacherData.status || 'active',
      profile: {
        id: newUserId,
        school_id: school.id,
        role: 'teacher',
        full_name: profileData.full_name || 'معلم جديد',
        email: profileData.email || `teacher.${Date.now()}@alrowad.edu.sa`,
        phone: profileData.phone || '0500000000',
        national_id: profileData.national_id || `${Date.now()}`.slice(0, 10),
        assigned_branches: [teacherData.branch_id || currentBranchId],
        is_active: true,
        created_at: new Date().toISOString().split('T')[0],
      },
      assigned_sections: teacherData.assigned_sections || [],
    };
    setTeachers((prev) => [newTeacher, ...prev]);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const assignTeacherToClass = (teacherId: string, sectionId: string, subjectId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    const subject = subjects.find((sub) => sub.id === subjectId);
    if (!section || !subject) return;

    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id !== teacherId) return t;
        const exists = t.assigned_sections.some(
          (a) => a.section_id === sectionId && a.subject_id === subjectId
        );
        if (exists) return t;
        return {
          ...t,
          assigned_sections: [
            ...t.assigned_sections,
            {
              section_id: section.id,
              section_name: section.name,
              grade_name: section.grade_name || 'الصف',
              subject_id: subject.id,
              subject_name: subject.name,
            },
          ],
        };
      })
    );
  };

  const removeTeacherAssignment = (teacherId: string, sectionId: string, subjectId: string) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id !== teacherId) return t;
        return {
          ...t,
          assigned_sections: t.assigned_sections.filter(
            (a) => !(a.section_id === sectionId && a.subject_id === subjectId)
          ),
        };
      })
    );
  };

  const addGrade = (gradeData: Partial<Grade>) => {
    const newGrade: Grade = {
      id: `grd-${Date.now()}`,
      branch_id: currentBranchId,
      name: gradeData.name || 'صف جديد',
      stage: gradeData.stage || 'primary',
      order_index: gradeData.order_index || grades.length + 1,
    };
    setGrades((prev) => [...prev, newGrade]);
  };

  const addSection = (sectionData: Partial<Section>) => {
    const grade = grades.find((g) => g.id === sectionData.grade_id);
    const newSection: Section = {
      id: `sec-${Date.now()}`,
      grade_id: sectionData.grade_id || (grades[0]?.id ?? 'grd-01'),
      academic_year_id: sectionData.academic_year_id || 'ay-2026',
      name: sectionData.name || 'شعبة جديدة',
      capacity: sectionData.capacity || 28,
      grade_name: grade?.name || 'الصف',
    };
    setSections((prev) => [...prev, newSection]);
  };

  const addSubject = (subjectData: Partial<Subject>) => {
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      branch_id: currentBranchId,
      grade_id: subjectData.grade_id || (grades[0]?.id ?? 'grd-01'),
      name: subjectData.name || 'مادة جديدة',
      code: subjectData.code || `SUB-${Date.now().toString().slice(-3)}`,
      credit_hours: subjectData.credit_hours || 3,
      pass_mark: subjectData.pass_mark || 50,
      total_mark: subjectData.total_mark || 100,
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const addAcademicYear = (yearData: Partial<AcademicYear>) => {
    const newYear: AcademicYear = {
      id: `ay-${Date.now()}`,
      branch_id: currentBranchId,
      name: yearData.name || '2027/2028',
      start_date: yearData.start_date || '2027-09-01',
      end_date: yearData.end_date || '2028-06-25',
      is_current: false,
    };
    setAcademicYears((prev) => [...prev, newYear]);
  };

  const addAcademicTerm = (termData: Partial<AcademicTerm>) => {
    const newTerm: AcademicTerm = {
      id: `term-${Date.now()}`,
      academic_year_id: termData.academic_year_id || 'ay-2026',
      name: termData.name || 'فصل دراسي جديد',
      start_date: termData.start_date || '2026-09-01',
      end_date: termData.end_date || '2026-12-15',
      is_current: false,
    };
    setAcademicTerms((prev) => [...prev, newTerm]);
  };

  const setActiveAcademicYear = (yearId: string) => {
    setAcademicYears((prev) =>
      prev.map((y) => ({
        ...y,
        is_current: y.id === yearId,
      }))
    );
  };

  const setActiveAcademicTerm = (termId: string) => {
    setAcademicTerms((prev) =>
      prev.map((t) => ({
        ...t,
        is_current: t.id === termId,
      }))
    );
  };

  const updateStudentStatus = (studentId: string, status: StudentStatus) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  };

  const addParent = (parentData: Partial<Parent>, profileData: Partial<UserProfile>) => {
    const newId = `pr-${Date.now()}`;
    const newUserId = `usr-parent-${Date.now()}`;
    const newParent: Parent = {
      id: newId,
      user_id: newUserId,
      relationship_type: parentData.relationship_type || 'father',
      workplace: parentData.workplace || '',
      emergency_phone: parentData.emergency_phone || profileData.phone || '',
      profile: {
        id: newUserId,
        school_id: school.id,
        role: 'parent',
        full_name: profileData.full_name || 'ولي أمر جديد',
        email: profileData.email || `parent.${Date.now()}@alrowad.edu.sa`,
        phone: profileData.phone || '0500000000',
        national_id: profileData.national_id || `${Date.now()}`.slice(0, 10),
        assigned_branches: [currentBranchId],
        is_active: true,
        created_at: new Date().toISOString().split('T')[0],
      },
      children: [],
    };
    setParents((prev) => [newParent, ...prev]);
  };

  const updateParent = (id: string, updates: Partial<Parent>) => {
    setParents((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const linkParentStudent = (
    parentId: string,
    studentId: string,
    relationshipType: string = 'father',
    isPrimary: boolean = false
  ) => {
    const parent = parents.find((p) => p.id === parentId);
    const student = students.find((s) => s.id === studentId);
    if (!parent || !student) return;

    // Check if already linked
    const exists = parentStudents.some(
      (ps) => ps.parent_id === parentId && ps.student_id === studentId
    );
    if (exists) return;

    const newLink: ParentStudentLink = {
      id: `ps-${Date.now()}`,
      parent_id: parentId,
      student_id: studentId,
      is_primary_contact: isPrimary,
      relationship_type: relationshipType,
      parent_name: parent.profile.full_name,
      student_name: student.full_name,
      phone: parent.profile.phone,
    };
    setParentStudents((prev) => [...prev, newLink]);
  };

  const unlinkParentStudent = (parentId: string, studentId: string) => {
    setParentStudents((prev) =>
      prev.filter((ps) => !(ps.parent_id === parentId && ps.student_id === studentId))
    );
  };

  const addGradingComponent = (comp: Partial<GradingComponent>) => {
    const newComp: GradingComponent = {
      id: `gc-${Date.now()}`,
      subject_id: comp.subject_id || (subjects[0]?.id ?? 'sub-01'),
      academic_term_id: comp.academic_term_id || 'term-1',
      name: comp.name || 'مكون تقييم جديد',
      weight: comp.weight || 10,
      max_score: comp.max_score || 10,
    };
    setGradingComponents((prev) => [...prev, newComp]);
  };

  const deleteGradingComponent = (id: string) => {
    setGradingComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const createExam = (examData: Partial<Exam>) => {
    const newExam: Exam = {
      id: `ex-${Date.now()}`,
      subject_id: examData.subject_id || (subjects[0]?.id ?? 'sub-01'),
      section_id: examData.section_id || (sections[0]?.id ?? 'sec-01'),
      academic_term_id: examData.academic_term_id || 'term-1',
      title: examData.title || 'اختبار جديد',
      exam_date: examData.exam_date || '2026-10-25',
      start_time: examData.start_time || '08:00',
      end_time: examData.end_time || '09:30',
      total_marks: examData.total_marks || 20,
      description: examData.description || '',
      is_published: false,
      created_by: currentUser.id,
      subject_name: examData.subject_name || 'المادة',
      section_name: examData.section_name || 'الشعبة',
    };
    setExams((prev) => [newExam, ...prev]);
  };

  const togglePublishExam = (examId: string) => {
    setExams((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, is_published: !e.is_published } : e))
    );
  };

  const recordExamResult = (examId: string, studentId: string, marks: number, notes?: string) => {
    setExamResults((prev) => {
      const idx = prev.findIndex((r) => r.exam_id === examId && r.student_id === studentId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], obtained_marks: marks, notes };
        return copy;
      }
      return [
        {
          id: `er-${Date.now()}`,
          exam_id: examId,
          student_id: studentId,
          obtained_marks: marks,
          notes,
        },
        ...prev,
      ];
    });
  };

  const togglePublishTermGrades = () => {
    setIsTermGradesPublished((prev) => !prev);
  };

  const addTimetableEntry = (entry: Partial<TimetableEntry>) => {
    const newEntry: TimetableEntry = {
      id: `tt-${Date.now()}`,
      section_id: entry.section_id || 'sec-01',
      subject_id: entry.subject_id || 'sub-01',
      teacher_id: entry.teacher_id || 'usr-teacher-ahmed',
      day_of_week: entry.day_of_week ?? 0,
      period_number: entry.period_number ?? 1,
      start_time: entry.start_time || '07:30',
      end_time: entry.end_time || '08:15',
      classroom: entry.classroom || 'قاعة 101',
      subject_name: entry.subject_name || 'الرياضيات',
      teacher_name: entry.teacher_name || 'أ. أحمد منصور',
      section_name: entry.section_name || 'شعبة أ',
      ...entry,
    };
    setTimetable((prev) => [...prev, newEntry]);
  };

  const deleteTimetableEntry = (id: string) => {
    setTimetable((prev) => prev.filter((t) => t.id !== id));
  };

  const addHomeworkAssignment = (hw: Partial<HomeworkAssignment>) => {
    const newHw: HomeworkAssignment = {
      id: `hw-${Date.now()}`,
      section_id: hw.section_id || 'sec-01',
      subject_id: hw.subject_id || 'sub-01',
      teacher_id: currentUser.id,
      title: hw.title || 'واجب مدرسي جديد',
      description: hw.description || '',
      due_date: hw.due_date || new Date().toISOString().split('T')[0],
      attachment_urls: hw.attachment_urls || [],
      status: 'active',
      subject_name: hw.subject_name || 'المادة',
      section_name: hw.section_name || 'الشعبة',
    };
    setAssignments((prev) => [newHw, ...prev]);
  };

  const gradeHomeworkSubmission = (submissionId: string, grade: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId ? { ...s, grade, feedback, status: 'graded' } : s
      )
    );
  };

  const submitHomework = (assignmentId: string, studentId: string, attachmentUrl?: string) => {
    const st = students.find((s) => s.id === studentId);
    const existing = submissions.find(
      (s) => s.assignment_id === assignmentId && s.student_id === studentId
    );
    if (existing) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === existing.id
            ? {
                ...s,
                submitted_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
                status: 'submitted',
                attachment_url: attachmentUrl || s.attachment_url,
              }
            : s
        )
      );
      return;
    }

    const newSubm: HomeworkSubmission = {
      id: `subm-${Date.now()}`,
      assignment_id: assignmentId,
      student_id: studentId,
      student_name: st?.full_name || 'الطالب',
      submitted_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'submitted',
      max_grade: 10,
      attachment_url: attachmentUrl || 'solution.pdf',
    };
    setSubmissions((prev) => [newSubm, ...prev]);
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
        teachers,
        parents,
        parentStudents,
        academicYears,
        academicTerms,
        students,
        attendance,
        teacherAttendance,
        assignments,
        submissions,
        requests,
        announcements,
        behaviorRecords,
        timetable,
        exams,
        examResults,
        gradingComponents,
        isTermGradesPublished,
        switchBranch,
        switchUserRole,
        switchActiveChild,
        hasPermission,
        addStudent,
        updateStudent,
        updateStudentStatus,
        markAttendance,
        markAllSectionPresent,
        markTeacherAttendance,
        markAllTeachersPresent,
        submitRequest,
        updateRequestStatus,
        addAnnouncement,
        addBehaviorRecord,
        addTeacher,
        updateTeacher,
        assignTeacherToClass,
        removeTeacherAssignment,
        addParent,
        updateParent,
        linkParentStudent,
        unlinkParentStudent,
        addGrade,
        addSection,
        addSubject,
        addAcademicYear,
        addAcademicTerm,
        setActiveAcademicYear,
        setActiveAcademicTerm,
        addGradingComponent,
        deleteGradingComponent,
        createExam,
        togglePublishExam,
        recordExamResult,
        togglePublishTermGrades,
        addTimetableEntry,
        deleteTimetableEntry,
        addHomeworkAssignment,
        gradeHomeworkSubmission,
        submitHomework,
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
