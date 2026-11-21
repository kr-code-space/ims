CREATE TABLE IF NOT EXISTS ims_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS ims_user_permissions (
    user_id BIGINT NOT NULL REFERENCES ims_users(id),
    permission VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, permission)
);

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    student_number VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(150) NOT NULL,
    year VARCHAR(50) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    user_id BIGINT UNIQUE REFERENCES ims_users(id)
);

CREATE TABLE IF NOT EXISTS faculty (
    id BIGSERIAL PRIMARY KEY,
    employee_number VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(150) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    user_id BIGINT UNIQUE REFERENCES ims_users(id)
);

CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS academic_terms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS academic_classes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department_id BIGINT NOT NULL REFERENCES departments(id),
    term_id BIGINT NOT NULL REFERENCES academic_terms(id),
    cr_student_id BIGINT REFERENCES students(id),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS subjects (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    credits INTEGER NOT NULL,
    semester VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS enrolments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    academic_class_id BIGINT NOT NULL REFERENCES academic_classes(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (student_id, academic_class_id)
);

CREATE TABLE IF NOT EXISTS subject_offerings (
    id BIGSERIAL PRIMARY KEY,
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    academic_class_id BIGINT NOT NULL REFERENCES academic_classes(id),
    faculty_id BIGINT REFERENCES faculty(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (subject_id, academic_class_id)
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    academic_class_id BIGINT REFERENCES academic_classes(id),
    date DATE NOT NULL,
    present BOOLEAN NOT NULL,
    remarks VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    academic_class_id BIGINT REFERENCES academic_classes(id),
    due_date DATE NOT NULL,
    max_marks INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id),
    student_id BIGINT NOT NULL REFERENCES students(id),
    submitted_at TIMESTAMP NOT NULL,
    feedback VARCHAR(2000),
    submitted_text VARCHAR(4000),
    marks INTEGER NOT NULL,
    status VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS fee_records (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    fee_type VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS library_books (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(255) NOT NULL UNIQUE,
    total_copies INTEGER NOT NULL,
    available_copies INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS library_book_issues (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT NOT NULL REFERENCES library_books(id),
    student_id BIGINT NOT NULL REFERENCES students(id),
    issued_at DATE NOT NULL,
    due_at DATE NOT NULL,
    returned_at DATE,
    status VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS lab_equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'AVAILABLE',
    maintenance_notes VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS facilities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'AVAILABLE',
    location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS staff (
    id BIGSERIAL PRIMARY KEY,
    employee_number VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS forum_posts (
    id BIGSERIAL PRIMARY KEY,
    academic_class_id BIGINT NOT NULL REFERENCES academic_classes(id),
    student_id BIGINT NOT NULL REFERENCES students(id),
    title VARCHAR(255) NOT NULL,
    content VARCHAR(4000) NOT NULL,
    anonymous BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS forum_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES forum_posts(id),
    student_id BIGINT NOT NULL REFERENCES students(id),
    content VARCHAR(2000) NOT NULL,
    anonymous BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_entries (
    id BIGSERIAL PRIMARY KEY,
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255),
    details VARCHAR(4000),
    occurred_at TIMESTAMP NOT NULL
);
