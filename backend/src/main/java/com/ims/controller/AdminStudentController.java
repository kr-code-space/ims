package com.ims.controller;

import com.ims.student.CreateStudentRequest;
import com.ims.student.StudentManagementService;
import com.ims.student.StudentResponse;
import com.ims.student.UpdateStudentRequest;
import com.ims.student.UpdateStudentStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {
    private final StudentManagementService studentManagementService;

    public AdminStudentController(StudentManagementService studentManagementService) {
        this.studentManagementService = studentManagementService;
    }

    @GetMapping
    public List<StudentResponse> findAll() {
        return studentManagementService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse create(@Valid @RequestBody CreateStudentRequest request) {
        return studentManagementService.create(request);
    }

    @PutMapping("/{id}")
    public StudentResponse update(@PathVariable Long id, @Valid @RequestBody UpdateStudentRequest request) {
        return studentManagementService.update(id, request);
    }

    @PutMapping("/{id}/status")
    public StudentResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStudentStatusRequest request
    ) {
        return studentManagementService.updateStatus(id, request.active());
    }
}
