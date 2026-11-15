package com.ims.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @GetMapping("/overview")
    public Map<String, Object> overview() {
        return Map.of(
                "title", "Administrative Dashboard",
                "summary", "Manage user accounts and institutional records.",
                "dataStatus", "Module metrics will be available when their database workflows are implemented."
        );
    }
}
