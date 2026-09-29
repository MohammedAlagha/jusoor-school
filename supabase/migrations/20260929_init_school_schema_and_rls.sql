-- ==============================================================================
-- MIGRATION: 20260929_init_school_schema_and_rls.sql
-- DESCRIPTION: Complete Multi-Branch School Management Schema & Row Level Security
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SCHOOLS
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    phone VARCHAR(30),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. BRANCHES
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(100),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_school_branch_code UNIQUE (school_id, code)
);
CREATE INDEX IF NOT EXISTS idx_branches_school ON public.branches(school_id);

-- 3. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'super_admin', 'admin', 'teacher', 'parent'
    display_name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. PROFILES & USER BRANCH ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id),
    role_id UUID NOT NULL REFERENCES public.roles(id),
    national_id VARCHAR(50) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role_id);

CREATE TABLE IF NOT EXISTS public.user_branch_assignments (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, branch_id)
);

-- 5. ACADEMIC STRUCTURE
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- '2026/2027'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_branch_academic_year UNIQUE (branch_id, name)
);

CREATE TABLE IF NOT EXISTS public.academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_year_term UNIQUE (academic_year_id, name)
);

CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('kindergarten', 'primary', 'middle', 'secondary')),
    order_index INT NOT NULL DEFAULT 1,
    CONSTRAINT uq_branch_grade UNIQUE (branch_id, name)
);

CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 30,
    CONSTRAINT uq_grade_section_year UNIQUE (grade_id, academic_year_id, name)
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL,
    credit_hours NUMERIC(3,1) DEFAULT 1.0,
    pass_mark NUMERIC(5,2) DEFAULT 50.0 NOT NULL,
    total_mark NUMERIC(5,2) DEFAULT 100.0 NOT NULL,
    CONSTRAINT uq_grade_subject_code UNIQUE (grade_id, code)
);

-- 6. TEACHERS & ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    specialization VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    CONSTRAINT uq_teacher_assignment UNIQUE (teacher_id, subject_id, section_id, academic_year_id)
);

-- 7. STUDENTS & PARENTS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE RESTRICT,
    national_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    father_name VARCHAR(50) NOT NULL,
    grandfather_name VARCHAR(50) NOT NULL,
    family_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    date_of_birth DATE NOT NULL,
    blood_type VARCHAR(5),
    photo_url TEXT,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'graduated', 'expelled')),
    medical_notes TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_students_branch_sec ON public.students(branch_id, section_id);

CREATE TABLE IF NOT EXISTS public.parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('father', 'mother', 'guardian')),
    workplace VARCHAR(150),
    emergency_phone VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS public.parent_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    is_primary_contact BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_parent_student UNIQUE (parent_id, student_id)
);

-- 8. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'excused_absence', 'unexcused_absence', 'late', 'early_leave')),
    minutes_late INT DEFAULT 0,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    CONSTRAINT uq_student_daily_attendance UNIQUE (student_id, date)
);

CREATE TABLE IF NOT EXISTS public.teacher_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'early_leave')),
    check_in TIME,
    check_out TIME,
    notes TEXT,
    CONSTRAINT uq_teacher_daily_attendance UNIQUE (teacher_id, date)
);

-- 9. GRADING & EXAMS
CREATE TABLE IF NOT EXISTS public.grading_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_term_id UUID NOT NULL REFERENCES public.academic_terms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    weight NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL,
    CONSTRAINT uq_comp_term_subject UNIQUE (subject_id, academic_term_id, name)
);

CREATE TABLE IF NOT EXISTS public.student_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    grading_component_id UUID NOT NULL REFERENCES public.grading_components(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    recorded_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_grade_item UNIQUE (student_id, grading_component_id)
);

CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    academic_term_id UUID NOT NULL REFERENCES public.academic_terms(id),
    title VARCHAR(150) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_marks NUMERIC(5,2) NOT NULL,
    description TEXT,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    created_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    obtained_marks NUMERIC(5,2) NOT NULL,
    notes TEXT,
    CONSTRAINT uq_exam_student_result UNIQUE (exam_id, student_id)
);

-- 10. TIMETABLE (WITH CONFLICT PREVENTION)
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 10),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    classroom VARCHAR(50),
    CONSTRAINT uq_section_time_conflict UNIQUE (section_id, day_of_week, period_number),
    CONSTRAINT uq_teacher_time_conflict UNIQUE (teacher_id, day_of_week, period_number)
);

-- 11. ASSIGNMENTS, BEHAVIOR & REQUESTS
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    attachment_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.behavior_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('positive', 'negative', 'infraction', 'general')),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    action_taken TEXT,
    is_visible_to_parent BOOLEAN DEFAULT TRUE,
    recorded_by UUID REFERENCES public.profiles(id),
    incident_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.administrative_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('document_request', 'transfer_request', 'certificate_request', 'general_inquiry')),
    description TEXT NOT NULL,
    attachment_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'completed')),
    admin_response TEXT,
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES public.grades(id),
    section_id UUID REFERENCES public.sections(id),
    target_audience VARCHAR(20) NOT NULL CHECK (target_audience IN ('all', 'branch', 'teachers', 'parents', 'grade', 'section')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    attachment_urls JSONB DEFAULT '[]'::jsonb,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrative_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper security definer functions
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT r.name FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_branch_permission(target_branch_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.current_user_role() = 'super_admin' OR EXISTS (
    SELECT 1 FROM public.user_branch_assignments
    WHERE user_id = auth.uid() AND branch_id = target_branch_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Students policy
CREATE POLICY "Student access policy" ON public.students
FOR SELECT TO authenticated
USING (
  public.current_user_role() = 'super_admin'
  OR public.has_branch_permission(branch_id)
  OR EXISTS (
    SELECT 1 FROM public.parent_students ps
    JOIN public.parents pr ON ps.parent_id = pr.id
    WHERE ps.student_id = students.id AND pr.user_id = auth.uid()
  )
  OR (
    public.current_user_role() = 'teacher' AND EXISTS (
      SELECT 1 FROM public.teacher_assignments ta
      WHERE ta.section_id = students.section_id
      AND ta.teacher_id = (SELECT id FROM public.teachers WHERE user_id = auth.uid())
    )
  )
);
