package com.ims.academic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public class AcademicDtos {
    public record DepartmentRequest(
            @NotBlank @Size(max = 20) String code,
            @NotBlank @Size(max = 150) String name,
            Boolean active
    ) {}

    public record DepartmentResponse(Long id, String code, String name, boolean active) {
        public static DepartmentResponse from(Department department) {
            return new DepartmentResponse(department.getId(), department.getCode(), department.getName(), department.isActive());
        }
    }

    public record TermRequest(
            @NotBlank @Size(max = 100) String name,
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            Boolean active
    ) {}

    public record TermResponse(Long id, String name, LocalDate startDate, LocalDate endDate, boolean active) {
        public static TermResponse from(AcademicTerm term) {
            return new TermResponse(term.getId(), term.getName(), term.getStartDate(), term.getEndDate(), term.isActive());
        }
    }

    public record ClassRequest(
            @NotBlank @Size(max = 50) String code,
            @NotBlank @Size(max = 150) String name,
            @NotNull Long departmentId,
            @NotNull Long termId,
            Long crStudentId,
            Boolean active
    ) {}

    public record ClassResponse(Long id, String code, String name, Long departmentId, String departmentName,
                                Long termId, String termName, Long crStudentId, String crStudentName, boolean active) {
        public static ClassResponse from(AcademicClass academicClass) {
            var cr = academicClass.getCrStudent();
            return new ClassResponse(
                    academicClass.getId(),
                    academicClass.getCode(),
                    academicClass.getName(),
                    academicClass.getDepartment().getId(),
                    academicClass.getDepartment().getName(),
                    academicClass.getTerm().getId(),
                    academicClass.getTerm().getName(),
                    cr == null ? null : cr.getId(),
                    cr == null ? null : cr.getFirstName() + " " + cr.getLastName(),
                    academicClass.isActive()
            );
        }
    }

    public record SubjectRequest(
            @NotBlank @Size(max = 30) String code,
            @NotBlank @Size(max = 150) String name,
            @NotBlank @Size(max = 150) String department,
            int credits,
            @NotBlank @Size(max = 50) String semester
    ) {}

    public record SubjectResponse(Long id, String code, String name, String department, int credits, String semester) {
        public static SubjectResponse from(Subject subject) {
            return new SubjectResponse(subject.getId(), subject.getCode(), subject.getName(),
                    subject.getDepartment(), subject.getCredits(), subject.getSemester());
        }
    }

    public record EnrolmentRequest(@NotNull Long studentId, @NotNull Long academicClassId, Boolean active) {}
    public record EnrolmentResponse(Long id, Long studentId, String studentName, Long academicClassId,
                                    String academicClassName, boolean active) {
        public static EnrolmentResponse from(Enrolment enrolment) {
            var student = enrolment.getStudent();
            var academicClass = enrolment.getAcademicClass();
            return new EnrolmentResponse(
                    enrolment.getId(),
                    student.getId(),
                    student.getFirstName() + " " + student.getLastName(),
                    academicClass.getId(),
                    academicClass.getName(),
                    enrolment.isActive()
            );
        }
    }

    public record OfferingRequest(@NotNull Long subjectId, @NotNull Long academicClassId, Long facultyId, Boolean active) {}
    public record OfferingResponse(Long id, Long subjectId, String subjectName, Long academicClassId,
                                   String academicClassName, Long facultyId, String facultyName, boolean active) {
        public static OfferingResponse from(SubjectOffering offering) {
            var faculty = offering.getFaculty();
            return new OfferingResponse(
                    offering.getId(),
                    offering.getSubject().getId(),
                    offering.getSubject().getName(),
                    offering.getAcademicClass().getId(),
                    offering.getAcademicClass().getName(),
                    faculty == null ? null : faculty.getId(),
                    faculty == null ? null : faculty.getFirstName() + " " + faculty.getLastName(),
                    offering.isActive()
            );
        }
    }

    public record AcademicOverview(List<DepartmentResponse> departments,
                                   List<TermResponse> terms,
                                   List<ClassResponse> classes,
                                   List<SubjectResponse> subjects,
                                   List<EnrolmentResponse> enrolments,
                                   List<OfferingResponse> offerings) {}
}
