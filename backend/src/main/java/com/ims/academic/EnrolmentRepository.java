package com.ims.academic;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrolmentRepository extends JpaRepository<Enrolment, Long> {
    boolean existsByStudentIdAndAcademicClassId(Long studentId, Long academicClassId);
    java.util.List<Enrolment> findByAcademicClassIdAndActiveTrue(Long academicClassId);
    java.util.List<Enrolment> findByStudentIdAndActiveTrue(Long studentId);
}
