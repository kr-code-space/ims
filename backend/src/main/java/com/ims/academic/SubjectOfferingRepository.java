package com.ims.academic;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectOfferingRepository extends JpaRepository<SubjectOffering, Long> {
    boolean existsBySubjectIdAndAcademicClassId(Long subjectId, Long academicClassId);
    java.util.List<SubjectOffering> findByFacultyIdAndActiveTrue(Long facultyId);
}
