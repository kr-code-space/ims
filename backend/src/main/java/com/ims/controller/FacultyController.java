package com.ims.controller;

import com.ims.attendance.AttendanceDtos;
import com.ims.attendance.AttendanceManagementService;
import com.ims.assignment.AssignmentDtos;
import com.ims.assignment.AssignmentManagementService;
import com.ims.laboratory.LabEquipment;
import com.ims.laboratory.LabEquipmentRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyController {
    private final AttendanceManagementService attendanceService;
    private final AssignmentManagementService assignmentService;
    private final LabEquipmentRepository labEquipmentRepository;

    public FacultyController(AttendanceManagementService attendanceService,
                             AssignmentManagementService assignmentService,
                             LabEquipmentRepository labEquipmentRepository) {
        this.attendanceService = attendanceService;
        this.assignmentService = assignmentService;
        this.labEquipmentRepository = labEquipmentRepository;
    }

    @GetMapping("/overview")
    public Map<String, Object> overview() {
        return Map.of(
                "title", "Faculty Dashboard",
                "summary", "Manage assigned classes, attendance, and assignments.",
                "dataStatus", "Module metrics will be available when their database workflows are implemented."
        );
    }

    @GetMapping("/lab-access")
    @PreAuthorize("hasAuthority('LAB_ACCESS')")
    public List<LabEquipment> labAccess() {
        return labEquipmentRepository.findAll();
    }

    @PostMapping("/lab-access/equipment")
    @PreAuthorize("hasAuthority('LAB_ACCESS')")
    public LabEquipment createLabEquipment(@RequestBody LabEquipment equipment) {
        return labEquipmentRepository.save(equipment);
    }

    @GetMapping("/attendance/offerings")
    public List<AttendanceDtos.OfferingResponse> attendanceOfferings(Authentication authentication) {
        return attendanceService.facultyOfferings(authentication.getName());
    }

    @GetMapping("/attendance/records")
    public List<AttendanceDtos.RecordResponse> attendanceRecords(
            Authentication authentication,
            @RequestParam Long academicClassId,
            @RequestParam Long subjectId,
            @RequestParam LocalDate date
    ) {
        return attendanceService.facultyRecords(
                authentication.getName(), academicClassId, subjectId, date);
    }

    @GetMapping("/attendance/roster")
    public List<AttendanceDtos.RosterEntry> attendanceRoster(
            Authentication authentication,
            @RequestParam Long academicClassId,
            @RequestParam Long subjectId
    ) {
        return attendanceService.facultyRoster(
                authentication.getName(), academicClassId, subjectId);
    }

    @PostMapping("/attendance/records")
    public List<AttendanceDtos.RecordResponse> saveAttendance(
            Authentication authentication,
            @Valid @RequestBody AttendanceDtos.RecordRequest request
    ) {
        return attendanceService.saveRecords(authentication.getName(), request);
    }

    @GetMapping("/assignments")
    public List<AssignmentDtos.AssignmentResponse> assignments(Authentication authentication) {
        return assignmentService.facultyAssignments(authentication.getName());
    }

    @PostMapping("/assignments")
    public AssignmentDtos.AssignmentResponse createAssignment(
            Authentication authentication,
            @Valid @RequestBody AssignmentDtos.CreateRequest request
    ) {
        return assignmentService.create(authentication.getName(), request);
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public List<AssignmentDtos.SubmissionResponse> submissions(
            Authentication authentication,
            @PathVariable Long assignmentId
    ) {
        return assignmentService.facultySubmissions(authentication.getName(), assignmentId);
    }

    @PutMapping("/submissions/{submissionId}")
    public AssignmentDtos.SubmissionResponse evaluateSubmission(
            Authentication authentication,
            @PathVariable Long submissionId,
            @Valid @RequestBody AssignmentDtos.EvaluateRequest request
    ) {
        return assignmentService.evaluate(authentication.getName(), submissionId, request);
    }
}
