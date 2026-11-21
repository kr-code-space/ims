package com.ims.attendance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByStudentIdOrderByDateDesc(Long studentId);
    List<AttendanceRecord> findByAcademicClassIdAndSubjectIdAndDate(Long academicClassId, Long subjectId, LocalDate date);
}
