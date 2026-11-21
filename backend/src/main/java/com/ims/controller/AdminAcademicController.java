package com.ims.controller;

import com.ims.academic.AcademicDtos;
import com.ims.academic.AcademicManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/academic")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAcademicController {
    private final AcademicManagementService service;

    public AdminAcademicController(AcademicManagementService service) {
        this.service = service;
    }

    @GetMapping
    public AcademicDtos.AcademicOverview overview() {
        return service.overview();
    }

    @PostMapping("/departments")
    @ResponseStatus(HttpStatus.CREATED)
    public AcademicDtos.DepartmentResponse createDepartment(@Valid @RequestBody AcademicDtos.DepartmentRequest request) {
        return service.createDepartment(request);
    }

    @PostMapping("/terms")
    @ResponseStatus(HttpStatus.CREATED)
    public AcademicDtos.TermResponse createTerm(@Valid @RequestBody AcademicDtos.TermRequest request) {
        return service.createTerm(request);
    }

    @PostMapping("/classes")
    @ResponseStatus(HttpStatus.CREATED)
    public AcademicDtos.ClassResponse createClass(@Valid @RequestBody AcademicDtos.ClassRequest request) {
        return service.createClass(request);
    }

    @PostMapping("/subjects")
    @ResponseStatus(HttpStatus.CREATED)
    public AcademicDtos.SubjectResponse createSubject(@Valid @RequestBody AcademicDtos.SubjectRequest request) {
        return service.createSubject(request);
    }

    @PostMapping("/enrolments")
    @ResponseStatus(HttpStatus.CREATED)
    public AcademicDtos.EnrolmentResponse createEnrolment(@Valid @RequestBody AcademicDtos.EnrolmentRequest request) {
        return service.createEnrolment(request);
    }

    @PostMapping("/offerings")
    @ResponseStatus(HttpStatus.CREATED)
    public AcademicDtos.OfferingResponse createOffering(@Valid @RequestBody AcademicDtos.OfferingRequest request) {
        return service.createOffering(request);
    }
}
