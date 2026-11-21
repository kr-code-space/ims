package com.ims.controller;

import com.ims.facility.Facility;
import com.ims.facility.FacilityRepository;
import com.ims.staff.Staff;
import com.ims.staff.StaffRepository;
import com.ims.audit.AuditEntry;
import com.ims.audit.AuditEntryRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOperationsController {
    private final StaffRepository staffRepository;
    private final FacilityRepository facilityRepository;
    private final AuditEntryRepository auditEntryRepository;

    public AdminOperationsController(StaffRepository staffRepository,
                                     FacilityRepository facilityRepository,
                                     AuditEntryRepository auditEntryRepository) {
        this.staffRepository = staffRepository;
        this.facilityRepository = facilityRepository;
        this.auditEntryRepository = auditEntryRepository;
    }

    @GetMapping("/staff")
    public List<Staff> staff() { return staffRepository.findAll(); }

    @PostMapping("/staff")
    public Staff createStaff(@RequestBody Staff staff) { return staffRepository.save(staff); }

    @GetMapping("/facilities")
    public List<Facility> facilities() { return facilityRepository.findAll(); }

    @PostMapping("/facilities")
    public Facility createFacility(@RequestBody Facility facility) { return facilityRepository.save(facility); }

    @GetMapping("/audit")
    public List<AuditEntry> audit() { return auditEntryRepository.findAllByOrderByOccurredAtDesc(); }
}
