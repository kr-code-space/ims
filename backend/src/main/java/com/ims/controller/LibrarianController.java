package com.ims.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/librarian")
@PreAuthorize("hasRole('LIBRARIAN')")
public class LibrarianController {

    @GetMapping("/overview")
    public Map<String, Object> overview() {
        return Map.of(
                "title", "Library Dashboard",
                "summary", "Manage the library catalogue and circulation records.",
                "dataStatus", "Library database workflows are not implemented yet."
        );
    }
}
