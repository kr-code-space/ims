package com.ims.assignment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AssignmentDtos {
    public record CreateRequest(@NotNull Long academicClassId,
                                @NotNull Long subjectId,
                                @NotBlank @Size(max = 200) String title,
                                @Size(max = 1000) String description,
                                @NotNull LocalDate dueDate,
                                @NotNull Integer maxMarks) {}

    public record AssignmentResponse(Long id, String title, String description, Long academicClassId,
                                     String academicClassName, Long subjectId, String subjectName,
                                     LocalDate dueDate, int maxMarks) {
        public static AssignmentResponse from(Assignment assignment) {
            return new AssignmentResponse(
                    assignment.getId(),
                    assignment.getTitle(),
                    assignment.getDescription(),
                    assignment.getAcademicClass() == null ? null : assignment.getAcademicClass().getId(),
                    assignment.getAcademicClass() == null ? null : assignment.getAcademicClass().getName(),
                    assignment.getSubject().getId(),
                    assignment.getSubject().getName(),
                    assignment.getDueDate(),
                    assignment.getMaxMarks()
            );
        }
    }

    public record SubmitRequest(@NotNull Long assignmentId,
                                @Size(max = 4000) String submittedText) {}

    public record EvaluateRequest(@NotNull Integer marks, @Size(max = 2000) String feedback) {}

    public record SubmissionResponse(Long id, Long assignmentId, String assignmentTitle,
                                     Long studentId, String studentName, LocalDateTime submittedAt,
                                     String submittedText, String feedback, int marks, String status) {
        public static SubmissionResponse from(Submission submission) {
            return new SubmissionResponse(
                    submission.getId(),
                    submission.getAssignment().getId(),
                    submission.getAssignment().getTitle(),
                    submission.getStudent().getId(),
                    submission.getStudent().getFirstName() + " " + submission.getStudent().getLastName(),
                    submission.getSubmittedAt(),
                    submission.getSubmittedText(),
                    submission.getFeedback(),
                    submission.getMarks(),
                    submission.getStatus()
            );
        }
    }
}
