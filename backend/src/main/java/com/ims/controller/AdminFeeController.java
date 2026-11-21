package com.ims.controller;

import com.ims.fee.FeeDtos;
import com.ims.fee.FeeManagementService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/fees")
@PreAuthorize("hasRole('ADMIN')")
public class AdminFeeController {
    private final FeeManagementService service;

    public AdminFeeController(FeeManagementService service) {
        this.service = service;
    }

    @GetMapping
    public List<FeeDtos.Response> findAll() {
        return service.findAll();
    }

    @PostMapping
    public FeeDtos.Response create(@Valid @RequestBody FeeDtos.CreateRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}/payment")
    public FeeDtos.Response recordPayment(@PathVariable Long id,
                                          @Valid @RequestBody FeeDtos.PaymentRequest request) {
        return service.recordPayment(id, request);
    }
}
