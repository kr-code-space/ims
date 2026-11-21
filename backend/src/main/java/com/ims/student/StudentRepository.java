package com.ims.student;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByStudentNumber(String studentNumber);
    boolean existsByStudentNumberAndIdNot(String studentNumber, Long id);
    java.util.Optional<Student> findByUserUsername(String username);
}
