package com.ims.attendance;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class AttendanceDtos {
    public record Entry(@NotNull Long studentId, @NotNull Boolean present, String remarks) {}

    public record RecordRequest(@NotNull Long academicClassId,
                                @NotNull Long subjectId,
                                @NotNull LocalDate date,
                                @NotNull List<Entry> entries) {}

    public record OfferingResponse(Long offeringId, Long academicClassId, String academicClassName,
                                   Long subjectId, String subjectName) {}

    public record RecordResponse(Long id, Long studentId, String studentName, Long subjectId,
                                 String subjectName, Long academicClassId, String academicClassName,
                                 LocalDate date, boolean present, String remarks) {
        public static RecordResponse from(AttendanceRecord record) {
            var student = record.getStudent();
            var subject = record.getSubject();
            var academicClass = record.getAcademicClass();
            return new RecordResponse(
                    record.getId(),
                    student.getId(),
                    student.getFirstName() + " " + student.getLastName(),
                    subject.getId(),
                    subject.getName(),
                    academicClass == null ? null : academicClass.getId(),
                    academicClass == null ? null : academicClass.getName(),
                    record.getDate(),
                    record.isPresent(),
                    record.getRemarks()
            );
        }
    }

    public record StudentAttendanceSummary(String subjectName, long totalClasses,
                                           long presentClasses, double percentage) {}

    public record RosterEntry(Long studentId, String studentName, String studentNumber) {}
}
