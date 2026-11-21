# College Management System: PRD and Full-Stack Implementation Plan

*Product Requirements Document, Spring Boot (Java) | Version 1.0 | Prepared for institutional and official use*

**Revision 2.** Aligned with the existing repository (Spring Boot, React and Vite, PostgreSQL). Account roles are now ADMIN, FACULTY, STUDENT and LIBRARIAN; HOD, CR and laboratory access are designations, responsibilities and permissions, not login roles. Features carry P0, P1 or P2 priorities and ship in four phases after a Phase 0 baseline audit. Contradictions found in the first draft are resolved in the decision log (Section 17).

## 1. Overview

### 1.1 Purpose

Build a secure, modern, web-based College Management System (CMS) that lets college officials manage departments, faculty, students, courses, attendance, marks, results, fees and the library from one place, replacing paper registers and scattered spreadsheets.

### 1.2 Problem Statement

Colleges typically keep student records, attendance and marks in disconnected files. This causes duplicate data, errors, slow reporting, no audit trail and no role-based control over who can change what.

### 1.3 Goals

- Single source of truth for all academic and administrative records.
- Role-based access so each user sees and edits only what they should.
- Fast daily workflows: attendance in under 2 minutes per class, marks entry per exam in one screen.
- One-click reports (PDF and Excel) for management and accreditation.
- Complete audit trail of every create, update and delete.
- Clean, modern, comfortable UI for non-technical staff.

### 1.4 Non-Goals (Version 1)

Online payment gateway, a full learning management system (course content, video, quizzes), timetable builder, hostel and transport, native mobile apps, biometric attendance, and e-mail or SMS delivery. These are Future Scope (Section 16). Assignments with submission and feedback, and class discussion, are not excluded: they are P2 features in Phase 4.

### 1.5 Success Metrics

| Metric | Target |
| --- | --- |
| Page load (list pages, 10k students) | under 2 seconds |
| Attendance marking time per class | under 2 minutes |
| Data entry errors vs. manual process | reduce by 80% |
| Report generation | under 10 seconds |
| System uptime during college hours | 99.5% |

## 2. Users, Roles and Permissions

| Account role | Portal | Description |
| --- | --- | --- |
| ADMIN | Admin portal | Institute-wide administration: users, departments, programs, faculty, students, enrollment, fees, settings, audit and controlled overrides. |
| FACULTY | Faculty portal | Teaching staff. Sees allocated classes, marks attendance, enters and submits marks, views own students. A faculty member holding the HOD designation also gets department-level access. |
| STUDENT | Student portal | Own profile, attendance, results, fees and library items; in Phase 4 also assignments and class discussion. A student holding the CR responsibility gets class announcement rights. |
| LIBRARIAN | Librarian portal | Library catalogue, book copies, issue, return, renewal and fines, plus basic member lookup. No academic or fee data. |

There are four account roles and four portals. Designations (HOD), responsibilities (CR) and access capabilities (laboratory access) are not login roles. They are attached to a faculty member or student and add scoped permissions on top of the account role. Section 17 records why.

| Item | Held by | Stored as | Adds |
| --- | --- | --- | --- |
| HOD | Faculty | Designation row linked to a department | Department-level view and edit of faculty, courses, sections, attendance and results of that department; approves marks before publication |
| CR (Class Representative) | Student | Responsibility row linked to a class section and term | Phase 4: post class announcements and moderate the class discussion; no extra access to other students' records |
| Laboratory access | Faculty or staff | Permission LAB\_ACCESS scoped to one lab | Phase 4: manage inventory and equipment issue for that lab |

Authorization has two checks on every request. First, the role and permission codes from the login token must allow the action. Second, the service layer checks scope: department for an HOD, allocated classes for faculty, own record for a student, library data for a librarian. Role defaults live in a role-permission table; the Admin can grant extra scoped permissions to a user.

### 2.1 Permission Matrix

Actions: C create, R view, U edit, D deactivate or delete, A approve, P publish, X export.

| Module | ADMIN | FACULTY (HOD adds) | STUDENT | LIBRARIAN |
| --- | --- | --- | --- | --- |
| Accounts | CRU, reset password, disable | Own account | Own account | Own account |
| Departments | CRUD | R; HOD edits own description | R own | R |
| Programs, terms, courses, sections | CRUD | R allocated; HOD CRU in own department | R own | R |
| Faculty records | CRUD, X | R own; HOD R and U own department | none | none |
| Student records | CRUD, X | R allocated sections; HOD R and U own department | R own, U contact details | R basic identity for circulation |
| Enrollment and allocation | CRUD | R own classes; HOD proposes own department | R own | none |
| Attendance | R all, override with reason | CRU allocated classes; HOD R department | R own | none |
| Marks and results | R all, P publish, override with reason | CRU allocated exams and submit; HOD A department | R own published results | none |
| Fees | CRUD, X | none | R own | none |
| Library | R oversight, settings | R catalogue and own loans | R catalogue, own loans and fines | CRUD, X |
| Assignments (Phase 4) | R all | CRUD own courses | R and submit own | none |
| Class discussion (Phase 4) | Remove posts | Post, moderate own classes | Post; CR adds announcements | none |
| Labs and facilities (Phase 4) | CRUD | LAB\_ACCESS holder manages own lab | none | none |
| Reports and exports | All, X | Own scope, X | Own, X | Library reports, X |
| Audit log and settings | R audit, CRU settings | none | none | Library rules only |

### 2.2 Scope and Override Rules

- ADMIN is institute-wide. An override (editing a published result, changing attendance after the edit window, unlocking marks) needs a written reason and is always audit logged.
- FACULTY sees only students, sections and offerings allocated to them. The HOD designation extends this to the HOD's own department only.
- STUDENT sees only own data. The student id comes from the login token, never from the request.
- LIBRARIAN sees library data and a basic identity lookup (name, roll or employee number, status) for issuing books.
- Disabled accounts lose access at the next token refresh at the latest.

## 3. Functional Requirements

**Priority levels.** P0: required for a functional, deliverable MVP (Phase 1). P1: important, built after the MVP foundation (Phases 2 and 3, and deployment). P2: advanced or optional (Phase 4); first to be cut if time runs short. Future Scope: excluded from this project delivery (Section 16). Each module below states Priority, Phase, Dependencies and Roles, then Core functionality, Business rules and Acceptance criteria.

### 3.0 Module Overview

| Module | Priority | Phase | Depends on | Roles |
| --- | --- | --- | --- | --- |
| 3.1 Authentication and authorization | P0 | 1 | none | All |
| 3.2 Account and profile management | P0 | 1 | 3.1 | All |
| 3.3 Department management | P0 | 1 | 3.1 | Admin; HOD view |
| 3.4 Academic structure (programs, terms, courses, sections) | P0 | 1 | 3.3 | Admin |
| 3.5 Faculty management | P0 | 1 | 3.3 | Admin |
| 3.6 Student management | P0 | 1 | 3.3, 3.4 | Admin |
| 3.7 Enrollment and academic allocation | P0 | 1 | 3.4, 3.5, 3.6 | Admin; HOD |
| 3.8 Admin dashboard and audit logging | P0 | 1 | 3.3 to 3.7 | Admin |
| 3.9 Attendance | P1 | 2 | 3.7 | Faculty, HOD, Admin, Student |
| 3.10 Examinations, marks and results | P1 | 2 | 3.7 | Faculty, HOD, Admin, Student |
| 3.11 Faculty and student dashboards | P1 | 2 | 3.9, 3.10 | Faculty, Student |
| 3.12 Fee management | P1 | 3 | 3.4, 3.6 | Admin, Student |
| 3.13 Library management | P1 | 3 | 3.1, 3.5, 3.6 | Librarian, Student, Faculty |
| 3.14 Student self-service | P1 | 3 | 3.12, 3.13 | Student |
| 3.15 Assignments (LMS-lite) | P2 | 4 | 3.7 | Faculty, Student |
| 3.16 Class discussion and CR workflows | P2 | 4 | 3.7 | Student, Faculty |
| 3.17 Laboratory inventory and access | P2 | 4 | 3.5 | Admin, LAB\_ACCESS holders |
| 3.18 Facility and infrastructure | P2 | 4 | 3.3 | Admin |
| 3.19 Reports, analytics and exports | P2 | 4 | 3.9 to 3.13 | All by scope |
| 3.20 Audit log screen and notifications | P2 | 4 | 3.8 | Admin, all |
| 3.21 Deployment and hardening | P1 | 4 | Phases 1 to 3 | Admin, IT |

### 3.1 Authentication and Authorization

**P0 | Phase 1 | Depends on: none | Roles: all**

- Core: login with username (roll number for students, employee number for faculty and librarians) and password; JWT access token and refresh cookie; logout; change password; forced change on first login; password reset by the Admin in the MVP (e-mail reset is P2).
- Rules: BCrypt hashing; lock for 15 minutes after 5 failed attempts; disabled accounts cannot sign in; role and permission checks are enforced by the API, not only hidden in the UI.
- Acceptance: only login and refresh work without a token; each role gets 403 on another role's endpoints; the fifth failed login locks the account.

### 3.2 Account and Profile Management

**P0 | Phase 1 | Depends on: 3.1 | Roles: all**

- Core: every user views own profile and changes own password; students edit contact details only; the Admin creates an account when creating a student, faculty member or librarian (generated username and temporary password), resets passwords and disables accounts.
- Rules: usernames are unique and never reused; profile photo is P1.
- Acceptance: a newly created student can sign in, is forced to change the password, and cannot edit academic fields.

### 3.3 Department Management

**P0 | Phase 1 | Depends on: 3.1 | Roles: Admin (HOD read)**

- Core: create, edit, search, deactivate; unique code; assign the HOD designation to a faculty member of that department.
- Rules: a department with active faculty, students, programs or courses cannot be deleted, only deactivated; one active HOD per department.
- Acceptance: changing the HOD moves department-level access to the new HOD at the next login.

### 3.4 Academic Structure: Programs, Terms, Courses, Sections

**P0 | Phase 1 | Depends on: 3.3 | Roles: Admin (HOD edits own department)**

- Core: programs (duration in semesters, department); academic terms (year and semester, dates, current flag); courses or subjects (code, title, credits, type, department); curriculum mapping of courses to a program semester as core or elective; class sections (program, batch, term, name such as CSE-A).
- Rules: exactly one current term; course code unique; section unique per program, batch, term and name; items in use cannot be deleted.
- Acceptance: the Admin can define a program's semester curriculum and create sections for the current term.

### 3.5 Faculty Management

**P0 | Phase 1 | Depends on: 3.3 | Roles: Admin; HOD for own department**

- Core: create, view, update, search, filter, deactivate; employee number, designation, qualification, department, joining date; HOD designation history; Excel export is P1.
- Rules: employee number and e-mail unique; faculty are deactivated, never deleted, so history is kept; an HOD must belong to the department.
- Acceptance: deactivating a faculty member blocks login but keeps their past attendance and marks visible.

### 3.6 Student Management

**P0 | Phase 1 | Depends on: 3.3, 3.4 | Roles: Admin; Faculty read for allocated sections**

- Core: create, view, update, search, filter by department, program, section, batch and status; profile page with personal, guardian and academic details; status ACTIVE, INACTIVE, GRADUATED, DROPPED. Bulk Excel import and semester promotion are P1.
- Rules: roll number unique; students are never hard-deleted; a student has one active section per term.
- Acceptance: the Admin adds a student, finds them by roll number in under one second, and the student can sign in.

### 3.7 Enrollment and Academic Allocation

**P0 | Phase 1 | Depends on: 3.4, 3.5, 3.6 | Roles: Admin; HOD for own department**

- Core: enroll students into a section for a term; create course offerings (course plus section plus term); enroll students in core courses automatically and in electives individually; allocate faculty to offerings as PRIMARY or CO teacher; faculty see My Classes and rosters.
- Rules: one primary faculty member per offering; allocation controls what faculty may access; ending an allocation sets an end date instead of deleting, so earlier attendance and marks stay attributable.
- Acceptance: after allocation a faculty user sees exactly their offerings and rosters, and no others.

### 3.8 Admin Dashboard and Audit Logging

**P0 | Phase 1 | Depends on: 3.3 to 3.7 | Roles: Admin**

- Core: dashboard cards and charts computed from the database (students, faculty, departments, programs, current term, students per department); backend audit logging of every create, update, deactivate, login and override with user, entity, id and time.
- Rules: no hard-coded figures; later phases add attendance, result, fee and library widgets.
- Acceptance: each figure equals the matching database count, checked by an automated test. The audit log screen is P2 (3.20); until then entries are queryable through the API.

### 3.9 Attendance

**P1 | Phase 2 | Depends on: 3.7 | Roles: Faculty mark; HOD view department; Admin view and override; Student view own**

- Core: faculty choose an allocated offering and date, mark Present, Absent or Leave per student with a Mark all present shortcut; per-student percentage per course; section and course reports; defaulter list below the threshold (default 75 percent).
- Rules: one record per student, offering and date; no future dates; faculty edit within a 7-day window (configurable), later changes only by the Admin with a reason; percentage = present divided by classes conducted x 100, with Leave counted by a configurable policy.
- Acceptance: percentages match worked test cases; faculty cannot mark a class they are not allocated; the defaulter list matches the threshold.

### 3.10 Examinations, Marks and Results

**P1 | Phase 2 | Depends on: 3.7 | Roles: Faculty enter and submit; HOD approve; Admin publish; Student view own**

- Core: define exams per offering (INTERNAL, MIDTERM, FINAL, PRACTICAL) with maximum marks and weightage; marks entry grid with absent flag; grading through a configurable grading scheme; course result and semester GPA calculation; workflow DRAFT, SUBMITTED, APPROVED, PUBLISHED; students view published marksheets on screen (PDF is Phase 4).
- Rules: 0 to maximum marks; weightage totals 100 percent per course; published results are locked and reopened only by the Admin with a reason; students never see unpublished marks.
- Acceptance: marks entered by faculty, approved by the HOD and published by the Admin appear on the student's results page; editing after publication is refused without an unlock.

### 3.11 Faculty and Student Dashboards

**P1 | Phase 2 | Depends on: 3.9, 3.10 | Roles: Faculty, HOD, Student**

- Core: faculty see today's classes, pending attendance, marks awaiting submission and defaulters in their courses; HOD sees department summaries; students see attendance per course with a warning below the threshold, enrolled courses and latest results.
- Acceptance: each widget shows only data inside the viewer's scope.

### 3.12 Fee Management

**P1 | Phase 3 | Depends on: 3.4, 3.6 | Roles: Admin manage; Student view own**

- Core: fee structures per program and term by head; invoices for one student or in bulk; partial payments; offline payment records (cash, UPI reference, cheque, bank transfer) with sequential receipt numbers; concessions with a reason; fee history; dues and defaulter report.
- Rules: payments are never edited or deleted, a mistake is fixed with a reversal entry; invoice status (PENDING, PARTIAL, PAID, OVERDUE) is derived from payments; no online gateway.
- Acceptance: a student is invoiced, pays partly then fully, the status changes correctly and the receipt is viewable.

### 3.13 Library Management

**P1 | Phase 3 | Depends on: 3.1, 3.5, 3.6 | Roles: Librarian manage; Student and Faculty view own**

- Core: catalogue (title, author, ISBN, category); individual book copies with accession number and status (AVAILABLE, ISSUED, LOST, DAMAGED); issue, return and renew for students and faculty; fines; overdue and fine reports.
- Rules: a copy can be issued only if AVAILABLE; maximum books per member (default 3); loan period 14 days (configurable); fine = overdue days x daily rate through a replaceable fine calculator; unpaid fines above a limit block new issues.
- Acceptance: the librarian issues and returns a copy, an overdue fine is calculated, and a student sees only their own loans.

### 3.14 Student Self-Service

**P1 | Phase 3 | Depends on: 3.12, 3.13 | Roles: Student**

- Core: view invoices, dues, payment history and receipts; view issued books, due dates and fines; update contact details; change password.
- Acceptance: a student can reach all of their own services from one portal and nothing belonging to others.

### 3.15 Assignments (LMS-lite)

**P2 | Phase 4 | Depends on: 3.7 | Roles: Faculty create and grade; Student submit**

- Core: faculty post an assignment for an offering with description, due date and an attachment up to 5 MB; students submit a file or text; faculty grade and give feedback; late submissions are flagged.
- Rules: only enrolled students see an assignment; no quizzes, course content hosting or video, which belong to the Future Scope LMS.

### 3.16 Class Discussion and CR Workflows

**P2 | Phase 4 | Depends on: 3.7 | Roles: Student, CR, Faculty, Admin**

- Core: a discussion thread per section or offering; a CR posts class announcements and raises class requests; faculty moderate; the Admin can remove posts.
- Rules: CR is a responsibility stored against a student, section and term; no private messaging.

### 3.17 Laboratory Inventory and Access

**P2 | Phase 4 | Depends on: 3.5 | Roles: Admin; LAB\_ACCESS holders**

- Core: labs, equipment inventory (item, quantity, condition), equipment issue and return log; the Admin grants LAB\_ACCESS for a lab to a faculty member or staff.

### 3.18 Facility and Infrastructure

**P2 | Phase 4 | Depends on: 3.3 | Roles: Admin**

- Core: buildings and rooms (type, capacity), room allocation list, simple maintenance requests.

### 3.19 Reports, Analytics and Exports

**P2 | Phase 4 | Depends on: 3.9 to 3.13 | Roles: all, by scope**

- Core: marksheet PDF, fee receipt PDF, attendance and defaulter reports; Excel export of lists and reports; analytics charts for pass percentage, attendance trend and fee collection.
- Rules: exports respect the viewer's scope and are audit logged.

### 3.20 Audit Log Screen and Notifications

**P2 | Phase 4 | Depends on: 3.8 | Roles: Admin; all for own notifications**

- Core: searchable audit log by user, date and entity; in-app notifications for low attendance, published results, fee dues and overdue books. E-mail and SMS delivery is Future Scope.

### 3.21 Deployment and Hardening

**P1 | Phase 4 | Depends on: Phases 1 to 3 | Roles: Admin, IT**

- Core: Docker images and compose, HTTPS, backups, monitoring (Sections 10 and 11). The MVP and Phases 2 and 3 run locally and do not wait for this.

## 4. Non-Functional Requirements

Targets that describe a deployed system (uptime, backups, load figures, HTTPS) apply from Phase 4. The MVP needs only the baseline: correct behaviour, input validation, pagination, role-based security and audit logging.

| Area | Requirement |
| --- | --- |
| Performance | Server-side pagination everywhere (default 20 rows); list queries use indexes; 95th percentile API response under 500 ms for 200 concurrent users |
| Scalability | Stateless app design so it can run behind a load balancer; DB handles 50k students and 5M attendance rows |
| Security | OWASP Top 10 mitigations, HTTPS only, BCrypt, CSRF protection, input validation, least-privilege DB user |
| Reliability | Daily automated DB backup, 30-day retention, tested restore procedure |
| Usability | Max 3 clicks to any common task; responsive down to tablet; keyboard-accessible forms; WCAG 2.1 AA colour contrast |
| Maintainability | Layered architecture, 70%+ unit test coverage on services, consistent code style (Checkstyle), API documentation via Swagger |
| Compatibility | Latest Chrome, Edge, Firefox, Safari |
| Data privacy | Student personal data accessible only per role; audit of every access to sensitive screens; data retention policy configurable |

## 5. System Architecture

### 5.1 High-Level View

```text
[ Browser: React SPA ] --HTTPS--> [ Nginx ]
                                     |-- /          --> React build (HTML, JS, CSS)
                                     |-- /api/v1/*  --> [ Spring Boot REST API ]
                                                          |  Controllers (JSON only)
                                                          |  Services (business rules)
                                                          |  Repositories (Spring Data JPA)
                                                          v
                                                    [ PostgreSQL ]  (managed with pgAdmin 4)
                                                          ^
                                        [ File storage: photos, imports, reports ]
```

### 5.2 Architectural Style

A modular monolith backend that exposes a REST API, plus a separate React single-page app (SPA). They are built separately but shipped together behind Nginx. A monolith backend fits: one team, simple transactions across attendance, marks and enrollment, and service interfaces keep the door open to split modules later. The React app talks to the backend only through /api/v1 JSON endpoints, so the API is the single contract between the two.

### 5.3 Layer Responsibilities

| Layer | Responsibility | Rules |
| --- | --- | --- |
| Controller | Request mapping, validation (@Valid), return JSON | No business logic, no repository calls |
| Service | Business rules, transactions (@Transactional), authorization checks, auditing | Works with DTOs outward and entities inward |
| Repository | Data access via Spring Data JPA, custom JPQL, specifications for filters | No business logic |
| Entity | Persistent domain model | Never exposed directly to views or APIs |
| DTO and Mapper | Transfer objects, MapStruct mapping | Hide internal fields, shape API output |

### 5.4 OOP Design (Academic Highlights)

| Concept | Where it is used | Why it is justified |
| --- | --- | --- |
| Encapsulation | Entities guard their own state and expose behaviour (Invoice.applyPayment, Loan.markReturned, Exam.publish); DTOs hide entity internals | Business invariants (no overpayment, locked results) live in one place |
| Abstraction and interfaces | Service interfaces (StudentService), PermissionEvaluator, ReportExporter | Controllers depend on contracts; services are easy to mock |
| Inheritance (two levels at most) | AuditableEntity (id, created and updated fields), then Person (name, contact), then Student, Faculty, Librarian | Real shared state and fields, not a hierarchy for its own sake |
| Polymorphism and method overriding | GradingStrategy (PercentageGrading, GpaGrading), FineCalculator (FlatRateFine, SlabFine), ReportExporter (Pdf, Excel); Person.getDisplayLabel() overridden by each subclass | Behaviour varies by college policy or output format and is chosen by configuration |
| Composition | Invoice owns InvoiceItems; Exam owns its marks; a result is built from course results; AttendanceSummary value object | Parts have no meaning outside the whole |
| Dependency injection | Spring constructor injection everywhere | Loose coupling and testability |
| Factory | ReportExporterFactory picks the exporter by format (Phase 4) | Added only once two formats exist |
| Observer (events) | Spring application events for audit logging and notifications | Keeps side effects out of the core transaction |
| Repository | Spring Data JPA repositories | Provided by the framework, not hand-written |

Rule: add an abstraction only when there are at least two real implementations or a clear testing need. No pattern is added just to raise the OOP count.

## 6. Technology Stack

| Concern | Choice |
| --- | --- |
| Language and runtime | Java 21 (LTS), or the version your Spring Boot release supports |
| Framework | Spring Boot 3.x |
| Web | Spring Web: REST controllers returning JSON under /api/v1 |
| Persistence | Spring Data JPA with Hibernate |
| Database | PostgreSQL 16 or newer, administered with pgAdmin 4 |
| Migrations | Flyway |
| Security | Spring Security 6 (JWT access token plus refresh token cookie, role-based method security) |
| Validation | Jakarta Bean Validation |
| Mapping and boilerplate | MapStruct, Lombok |
| Frontend | React 18 (JavaScript, JSX, HTML5, CSS3) built with Vite; React Router, Axios, TanStack Query, React Hook Form, Chart.js; plain CSS with design tokens and CSS Modules; Inter font |
| Reports | Apache POI (Excel), OpenPDF (PDF) |
| API docs | springdoc-openapi (Swagger UI) |
| Caching (optional) | Spring Cache with Caffeine for dropdown and dashboard data |
| Testing | JUnit 5, Mockito, Spring Boot Test, Testcontainers; Vitest and React Testing Library; Playwright |
| Build | Maven (backend); npm and Vite (frontend) |
| DevOps | Git, GitHub Actions, Docker, Docker Compose, Nginx |
| Monitoring | Spring Boot Actuator, Logback with rolling files |

Development environment: Windows with the Antigravity IDE, JDK 21, Maven, Node.js 20 LTS, local PostgreSQL 16 or newer with pgAdmin 4, and Postman. Docker arrives in Phase 4; until then the backend runs with Maven, the frontend with Vite, and the database locally.

## 7. Backend Plan

### 7.1 Project Structure

```text
backend/  (the existing Maven project; move toward this layout one module at a time)
com.college.ims
  common/        AuditableEntity, Person, ApiError, exceptions, utilities
  config/        SecurityConfig, CorsConfig (dev only), OpenApiConfig, AuditingConfig
  security/      JwtService, JwtAuthenticationFilter, PermissionEvaluator, scope checks
  auth/ user/   login, refresh, AppUser, Role, Permission, UserPermission
  department/    Phase 1
  academic/      Program, AcademicTerm, Course, CurriculumEntry, ClassSection, CourseOffering
  faculty/       Faculty, FacultyDesignation (HOD)
  student/       Student, ClassRepresentative
  enrollment/    StudentEnrollment, CourseEnrollment, FacultyAllocation
  dashboard/     statistics queries
  audit/         AuditEvent, listener, AuditLog
  attendance/    Phase 2
  exam/          Phase 2: Exam, Mark, CourseResult, GradingStrategy implementations
  fee/           Phase 3
  library/       Phase 3: Book, BookCopy, Loan, FineCalculator implementations
  lms/ lab/ facility/ notification/ report/    Phase 4
  Each module package holds: controller, service (interface + impl), repository, entity, dto, mapper
resources/
  db/migration/  Flyway scripts (PostgreSQL)
  application.yml, application-dev.yml, application-prod.yml
```

### 7.2 Core Domain Model

- **Identity and access:** AppUser (username, password hash, role ADMIN, FACULTY, STUDENT or LIBRARIAN, enabled, must-change-password, failed attempts, lock time); Permission; RolePermission (defaults); UserPermission (extra grants with optional scope such as a lab or department).
- **Organization:** Department; Faculty with FacultyDesignation (type HOD, department, from and to dates); Student; Librarian profile; ClassRepresentative (student, section, term).
- **Academic structure:** Program; AcademicTerm; Course; CurriculumEntry (program, semester, course, core or elective); ClassSection; CourseOffering (course, section, term).
- **Enrollment and allocation:** StudentEnrollment (student, section, term); CourseEnrollment (student, offering); FacultyAllocation (offering, faculty, PRIMARY or CO, from and to dates).
- **Assessment (Phase 2):** AttendanceRecord; Exam (status DRAFT, SUBMITTED, APPROVED, PUBLISHED); Mark; CourseResult; GradingScheme.
- **Finance (Phase 3):** FeeStructure; Invoice with InvoiceItems; Payment (with optional reversal link) and receipt number.
- **Library (Phase 3):** Book; BookCopy; Loan (member is a student or a faculty member); fine fields on Loan.
- **Phase 4:** Assignment, Submission, DiscussionThread, DiscussionPost, Lab, LabEquipment, Room, Notification; AuditLog is written from Phase 1.

### 7.3 Key Business Rules (Service Layer)

1. Roll number, employee number, e-mail, department code, course code, accession number, invoice number and receipt number are unique.
2. A department cannot be deleted while it has active linked records. Students and faculty are deactivated, never deleted, so history stays intact.
3. Exactly one academic term is current; a student has one active section per term.
4. Access is derived on the server: faculty through FacultyAllocation, HOD through the designation, students through their own id from the token, librarians through the library module only. The UI never decides permissions.
5. Attendance: one record per student, offering and date; no future dates; edits only inside the edit window, later changes by the Admin with a reason; percentage = present divided by conducted x 100.
6. Marks lie between 0 and the maximum; course weightage totals 100 percent; results move DRAFT, SUBMITTED (faculty), APPROVED (HOD), PUBLISHED (Admin) and are locked afterwards; unlock needs the Admin and a reason.
7. Payments are never edited or deleted; corrections are reversal entries; invoice status is derived from payments.
8. A book copy can be issued only if AVAILABLE and the member is under the book limit and fine limit; fine = overdue days x daily rate through the FineCalculator.
9. Every write publishes an audit event; overrides carry a mandatory reason.

### 7.4 REST API Endpoint Catalogue

| Module | Phase | Endpoints (all under /api/v1, JSON) |
| --- | --- | --- |
| Auth | 1 | POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me, POST /auth/password/change |
| Accounts and users | 1 | GET and PUT /me/profile, CRUD under /users (Admin), POST /users/{id}/reset-password, PUT /users/{id}/permissions |
| Departments | 1 | CRUD under /departments, PUT /departments/{id}/hod |
| Academic structure | 1 | CRUD under /programs, /terms, /courses, /sections, /programs/{id}/curriculum, /offerings |
| Faculty | 1 | CRUD under /faculty (soft delete), GET /faculty/{id}/designations |
| Students | 1 | CRUD under /students (soft delete), GET /students?filters&page&size |
| Enrollment and allocation | 1 | POST /enrollments, POST /offerings/{id}/enrollments, POST /offerings/{id}/allocations, GET /me/classes (faculty), GET /offerings/{id}/roster |
| Dashboard | 1 | GET /dashboard/admin; later /dashboard/faculty and /dashboard/student |
| Attendance | 2 | GET /attendance/sheet?offeringId=&date=, POST /attendance, GET /attendance/report, GET /attendance/defaulters, GET /me/attendance |
| Exams and results | 2 | GET and POST /exams, GET and PUT /exams/{id}/marks, POST /exams/{id}/submit, /approve, /publish, /unlock, GET /me/results |
| Fees | 3 | CRUD under /fee-structures, POST /invoices, POST /invoices/{id}/payments, POST /payments/{id}/reverse, GET /fees/defaulters, GET /me/invoices, GET /me/payments |
| Library | 3 | CRUD under /books and /books/{id}/copies, POST /library/issue, /return, /renew, GET /library/overdue, GET /me/loans |
| Phase 4 modules | 4 | /assignments, /submissions, /discussions, /labs, /rooms, /notifications, GET /audit-logs, GET and PUT /settings, GET /reports/{type}?format=pdf or xlsx |

API conventions: JSON only; paging with ?page=&size=&sort=; one standard error body (timestamp, status, code, message, fieldErrors); 401 makes the React client refresh its token once, 403 opens the no-permission page; downloads (PDF, Excel) are returned as file streams.

### 7.5 Cross-Cutting Concerns

- **Validation:** Bean Validation annotations on DTOs; custom validators for roll number format.
- **Exception handling:** @ControllerAdvice mapping exceptions to one standard JSON error body that the React app turns into toasts and inline form errors.
- **Auditing:** JPA auditing for createdBy and updatedBy plus an event-based AuditLog writer.
- **Pagination and filtering:** Pageable plus JPA Specifications for combined filters.
- **Transactions:** @Transactional on service methods; bulk attendance and marks saved in one transaction with batch inserts.
- **Logging:** structured logs with request id; no sensitive data in logs.
- **Caching:** reference data (departments, programs) cached with eviction on update.

## 8. Database Plan

### 8.1 Tables

```text
-- Phase 1: identity, structure, people, enrollment
app_users(id, username UNIQUE, password_hash, role [ADMIN/FACULTY/STUDENT/LIBRARIAN], enabled, must_change_password, failed_attempts, locked_until)
permissions(id, code UNIQUE, description)
role_permissions(role, permission_id FK)
user_permissions(id, user_id FK, permission_id FK, scope_type [NONE/DEPARTMENT/LAB], scope_id NULL)
departments(id, name, code UNIQUE, description, established_year, active)
faculty(id, user_id FK, employee_no UNIQUE, name, email UNIQUE, phone, designation, qualification, dept_id FK, joining_date, status)
faculty_designations(id, faculty_id FK, type [HOD], dept_id FK, from_date, to_date NULL)  -- one open HOD row per department
librarians(id, user_id FK, employee_no UNIQUE, name, email, phone, status)
programs(id, name, code UNIQUE, duration_semesters, dept_id FK)
academic_terms(id, label, start_date, end_date, is_current)
courses(id, code UNIQUE, title, credits, type [THEORY/LAB/ELECTIVE], dept_id FK)
curriculum_entries(id, program_id FK, semester_no, course_id FK, kind [CORE/ELECTIVE], UNIQUE(program_id, semester_no, course_id))
class_sections(id, program_id FK, batch_year, term_id FK, name, UNIQUE(program_id, batch_year, term_id, name))
students(id, user_id FK, roll_no UNIQUE, name, email, phone, dob, gender, address, guardian_name, guardian_phone,
         program_id FK, dept_id FK, batch_year, current_semester, status)
class_representatives(id, student_id FK, section_id FK, from_date, to_date NULL)
student_enrollments(id, student_id FK, section_id FK, term_id FK, status, UNIQUE(student_id, term_id))
course_offerings(id, course_id FK, section_id FK, term_id FK, UNIQUE(course_id, section_id, term_id))
course_enrollments(id, student_id FK, offering_id FK, UNIQUE(student_id, offering_id))
faculty_allocations(id, offering_id FK, faculty_id FK, role [PRIMARY/CO], from_date, to_date NULL)
audit_logs(id, user_id, action, entity, entity_id, old_value JSONB, new_value JSONB, reason, ip, created_at)
settings(key PRIMARY, value)

-- Phase 2: attendance, examinations
attendance(id, student_id FK, offering_id FK, att_date, status [PRESENT/ABSENT/LEAVE], marked_by FK, UNIQUE(student_id, offering_id, att_date))
grading_schemes(id, name, bands JSONB, is_default)
exams(id, offering_id FK, type, max_marks, weightage, exam_date, status [DRAFT/SUBMITTED/APPROVED/PUBLISHED])
marks(id, student_id FK, exam_id FK, marks_obtained, absent, remarks, UNIQUE(student_id, exam_id))
course_results(id, student_id FK, offering_id FK, total, grade, grade_points, status)

-- Phase 3: fees, library
fee_structures(id, program_id FK, term_id FK, head, amount, due_date)
invoices(id, invoice_no UNIQUE, student_id FK, term_id FK, total_amount, discount, due_date, status [PENDING/PARTIAL/PAID/OVERDUE])
invoice_items(id, invoice_id FK, head, amount)
payments(id, receipt_no UNIQUE, invoice_id FK, amount, mode [CASH/UPI/CHEQUE/BANK], reference, paid_on, received_by FK app_users, reversal_of FK payments NULL)
books(id, isbn NULL, title, author, category, publisher)
book_copies(id, book_id FK, accession_no UNIQUE, shelf_location, status [AVAILABLE/ISSUED/LOST/DAMAGED])
loans(id, copy_id FK, student_id FK NULL, faculty_id FK NULL, issued_on, due_on, returned_on NULL, renew_count, fine_amount, fine_paid, issued_by FK librarians,
      CHECK exactly one of student_id and faculty_id is set)

-- Phase 4: LMS-lite, labs, facilities, notifications
assignments(id, offering_id FK, title, description, due_at, max_marks, created_by FK faculty)
submissions(id, assignment_id FK, student_id FK, file_path, body, submitted_at, marks, feedback, UNIQUE(assignment_id, student_id))
discussion_threads(id, section_id FK, offering_id FK NULL, title, created_by FK app_users, pinned)
discussion_posts(id, thread_id FK, author_id FK app_users, body, created_at, deleted)
labs(id, name, dept_id FK, location)
lab_equipment(id, lab_id FK, item, quantity, condition)
rooms(id, building, room_no, type, capacity)
notifications(id, user_id FK, type, message, read_at, created_at)
```

All tables also carry created\_at, updated\_at, created\_by, updated\_by.

### 8.2 Indexes

- students(roll\_no), students(dept\_id, status), faculty(dept\_id, status), courses(dept\_id)
- course\_offerings(section\_id, term\_id), faculty\_allocations(faculty\_id, to\_date), student\_enrollments(section\_id, term\_id)
- attendance(offering\_id, att\_date), attendance(student\_id, offering\_id); marks(exam\_id); course\_results(student\_id)
- invoices(student\_id, status), payments(invoice\_id), book\_copies(book\_id, status), loans(copy\_id, returned\_on), loans(student\_id, returned\_on)
- audit\_logs(created\_at), audit\_logs(entity, entity\_id)

### 8.3 Data Management

- Flyway versioned migrations; never edit an applied migration.
- Seed script for roles, default Admin user (password must be changed on first login), grading scheme.
- Nightly pg\_dump job, offsite copy, monthly restore test.

### 8.4 PostgreSQL Setup (Local and Docker)

- PostgreSQL (16 or newer) is the database from day one. Install it locally and manage it with pgAdmin 4, or run the postgres image in Docker; the application only needs the connection settings.
- Create a database named college and a least-privilege application user. Flyway creates and upgrades every table, so nothing is created by hand.
- Conventions: lowercase snake\_case names; enums stored as VARCHAR with CHECK constraints and @Enumerated(STRING) in Java; IDENTITY ids; JSONB for audit values.
- Use pgAdmin for browsing data, running ad-hoc queries and checking backups, never for schema changes (Flyway only).
- Back up with pg\_dump on a schedule and test restores with pg\_restore; run integration tests on Testcontainers PostgreSQL with the same major version as production.

## 9. Frontend Plan

### 9.1 Frontend Technology Stack

The frontend is a React single-page app written in JavaScript, HTML and CSS. It lives in its own frontend/ folder and talks to the Spring Boot API only through JSON.

| Concern | Choice |
| --- | --- |
| Language and markup | JavaScript (ES2022), JSX, HTML5, CSS3 |
| Framework | React 18 |
| Build tool | Vite: dev server with hot reload, optimized production bundle |
| Routing | React Router 6: nested layouts, role-protected routes, lazy-loaded pages |
| Server data | TanStack Query: caching, pagination, refetch after save |
| HTTP client | Axios with interceptors: attach token, refresh on 401, global error toasts |
| Forms | React Hook Form with Zod or Yup rules mirroring backend validation |
| Tables | TanStack Table with server-side sorting, filtering and pagination |
| Charts | Chart.js through react-chartjs-2 |
| Styling | Plain CSS with design tokens (CSS variables) and CSS Modules; light and dark themes; no UI framework needed |
| Icons and font | Lucide icons, Inter font |
| Quality and tests | ESLint, Prettier, Vitest, React Testing Library, Playwright |

### 9.2 Project Structure

```text
frontend/
  index.html
  vite.config.js          dev proxy: /api -> http://localhost:8080
  public/                 logo, favicon
  src/
    main.jsx, App.jsx, routes.jsx
    api/                  axiosClient.js, studentApi.js, facultyApi.js, attendanceApi.js ...
    auth/                 AuthContext.jsx, ProtectedRoute.jsx, roles.js
    components/           Layout (Sidebar, Topbar), DataTable, FormField, Modal,
                          ConfirmDialog, Toast, Badge, EmptyState, Loader
    features/             dashboard, students, faculty, departments, courses,
                          attendance, marks, reports, users, audit
                          (each: pages, components, hooks, api calls)
    hooks/                useDebounce, usePagination, useToast, useTheme
    pages/                LoginPage, ForbiddenPage, NotFoundPage
    styles/               tokens.css, base.css, layout.css, components.css, dark.css
    utils/                formatDate, gradeHelpers, validators
```

### 9.3 Design System

- **Palette:** primary indigo (#4F46E5), success green, warning amber, danger red; light grey background (#F3F4F6), white cards, soft shadows, 12 px radius. All colours live as CSS variables in tokens.css.
- **Typography:** Inter, 14 to 16 px base, clear heading scale.
- **Components:** collapsible sidebar, top bar with global search, KPI cards, data tables, modal forms, toasts, confirmation dialogs, status badges, breadcrumbs, empty states, skeleton loaders.
- **Themes:** light and dark mode toggle, stored per user in the browser.
- **Responsive:** sidebar collapses to icons on tablets and to a drawer on phones.

### 9.4 App Shell and Navigation

One Layout component (Sidebar, Topbar and an Outlet for the page) wraps every authenticated route. Sidebar items come from roles.js, so each role sees only its own menu. Breadcrumbs and page titles come from the route config.

The React app has four portals inside one codebase: Admin, Faculty, Student and Librarian. After login the user is sent to the portal for their account role. Designations and responsibilities add sections inside a portal: an HOD sees a Department section, a LAB\_ACCESS holder sees a Lab section (Phase 4), and a CR sees a Class section (Phase 4).

| Portal | Lands on | Main screens | Added by designation or responsibility |
| --- | --- | --- | --- |
| Admin | /admin/dashboard | Users, departments, academic structure, faculty, students, enrollment and allocation, fees, results publishing, settings, audit | none |
| Faculty | /faculty/dashboard | My classes, attendance, marks entry, class reports | HOD: Department section (faculty, courses, approvals, department reports); LAB\_ACCESS: Lab section (Phase 4) |
| Student | /student/dashboard | Attendance, results, fees, library, profile; assignments and discussion in Phase 4 | CR: Class section (Phase 4) |
| Librarian | /librarian/dashboard | Books and copies, issue, return, renewal, overdue list, fines, library reports | none |

### 9.5 Page Inventory

| Area | Pages (routes) | Phase | Roles |
| --- | --- | --- | --- |
| Auth and profile | /login, /change-password, /profile | 1 | All |
| Admin dashboard | /admin/dashboard | 1 | Admin |
| Users | /admin/users | 1 | Admin |
| Departments | /admin/departments | 1 | Admin; HOD view |
| Academic structure | /admin/programs, /admin/terms, /admin/courses, /admin/sections | 1 | Admin; HOD own department |
| Faculty | /admin/faculty, /admin/faculty/:id | 1 | Admin; HOD own department |
| Students | /admin/students, /admin/students/new, /admin/students/:id | 1 | Admin; Faculty view allocated |
| Enrollment and allocation | /admin/enrollment, /admin/allocations | 1 | Admin; HOD |
| Faculty portal | /faculty/dashboard, /faculty/classes, /faculty/classes/:offeringId | 1 | Faculty |
| Attendance | /faculty/attendance, /faculty/attendance/report, /admin/attendance, /student/attendance | 2 | Faculty, HOD, Admin, Student |
| Exams and results | /faculty/exams, /faculty/exams/:id/marks, /hod/approvals, /admin/results, /student/results | 2 | Faculty, HOD, Admin, Student |
| Dashboards | /faculty/dashboard and /student/dashboard widgets | 2 | Faculty, Student |
| Fees | /admin/fees, /admin/fees/invoices/:id, /student/fees | 3 | Admin, Student |
| Library | /librarian/books, /librarian/issue, /librarian/return, /librarian/overdue, /student/library | 3 | Librarian, Student |
| Phase 4 | Assignments, discussion, labs, facilities, reports, audit log, notifications | 4 | By role |
| Errors | /403, /404 and a global error boundary | 1 | All |

### 9.6 Authentication in the React App

1. Login posts credentials to /api/v1/auth/login. The access token (JWT, 15 minutes) is kept in memory in AuthContext; the refresh token arrives as an HttpOnly cookie.
2. An Axios request interceptor adds the Authorization header. A response interceptor calls /auth/refresh once on a 401, retries the request, and logs the user out if refresh fails.
3. On page reload the app calls /auth/refresh, then /auth/me, to restore the user and role.
4. ProtectedRoute checks the role from /auth/me; hiding menus is cosmetic, because the API enforces every permission.

### 9.7 UX Details for Admin Users

- Data tables: server-side search (300 ms debounce), sort, filter chips, page size, row actions (view, edit, deactivate).
- Forms: inline validation, required markers, date pickers, auto-focus, Enter to submit, unsaved-changes warning.
- Attendance screen: sticky header with course and date, large Present/Absent toggles, running count, Mark all present, keyboard shortcuts (P, A, arrow keys).
- Marks grid: tab-through cells, instant validation, auto totals, paste from Excel.
- Feedback: success and error toasts, confirm dialogs on destructive actions, loading skeletons.
- Accessibility: labels, ARIA roles, visible focus states, sufficient contrast.
- Performance: lazy-loaded routes, query caching, hashed asset files cached by the browser, SPA fallback to index.html in Nginx.
- Config: API base URL comes from VITE\_API\_BASE\_URL (/api/v1 in production, proxied in development).

## 10. Security Plan

Security is tiered. Baseline, mandatory from Phase 1: BCrypt passwords, JWT access tokens, role and permission checks on every endpoint, DTOs instead of entities, input validation, parameterized queries through JPA, and audit logging. Hardening, delivered in Phase 4 with deployment: HTTPS and HSTS, rate limiting, security headers, dependency scanning, backups and monitoring. Hardening controls in the table below are not blockers for the MVP.

| Threat | Control |
| --- | --- |
| Weak or stolen credentials | BCrypt (strength 12), password policy (min 8, mixed), lockout after 5 failures, forced first-login change, short-lived access tokens (15 minutes) |
| Broken access control | Role checks at API level (SecurityFilterChain), method level (@PreAuthorize), and ownership checks in services (faculty only for assigned courses, students only for their own records with the id taken from the token); role and permission codes from the token are checked on every API call, and scope (department, allocated classes, own record) is resolved on the server; React route guards only hide the UI |
| SQL injection | JPA and parameterized queries only; no string-built SQL |
| XSS | React escapes output by default; never use dangerouslySetInnerHTML; Content-Security-Policy header; tokens never stored in localStorage |
| CSRF | Access token goes in the Authorization header (browsers do not send it automatically); refresh cookie is SameSite=Strict and used only by /auth/refresh |
| Token theft | Access token kept in memory only; refresh token in an HttpOnly, Secure, SameSite=Strict cookie with rotation and server-side revocation on logout |
| Sensitive data exposure | HTTPS only (HSTS), secrets in environment variables, DB user with least privilege, no PII in logs |
| File upload abuse | Whitelist types (jpg, png, xlsx), size limits, random file names, stored outside web root |
| Brute force and abuse | Rate limiting on /api/v1/auth/login at Nginx, optional CAPTCHA after repeated failures |
| Insider misuse | Full audit log, locked results, reason required for unlock |
| Vulnerable dependencies | Dependabot or OWASP Dependency-Check in CI |

Security headers: X-Content-Type-Options, X-Frame-Options (DENY), Referrer-Policy, Content-Security-Policy. CORS: in production React and the API share one origin behind Nginx, so CORS is off; in local development only http://localhost:5173 is allowed.

## 11. Server-Side and Infrastructure Plan

Phase note: the MVP and Phases 2 and 3 run locally (Maven, Vite, local PostgreSQL). Everything in this section (Docker, Nginx, HTTPS, CI/CD, backups, monitoring) is delivered in Phase 4.

### 11.1 Environments

| Environment | Purpose | Notes |
| --- | --- | --- |
| Local | Developer machine | Local PostgreSQL with pgAdmin 4 (or Docker postgres), Spring profile dev, Vite dev server with hot reload and proxy to the API |
| Staging | Testing with copy of realistic data | Same stack as production, anonymized data |
| Production | Live college use | Hardened, backed up, monitored |

### 11.2 Deployment Topology

```text
Internet or College LAN
    |
[ Nginx :443 ]  TLS, gzip, rate limit
    |-- /          --> React build (static HTML, JS, CSS)
    |-- /api/v1/*  --> [ Spring Boot container :8080 ]  (1 to 2 instances, stateless JWT)
                            |
                       [ PostgreSQL ]  + nightly pg_dump backups
                            |
                       [ Volume: /data/uploads, /data/reports ]
```

### 11.3 Docker Setup

- Backend Dockerfile: multi-stage (Maven build, then slim JRE 21 runtime), running as a non-root user.
- Frontend Dockerfile: multi-stage (node:20 runs npm ci and npm run build, then nginx:alpine serves the dist folder, falls back to index.html, and proxies /api/ to the backend).
- docker-compose.yml with services db (PostgreSQL), api (Spring Boot) and web (Nginx with React build); named volumes for DB data and uploads; health checks; api waits for a healthy db.
- Environment variables: DB\_URL, DB\_USER, DB\_PASSWORD, JWT\_SECRET, SPRING\_PROFILES\_ACTIVE, FILE\_STORAGE\_PATH; frontend build argument VITE\_API\_BASE\_URL.

Sample docker-compose.yml (PostgreSQL; in local development you can instead run PostgreSQL directly and use pgAdmin 4):

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: college
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes: [db_data:/var/lib/postgresql/data]
    healthcheck:
      test: [CMD-SHELL, pg_isready -U ${DB_USER} -d college]
      interval: 10s
      retries: 10
  api:
    build: ./backend
    environment:
      DB_URL: jdbc:postgresql://db:5432/college
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      SPRING_PROFILES_ACTIVE: prod
    depends_on:
      db:
        condition: service_healthy
    volumes: [uploads:/data/uploads]
  web:
    build:
      context: ./frontend
      args:
        VITE_API_BASE_URL: /api/v1
    ports: [80:80]
    depends_on: [api]
volumes:
  db_data:
  uploads:
```

### 11.4 Sample application.yml (production)

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate.ddl-auto: validate
    open-in-view: false
    properties.hibernate.jdbc.batch_size: 50
  flyway:
    enabled: true
    locations: classpath:db/migration
  servlet.multipart.max-file-size: 5MB
app:
  jwt:
    secret: ${JWT_SECRET}
    access-token-minutes: 15
    refresh-token-minutes: 30
  cors.allowed-origins: ${CORS_ORIGINS:}
server:
  forward-headers-strategy: framework
management.endpoints.web.exposure.include: health,info
```

### 11.5 CI/CD Pipeline (GitHub Actions)

1. On every push, two parallel jobs: backend (compile, unit and integration tests with Testcontainers PostgreSQL, static analysis) and frontend (npm ci, ESLint, Vitest, npm run build).
2. On merge to main: build two Docker images (api and web), tag with commit SHA, push to registry.
3. Deploy to staging automatically; production deploy after manual approval.
4. Flyway applies migrations on startup; rollback plan is restore from backup plus previous image tags.

### 11.6 Monitoring, Logging and Backup

- Actuator health endpoint for uptime checks; logs rotated daily, kept 30 days.
- Alerts on app down, disk above 80%, DB connection failures, repeated login failures.
- Backups: nightly full DB dump, weekly offsite copy, quarterly restore drill; uploads folder synced daily.

### 11.7 Capacity Guidance

For up to about 5,000 students and 100 concurrent users: 2 vCPU, 4 GB RAM app server, 2 vCPU, 4 GB RAM database, 50 GB disk. Scale vertically first; add a second app instance behind Nginx if needed (JWTs are stateless, so no sticky sessions are needed).

## 12. Phased Roadmap and Step-by-Step Plan

Phases are ordered by dependency, not by calendar. Each phase ends at a gate; the next phase starts when the gate is met, unless a task's own dependencies are already finished. Effort is sized S, M or L, and the sizes are confirmed after the Phase 0 audit because the repository already contains working code.

### 12.1 Dependency Chain

```text
Phase 0  Baseline audit and alignment
   |
Phase 1  (P0, MVP)  Auth -> Departments -> Academic structure -> Faculty and Students
                    -> Enrollment and allocation -> Admin dashboard and audit log
   |
Phase 2  (P1)       Attendance and Exams/Results -> Faculty and Student dashboards
   |
Phase 3  (P1)       Fees and Library -> Student self-service
   |
Phase 4  (P1, P2)   Deployment and hardening first, then optional P2 features by value
```

### Phase 0: Baseline Audit and Alignment (size S)

1. Inventory the repository: modules, entities, endpoints, pages, migrations. Mark each as working, partial, mock-only or missing.
2. Build a gap table against Section 3 (Done, Partial, Missing) and agree what is kept, refactored or rebuilt. Working code is not replaced without a reason.
3. Set up the Windows environment: Antigravity IDE, JDK 21, Maven, Node.js 20, PostgreSQL 16 with pgAdmin 4, Postman.
4. Confirm the app starts against local PostgreSQL, the Flyway baseline matches the current schema, and the seeded Admin can sign in.
5. Align the role model in code with Section 2: four roles, with HOD, CR and LAB\_ACCESS as designations, responsibilities and permissions.

- **Gate:** gap table agreed; backend and frontend run locally; seeded Admin login works.

### Phase 1: Core Administration and Academic Foundation, MVP (size L)

1. Authentication and authorization: JWT login and refresh, BCrypt, roles and permissions, error handling, React login and protected routes (3.1).
2. Accounts and profiles (3.2) and Departments (3.3).
3. Academic structure: programs, terms, courses, curriculum, sections (3.4).
4. Faculty (3.5) and Students (3.6) with search, filters, pagination and soft delete.
5. Enrollment and faculty allocation, My Classes and rosters (3.7).
6. Admin dashboard with database-backed figures and audit logging (3.8).
7. Tests: service unit tests, repository tests on Testcontainers PostgreSQL, role-matrix negative tests, and one end-to-end flow (department, program, section, student, faculty, allocation).

- **Gate:** every P0 acceptance criterion demonstrated; an Admin can set up a department from scratch; faculty see only allocated classes.

### Phase 2: Academic Operations (size L)

1. Attendance: sheet, bulk save, edit window, percentage, defaulters (3.9).
2. Grading scheme and exams: setup, marks grid, GradingStrategy, course results and GPA (3.10).
3. Result workflow: submit, approve, publish, lock, unlock with reason.
4. Faculty and student dashboards, student attendance and result views (3.11).

- **Gate:** a full semester simulation (enroll, attend, mark, approve, publish) works end to end with correct percentages and grades.

### Phase 3: Institutional Services (size M to L)

1. Fees: structures, invoices, partial payments, receipts, reversals, dues (3.12).
2. Library: catalogue, copies, issue, return, renew, fines, Librarian portal (3.13).
3. Student self-service and the matching dashboard widgets (3.14).

- **Gate:** a student is invoiced, pays in two parts and sees the receipt; the librarian issues and returns a copy and a fine is calculated.

### Phase 4: Advanced Features and System Maturity (size L; P2 items optional)

1. Deployment and hardening first (3.21): Dockerfiles and compose, HTTPS, backups, monitoring, dependency scan.
2. Reports and exports (3.19) and the audit log screen (3.20), because they build on earlier data.
3. Then, by value and as time allows: assignments (3.15), class discussion and CR (3.16), notifications (3.20), laboratory (3.17), facilities (3.18).
4. Performance checks, user acceptance testing with staff, user manual, demo data.

- **Gate:** clean-machine deployment from compose works; the hardening checklist is closed; each P2 feature that ships is fully tested, otherwise it is left out.

### 12.2 Scope Control

- A task may be pulled forward only if its dependencies are finished.
- If time runs short, P2 items are dropped from the bottom of Phase 4 first; Phase 1 is never cut.
- Each change request is classified as P0, P1, P2 or Future Scope and logged before work starts.

## 13. Testing Strategy

| Level | Scope | Tools |
| --- | --- | --- |
| Unit | Services: grade calculation, attendance percentage, business rules | JUnit 5, Mockito |
| Repository | Custom queries, constraints | @DataJpaTest, Testcontainers |
| Web layer | Controllers, validation, security rules | MockMvc, @WithMockUser |
| Integration | Full flow with real DB | @SpringBootTest, Testcontainers |
| UI and E2E | Login, add student, mark attendance, publish results | Vitest and React Testing Library for components; Playwright for end-to-end, one flow per role |
| Security | Role matrix, IDOR checks, CSRF, XSS payloads | MockMvc tests, OWASP ZAP |
| Performance | Large lists, bulk save, reports | JMeter or Gatling |
| UAT | Real users follow scripted scenarios | Checklist signed off by college |

Target: 70%+ coverage on service layer; all P0 acceptance criteria covered by at least one automated test.

## 14. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Requirements change late | Schedule slip | Freeze P0 scope after Phase 0; change log; P1 and P2 backlog |
| Poor legacy data quality | Import failures | Validation report, cleaning template, pilot import on one department |
| Wrong marks or attendance edits | Trust loss | Audit log, edit windows, publish lock, unlock with reason |
| Slow lists as data grows | Poor UX | Pagination, indexes, query review, caching |
| Data loss | Severe | Nightly backups, restore drills, soft deletes |
| Staff resistance to new system | Low adoption | Simple UI, training, keyboard shortcuts, quick-win reports |
| Security breach | Severe | Controls in Section 10, regular dependency updates |
| Existing code differs from this PRD | Rework and wasted effort | Phase 0 audit and gap table; refactor incrementally; keep what already works |
| Scope too large for the team | Missed delivery | Phase gates; P0 first; P2 features are optional and cut first |

## 15. Definition of Done and Launch Checklist

- Every phase: acceptance criteria demonstrated, automated tests green, migrations apply on an empty database, no open critical defects.
- MVP gate (Phase 1): all P0 modules work end to end with the four-role model; role-matrix negative tests pass; dashboard figures come from the database.
- Phase 2 gate: attendance and result workflows pass the semester simulation; students see only published results.
- Phase 3 gate: fee and library flows pass their acceptance tests; no student can see another student's data.
- Delivery gate (Phase 4): clean-machine deployment, HTTPS and backups verified when hosted, default Admin password changed and seed data removed, user manual and demo data delivered.

## 16. Future Scope

1. Parent portal (guardian view of attendance, marks and notices).
2. Online fee payment (UPI and cards) with automatic receipts.
3. Timetable builder with clash detection.
4. E-mail and SMS notifications.
5. Hostel and transport modules.
6. Biometric or QR-based attendance.
7. Analytics such as at-risk student prediction, beyond the Phase 4 charts.
8. SSO (Google or Microsoft) and two-factor authentication.
9. Full learning management system: course content, video, quizzes and rubrics, beyond the Phase 4 assignments.
10. Mobile app reusing the REST API; migration of the React frontend to TypeScript.
11. Multi-institute (multi-tenant) support.

## 17. Decisions and Open Questions

Decision log: how contradictions in the first draft were resolved.

| ID | Topic | Decision | Reason |
| --- | --- | --- | --- |
| D1 | Account roles | ADMIN, FACULTY, STUDENT, LIBRARIAN; four portals | The librarian has different duties and data scope from teaching faculty; replaces the earlier model where Librarian was a faculty position |
| D2 | HOD | Designation on a faculty member, linked to a department; not a login role | Access comes from the designation and department, not a new account type |
| D3 | CR | Responsibility held by a student; not a login role | Needs only class announcement rights in Phase 4 |
| D4 | Laboratory access | Permission LAB\_ACCESS scoped to a lab | A capability granted by the Admin, not an account |
| D5 | Assignments versus LMS | Assignments with submission and feedback are P2 in Phase 4; a full LMS is Future Scope | Removes the clash between in-scope assignments and excluded LMS features |
| D6 | Fees and library | P1 in Phase 3; offline payment only | Both depend on the academic foundation; no gateway in this delivery |
| D7 | Student portal | Profile in Phase 1; each view arrives with the module it reads | Avoids empty screens and keeps the MVP small |
| D8 | Security and deployment | Baseline security from Phase 1; HTTPS, rate limiting, backups, monitoring and Docker in Phase 4 | Hardening is not needed to prove the functional MVP |
| D9 | Database | PostgreSQL from day one; the MySQL option is dropped | Matches the existing repository and the chosen stack |
| D10 | Scheduling | Phases with gates replace fixed week counts | The repository already has code; the Phase 0 audit sets realistic sizes |
| D11 | Exports | On-screen first; PDF and Excel in Phase 4 | Keeps early phases focused on core data |
| D12 | Notifications | In-app notifications are P2; e-mail and SMS are Future Scope | Avoids an external delivery dependency |
| D13 | Result workflow | Faculty submit, HOD approves, Admin publishes | Gives department review before publication, with Admin override logged |

Open questions for the college:

1. Which grading scheme applies (percentage bands, 10-point GPA, letter grades) and how is GPA weighted?
2. Is the pattern semester or annual, and how are electives handled?
3. What is the official minimum attendance, and the rule for medical leave?
4. Besides the Admin, who approves late attendance edits and result unlocks?
5. Which fee heads, concessions and library fine rules apply?
6. Which parts of the existing repository work and should be kept? The Phase 0 audit answers this.
7. Where will the system be hosted, and when is deployment needed?
8. How many existing records need migration, and in what format?
