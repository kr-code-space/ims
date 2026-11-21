package com.ims.assignment;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    java.util.List<Assignment> findByAcademicClassIdOrderByDueDateAsc(Long academicClassId);
}
