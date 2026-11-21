package com.ims.faculty;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    boolean existsByEmployeeNumber(String employeeNumber);
    boolean existsByEmployeeNumberAndIdNot(String employeeNumber, Long id);
    java.util.Optional<Faculty> findByUserUsername(String username);
}
