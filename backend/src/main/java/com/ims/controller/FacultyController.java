package com.ims.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyController {

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
    public Map<String, Object> labAccess() {
        return Map.of(
                "title", "Laboratory Management",
                "summary", "Laboratory data workflows are not implemented yet.",
                "dataStatus", "No live laboratory records are available."
        );
    }
}
