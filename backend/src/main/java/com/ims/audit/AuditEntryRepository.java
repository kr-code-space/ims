package com.ims.audit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AuditEntryRepository extends JpaRepository<AuditEntry, Long> {
    List<AuditEntry> findAllByOrderByOccurredAtDesc();
}
