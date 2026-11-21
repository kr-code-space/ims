package com.ims.academic;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicClassRepository extends JpaRepository<AcademicClass, Long> {
    boolean existsByCode(String code);
}
