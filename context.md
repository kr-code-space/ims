# Institute Management System (IMS)

> **Implementation status reviewed: 2026-11-21.** This document describes both the intended IMS scope and the current code. The role and module descriptions below are requirements, not a claim that those workflows are already implemented.

## Current Implementation Snapshot

The repository is a working full-stack starting point, not yet a complete Institute Management System.

### Working now

- React/Vite frontend and Spring Boot backend can run locally against PostgreSQL.
- Admins can maintain the academic foundation: departments, academic terms, classes, subjects, student enrolments, and subject offerings.
- Admins can maintain database-backed faculty records, optional faculty login accounts, activation status, and `LAB_ACCESS`.
- Faculty can record class-scoped attendance and create/evaluate assignments for assigned subject offerings.
- Students can view subject-wise attendance and submit or update assignments.
- Admin and student fee APIs support dues, partial/full payment recording, and student fee history.
- Flyway migrations and Docker Compose configuration are available for local PostgreSQL startup.
- Library, laboratory, facility, staff, forum, and audit database foundations and role-protected APIs are implemented.
- Database-backed login uses Spring Security HTTP Basic and BCrypt password hashes.
- An initial administrator can be seeded from environment variables.
- Admins can view and create user accounts, enable/disable accounts, reset another user's password, and change faculty permissions through a database-backed API and screen.
- Admins have a working Student Management screen and database-backed API to list, add, edit, search, activate, and deactivate student records.
- The Admin User Management screen supports account search/creation, enable/disable, faculty `LAB_ACCESS` changes, and temporary password resets. It prevents the current admin from disabling or resetting their own account.
- Creating a student can optionally create a linked `STUDENT` login. Deactivating that record also disables its linked login. Student records are deactivated rather than deleted, so related history is not removed.
- Hibernate updates the current database schema from the JPA entities at application startup.
- Six unit tests cover student account creation/password hashing, rejection of incomplete optional login details, student deactivation, user listing, safe account status changes, and password reset hashing/self-reset protection.

### Not a complete implementation yet

- The dashboards for Faculty, Student, and Librarian are informational placeholders. Other than the Admin Students and Users pages, there are no operational module screens.
- Faculty has working Attendance and Assignment screens; Students have working Attendance and Assignment screens.
- Librarian dashboards remain informational placeholders until library workflows are implemented.
- Academic foundation now has database-backed entities, admin APIs, and an admin frontend.
- Library, forum, laboratory inventory, facilities, staff, and audit-log workflows have not been implemented.
- Library, forum, laboratory, facility, staff, and audit database foundations and role-protected APIs are now present.
- No production deployment configuration, database migration history, payment integration, or end-to-end UI/API tests are present.

### Current API surface

| Endpoint | Current behavior |
| --- | --- |
| `GET /api/health` | Public backend health check. |
| `POST /api/auth/login` | Accepts JSON username/password and returns the authenticated username and authorities. |
| `GET /api/auth/me` | Returns the current authenticated username and authorities. |
| `GET /api/admin/overview` | Admin-only placeholder overview; does not return real metrics. |
| `GET /api/admin/users` | Admin-only account list; responses do not include password hashes. |
| `POST /api/admin/users` | Admin-only creation of a user account. Passwords must be 12-72 characters. |
| `PUT /api/admin/users/{userId}/permissions` | Admin-only permission update; additional permissions are currently supported only for faculty (`LAB_ACCESS`). |
| `PUT /api/admin/users/{userId}/status` | Admin-only enable/disable; the current admin cannot disable their own account. |
| `PUT /api/admin/users/{userId}/password` | Admin-only password reset for another user; hashes with BCrypt and blocks resetting the current admin's password. |
| `GET /api/admin/students` | Admin-only list of student records. |
| `POST /api/admin/students` | Admin-only student creation; may also create a linked student login. |
| `PUT /api/admin/students/{id}` | Admin-only update of student record fields. |
| `PUT /api/admin/students/{id}/status` | Admin-only activation/deactivation; also enables/disables its linked login. |
| `GET /api/admin/faculty` | Admin-only faculty record list. |
| `POST /api/admin/faculty` | Admin-only faculty creation; may create a linked faculty login. |
| `PUT /api/admin/faculty/{id}` | Admin-only faculty record update. |
| `PUT /api/admin/faculty/{id}/status` | Admin-only faculty activation/deactivation; also enables/disables its linked login. |
| `GET /api/admin/fees` | Admin-only fee record list. |
| `POST /api/admin/fees` | Admin-only fee assignment/creation. |
| `PUT /api/admin/fees/{id}/payment` | Admin-only partial/full payment recording. |
| `GET /api/student/fees` | Student-only view of their fee records. |
| `GET /api/admin/academic` | Admin-only academic structure overview. |
| `POST /api/admin/academic/departments` | Admin-only department creation. |
| `POST /api/admin/academic/terms` | Admin-only academic term creation. |
| `POST /api/admin/academic/classes` | Admin-only class creation with department, term, and optional CR. |
| `POST /api/admin/academic/subjects` | Admin-only subject creation. |
| `POST /api/admin/academic/enrolments` | Admin-only student-to-class enrolment. |
| `POST /api/admin/academic/offerings` | Admin-only subject-to-class offering, with optional faculty assignment. |
| `GET /api/faculty/overview`, `GET /api/student/overview`, `GET /api/librarian/overview` | Role-protected placeholder responses, not functional module data. |
| `GET /api/faculty/lab-access` | Faculty with `LAB_ACCESS` only; still a placeholder with no laboratory records. |

User roles are assigned at account creation and cannot yet be changed through the API. There is no self-service password/profile page. The login API does not issue JWTs.

### Existing persistence model

The JPA model currently declares:

- `ims_users` and `ims_user_permissions`: users, roles, enabled status, BCrypt password hashes, and permissions.
- `students`: student number, name, department, year, class name, active status, and an optional one-to-one user account.
- `faculty`: employee number, name, department, designation, and an optional user account.
- `subjects`: subject code, name, department, credits, and semester.
- `attendance_records`: student, subject, date, attendance result, and remarks.
- `assignments` and `submissions`: assignment details and student submission/evaluation fields.
- `fee_records`: student, fee type, amounts, status, and due date.

Except for user provisioning and Student Management, these are data-model scaffolds: their repositories exist, but there are no corresponding business workflows or CRUD APIs. There are no current entities for classes/enrolments, staff, library, forum, lab equipment, facilities, or audit logs.

### Development configuration and verification

- Backend: Java source/target 17, Spring Boot 3.3.5, Maven, PostgreSQL, Spring Data JPA/Hibernate.
- Frontend: React 19, Vite 8, React Router, Axios, Lucide icons, and plain CSS. Tailwind is not installed.
- The frontend API base URL is currently hard-coded as `http://localhost:8080/api`.
- Local CORS allows `http://localhost:5173` and `http://127.0.0.1:5173`.
- Database defaults in `backend/src/main/resources/application.yml`: `jdbc:postgresql://localhost:5432/imsdb`, username `imsuser`, and password from `DB_PASSWORD`. `DB_URL`, `DB_USERNAME`, and `DDL_AUTO` can override the defaults. PostgreSQL itself and the `imsdb` database/`imsuser` role must already exist; Hibernate creates/updates application tables, not the database or PostgreSQL role.
- The initial admin seeder reads `IMS_BOOTSTRAP_ADMIN_USERNAME`, `IMS_BOOTSTRAP_ADMIN_PASSWORD`, `IMS_BOOTSTRAP_ADMIN_FIRST_NAME`, `IMS_BOOTSTRAP_ADMIN_LAST_NAME`, and `IMS_BOOTSTRAP_ADMIN_EMAIL`. It creates an admin only when all are set and that username does not already exist. It does not reset an existing user's password. Bootstrap passwords must be 12-72 characters.
- The frontend keeps the authenticated API client in memory, not as a persistent token/session. Refreshing the page requires signing in again.
- The frontend exposes the Admin Students and Users pages; other roles still see dashboard placeholders. A user whose password was reset must sign in again using the new password.
- Local startup from the repository root: `.\apache-maven-3.9.11\bin\mvn.cmd -f backend\pom.xml spring-boot:run`; in `frontend`, use `npm run dev`. The Maven path is specific to machines with that local Maven folder; an installed Maven can be used instead.
- Latest checks: `mvn -f backend/pom.xml test` passes (10 tests); frontend `npm run build` and `npm run lint` pass.

### Recommended next work

1. Implement academic structure (departments, classes, terms/semesters, subject offerings, enrolment, and faculty/class assignment). This is the foundation for meaningful class-scoped permissions and for connecting existing student records to actual classes.
2. Implement Faculty Management using database-backed staff/user records, then Attendance and Assignments/Submissions using those academic relationships.
3. Implement fee structures, dues, payment recording, and receipts; choose and document any payment-provider integration before implementing real online payments.
4. Implement student self-service (profile, subjects, attendance, assignment submission/results, and fees), then the class forum and CR-specific moderation.
5. Implement Library and circulation workflows, Lab inventory/maintenance, Facilities, and Audit Logs.
6. Add integration/API and end-to-end tests, database migrations, deployment configuration, and production security hardening.

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

## 4. Intended Technology Stack

The table below describes the target stack. The current implementation differs in the places called out above: it uses plain CSS rather than Tailwind, Hibernate schema updates rather than Flyway migrations, and HTTP Basic rather than JWT.

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

The following diagram is the target architecture. Several modules shown in it are not implemented yet.

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

    Planned: versioned migrations
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

This is a proposed organisation; modules can be added as the corresponding functionality is developed. The current backend has Java packages for controllers, config, users, students, faculty, subjects, attendance, assignments, and fees, but several of these currently contain only entities and repositories.

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

This is a proposed frontend structure, not the current layout. The current frontend is a small `App.jsx`/`App.css` application with login, role dashboard placeholders, and the Admin Student Management screen; it does not yet have separate feature pages, shared API services, or complete role workflows.

## 6. Security and Data Access Model

This section defines the intended access policy. In the current code, HTTP Basic authentication and role checks are applied to the APIs that exist; fine-grained class/subject scoping, CR permissions, and most module-specific authorization cannot be implemented until those workflows and relationships exist.

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

PostgreSQL stores the system's persistent records. Spring Data JPA and Hibernate provide object-relational data access. **Currently Hibernate uses `ddl-auto: update`** to create/update tables from the entities; Flyway is only a target choice and is not included in the dependencies. `ddl-auto: update` is convenient for local development but should be replaced by reviewed, versioned migrations before production use.

The data model should distinguish:

- **Master/current records:** current student, faculty, class, subject, inventory, and account information.
- **Transaction/history records:** payments, attendance entries, assignment submissions, book issues/returns, allocation changes, and other events.
- **Audit records:** who performed important actions and when.

This separation helps preserve historical information even when current details change.

## 8. Multi-Institute Capability

Supporting multiple institutes was identified as a possible future extension. The system's architecture should be considered with that possibility in mind.

Multi-institute support would require institute-level data separation and decisions about user membership, institute-specific administrators, roles, and permissions. It is a future capability rather than a fully specified current module.

## 9. Project Description

**Target description:** Institute Management System (IMS) is intended to be a full-stack, role-based institutional management application built with Java, Spring Boot, React, and PostgreSQL. It is intended to centralise student and staff records, academic activities, attendance, assignments, fees, library and laboratory operations, facilities, and student support workflows.

**Current implementation:** the modular-monolith foundation includes database-backed login and user provisioning, role/permission checks for existing APIs, and a working Admin Student Management workflow. Faculty, student, librarian, attendance, assignment, fee, library, lab, forum, facilities, and audit workflows remain to be implemented as described in the status and roadmap sections above.
