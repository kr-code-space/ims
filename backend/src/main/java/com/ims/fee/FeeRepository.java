package com.ims.fee;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeRepository extends JpaRepository<FeeRecord, Long> {
}
