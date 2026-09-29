export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'parent';

export type StudentStatus = 'active' | 'transferred' | 'graduated' | 'expelled';

export type AttendanceStatus = 'present' | 'excused_absence' | 'unexcused_absence' | 'late' | 'early_leave';

export type BehaviorType = 'positive' | 'negative' | 'infraction' | 'general';

export type RequestStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';

export interface School {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  school_id: string;
  name: string;
  code: string;
  city: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
  students_count?: number;
  teachers_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: UserRole;
  display_name: string;
  description?: string;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string;
}

export interface UserProfile {
  id: string;
  school_id: string;
  role: UserRole;
  national_id?: string;
  full_name: string;
  phone?: string;
  email: string;
  avatar_url?: string;
  is_active: boolean;
  assigned_branches: string[]; // Branch IDs
  created_at: string;
}

export interface AcademicYear {
  id: string;
  branch_id: string;
  name: string; // e.g. "2026/2027"
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface AcademicTerm {
  id: string;
  academic_year_id: string;
  name: string; // e.g. "الفصل الدراسي الأول"
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface Grade {
  id: string;
  branch_id: string;
  name: string; // e.g. "الصف الأول الثانوي"
  stage: 'kindergarten' | 'primary' | 'middle' | 'secondary';
  order_index: number;
}

export interface Section {
  id: string;
  grade_id: string;
  academic_year_id: string;
  name: string; // e.g. "شعبة أ"
  capacity: number;
  grade_name?: string;
}

export interface Subject {
  id: string;
  branch_id: string;
  grade_id: string;
  name: string; // e.g. "الرياضيات المتقدمة"
  code: string;
  credit_hours: number;
  pass_mark: number;
  total_mark: number;
}

export interface Teacher {
  id: string;
  user_id: string;
  branch_id: string;
  profile: UserProfile;
  specialization: string;
  hire_date: string;
  status: 'active' | 'on_leave' | 'terminated';
  assigned_sections: {
    section_id: string;
    section_name: string;
    grade_name: string;
    subject_id: string;
    subject_name: string;
  }[];
}

export interface Student {
  id: string;
  branch_id: string;
  section_id: string;
  national_id: string;
  first_name: string;
  father_name: string;
  grandfather_name: string;
  family_name: string;
  full_name: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  blood_type?: string;
  photo_url?: string;
  enrollment_date: string;
  status: StudentStatus;
  medical_notes?: string;
  address?: string;
  parent_id?: string;
  grade_name?: string;
  section_name?: string;
  branch_name?: string;
}

export interface Parent {
  id: string;
  user_id: string;
  profile: UserProfile;
  relationship_type: 'father' | 'mother' | 'guardian';
  workplace?: string;
  emergency_phone?: string;
  children: Student[];
}

export interface StudentAttendanceRecord {
  id: string;
  student_id: string;
  section_id: string;
  date: string;
  status: AttendanceStatus;
  minutes_late?: number;
  notes?: string;
  recorded_by: string;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacher_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
  check_in?: string;
  check_out?: string;
  notes?: string;
}

export interface GradingComponent {
  id: string;
  subject_id: string;
  academic_term_id: string;
  name: string; // e.g. "مشاركة وتفاعل", "اختبار نصفي", "اختبار نهائي"
  weight: number;
  max_score: number;
}

export interface StudentGrade {
  id: string;
  student_id: string;
  grading_component_id: string;
  score: number;
  is_published: boolean;
  recorded_by: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  subject_id: string;
  section_id: string;
  academic_term_id: string;
  title: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  total_marks: number;
  description?: string;
  is_published: boolean;
  created_by: string;
  subject_name?: string;
  section_name?: string;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  obtained_marks: number;
  notes?: string;
}

export interface TimetableEntry {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number; // 0=Sunday, 4=Thursday
  period_number: number; // 1..7
  start_time: string;
  end_time: string;
  classroom?: string;
  subject_name?: string;
  teacher_name?: string;
  section_name?: string;
}

export interface HomeworkAssignment {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  description: string;
  due_date: string;
  attachment_urls: string[];
  status: 'active' | 'archived';
  subject_name?: string;
  section_name?: string;
}

export interface BehaviorRecord {
  id: string;
  student_id: string;
  type: BehaviorType;
  title: string;
  description: string;
  action_taken?: string;
  is_visible_to_parent: boolean;
  recorded_by: string;
  incident_date: string;
}

export interface Announcement {
  id: string;
  branch_id?: string;
  grade_id?: string;
  target_audience: 'all' | 'branch' | 'teachers' | 'parents' | 'grade';
  title: string;
  content: string;
  published_at: string;
  created_by_name: string;
}

export interface AdministrativeRequest {
  id: string;
  branch_id: string;
  parent_id: string;
  student_id: string;
  student_name: string;
  parent_name: string;
  type: 'document_request' | 'transfer_request' | 'certificate_request' | 'general_inquiry';
  type_label: string;
  description: string;
  status: RequestStatus;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  entity: string;
  entity_id: string;
  details: string;
  created_at: string;
}
