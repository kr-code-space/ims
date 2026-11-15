# Institute Management System (IMS)

## Project Overview, Technology Stack & Architecture

## 1. Project Overview

The **Institute Management System (IMS)** is a web-based application intended to centralise the academic, administrative, and operational activities of an educational institute.

The system provides separate interfaces and functionality for administrators, faculty members, students, and librarians. It is designed to manage institutional information in one place, reduce manual work, improve access to information, and maintain organised records.

The system uses Role-Based Access Control (RBAC), with additional permissions for specific responsibilities. Users should only be able to access the information and operations relevant to their role, assigned classes, and granted permissions.

The intended architecture is a **Modular Monolith**: one backend application organised into separate functional modules, rather than multiple independent microservices.

## 2. User Roles and Functionality

There are four primary roles:

- `ADMIN`
- `FACULTY`
- `STUDENT`
- `LIBRARIAN`

### 2.1 Admin

Admin manages the institute's central records and administrative operations.

Main areas:

- Student management: personal details, official records, academic details, enrolment, and class allocation.
- Faculty and staff management: teaching and non-teaching staff details, designations, departments, and staff records.
- Faculty allocation: assign faculty members to one or multiple classes.
- Class Representative allocation: assign a student as CR for a particular class.
- Fee management: fee structures, student dues, payment records, and receipts.
- Library management: library records and inventory.
- Laboratory management: lab inventory, equipment, and maintenance records.
- Facilities and infrastructure: classrooms, equipment, and facility records.
- User and access management: manage accounts, roles, and additional permissions.
- Audit logs: view records of important administrative changes.

Admin is the only role that can modify official student records and manage fee records.

### 2.2 Faculty

Faculty manage academic activities for the classes assigned to them by Admin.

Main areas:

- View assigned classes only.
- View student records for assigned classes in read-only form.
- Create and assign assignments.
- View student submissions.
- Evaluate submissions and provide marks and feedback.
- Mark and manage attendance for assigned classes/subjects.
- Access a separate Lab Management section when granted the additional `LAB_ACCESS` permission.

A faculty member may be assigned to multiple classes. Faculty access is limited to their assigned classes and subjects. Faculty cannot edit official student details.

### 2.3 Student

Students use the system to access academic information and participate in class activities.

Main areas:

- View personal and academic information.
- View enrolled subjects and associated faculty.
- View assignments, instructions, and deadlines.
- Submit assignments and track submission status.
- View marks and faculty feedback.
- View subject-wise attendance, attendance history, and percentage.
- View fee structure, outstanding dues, payment status, and payment history.
- Submit fee payments through the system's payment workflow.
- View or download receipts where available.
- Participate in a class-specific doubt forum.
- Post doubts anonymously if desired and reply/comment on other students' posts.

Students can view their own records but cannot modify official student or fee records.

### 2.4 Librarian

Librarian is a separate primary role responsible for library operations.

The intended library area includes:

- Book and catalogue records.
- Library inventory and copies.
- Issue and return records.
- Due dates and borrowing history.
- Overdue, lost, or damaged item records where required.

### 2.5 Additional Responsibility: Class Representative (CR)

CR is an additional responsibility assigned to a student by Admin; it is not a separate primary role.

- The CR retains normal Student functionality.
- The CR can remove inappropriate posts and comments from the doubt forum of the class to which they are assigned.
- The CR cannot moderate other classes' forums.
- Faculty do not moderate the student doubt forum under the current design.

### 2.6 Additional Permission: `LAB_ACCESS`

`LAB_ACCESS` is an additional permission granted or revoked by Admin.

- Faculty with this permission see a separate Lab Management section.
- Faculty without this permission do not have access to that section.
- The permission is separate from the four primary roles.

## 3. Main Functional Modules

| Module                             | Purpose                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Authentication and User Management | Login, user accounts, roles, permissions, and account status                   |
| Student Management                 | Student profiles, official records, academic information, and class allocation |
| Faculty Management                 | Faculty details, class allocation, and academic responsibilities               |
| Staff Management                   | Teaching and non-teaching staff records                                        |
| Academic Management                | Academic structure, classes, subjects, and enrolment                           |
| Attendance                         | Attendance recording, history, and percentage                                  |
| Assignments                        | Assignment creation, submission, evaluation, and feedback                      |
| Doubt Forum                        | Class-specific student discussions and CR moderation                           |
| Fee Management                     | Fee structures, dues, payments, and receipts                                   |
| Library Management                 | Books, inventory, issue/return, and borrowing records                          |
| Laboratory Management              | Lab inventory, equipment, and maintenance                                      |
| Facility Management                | Classrooms, infrastructure, and facility records                               |
| Audit Logs                         | History of important administrative actions                                    |

Other possible areas include examinations/results, timetable, announcements, leave management, reports, and multi-institute support.

## 4. Technology Stack

The intended technology stack is:

| Layer                | Technology                  | Role                                                                 |
| -------------------- | --------------------------- | -------------------------------------------------------------------- |
| Backend language     | Java                        | Backend application development                                      |
| Backend framework    | Spring Boot                 | REST APIs, business logic, and application configuration             |
| Build tool           | Maven                       | Dependency management, builds, and tests                             |
| Frontend library     | React                       | User interface and role-specific dashboards                          |
| Frontend build tool  | Vite                        | Frontend development and production builds                           |
| Frontend language    | JavaScript + JSX            | React components and application logic                               |
| CSS framework        | Tailwind CSS                | Styling and responsive layouts                                       |
| Frontend routing     | React Router DOM            | Page routing                                                         |
| HTTP client          | Axios                       | Communication between frontend and backend                           |
| Icons                | Lucide React                | Interface icons                                                      |
| Database             | PostgreSQL                  | Persistent data storage                                              |
| ORM/data access      | Spring Data JPA + Hibernate | Object-relational mapping and database access                        |
| Database migrations  | Flyway                      | Version-controlled database schema changes                           |
| Security framework   | Spring Security             | Authentication and authorization                                     |
| Authentication token | JWT                         | Token-based API authentication, if used in the final security design |
| Password hashing     | BCrypt                      | Secure password hash storage                                         |

The exact dependency versions should be selected as a compatible set when the project is created.

## 5. System Architecture

### 5.1 Architectural Style

The backend follows a **Modular Monolithic Architecture**.

This means:

- There is one Spring Boot backend application.
- Functional areas are separated into modules.
- Modules have clear responsibilities and boundaries.
- Modules can share common infrastructure and communicate through application-level interfaces.
- The project is not split into microservices.

### 5.2 High-Level Architecture

```text
┌──────────────────────────────────────────────┐
│               FRONTEND                       │
│              React + Vite                    │
│                                              │
│  Admin | Faculty | Student | Librarian       │
│                                              │
│  Pages | Components | Routes | API Client    │
└──────────────────────┬───────────────────────┘
                       │
                  REST API
                 JSON / HTTP
                       │
┌──────────────────────▼───────────────────────┐
│                BACKEND                       │
│               Spring Boot                    │
│                                              │
│  Authentication and Authorization            │
│  REST Controllers                            │
│  Business / Service Layer                    │
│  Data Access / Repositories                  │
│  Validation and Exception Handling           │
│  Audit and Common Components                 │
└──────────────────────┬───────────────────────┘
                       │
                 JPA / Hibernate
                       │
┌──────────────────────▼───────────────────────┐
│                 DATABASE                     │
│                PostgreSQL                    │
│                                              │
│  Users | Students | Faculty | Attendance     │
│  Assignments | Fees | Library | Labs         │
│  Forum | Facilities | Audit Records          │
└──────────────────────────────────────────────┘

             Flyway
   Versioned database migrations
```

### 5.3 Backend Internal Structure

The backend is organised into functional modules. Each module can contain the following layers:

```text
module/
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
└── mapper/
```

- **Controller:** Receives HTTP requests and returns API responses.
- **Service:** Contains business logic and application operations.
- **Repository:** Handles database queries and persistence.
- **Entity:** Represents persisted database objects.
- **DTO:** Defines the data exchanged through API requests and responses.
- **Mapper:** Converts between entities and DTOs where needed.

### 5.4 Proposed Backend Folder Structure

```text
ims/
└── backend/
    └── src/
        └── main/
            ├── java/com/institute/
            │   ├── ImsApplication.java
            │   ├── config/
            │   ├── security/
            │   ├── auth/
            │   ├── user/
            │   ├── student/
            │   ├── faculty/
            │   ├── staff/
            │   ├── department/
            │   ├── academic/
            │   ├── attendance/
            │   ├── assignment/
            │   ├── forum/
            │   ├── fee/
            │   ├── library/
            │   ├── laboratory/
            │   ├── facility/
            │   ├── audit/
            │   └── common/
            └── resources/
                ├── application.yml
                └── db/
                    └── migration/
```

This is a proposed organisation; modules can be added as the corresponding functionality is developed.

### 5.5 Proposed Frontend Folder Structure

```text
ims/
└── frontend/
    └── src/
        ├── assets/
        ├── components/
        │   ├── common/
        │   ├── layout/
        │   └── ui/
        ├── context/
        ├── hooks/
        ├── routes/
        ├── services/
        ├── utils/
        ├── features/
        │   ├── auth/
        │   ├── admin/
        │   ├── faculty/
        │   ├── student/
        │   └── librarian/
        ├── App.jsx
        └── main.jsx
```

The frontend is organised by feature and role, with shared components, routing, authentication state, and API services.

## 6. Security and Data Access Model

The system is based on role-based and permission-based access control.

- Every user authenticates before accessing protected functionality.
- Admin, Faculty, Student, and Librarian have distinct access scopes.
- Additional permissions such as `LAB_ACCESS` are checked separately from primary roles.
- CR moderation rights are limited to the class assigned to that student.
- Faculty access is restricted to assigned classes and subjects.
- Students access their own records and their class-specific academic/forum information.
- Official student records and fee records are managed by Admin.
- Backend APIs enforce permissions; frontend navigation and route restrictions are supplementary.
- Passwords are stored as secure hashes, not plaintext.
- Important administrative changes are recorded in audit history.

## 7. Data and Persistence Concepts

PostgreSQL stores the system's persistent records. Spring Data JPA and Hibernate provide object-relational data access, while Flyway manages database schema migrations.

The data model should distinguish:

- **Master/current records:** current student, faculty, class, subject, inventory, and account information.
- **Transaction/history records:** payments, attendance entries, assignment submissions, book issues/returns, allocation changes, and other events.
- **Audit records:** who performed important actions and when.

This separation helps preserve historical information even when current details change.

## 8. Multi-Institute Capability

Supporting multiple institutes was identified as a possible future extension. The system's architecture should be considered with that possibility in mind.

Multi-institute support would require institute-level data separation and decisions about user membership, institute-specific administrators, roles, and permissions. It is a future capability rather than a fully specified current module.

## 9. Project Description

**Institute Management System (IMS)** is a full-stack, role-based institutional management application built with Java, Spring Boot, React, and PostgreSQL. It is intended to centralise student and staff records, academic activities, attendance, assignments, fees, library and laboratory operations, facilities, and student support workflows. Its modular monolithic backend exposes REST APIs to a React frontend and uses role- and permission-based access to provide separate functionality for Admin, Faculty, Students, and Librarians.
