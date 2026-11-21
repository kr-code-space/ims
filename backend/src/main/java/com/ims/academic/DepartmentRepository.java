package com.ims.academic;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByCode(String code);
    boolean existsByName(String name);
}
