package com.ims.assignment;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    java.util.List<Submission> findByAssignmentId(Long assignmentId);
    java.util.List<Submission> findByStudentIdOrderBySubmittedAtDesc(Long studentId);
    java.util.Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
}
