package com.ims.controller;

import com.ims.faculty.FacultyDtos;
import com.ims.faculty.FacultyManagementService;
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
@RequestMapping("/api/admin/faculty")
@PreAuthorize("hasRole('ADMIN')")
public class AdminFacultyController {
    private final FacultyManagementService service;

    public AdminFacultyController(FacultyManagementService service) {
        this.service = service;
    }

    @GetMapping
    public List<FacultyDtos.Response> findAll() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FacultyDtos.Response create(@Valid @RequestBody FacultyDtos.CreateRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public FacultyDtos.Response update(@PathVariable Long id,
                                       @Valid @RequestBody FacultyDtos.UpdateRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{id}/status")
    public FacultyDtos.Response updateStatus(@PathVariable Long id,
                                             @Valid @RequestBody FacultyDtos.StatusRequest request) {
        return service.updateStatus(id, Boolean.TRUE.equals(request.active()));
    }
}
